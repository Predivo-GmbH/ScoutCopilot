# WyScout vs StatsBomb -- Data Provider Decision Document

**Date:** 2026-04-02
**Project:** ScoutCopilot (scoutcopilot.predivo.ch / scoutcopilot.com)
**Purpose:** Decide which football data provider(s) to integrate for production use

---

## 1. Feature-by-Feature Comparison

| Dimension | WyScout (Hudl) | StatsBomb (Hudl) |
|---|---|---|
| **API format** | REST (`apirest.wyscout.com/v4`) | GraphQL (`live-api.statsbomb.com/v1/graphql`) |
| **Rate limit** | 12 req/sec | Not publicly documented |
| **Authentication** | Basic Auth (username:password) | Basic Auth (username:password) |
| **Player search** | Direct search endpoint with filters (position, age, height, foot, competition, market value range) | Player-stats endpoint filtered by competition/season; no direct player search |
| **Player photos** | YES (`?imageDataURL=true`, base64) | NO |
| **Player bio data** | Full (name, DOB, nationality, height, weight, foot, current team) | Partial (name, DOB, nationality, height, weight -- no foot, no current team in base schema) |
| **Contract expiry** | YES (via `/contractinfo`) | NO |
| **Agent info** | PARTIAL (agency names via `/contractinfo`) | NO |
| **Market value** | NO | NO |
| **Wage/salary** | NO | NO |
| **Transfer history** | YES (via `/transfers`) | NO |
| **Stats depth** | 115 player metrics, 142 team metrics (Stats Pack) | Deep event-level stats; aggregation done client-side or via GraphQL |
| **Match events** | 3,000+ events/match, 80+ event types | ~3,400 events/match, 30 event types (more granular per type) |
| **Unique event types** | Standard event taxonomy | Carries (distinct events), ball receipts in space, line-breaking passes |
| **Advanced metrics** | Standard per-90 stats | OBV (On-Ball Value), xPass, pass clustering |
| **xG model** | Standard xG | Enhanced xG using GK + defender positions from 360 data |
| **360 freeze-frame** | NO | YES -- 40+ leagues (bundled free with subscription) |
| **Video** | YES -- massive library, industry standard | NO video library |
| **Coverage breadth** | 600+ competitions (including lower divisions) | 190+ competitions |
| **Free/open data** | NONE | YES -- 3,000+ matches (La Liga 18 seasons, World Cups, Euros, etc.) |
| **Python library** | No official library | `statsbombpy` v1.17.0 (actively maintained) |
| **ID mapping** | Hudl ID Mapping API (free for dual subscribers) | Hudl ID Mapping API (free for dual subscribers) |
| **Pricing** | Individual from EUR 299/yr (video only); API est. GBP 5,000+/yr per league; Enterprise custom | Enterprise only, est. $10K-50K+/yr |

### Data Gap Summary (Neither Provider Has)

| Data Point | Alternative Source |
|---|---|
| Market value | Transfermarkt (scraping/unofficial API), API-Football |
| Wage/salary | Capology (scraping), Spotrac (limited to some leagues) |
| Full agent details | TransferRoom, agent databases (manual) |
| Player photos (if no WyScout) | API-Football, FBref player pages |
| Injury history | Transfermarkt, API-Football |
| Social media stats | Manual / social APIs |

---

## 2. ScoutCopilot Feature Mapping

### How Each Provider Serves Each Feature

| ScoutCopilot Feature | WyScout | StatsBomb | Winner |
|---|---|---|---|
| **NL player search** | Direct player search API with rich filters (position, age, foot, height, competition). Claude can map natural language to structured query params easily. | No direct player search endpoint. Must query by competition/season then filter client-side. | **WyScout** |
| **AI scouting report (Claude)** | 115 metrics per player. Good breadth for report narrative. Contract info adds context. | OBV, 360 data, carries, line-breaking passes give deeper tactical insight. Claude can generate more nuanced tactical analysis. | **StatsBomb** (for quality) / **WyScout** (for breadth + contract context) |
| **Radar charts** | 115 standardized metrics map cleanly to radar axes. Per-90 normalization built in. | Metrics require aggregation from event data or GraphQL queries. More powerful but more work. | **WyScout** (simpler) / **StatsBomb** (richer) |
| **Watchlist alerts** | Player endpoint returns current team, contract expiry. Can detect team changes, approaching free agency. | No contract data. Limited to performance-based alerts from match events. | **WyScout** |
| **Squad builder** | Full player roster data per team. Position data included. | Team lineups available but less structured for squad-building use case. | **WyScout** |
| **Player detail page** | Photo, bio, stats, contract expiry, agent, transfer history -- covers 6/8 typical detail page sections. | Stats + advanced metrics only. No photo, no contract, no transfers. Covers 2/8 sections. | **WyScout** |

