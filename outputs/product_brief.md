# Product Brief: AI-Powered Football Scouting Assistant
**Date:** 2026-03-23
**Phase:** 2 — Product Brief & Offer Design
**Status:** DRAFT

---

## 1. App Name Options

| # | Name | Rationale |
|---|------|-----------|
| A | **ScoutCopilot** | Direct, descriptive, immediately understood. "Copilot" signals AI-assisted workflow without replacing the scout. Industry-appropriate. |
| B | **ScoutForge** | Conveys building/crafting intelligence from raw data. "Forge" implies transforming raw material (data) into something useful (scouting reports, shortlists). Aligns with existing Predivo naming conventions (SignalForge). |
| C | **TalentLens** | Positions the product as a focusing tool — cutting through noise to see what matters. "Lens" metaphor resonates with evaluation/analysis. More premium feel for B2B sales. |

**Recommendation:** ScoutCopilot. It requires zero explanation. A sporting director hearing the name immediately understands what the product does. In a niche B2B market where word-of-mouth matters, clarity beats cleverness.

---

## 2. One-Line Description

**"An AI assistant that connects to your Wyscout or StatsBomb API and turns natural language questions into ranked player shortlists, comparison reports, and scouting briefs — in seconds instead of hours."**

---

## 3. Target Personas

### Persona A: Mid-Tier Professional Club Scouting Department

**Profile:** Championship, Eredivisie, Belgian Pro League, 2. Bundesliga, Serie B level clubs. Scouting department of 2-8 people. Head of Recruitment reports to Sporting Director.

**Data access:** Wyscout Gold/Diamond platform subscription. May already have Wyscout Data API access for 1-5 leagues (~GBP 5,000/league/year). Possibly StatsBomb for key target leagues.

**Current workflow:** Scouts use Wyscout's platform UI for video and basic player search. Data-savvy staff export CSVs and build spreadsheets. No in-house data scientist or engineer. The Head of Recruitment manually synthesizes reports from multiple scouts into shortlists for the transfer window.

**Pain (in their words):**
- "Constantly updating spreadsheets, looking for scattered files and trying to make evaluations from dispersed information"
- "A pile of reports for the next transfer window but no way to filter them down to meet the club's specific requirements"
- "Everyone is scouting players using the same parameters" — no differentiation edge

**Budget authority:** GBP 1,000-5,000/year for scouting tools (beyond Wyscout platform). Approved by Sporting Director or Head of Football Operations.

**Success metric:** Reduce time from "transfer brief" to "qualified shortlist of 10 players" from 2-3 weeks to 1-2 days.

### Persona B: Player Agency with Wyscout API Access

**Profile:** Managing 20-100+ professional players across multiple leagues. 2-10 agents. Need to identify comparable players for client positioning, find destination clubs, and prepare pitch materials.

**Data access:** Wyscout Data API (agencies are a core Wyscout API customer segment). May have StatsBomb access for premium analytical services.

**Current workflow:** Agents manually search Wyscout for players similar to their clients. Build comparison decks in PowerPoint. Spend hours finding clubs whose playing style or squad gaps match their client profiles.

**Pain:** Agents manage dozens of players across transfer windows. Manually searching for "clubs that need a left-back with these specific attributes in the January window" across 30+ leagues is unsustainable. They are paying for API access but using it at 10% of its potential.

**Budget authority:** EUR 1,000-5,000/year for tools. Decision made by agency principal.

**Success metric:** Identify 5 realistic destination clubs for a client player in hours instead of days.

---

## 4. Core Problem Solved

Professional football clubs and agencies pay GBP 5,000+ per league per year for Wyscout/StatsBomb API access — the best scouting data in the world — but lack the technical capability to extract value from it. The data sits behind REST APIs that require programming skills to query, and the results come back as raw JSON that requires analyst expertise to interpret.

The result: scouts who should be evaluating players spend their time fighting spreadsheets. Clubs that invested in premium data access use it at a fraction of its potential. Transfer windows become a scramble of manual filtering rather than systematic identification.

**In their exact words:** "It requires almost a basic programming course to get real value out of it." And: "Previously, it cost scouts hours or longer to sift through all those reports; now they get a list of players plus a summary in seconds."

ScoutCopilot is the AI interpretation layer that makes that data investment productive. The scout asks a question in plain English. The AI translates it into API calls, retrieves the data, analyzes it, and returns a ranked, contextualized answer. The data stays in the customer's account. We provide the intelligence layer.

---

## 5. MVP Features (Exactly 3)

### Feature 1: Natural Language Player Search

The scout types a query like "Find left-footed center-backs under 24 in Ligue 2 with strong aerial duel win rate and progressive passing, market value under EUR 2M." The system parses this into structured API calls against the customer's Wyscout/StatsBomb account, retrieves matching players, ranks them by composite fit score, and returns a sortable shortlist with key metrics highlighted. Results are filterable and sortable post-query.

### Feature 2: AI Scouting Report Generation

Select any player from a search result (or enter a player name directly) and generate a structured scouting report. The report pulls the player's full statistical profile from the connected API, contextualizes metrics against league and positional averages, identifies strengths/weaknesses, and presents a concise evaluation narrative. Reports are exportable as PDF for offline sharing with coaching staff and board members.

### Feature 3: Head-to-Head Player Comparison

Select 2-4 players and generate a side-by-side comparison across relevant metrics for their position. The AI identifies where each player excels relative to the others, highlights statistical outliers, and provides a summary recommendation based on the original search criteria or a user-specified tactical context (e.g., "Compare these three for a 4-3-3 high-press system"). Includes radar charts for visual comparison.

---

