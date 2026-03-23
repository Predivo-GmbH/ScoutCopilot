# Phase 1 — Idea Validation: AI Football Scouting Tool
**Date:** 2026-03-22
**Status:** VALIDATED — Proceed to Phase 2

---

## Executive Summary

An AI-powered scouting assistant that sits on top of Hudl/Wyscout data and lets football clubs find, evaluate, and shortlist players using natural language queries. The tool targets the ~30,000 professional and semi-professional clubs that lack in-house data science teams but have access to raw scouting data they can't fully exploit.

**Winning Idea:** "Scout Copilot" — a natural language AI assistant for football scouting, built on top of Hudl/Wyscout/StatsBomb APIs.

---

## 1. Problem Validation

### Pain Points (Exact Customer Language)

| Pain Point | Evidence |
|-----------|----------|
| Data overload | "Constantly updating spreadsheets, looking for scattered files and trying to make evaluations from dispersed information" |
| No AI layer | "A pile of reports for the next transfer window but no way to filter them down to meet the club's specific requirements" |
| Time drain | "Previously, it cost scouts hours or longer to sift through all those reports; now they get a list of players plus a summary in seconds" — Sevilla FC |
| Hudl = wrong sport | "Hudl for soccer is like bringing a pick up truck to the race track" — BigSoccer forum |
| Tool complexity | "It requires almost a basic programming course to get real value out of it" — G2 review on Sportscode |
| Same data, no edge | "Everyone is scouting players using the same parameters" — clubs can't differentiate |
| Pricing lock-out | Wyscout: $3K-$10K/yr, StatsBomb: $30K-$100K/yr — smaller clubs priced out of advanced analytics |

### Communities Where This Pain Is Discussed
- Reddit: r/football, r/soccer, r/footballtactics
- BigSoccer.com forums (active Hudl discussion threads)
- ScoutDecision blog (scouting industry)
- G2/Capterra reviews for Hudl Sportscode
- 360scouting.com (scouting tool comparisons)

---

## 2. Market Size

| Metric | Value |
|--------|-------|
| Professional + semi-pro clubs globally | ~32,000 |
| Clubs using some form of video/data tool | ~10,000-15,000 |
| Football analytics market (2025) | $1.36B |
| Football analytics market (2034 projected) | $4.04B |
| Market CAGR | 12.9% (football fastest-growing segment at >20%) |
| Independent scouts and agents globally | ~50,000 |

### Addressable Market for Scout Copilot
- **TAM:** 32,000 clubs + 50,000 scouts = 82,000 potential customers
- **SAM:** ~15,000 organizations with data tool access
- **SOM (Year 1-3):** 1,000-3,000 customers
- **Revenue potential:** $9.5M ARR at 10% penetration of scouts + clubs at $79/mo

---

## 3. Competitive Landscape

### Major Players

| Competitor | Focus | Price Range | Key Weakness |
|-----------|-------|-------------|-------------|
| Wyscout (Hudl) | Video + data platform | $3K-$10K/yr | No AI interpretation layer, raw data only |
| InStat (Hudl) | Match data + video | $5K-$30K/yr | Limited customization, accuracy concerns |
| StatsBomb (Hudl) | Advanced event data | $30K-$100K/yr | Data provider, not scouting workflow tool |
| SciSports | AI player ratings | $15K-$50K/yr | "Black box" AI, expensive, video-light |
| Nacsport | Manual video analysis | $500-$5K/yr | Zero AI, very manual process |
| Catapult | GPS/wearable tracking | $10K-$100K/yr | Physical focus, overkill for scouting |
| Metrica Sports | AI tracking from video | $10K-$40K/yr | No scouting workflow, data generation only |
| Twelve Football | WhatsApp scout bot | Unknown | Narrow (chat only), elite-focused |
| ScoutingStats | Affordable scouting | $13/mo | Basic stats, no AI |

### Competitor Gap Matrix — Unserved Capabilities