### Verdict by Feature

- **4 of 6 features favor WyScout** as the primary data source
- **AI reports benefit from StatsBomb's unique metrics** but need WyScout's context data
- **Radar charts** work with either but StatsBomb adds differentiation

---

## 3. Scenarios

### Scenario A: WyScout Only

| Aspect | Detail |
|---|---|
| **What works** | NL search (direct API), player detail pages (photo, bio, contract, agent, transfers), radar charts (115 metrics), watchlist alerts (contract expiry, team changes), squad builder (roster data), AI reports (good breadth) |
| **What's missing** | OBV and advanced tactical metrics, 360 freeze-frame data, carries as events, enhanced xG, free development data |
| **Data gaps to fill** | Market value (API-Football or Transfermarkt), wage data (Capology) |
| **Estimated cost** | GBP 5,000-15,000/yr for API access (1-3 leagues); EUR 299/yr individual for video research during development |
| **Development cost** | Provider already coded (`wyscout.ts`). Needs v3->v4 URL update, photo endpoint, contract endpoint. ~2-3 days. |
| **Risk** | No free data for development/testing. Must use paid API from day one or maintain mock data longer. |

### Scenario B: StatsBomb Only

| Aspect | Detail |
|---|---|
| **What works** | AI reports (superior tactical depth), radar charts (unique metrics = differentiation), free open data for all development/testing |
| **What's missing** | No player search API (must build custom search layer), no player photos, no contract data, no agent info, no transfer history, no video, limited coverage (190 vs 600 competitions) |
| **Data gaps to fill** | Photos (API-Football), contract/agent/transfers (Transfermarkt), player search (custom index), market value (API-Football) |
| **Estimated cost** | $10,000-50,000/yr for production API; $0 for development (open data) |
| **Development cost** | Provider partially coded (`statsbomb.ts`). Needs GraphQL migration (current code uses REST v2, production uses GraphQL). Must build search indexing layer, integrate 3+ supplementary APIs for missing data. ~2-3 weeks. |
| **Risk** | Higher total cost (data provider + supplementary APIs). More integration complexity. Player detail pages would be sparse without 3+ additional data sources. |

### Scenario C: Both Providers (with ID Mapping)

| Aspect | Detail |
|---|---|
| **What works** | Everything. WyScout for search, photos, bio, contract, transfers, video. StatsBomb for advanced metrics, OBV, 360 data, enhanced xG. Best-in-class AI reports combining both. Radar charts with unique StatsBomb metrics as differentiator. |
| **What's missing** | Market value, wages (same as Scenario A). |
| **Data gaps to fill** | Market value (API-Football or Transfermarkt), wage data (Capology) |
| **Estimated cost** | GBP 5,000-15,000/yr (WyScout) + $10,000-50,000/yr (StatsBomb) = $15,000-65,000+/yr. ID Mapping API is free for dual subscribers. |
| **Development cost** | Both providers already partially coded. Need: v4 migration (WyScout), GraphQL migration (StatsBomb), ID mapping integration, data merging layer. ~1-2 weeks. |
| **Risk** | Highest cost. Overkill for MVP. Both owned by Hudl so potential for bundled deal. |

### Scenario Cost Summary

| Scenario | Annual Data Cost | Dev Effort | Data Completeness |
|---|---|---|---|
| A: WyScout only | $6K-18K | 2-3 days | 75% (missing advanced metrics) |
| B: StatsBomb only | $10K-50K + supplementary APIs | 2-3 weeks | 50% (missing search, photos, contracts) |
| C: Both | $15K-65K | 1-2 weeks | 95% (missing only market value, wages) |

---

## 4. Recommendation

### Primary recommendation: Phased approach -- StatsBomb free data NOW, WyScout at LAUNCH, both at SCALE

**Reasoning:**

1. **ScoutCopilot is pre-revenue.** Spending $10K+ before launch on data APIs is premature. StatsBomb's free open data (3,000+ real matches) eliminates this cost during development.

2. **WyScout is the better primary production provider.** It covers more ScoutCopilot features natively (4 of 6), has direct player search, player photos, contract data, and 3x the competition coverage. For a scouting platform, the ability to search and display complete player profiles is more important than having the deepest event-level analytics.

3. **StatsBomb adds differentiation, not foundation.** OBV, 360 data, and carries are powerful for AI report quality and radar chart uniqueness -- but they are premium add-ons, not table-stakes features. Scouts expect search, photos, and contract info. They don't expect OBV.

4. **The phased approach manages cash flow.** Free data for dev, one paid provider at launch, both when revenue justifies it.