## 6. Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Frontend** | React 19 + Vite 8 + TypeScript + Tailwind 4 | Proven stack across all Predivo products. Fast builds, type safety, consistent design system. No learning curve — ship fast. |
| **Backend** | Supabase (Auth, PostgreSQL, Edge Functions) | Auth handles team-based access (multiple scouts per club account). Edge Functions proxy API calls and run the AI pipeline. Row-Level Security for multi-tenant data isolation. Already battle-tested across 6 Predivo products. |
| **AI** | Claude API (Anthropic) | NL query parsing (user question to structured API parameters), result analysis and ranking, report narrative generation. Claude's large context window handles full player stat profiles. Consistent with Predivo's AI stack. |
| **Data** | BYOK — Customer's own Wyscout/StatsBomb API credentials | Zero data licensing cost. Customer provides their own API credentials, stored encrypted in their Supabase vault. All API calls execute server-side using their credentials. We never store or cache player data beyond the active session. |
| **Hosting** | Metanet FTP (static frontend) + Supabase (backend) | Standard Predivo deployment. No Vercel dependency. Frontend is a static SPA deployed to Metanet. All dynamic logic runs in Supabase Edge Functions. |
| **Dev/QA Data** | StatsBomb Open Data (mock API server) | Free, same JSON schema as paid StatsBomb API. Build and test the full pipeline without real credentials. Covers 21 competitions with real event data. |

**Why this stack in one sentence:** It is identical to every other Predivo product, which means zero infrastructure learning curve, shared auth patterns, and the fastest possible path from brief to deployed MVP.

---

## 7. Scope Guard — What This Is NOT (v1)

1. **NOT a data provider.** We do not license, store, or resell football data. The customer must have their own Wyscout or StatsBomb API access. If they do not have API credentials, they cannot use the product.

2. **NOT a video analysis tool.** We do not process, tag, or display match video. Video integration (linking Wyscout video clips to statistical findings) is a potential v2 feature, not v1.

3. **NOT a replacement for human scouts.** The product generates shortlists and statistical reports. It does not evaluate character, injury risk beyond available data, tactical fit in live match context, or any qualitative judgment that requires watching a player.

4. **NOT a live match tracking or real-time analytics tool.** All analysis is based on post-match event data. Live in-game dashboards, GPS/wearable integration, and real-time tactical overlays are out of scope.

5. **NOT a Sportmonks/API-Football/FBref connector.** These data sources lack the event-level granularity required for meaningful scouting queries (no individual passes, pressures, carries, defensive actions). Offering connectors for inferior data sources would create a broken experience. Only Wyscout and StatsBomb APIs are supported.

6. **NOT a team/squad management tool.** No contract tracking, wage management, squad registration, or transfer negotiation features. The product is scoped to player identification and evaluation only.

7. **NOT a predictive model or player valuation engine.** We do not predict future performance, project development curves, or estimate transfer market values. The AI analyzes current and historical statistical data — it does not speculate.

---

## 8. BYOK Connector Architecture

### Overview

The BYOK (Bring Your Own Key) architecture ensures that customer API credentials are handled securely and that all data requests execute using the customer's own rate limits and data entitlements. ScoutCopilot never holds or caches football data beyond the active user session.

### Credential Vault

Customer API credentials (Wyscout Basic Auth username/password, StatsBomb Basic Auth or OAuth2 Client ID/Secret) are stored in Supabase Vault — Supabase's built-in secrets management backed by PostgreSQL's `pgsodium` encryption extension. Credentials are encrypted at rest using AES-256-GCM. They are only decrypted inside Supabase Edge Functions at the moment of API call execution and are never exposed to the frontend, logs, or any persistent storage.

Each customer organization has an isolated credential record. Row-Level Security ensures that credentials are only accessible to authenticated users belonging to that organization.

### API Routing

When a user submits a natural language query:

1. **Parse phase:** The Claude API converts the natural language query into structured search parameters (position, age range, league, metrics, thresholds).
2. **Route phase:** A Supabase Edge Function reads the customer's encrypted credentials from Vault, determines which data provider is configured (Wyscout, StatsBomb, or both), and constructs the appropriate API calls using the provider's endpoint format.
3. **Fetch phase:** The Edge Function executes the API calls server-side using the customer's credentials. Responses are streamed back to the Edge Function.
4. **Analyze phase:** Raw API responses are passed to Claude for ranking, contextualization, and narrative generation.
5. **Return phase:** The processed results are returned to the frontend. Raw API data is not persisted.

For customers with both Wyscout and StatsBomb connected, the router uses Hudl's ID mapping API (free for dual subscribers) to correlate player/match IDs across both data sources, enabling richer combined analysis.

### Session Caching

To avoid redundant API calls within a single user session (e.g., a scout refining a search or drilling into a player from a shortlist), results are cached in-memory within the Edge Function execution context and in the user's browser session storage. Cache TTL is 30 minutes. No data is written to the database or any persistent server-side store. When the session ends, the cache is gone.

### Rate Limit Management

Wyscout allows 12 requests/second per API key. StatsBomb limits are negotiated per contract (typically similar). The Edge Function implements:

- **Request throttling:** A token bucket rate limiter per customer, set conservatively below the provider's documented limits (e.g., 8 req/s for Wyscout) to leave headroom for the customer's own direct API usage.
- **Batch optimization:** Where possible, queries are batched into fewer, broader API calls rather than many narrow ones (e.g., fetching a full league's player stats in one call rather than individual player lookups).
- **Graceful degradation:** If a rate limit is hit (HTTP 429), the system queues the remaining requests with exponential backoff and notifies the user of the delay rather than failing silently.
- **Usage dashboard:** Customers can see how many API calls ScoutCopilot has made on their behalf in the current billing period, so they can manage their API allocation.

---

*Product brief prepared 2026-03-23. Next step: Phase 2 continued — Offer Design (pricing tiers, packaging, landing page copy).*