| Capability | Any Competitor? | Opportunity |
|-----------|----------------|-------------|
| Natural language player search | NO | **PRIMARY DIFFERENTIATOR** |
| AI-generated scouting reports | NO | **STRONG GAP** |
| Tactical system fit analysis | NO (SciSports basic) | **STRONG GAP** |
| Automated video event tagging for soccer | Minimal (Hudl Assist basic) | **MODERATE GAP** |
| Development trajectory prediction | NO (SciSports basic) | **STRONG GAP** |
| Affordable AI for mid/lower-tier clubs | NO | **STRONG GAP** |
| Custom metrics/models | NO (API-only via StatsBomb) | **STRONG GAP** |

**Key insight:** No one has built the "AI interpretation layer on top of Hudl." Hudl owns the data monopoly but has no AI scouting product. This is the gap.

---

## 4. Technical Feasibility

### Data Access Assessment

| Method | Feasibility | Cost |
|--------|------------|------|
| Wyscout commercial API (OpenAPI 3.0) | HIGH — well-documented, ~1,800 events/match | $3K-$10K/yr partnership |
| StatsBomb API (via Hudl) | HIGH — 3,000+ events/match, 50+ metrics | Commercial license required |
| StatsBomb Open Data (free) | HIGH — ideal for MVP/prototype | FREE |
| Sportmonks API | HIGH — self-service, broad coverage | $30-$300/mo |
| API-Football (RapidAPI) | HIGH — free tier available | $0-$100/mo |
| FBref.com (web data) | MEDIUM — scrapeable with care | Free |
| Direct Hudl scraping | LOW — TOS violation, legal risk | N/A — DO NOT USE |

**Recommended MVP data strategy:**
1. Start with **StatsBomb Open Data** (free) for prototype and demo
2. Add **Sportmonks** or **API-Football** for broad coverage ($30-300/mo)
3. Pursue **Wyscout API partnership** once product has traction
4. User-uploaded data as an alternative input path

### Tech Stack (Solo Dev)
- Frontend: React 19 + Vite 8 + TypeScript + Tailwind 4
- Backend: Supabase (auth, DB, edge functions)
- AI: Claude API or OpenAI for NL queries (RAG architecture)
- Data: StatsBomb Open Data → Sportmonks → Wyscout API
- Hosting: Metanet FTP
- Build time: 4-8 weeks for MVP

---

## 5. Commercial API Deep Dive

### Tier 1 — Football-Specific Data APIs