### Data gaps and how to fill them

| Gap | Solution | Cost | Priority |
|---|---|---|---|
| Market value | API-Football (`api-football.com`) | $0 (free tier: 100 req/day) to $19/mo | HIGH -- scouts expect this |
| Player photos (if no WyScout) | API-Football player endpoint | Included in above | HIGH |
| Injury history | API-Football injuries endpoint | Included in above | MEDIUM |
| Wage/salary | Capology scraping or manual | Free (scraping) | LOW -- nice-to-have |
| Full agent details | Manual database or TransferRoom partnership | Variable | LOW |
| Highlights/video | YouTube API or WyScout video (separate from API) | $0 (YouTube) to $299/yr (WyScout individual) | MEDIUM |

**API-Football is the single best supplementary source** -- it fills market value, photos, and injury history in one integration at $0-19/mo.

---

## 5. Implementation Roadmap

### Phase 1: NOW (Pre-launch, $0 cost)

| Task | Detail | Effort |
|---|---|---|
| Integrate StatsBomb open data | Use `statsbombpy` or direct GitHub raw URLs (already coded in `statsbomb.ts` via `STATSBOMB_OPEN_URL`). Load 3,000+ real matches for La Liga, World Cup, Euros. | 1 day |
| Build player stats index from open data | Aggregate event data into per-player season stats. Store in Supabase. This becomes the search/filter backend. | 2-3 days |
| Replace mock data with real StatsBomb data | Wire up player search, radar charts, and AI reports to use real aggregated stats from the open data set. | 2-3 days |
| Integrate API-Football free tier | 100 req/day covers development. Get player photos, market values, injury history. Store in Supabase as supplementary data. | 1-2 days |
| Update `wyscout.ts` provider | Change base URL from v3 to v4. Add photo endpoint (`?imageDataURL=true`), contract endpoint (`/contractinfo`). Keep ready for production but don't activate yet. | 1 day |
| **Total Phase 1** | **Real data in the app, $0 cost** | **~1-2 weeks** |

**What ScoutCopilot looks like after Phase 1:**
- NL search works against real player data (StatsBomb open data -- La Liga, international tournaments)
- AI reports generated from real event-level stats
- Radar charts with real per-90 metrics
- Player photos and market values from API-Football
- Limited to StatsBomb open data coverage (~7 competitions)

### Phase 2: LAUNCH (First paying customers, ~$6K-18K/yr)

| Task | Detail | Effort |
|---|---|---|
| Activate WyScout API subscription | Start with 1-3 priority leagues (e.g., Big 5 European leagues). Negotiate startup/academic pricing. | Business negotiation |
| Wire WyScout as primary search provider | Replace StatsBomb open data search with WyScout player search API. Much richer filters, 600+ competitions. | 2-3 days |
| Implement WyScout player detail pipeline | Photos, contract expiry, agent info, transfer history flowing into player detail pages. | 2-3 days |
| Keep StatsBomb open data as analytics layer | Continue using open data for advanced metrics on players/matches where available. Enriches AI reports. | Already done |
| Upgrade API-Football to paid tier | $19/mo for 7,500 req/day. Covers market value and photos for all players WyScout returns. | 1 hour |
| Implement data caching in Supabase | Cache WyScout + API-Football responses. Reduce API calls, improve response times, stay within rate limits. | 2-3 days |
| **Total Phase 2** | **Full production data, professional scouting UX** | **~1-2 weeks + business negotiation** |

**What ScoutCopilot looks like after Phase 2:**
- NL search across 600+ competitions worldwide
- Complete player profiles (photo, bio, stats, contract, agent, transfers, market value)
- AI reports with real WyScout stats + StatsBomb advanced metrics where available
- Watchlist alerts for contract expiry and team changes
- Squad builder with real roster data

### Phase 3: SCALE (Revenue justifies, ~$20K-65K+/yr)

| Task | Detail | Effort |
|---|---|---|
| Add StatsBomb paid subscription | Negotiate with Hudl for bundled WyScout + StatsBomb deal (both owned by Hudl). | Business negotiation |
| Implement Hudl ID Mapping API | Free for dual subscribers. Maps WyScout player IDs to StatsBomb player IDs. | 1-2 days |
| Build unified data layer | Merge WyScout profile data with StatsBomb 360 data, OBV, carries, line-breaking passes. | 3-5 days |
| Upgrade AI reports with 360 data | Claude generates tactical analysis using freeze-frame data (defender/GK positions at moment of shot, pass, carry). Major differentiation. | 2-3 days |
| Add StatsBomb-exclusive radar metrics | OBV, xPass, pass clustering as radar chart options. Unique selling point vs competitors using WyScout alone. | 1-2 days |
| Video integration (WyScout) | Link scouting reports to relevant video clips. Requires WyScout video pack. | 3-5 days |
| **Total Phase 3** | **Best-in-class data platform** | **~2-3 weeks + business negotiation** |