#### Wyscout Data API (Hudl)
- **Docs:** [apidocs.wyscout.com](https://apidocs.wyscout.com/)
- **Auth:** Basic Access Authentication (Base64 username:password)
- **Pricing:** Platform subs: Copper ~€299/yr, Mercury ~€399/yr, Gold/Diamond = quote. API data packs: custom, est. €3,000-10,000+/yr
- **Rate limits:** 12 requests/second per API key
- **Coverage:** 600+ leagues, 500,000+ players, ~1,800 events/match, up to 5 years history
- **Freshness:** Near real-time event tagging during matches; post-match within hours
- **Format:** JSON (OpenAPI 3.0, downloadable .yml spec)
- **Free tier:** None for API. Copper plan (€299/yr) is video access only.
- **Commercial use:** Yes — designed for clubs, agencies, media. License negotiated per contract.
- **Scouting score: 9/10** — Can answer "find a left-back under 24 with strong crossing stats." No raw tracking/positional (x,y) data or physical metrics.

#### StatsBomb API (Hudl)
- **Docs:** [live-data-api-guide.statsbomb.com](https://live-data-api-guide.statsbomb.com/)
- **Auth:** API credentials (username/password) for REST; GraphQL API for live data
- **Pricing:** Enterprise-only, est. €5,000-20,000+/yr depending on competition coverage
- **Coverage:** 190+ competitions, 3,400+ events/match (industry-leading), 360 freeze-frame data for 40+ key leagues
- **Freshness:** Live data via GraphQL. Post-match event data within 24-48 hours.
- **Format:** JSON (REST) and GraphQL
- **Free tier:** StatsBomb Open Data on GitHub (see Tier 3). No free commercial API.
- **Commercial use:** Yes — designed for commercial analytics. License negotiated per client.
- **Scouting score: 10/10** — Most granular event data available. Freeze-frame (360) shows exact positions of all players at every event. xG, xA, pressure events, carries, ball receipts.

#### Sportmonks Football API
- **Docs:** [docs.sportmonks.com/football](https://docs.sportmonks.com/football/)
- **Auth:** Bearer token
- **Pricing:** Starter €29/mo (5 leagues, 2K calls/hr) | Growth €99/mo (30 leagues, 2.5K calls/hr) | Pro €249/mo (120 leagues, 3K calls/hr) | Enterprise custom (2,300+ leagues). Add-ons: xG €24/mo, odds €15/mo, extra leagues €4/mo each.
- **Rate limits:** 2,000-5,000 calls/hr depending on plan
- **Coverage:** 2,300+ leagues and cups, fixtures, live scores, standings, lineups, player stats, xG (add-on)
- **Freshness:** Live scores real-time. xG: 12hrs (basic) to real-time (advanced).
- **Format:** JSON
- **Free tier:** Yes — free plan with limited data, no expiration. 14-day trial on paid plans.
- **Commercial use:** **EXPLICITLY ALLOWED for SaaS products.** Cannot resell raw data.
- **Scouting score: 7/10** — Good for dashboard with basic-to-intermediate metrics. No event-level data (individual passes, pressures). No tracking. No video.

#### API-Football (API-Sports / RapidAPI)
- **Docs:** [api-football.com/documentation-v3](https://www.api-football.com/documentation-v3)
- **Auth:** `x-apisports-key` header (direct) or `X-RapidAPI-Key` (via RapidAPI)
- **Pricing:** Free $0 (100 req/day) | Pro $19/mo (7,500/day) | Ultra $29/mo (75,000/day) | Mega $39/mo (150,000/day). All plans = all endpoints + all competitions.
- **Coverage:** 1,200+ leagues. Endpoints: fixtures, livescore, events, lineups, top scorers, players, transfers, injuries, odds, predictions.
- **Format:** JSON
- **Free tier:** Yes — 100 req/day, all endpoints, forever free, no credit card.
- **Commercial use:** **CAUTION — does NOT grant commercial rights.** Reselling prohibited. Users must obtain own licenses from rights holders.
- **Scouting score: 6/10** — Broad coverage, cheap. No xG/xA, no event-level detail, aggregated stats only.

#### Football-Data.org
- **Docs:** [football-data.org/documentation/api](https://www.football-data.org/documentation/api)
- **Auth:** `X-Auth-Token` header
- **Pricing:** Free €0 (12 competitions, 10 req/min) | Standard €49/mo (25 competitions) | Advanced €99/mo (50) | Pro €199/mo (100). Add-ons: odds €15/mo, statistics €15/mo.
- **Coverage:** Up to 100 competitions. Fixtures, standings, teams, players, match scores.
- **Free tier:** Yes — 12 top competitions, forever free.
- **Scouting score: 4/10** — Mostly fixtures/results. No player-level advanced stats, no xG, no events.

#### Opta / Stats Perform
- **Docs:** [developer.stats.com](https://developer.stats.com/)
- **Auth:** OAuth / enterprise credentials
- **Pricing:** Fully custom, est. $10,000-100,000+/yr. Multi-year contracts typical.
- **Coverage:** Gold standard — virtually every professional league globally. Historical data going back decades.
- **Scouting score: 9/10** (if budget allows) — Cost is prohibitive for startups.

### Tier 2 — Supplementary Data

| Source | Official API? | Data | Commercial Use | Scouting Score |
|--------|-------------|------|---------------|---------------|
| **Transfermarkt** | NO — scraping only | Market values, transfer history, contracts, injuries | **HIGH RISK** — scraping violates ToS | 8/10 data, 3/10 legal |
| **SofaScore** | NO — no public API | Player ratings, match events, heat maps | Not available | 5/10 |
| **FBref** | NO — scraping only | Comprehensive stats (StatsBomb-powered), xG, xA, progressive passes | Legally gray — license StatsBomb instead | 8/10 data, 4/10 legal |
| **SkillCorner** | Enterprise API | Tracking data from broadcast video, physical metrics, XY coordinates | Yes (licensed), est. €5K-15K/yr | 9/10 for physical profiling |
| **Understat** | NO — scraping only | xG, xA, shot data for 6 leagues (from 2014/15) | Legally gray | 6/10 |

### Tier 3 — Free/Open Data

| Source | Data | Format | Best For |
|--------|------|--------|---------|
| **StatsBomb Open Data** ([GitHub](https://github.com/statsbomb/open-data)) | Full event data: passes, shots, carries, pressures, 360 freeze-frames. Select competitions (World Cups, FA WSL, La Liga seasons) | JSON | **MVP prototyping** — identical format to paid API |
| **SkillCorner Open Data** ([GitHub](https://github.com/SkillCorner/opendata)) | 10 matches broadcast tracking (A-League 2024/25), XY coordinates | CSV | Physical profiling prototype |
| **Kaggle Datasets** | Player stats 2025-26, Transfermarkt values, historical match data | CSV | Static analysis, ML training |
| **Football-Data.co.uk** | Historical match results with betting odds | CSV | Match outcome ML models |

### Recommended Data Stack Strategy

| Phase | Budget | Sources | What You Can Build |
|-------|--------|---------|-------------------|
| **MVP Prototype** | $0/mo | StatsBomb Open Data + Kaggle datasets + Football-Data.org free tier | Working AI scouting assistant on historical data. Enough to validate concept + get early feedback. |
| **Paid Launch** | ~€200-350/mo | Sportmonks Growth/Pro (€99-249) + xG add-on (€24) + Football-Data.org Standard (€49) | Live scouting across 30-120 leagues with player stats, xG, scores. Enough for a paid product. |
| **Scale** | ~€1,500-3,500/mo | Wyscout API (€250-670) + StatsBomb API (€420-1,250) + Sportmonks Pro (€249) | Professional-grade with event-level data, freeze-frames. Competitive with pro club tools. |
| **Enterprise** | €3K-8K+/mo | + SkillCorner (tracking) + Opta (full coverage) | Full physical + tactical + event data. Enterprise-grade. |

### Key Commercial Decision: Sportmonks Is the MVP Data Provider

Sportmonks is the **only mid-tier provider that explicitly permits commercial SaaS use**. This makes it the clear choice for launch:
- Self-service signup (no sales calls)
- Free trial to validate before committing
- Clear pricing (no enterprise negotiation)
- xG available as add-on
- 2,300+ leagues at Pro tier
- Well-documented REST API

**API-Football is NOT recommended** despite being cheaper — their ToS does not grant commercial rights, creating legal risk for a SaaS product.

---

## 6. Winning Idea Brief

### Scout Copilot — AI-Powered Football Scouting Assistant

**One-line:** "Ask your scouting database questions in plain English and get AI-ranked player shortlists in seconds."

**Core problem:** Football clubs have access to mountains of scouting data (via Hudl/Wyscout) but lack the analyst staff to turn it into actionable intelligence. Scouts spend hours manually filtering spreadsheets instead of evaluating players.

**Solution:** A conversational AI assistant that connects to football data APIs and lets scouts ask natural language questions like:
- "Find me a left-footed center-back under 24 with strong aerial stats, budget under €500K"
- "Who are the top 10 progressive passers in Ligue 2 this season?"
- "Compare these 3 players for our 4-3-3 pressing system"
- "Generate a scouting report for Player X"

**Target customer:** Mid-tier professional clubs (Championship, Eredivisie, Belgian Pro League level), semi-pro clubs, independent scouts, and player agencies.

**Why now:**
- LLM technology makes natural language queries over structured data trivially easy
- Hudl's monopoly means data is concentrated and API-accessible
- Sevilla FC and Twelve Football have validated the concept at elite level — no one has productized it for the other 30,000 clubs
- Football analytics market growing at >20% CAGR

**MRR potential:** $9.5M ARR at scale ($79-299/mo pricing)
**Buildability:** 9/10 (well-solved tech pattern: RAG + structured data + LLM)
**Solo dev timeline:** 4-8 weeks for MVP

### Backup Idea: AI Player Shortlist Generator
If the NL assistant approach proves too broad, narrow to a focused shortlist tool: clubs input their requirements (position, age, budget, league, play style) and get an AI-ranked shortlist with comparison scores. Buildability: 8/10, Market: $6M ARR.

---

## 7. Critical Risk Assessment — The Data Dependency Problem

### 7.1 The Core Problem: This Product IS Its Data

Without comprehensive, live, professional-grade football data, this application has zero value. The AI layer — the chat interface, the NL queries, the ranking algorithms — is commodity technology. The entire value proposition is the DATA underneath it.

A scout who asks "find me a left-footed CB under 24 in Ligue 2 with strong aerial stats" and gets results based on 3-year-old World Cup data will never come back. They'll open Wyscout and do it manually.

### 7.2 Why Licensing Data Ourselves Doesn't Work

The original phased strategy (free data → Sportmonks → Wyscout API) has fatal flaws:

**Free data (StatsBomb Open Data):** Covers World Cups and women's leagues only. No current-season data for any major men's league. USELESS for a real scouting product. Only valid for internal dev/testing.

**Sportmonks (~€300/mo):** Provides basic stats (goals, assists, xG) but NO event-level data (individual passes, pressures, defensive actions). A product built on this competes with free websites like FBref — not enough value to justify a subscription.

**Wyscout + StatsBomb (€670-2,500/mo):** The real data, but the costs create a chicken-and-egg problem: can't validate without data, can't afford data without revenue, can't get revenue without data.

Additionally, licensing data ourselves creates critical business risks:
- Data costs eat margins (need 9-32 customers at $79/mo just to cover data)
- 100% dependent on Hudl (owns both Wyscout AND StatsBomb)
- Hudl can change terms, raise prices, or restrict access at any time
- Hudl could build the same AI layer themselves (they have all the data + customer relationships)
- No proprietary data moat — we're just a middleman

### 7.3 Hudl's Corporate Structure (Clarification)

Hudl owns ALL three major football data/scouting brands:

| Company | Acquired | Role | Status |
|---------|----------|------|--------|
| **Wyscout** | 2019 | Video scouting platform | Active — primary scouting product |
| **InStat** | 2020 | Video analysis + basic stats | Being sunset — merged into Wyscout |
| **StatsBomb** | Nov 2023 | Advanced event data + analytics | Active — premium data product |

**They are NOT the same product** despite being the same parent company:
- **Wyscout** = video clips + player search + basic match stats (~1,800 events/match)
- **StatsBomb** = deep event data + 360 freeze-frames + xG models (~3,400 events/match)
- A club subscribing to both gets an ID mapping API (free) to link Wyscout and StatsBomb player/match IDs
- They are still sold as **separate subscriptions** through one Hudl sales team
- Bundled deals are available but there is NO unified "Hudl Data API" yet

**The competitive landscape is now: Hudl (Wyscout + StatsBomb) vs. Stats Perform (Opta).**

### 7.4 The BYOK Model — Critical Reality Check

The BYOK (Bring Your Own Key) concept — where the customer plugs their own API credentials into our software — is the right business model. But the original assumption that "most clubs already have API access" is **wrong**.

**What customers actually have:**

#### Wyscout Plans vs. API Access

| Plan | Price | Includes API? | What It Includes |
|------|-------|--------------|------------------|
| **Copper** | $325/yr (~€299) | **NO** | 70 min video clips/mo, 2 PDF reports/mo, no downloads |
| **Mercury** | $435/yr (~€399) | **NO** | 170 min video clips/mo, 2 PDF reports/mo, no downloads |
| **Gold** | Contact sales | **NO** | 520 min clips/mo, 10 full matches/mo, downloads, advanced search |
| **Diamond** | Contact sales | **NO** | 1,020 min clips/mo, 40 full matches/mo, full feature access |
| **Data API** | Contact sales (separate product) | **YES** | Separate product line entirely. Not an add-on. |

**The Wyscout Data API is a completely separate product**, not an upgrade to any platform plan. Key facts:
- Must contact Hudl/Wyscout sales to get API access
- No self-service signup or API key generation dashboard
- Credentials (username/password for Basic Auth) are provisioned by sales team
- Pricing is per-league: **~GBP 5,000/league/year** (anecdotal but widely cited)
- Data comes in separate packs: Database Pack, Stats Pack, Events Pack, Physical Data Pack
- Each pack likely priced separately on top of per-league fees

#### StatsBomb API Access

| Aspect | Detail |
|--------|--------|
| Self-service? | **NO** — enterprise sales only |
| Pricing | Not public. Estimated: low-to-mid five figures/yr per league |
| Auth (REST) | Basic Auth (username/password, provisioned by sales) |
| Auth (Live GraphQL) | OAuth2 Client Credentials (Client_ID + Client_Secret, daily token refresh) |
| Coverage | 190+ competitions, 200,000+ players |
| Who buys | Professional clubs, federations, betting companies, media, agencies |

**Bottom line:** Most mid-tier clubs (our target market) likely have Wyscout Copper/Mercury for video scouting but do NOT have the separate Data API product. Getting API access requires a separate sales conversation and significant additional cost (~GBP 5K+ per league).

### 7.5 Revised BYOK Assessment — Who Actually Has API Access?

| Customer Segment | Wyscout Platform? | Wyscout Data API? | StatsBomb API? | Realistic? |
|-----------------|-------------------|-------------------|----------------|------------|
| **Top clubs (PL, La Liga top)** | Diamond | Likely yes | Likely yes | YES — but they build in-house tools |
| **Upper-mid clubs (Championship, Eredivisie top)** | Gold/Diamond | Maybe | Maybe | POSSIBLE — depends on analytics budget |
| **Lower-mid clubs (League One, 2. Bundesliga)** | Copper/Mercury | **Unlikely** | **No** | LOW — API access too expensive |
| **Semi-pro clubs** | Maybe Copper | **No** | **No** | NO |
| **Player agencies (major)** | Likely yes | Possibly | Possibly | POSSIBLE |
| **Independent scouts** | Copper/Mercury | **No** | **No** | NO |

**The honest reality:** The customers who have API access are mostly top-tier clubs who already have in-house data teams. The mid-tier clubs we want to target probably DON'T have API access and would need to purchase it separately at ~GBP 5K+/league/year — which is a significant barrier.

### 7.6 Should We Offer Sportmonks/API-Football/CSV Connectors?

You asked whether it makes sense to offer cheaper data source connectors. Let's be honest:

| Connector | Data Quality for Scouting | Can Answer Real Scouting Questions? | Worth Building? |
|-----------|--------------------------|-------------------------------------|-----------------|
| **Wyscout Data API** | Excellent (9/10) | YES — event data, player search, 150+ metrics, video | **YES — primary connector** |
| **StatsBomb API** | Best available (10/10) | YES — deepest event data, freeze-frames, xG/xA | **YES — premium connector** |
| **Sportmonks** | Basic (4/10 for scouting) | NO — only aggregated season stats (goals, assists, cards). No individual passes, pressures, defensive actions. A scout asking "find progressive passers" gets NOTHING useful. | **NO — misleading to offer** |
| **API-Football** | Basic (3/10 for scouting) | NO — same problem as Sportmonks, even less data. Plus no commercial rights in ToS. | **NO — legal risk + useless data** |
| **Football-Data.org** | Minimal (2/10 for scouting) | NO — fixtures and standings only. Zero player-level analysis. | **NO — not a scouting tool** |
| **CSV Upload** | Depends on user data | MAYBE — if user exports from Wyscout/FBref and uploads. But manual, fragile, and format varies. | **MAYBE — as last resort fallback** |

**Verdict: Only Wyscout and StatsBomb APIs produce data good enough to power a real scouting assistant.** Offering Sportmonks/API-Football connectors would create a poor first impression — the product would look broken because it can't answer the questions scouts actually ask. It's better to be honest: "This product requires Wyscout or StatsBomb API access to deliver value."

### 7.7 The QA Problem — How Do We Test Without Data?

You correctly identified this: **we cannot build, test, or QA the product without having at least one account with real API data.**

**Options for development/QA data:**

| Option | Cost | Feasibility | Data Quality |
|--------|------|-------------|-------------|
| **StatsBomb Open Data (GitHub)** | Free | HIGH — immediate access | Good for testing the AI pipeline architecture. 21 competitions, same JSON format as paid API. But historical/limited — not current season. |
| **Wyscout Copper ($325/yr)** | $325/yr | HIGH — self-service | Platform access only (video). NO API. Cannot test API integration. |
| **Wyscout Data API (dev license)** | Unknown — must ask sales | MEDIUM — requires sales call | Real data, real API. Could ask for a trial/dev license. |
| **StatsBomb API (dev license)** | Unknown — must ask sales | MEDIUM — requires sales call | Best data, real API. Could ask for a trial/dev license. |
| **Mock API with StatsBomb Open Data** | Free (dev time only) | HIGH | Build a local mock server that serves StatsBomb Open Data in the same format as the real API. Test the full pipeline without real credentials. |

**Recommended QA approach:**

1. **Phase 1 (Build):** Use StatsBomb Open Data + a mock API server. Build and test the entire NL → query → result → AI analysis pipeline against this mock. Validates architecture, AI quality, and UX.
2. **Phase 2 (Real data validation):** Contact Wyscout/StatsBomb sales. Request a **developer trial or limited-scope API access** for integration testing. Many data providers offer this for verified tool builders — especially if you position it as "building a tool that drives more value from your platform" (which benefits Hudl).
3. **Phase 3 (Beta):** Get 1-2 beta customers (clubs/agencies with existing API access) to test with real credentials. They validate the product on live data while we QA the integration.

**Critical insight:** The mock API approach lets us build 90% of the product without any API cost. The remaining 10% (real endpoint behavior, rate limits, data freshness) requires a real account — but that's a focused QA phase, not the entire development cycle.

### 7.8 The Real Business Model — Revised Honestly

Given everything above, here's the honest picture:

**The product requires customers who have (or are willing to buy) Wyscout/StatsBomb Data API access.** This is a smaller market than "all clubs with Wyscout" but a more valuable one.

**Actual target customer profile:**
- Professional clubs (Tier 1-3) with existing Wyscout Data API + possibly StatsBomb
- Player agencies with Wyscout Data API access
- Clubs considering upgrading from Wyscout platform-only to platform + API (we become the reason to upgrade)

**The value proposition shifts slightly:**
- For clubs WITH API access: "You're paying GBP 5K+/yr for data API access but querying it manually via spreadsheets. Our AI layer makes that investment 10x more productive."
- For clubs WITHOUT API access: "Upgrading to Wyscout Data API costs ~GBP 5K/league/yr. Combined with our AI tool ($149/mo), you get a full AI scouting department for less than hiring one junior analyst."

**Revised economics (BYOK model with honest market sizing):**

| Metric | Value |
|--------|-------|
| Our monthly fixed costs | ~€80 (hosting + AI API) |
| Cost per customer | ~€2-5/mo (AI API usage) |
| Break-even | 1-2 customers at $149/mo |
| Gross margin at 50 customers | ~95% |
| Realistic addressable market | ~3,000-5,000 organizations with Wyscout/StatsBomb API access |
| Realistic Year 1 target | 20-50 customers |
| Year 1 ARR target | $36K-$90K at $149/mo |

### 7.9 Remaining Risks (Final Honest Assessment)

| Risk | Severity | Detail | Mitigation |
|------|----------|--------|------------|
| **Small addressable market** | HIGH | Only orgs with Wyscout/StatsBomb API access (~3-5K globally). Much smaller than original 82K estimate. | Position as "the reason to upgrade" — expand market by making API access more valuable. Also: agencies are an underserved segment with API access. |
| **Wyscout ToS may prohibit third-party tool usage** | MEDIUM | Wyscout markets API for use with BI tools (Tableau, Power BI) — suggesting third-party use is OK. But building a commercial SaaS that displays their data to end users "likely restricted without special license." | Verify with Wyscout sales during dev phase. Customer using their own credentials is standard practice (Zapier model). The data never leaves the customer's session. |
| **Hudl builds their own AI layer** | HIGH | Hudl already integrates Wyscout video into StatsBomb IQ. Adding an AI chat layer is trivially easy for them. They have every incentive. | Speed advantage only. If Hudl ships their own AI scouting copilot, this product's window closes. |
| **Customer acquisition cost** | MEDIUM | Selling to professional football clubs requires industry credibility and relationships. Cold outreach to sporting directors is hard for an unknown brand. | Start with agencies (more accessible), football analytics community, LinkedIn/Twitter football analytics circles. |
| **QA requires real API access** | MEDIUM | Can't fully validate without real Wyscout/StatsBomb credentials. | Mock API for development, request dev trial from Hudl for integration testing. |
| **Customer's API rate limits** | LOW | Wyscout: 12 req/s. No documented daily/monthly caps. Smart caching needed. | Session-level caching, batch queries, pre-compute common patterns. |

### 7.10 Does This Fit the 1-Person AI SaaS Model?

| Criteria | Scout Copilot (BYOK, Revised) | Typical 1-Person SaaS |
|----------|-------------------------------|----------------------|
| Data ownership | Customer-provided (BYOK) | Own data or user-generated |
| Our monthly fixed costs | ~€80 | $0-50/mo |
| Break-even customers | 1-2 | 1-5 |
| Addressable market | ~3,000-5,000 orgs (smaller but high-value) | Varies |
| Time to first revenue | Weeks (build) + weeks (acquire first customer) | Weeks |
| Defensibility/moat | AI quality + Wyscout/StatsBomb deep integration | Own product, own data |
| Single point of failure | Hudl (API stability + ToS) | None |
| Scalability | Limited by addressable market (~5K orgs) | Unlimited |
| Sales cycle | Longer — selling to professional football clubs | Shorter — self-service SaaS |

**Verdict: CONDITIONALLY YES.** The BYOK model makes the economics work, but the addressable market is smaller than initially assumed, the sales cycle is longer (B2B to football clubs), and there's meaningful platform risk from Hudl. This is viable but requires realistic expectations — it's a niche B2B tool, not a mass-market SaaS.

---

## 8. Final Feasibility Verdict

**Assessment: CONDITIONALLY VALIDATED — viable but niche, with platform risk**

### What's Strong:
- Real, validated pain points (scouts drowning in data, no AI layer exists)
- BYOK model eliminates data cost problem (~95% margins)
- The AI layer is technically straightforward to build (4-8 weeks)
- Professional clubs and agencies are willing to pay $149+/mo for tools that save analyst hours

### What's Concerning:
- Addressable market is ~3-5K organizations (not 82K as originally estimated)
- Dependent on Hudl's API stability and ToS permitting third-party tool usage
- Hudl could build this themselves at any time
- Selling to professional football clubs requires industry credibility
- Sportmonks/API-Football/CSV connectors don't produce data good enough for real scouting — the product only works with Wyscout/StatsBomb APIs
- QA requires negotiating at least a dev trial with Hudl

### The Decision

This is a **viable niche B2B product** with strong margins but platform risk and a smaller-than-expected market. It's fundamentally different from your other SaaS products (self-service, wide market, no platform dependency).

| Factor | This Product | Your Other SaaS Products |
|--------|-------------|--------------------------|
| Market size | ~3-5K orgs | Thousands to millions |
| Sales model | B2B, relationship-based | Self-service |
| Platform dependency | HIGH (Hudl) | None |
| Revenue ceiling | ~$500K-$1M ARR realistic | Higher ceiling |
| Margins | ~95% | Similar |
| Build difficulty | Medium (AI + API integration) | Medium |

---

## 9. Recommended Next Steps

### If proceeding:
1. **Contact Wyscout/StatsBomb sales** — Request a developer trial or limited API access for integration testing. This is the #1 blocker. If they refuse or price is prohibitive, the project is dead.
2. **Verify ToS** — Confirm that a customer using their own API credentials in a third-party tool is permitted under Wyscout's terms.
3. **Build mock API prototype** — Use StatsBomb Open Data to build and test the full AI pipeline without real credentials.
4. **Find 2-3 beta testers** — Agencies or clubs with existing API access willing to test. Football analytics Twitter/LinkedIn community is the best source.
5. **Proceed to Phase 2** — Product Brief & Offer Design (only after steps 1-2 are confirmed)

### If not proceeding:
- Archive this research — the market analysis and API deep dive are valuable reference material
- Apply insights to other projects where you own the data stack

---

*Research conducted 2026-03-22 using market data, competitor analysis, Hudl platform assessment, and API deep dive.*
*Revised 2026-03-22 with honest BYOK assessment, Wyscout/StatsBomb API access reality, and connector viability analysis.*