**What ScoutCopilot looks like after Phase 3:**
- Everything from Phase 2 PLUS:
- OBV rankings, 360 freeze-frame tactical visualizations
- AI reports referencing specific plays with freeze-frame context
- Radar charts with metrics no competitor has (carries, line-breaking passes, ball receipts in space)
- Video clips linked to scouting reports
- This is the product that competes with (and potentially surpasses) standalone WyScout/StatsBomb UIs

---

## 6. Current Codebase Status

### Existing provider implementations

| File | Status | Notes |
|---|---|---|
| `C:\Business\Internal Projects\ScoutCopilot\supabase\functions\_shared\providers\wyscout.ts` | Partially implemented | Uses v3 URL (needs v4). Has `searchPlayers`, `getPlayerStats`, `getPlayerDetails`. Missing: photo param, contract endpoint, transfer endpoint. |
| `C:\Business\Internal Projects\ScoutCopilot\supabase\functions\_shared\providers\statsbomb.ts` | Partially implemented | Uses REST v2 URL (production is GraphQL). Has open data fallback URL. Has `getCompetitions`, `getLineups`, `getPlayerMatchStats`, `searchPlayers`, `getPlayerSeasonStats`. |

### What needs updating for Phase 1

**`statsbomb.ts`:**
- Open data URL is already correct (`raw.githubusercontent.com/statsbomb/open-data/master/data`)
- Add functions: `getOpenDataCompetitions()`, `getOpenDataMatches()`, `getOpenDataEvents()` using the open data paths
- The `useOpenData` flag in `statsbombFetch` already supports this pattern

**`wyscout.ts`:**
- Change `WYSCOUT_BASE_URL` from `v3` to `v4`
- Add `getPlayerPhoto(playerId, credentials, orgId)` function with `?imageDataURL=true` param
- Add `getContractInfo(playerId, credentials, orgId)` function
- Add `getTransfers(playerId, credentials, orgId)` function

---

## 7. Decision Matrix (Quick Reference)

| If your priority is... | Choose... |
|---|---|
| Fastest time to real data (free) | StatsBomb open data |
| Best player search experience | WyScout |
| Most complete player profiles | WyScout + API-Football |
| Deepest tactical analysis | StatsBomb |
| Lowest production cost | WyScout (cheaper than StatsBomb for equivalent coverage) |
| Maximum differentiation vs competitors | Both (WyScout foundation + StatsBomb advanced metrics) |
| MVP with real data, zero spend | StatsBomb open data + API-Football free tier |

---

## Appendix: Provider API Endpoint Reference

### WyScout v4 Key Endpoints

```
GET /v4/players                          # Search players with filters
GET /v4/players/{id}                     # Player details
GET /v4/players/{id}?imageDataURL=true   # Player details + base64 photo
GET /v4/players/{id}/advancedstats       # 115 metrics
GET /v4/players/{id}/contractinfo        # Contract expiry + agency
GET /v4/players/{id}/transfers           # Transfer history
GET /v4/teams/{id}/squad                 # Team roster
GET /v4/competitions                     # All available competitions
GET /v4/matches/{id}/events              # Match events (Events Pack)
```

### StatsBomb Key Endpoints

```
# GraphQL (production)
POST /v1/graphql                         # All queries via GraphQL

# REST v2 (legacy, still works)
GET /api/v2/competitions                 # Available competitions
GET /api/v2/matches/{id}                 # Match details
GET /api/v2/events/{id}                  # Match events (~3,400/match)
GET /api/v2/lineups/{id}                 # Match lineups
GET /api/v2/three-sixty/{id}            # 360 freeze-frame data

# Open Data (free, GitHub raw)
GET /statsbomb/open-data/master/data/competitions.json
GET /statsbomb/open-data/master/data/matches/{comp_id}/{season_id}.json
GET /statsbomb/open-data/master/data/events/{match_id}.json
GET /statsbomb/open-data/master/data/three-sixty/{match_id}.json
GET /statsbomb/open-data/master/data/lineups/{match_id}.json
```

### API-Football Key Endpoints (Supplementary)

```
GET /v3/players?id={id}                  # Player details + photo + market value
GET /v3/players?search={name}            # Player search
GET /v3/injuries?player={id}             # Injury history
GET /v3/transfers?player={id}            # Transfer history
GET /v3/players/squads?team={id}         # Team squad
```
