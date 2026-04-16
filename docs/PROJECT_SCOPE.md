# ScoutCopilot — Project Scope

> Last updated: 2026-04-16

## What This Project Is

ScoutCopilot is an AI-powered football scouting platform that connects to professional data providers (StatsBomb, Wyscout, API-Football) and uses Claude AI to turn natural language queries into ranked player shortlists, detailed scouting reports, and head-to-head comparison briefs. It targets independent scouts, small clubs, and football academies who need data-driven recruitment without enterprise-level budgets.

**Production URL:** https://scoutcopilot.com
**Repository:** https://github.com/Arivioo/ScoutCopilot

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript 5.9, Vite 8, Tailwind CSS 4 (MD3 design tokens) |
| State | TanStack Query 5 (server state), React state (local) |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions in Deno) |
| AI | Claude API (claude-3-haiku for parsing/ranking, claude-3-sonnet for reports) |
| Payments | Stripe (checkout, billing portal, webhooks) |
| i18n | i18next (English + German, URL-based routing `/:lang/...`) |
| PDF | jsPDF + html2canvas (report export) |
| Icons | Lucide React |
| Deploy | GitHub Actions → FTP (lftp) → Metanet hosting |

---

## Features

### 1. AI Player Search
- Natural language queries: "fast left-back under 23 in the Bundesliga"
- Claude parses query into structured filters (position, age, league, metrics, etc.)
- Searches across multiple data providers simultaneously
- Claude ranks results by fit score (0-100) with reasoning
- Results table with sortable columns, expandable stat rows, pagination
- CSV export of results
- Search history with reload capability
- Background photo enrichment for all results

### 2. AI Scouting Reports
- One-click report generation from search results or any player
- Claude generates: executive summary, strengths, weaknesses, style of play, stats analysis (A-D ratings), tactical fit contexts, recommendation
- Report data enriched with: transfer history (from TheSportsDB + API-Football), contract info, similar players (found via DB similarity scoring), player photo
- Report detail page with radar chart, stat categories, similar players carousel, transfer timeline, contract overview
- PDF export with branded layout
- Birth date inline editing on report page
- Reports list page with search, sort, delete

### 3. Head-to-Head Comparison
- Select 2-10 scouted players for side-by-side comparison
- Per-90 metrics computed from raw stats: Goals/90, Assists/90, Key Passes/90, Pass %, Prog. Carries/90, Tackles/90, Aerial Won %
- Radar chart overlay with color-coded player polygons
- Claude generates AI verdict: analysis, per-player ranks, highlights, recommendation
- Optional tactical context input ("Compare for a 4-3-3 high-press system")
- Comparison history (save, load, delete)
- Tier limits: Scout plan = 3 players max, Pro/Club = 10

### 4. Squad Management
- Create multiple squads
- Import full team rosters from API-Football (search team → import squad)
- Manually add players (name, position, shirt number, nationality, birth date)
- Inline position editing (10 positions: GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST)
- Inline birth date editing (set or correct existing DOB)
- Photo upload per player (JPEG/PNG/WebP, auto-cropped to 400×400 JPEG via face detection → Supabase Storage `player-photos` bucket)
- On-demand photo fetching with server-side proxy for blocked CDNs (see Photo Architecture below)
- Squad overview with formation gap analysis (identifies position gaps by depth, avg age, avg rating)
- Rate players via Claude AI (1-99 rating with reasoning)
- Add players to squads directly from search results

### 5. Watchlists
- Create categorized watchlists (transfer targets, youth prospects, position-specific)
- Add players from search results or reports
- Alert status tracking per player (stable, price change, injury, form change)
- Edit watchlist name/description
- Remove players with confirmation dialog
- On-demand photo fetching

### 6. Dashboard
- Overview stats: total searches, reports generated, players tracked, API calls this month
- Recent search history with quick-load
- Watchlist alerts feed
- Quick actions (search, create watchlist, create squad)

### 7. Team Management
- Organization-based multi-tenancy
- Roles: owner, admin, scout
- Invite members by email with role assignment
- Team invitation emails (bilingual EN/DE)

### 8. Settings
- Profile management (name, email change)
- Scoring weights customization (attacking, defending, passing, physical — influences AI analysis)
- API credentials management (BYOK: bring your own Wyscout/StatsBomb keys)
- Credential validation (tests connection before saving)
- Account deletion with cascade cleanup

### 9. Billing (Stripe)
- Three tiers: Scout ($), Pro ($$), Club ($$$)
- Monthly and yearly billing intervals
- Stripe Checkout for new subscriptions
- Stripe Billing Portal for management
- Webhook handling: checkout completed, subscription updated/deleted, payment failed
- Usage tracking per organization/month

### 10. Authentication
- Email/password sign-up with welcome email
- Magic link (email code) sign-in
- Password reset flow
- Auto-organization creation on signup (onboarding flow)
- Password gate for private beta access

### 11. Internationalization
- Full English + German translations
- URL-based language routing (`/en/...`, `/de/...`)
- Bilingual email templates
- Translation completeness enforced by test

### 12. Landing Page
- Public marketing page with features, pricing, FAQ
- Interactive radar chart demo
- SEO-optimized with build-time sitemap generation (no static `public/sitemap.xml`)
- Open Graph meta tags (`og:image`, `og:type`) on public pages
- www → non-www 301 redirect (`.htaccess`)
- Root `/` → `/{lang}/` 301 redirect
- Scroll affordance gradients on comparison/pricing tables

---

## Data Sources & APIs

### StatsBomb Open Data (Free)
- **What:** Historical match event data for select competitions
- **Coverage:** Premier League, La Liga, Serie A, Bundesliga (select seasons), World Cup, Champions League, NWSL, WSL
- **Tables:** `sb_competitions`, `sb_matches`, `sb_players`, `sb_player_season_stats`
- **Stats:** 30+ metrics per player per season (goals, assists, xG, xA, npxG, key passes, progressive passes/carries, tackles, interceptions, clearances, aerial duels, dribbles, pressures, shot/goal creating actions, cards)
- **Player ID format:** `sb-open-{numeric_id}`

### API-Football (api-sports.io) — Paid
- **What:** Live player search, stats, transfers, team squads, photos
- **Plan:** 7,500 requests/day
- **Key:** `ba1133bc739331ddb3fd8e1b1f57e1d2`
- **Season convention:** European seasons span two years; API uses start year (e.g., 2025/2026 = `season=2025`). Logic: `month < 7 ? year - 1 : year`
- **Limitations:** No xG, xA, progressive stats, aerial data, market value
- **Squad import:** Returns only 4 generic positions (Goalkeeper, Defender, Midfielder, Attacker) — users reassign via inline position editor
- **Player ID format:** `apifb-{numeric_id}`
- **Photo CDN:** `media.api-sports.io` blocks browser hotlinking (403 Forbidden) — photos are proxied server-side to Supabase Storage on first access (see Photo Architecture)

### TheSportsDB (Free)
- **What:** Player photos, metadata, team logos
- **Usage:** Fallback photo source (searched by player name), birth date enrichment, transfer/contract history
- **Endpoint:** `/searchplayers.php?p={name}`
- **Photo CDN:** Migrated from `www.thesportsdb.com` to `r2.thesportsdb.com` — URLs are normalized in `generate-photo` edge function

### Wyscout API (BYOK — User's Own Credentials)
- **What:** Professional scouting data with advanced stats
- **Auth:** Basic auth (username:password), stored encrypted in `api_credentials`
- **Features:** Player search with position/age/league/value filters, advanced per-90 stats, contract info, transfers with fees, player photos (base64)
- **Rate limit:** 12 req/s (ScoutCopilot uses 8/s conservatively)
- **Player ID format:** `wy-{numeric_id}`

### StatsBomb Licensed API (BYOK)
- **What:** Full StatsBomb data access (more competitions than open data)
- **Auth:** Basic auth
- **Same schema** as open data but with additional competitions/seasons
- **Player ID format:** `sb-{numeric_id}`

### Claude AI (Anthropic)
- **Model:** claude-3-haiku-20240307 (parsing, ranking, rating), claude-3-sonnet (report generation)
- **Uses:**
  1. **Query parsing:** NL → structured search parameters
  2. **Player ranking:** Fit score 0-100 with reasoning
  3. **Report generation:** Summary, strengths, weaknesses, style, stats analysis, recommendation
  4. **Player comparison:** Head-to-head analysis with per-metric ranks
  5. **Player rating:** 1-99 rating with reasoning (formula fallback)

### Photo Architecture

Player photos follow a priority chain with server-side proxying:

| Priority | Source | When Used | Storage |
|----------|--------|-----------|---------|
| 1 | **API-Football** | Squad imports (`apifb-` players) | Proxied to Supabase Storage (`player-photos` bucket) — CDN blocks browser hotlinking |
| 2 | **TheSportsDB** | Fallback for players without API-Football photo | Direct URL stored in DB (TheSportsDB allows hotlinking) |
| 3 | **Manual upload** | User uploads custom photo | Supabase Storage (`player-photos` bucket), auto-cropped to 400×400 JPEG |
| — | **Silhouette** | No photo available | SVG fallback in `PlayerAvatar` component |

**Key files:**
- `supabase/functions/generate-photo/index.ts` — Server-side photo resolution: detects api-sports.io URLs → downloads → uploads to Supabase Storage. Falls back to TheSportsDB.
- `src/lib/usePlayerPhotoFetch.ts` — Client-side hook: identifies players needing photos, calls `generate-photo`, maps results back. `reportBrokenUrl` triggers re-fetch for failed images.
- `src/lib/usePlayerPhotoUpload.ts` — Manual photo upload with face detection + auto-crop to 400×400.
- `src/components/shared/PlayerAvatar.tsx` — Renders photo with silhouette fallback, loading spinner, AI badge, lightbox, upload overlay.

**Storage:** Supabase Storage `player-photos` bucket (public). Free plan: 1 GB (~10K+ photos at ~80 KB avg). Upload size: max 10 MB raw → auto-cropped to ~50-100 KB.

### Stripe
- **What:** Payment processing for subscriptions
- **Account:** `acct_1T2Zsp3t3lPzxbvZ` (shared across Predivo projects)
- **Endpoints used:** Checkout Sessions, Billing Portal, Webhooks

---

## Database Schema (15 Tables)

### Application Tables (Multi-Tenant, RLS-Protected)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `organizations` | Multi-tenant orgs | name, slug, subscription_tier, stripe_customer_id, max_seats |
| `profiles` | User accounts (extends auth.users) | organization_id, role, scoring_weights |
| `api_credentials` | BYOK API keys (Wyscout/StatsBomb) | organization_id, provider, encrypted_credentials |
| `search_queries` | Search history | user_id, organization_id, query_text, parsed_parameters, result_count |
| `search_results` | Cached search results | search_query_id, player_external_id, player_data (JSONB), rank, fit_score |
| `player_reports` | AI scouting reports | user_id, organization_id, player_external_id, report_data (JSONB) |
| `player_comparisons` | Head-to-head analyses | user_id, organization_id, title, player_ids[], comparison_data (JSONB) |
| `watchlists` | Player tracking lists | user_id, organization_id, name, category, is_shared |
| `watchlist_players` | Watchlist membership | watchlist_id, player_external_id, player_data (JSONB), notes |
| `usage_tracking` | Monthly billing metrics | organization_id, month, api_calls_count, reports_generated, searches_count |
| `player_enrichment_cache` | API-Football data cache (30-day TTL) | player_external_id, current_club, birth_date, photo_url, raw_data |

### Reference Tables (RLS-Protected — Authenticated Read-Only)

| Table | Purpose | Records |
|-------|---------|---------|
| `sb_competitions` | StatsBomb competition/season registry | ~50 |
| `sb_matches` | Match records with scores | ~5,000 |
| `sb_players` | Player registry with positions, birth dates, photos | ~10,000 |
| `sb_player_season_stats` | Pre-aggregated per-90 stats (30+ metrics) | ~15,000 |

> **Note:** All 4 reference tables have RLS enabled with authenticated read-only policies (fixed 2026-04-08). Accessed via `sbPlayersTable()` helper in `src/lib/sbPlayersQuery.ts` for type safety.

### Security Model
- **Organization isolation:** `get_user_organization_id()` SQL function scopes all queries
- **Role-based access:** `api_credentials` restricted to owner/admin
- **Service role bypass:** `usage_tracking` writes, `player_enrichment_cache` writes
- **All edge functions:** `verify_jwt = false` (ES256 JWTs incompatible with Supabase HS256 middleware; auth handled in function code)
- **Admin-only edge functions:** `enrich-photos`, `backfill-birth-dates`, `backfill-reports` require `Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}` — direct token comparison, no JWT decode
- **Env var safety:** All edge functions use explicit guards on `Deno.env.get()` with 500 response on missing vars (no non-null assertions)

---

## Edge Functions (16 Functions)

| Function | Method | Purpose | Rate Limit |
|----------|--------|---------|-----------|
| `search` | POST | NL player search across all providers | 30/min/org |
| `report` | POST | AI scouting report generation | 10/min/org, 10/month (scout tier) |
| `compare` | POST | Head-to-head player comparison | 20/min/org |
| `rate-player` | POST | AI player rating (1-99) | None (batch max 10) |
| `import-team` | POST | Search teams + import squads from API-Football | 30/min/org |
| `generate-photo` | POST | Fetch/generate player photos | 10/min/org |
| `enrich-photos` | POST | Batch photo enrichment from API-Football | 10/min (6.5s delay) |
| `backfill-birth-dates` | POST | Batch birth date enrichment from TheSportsDB | service_role only |
| `backfill-reports` | POST | Re-enrich existing reports with missing data | service_role or admin |
| `checkout` | POST | Create Stripe checkout session | 5/min/org |
| `billing-portal` | POST | Open Stripe billing portal | 10/min/org |
| `stripe-webhook` | POST | Handle Stripe events (signature verified) | None |
| `credentials` | CRUD | Manage BYOK API credentials | 10/min/org |
| `invite-member` | POST | Send team invitation email | 5/min/org |
| `send-welcome` | POST | Send welcome email after signup | 5/min/user |
| `delete-account` | POST | Cascade delete user + send confirmation | 3/min/user |

---

## Subscription Tiers

| Feature | Scout | Pro | Club |
|---------|-------|-----|------|
| Seats | 1 | 3 | 10 |
| Reports/month | 10 | Unlimited | Unlimited |
| Max comparisons | 3 players | 10 players | 10 players |
| Shortlists | 25 | Unlimited | Unlimited |
| Leagues | 1 | Unlimited | Unlimited |
| Data sources | 1 | 2 | 2 |
| Tactical fit analysis | No | Yes | Yes |
| PDF export | No | Yes | Yes |
| Watchlists | No | Yes | Yes |
| API access | No | No | Yes |
| Custom metrics | No | No | Yes |
| Data retention | 3 months | 6 months | 24 months |

---

## Player ID Format Convention

| Prefix | Source | Example |
|--------|--------|---------|
| `sb-open-{id}` | StatsBomb open data | `sb-open-12345` |
| `sb-{id}` | StatsBomb licensed | `sb-67890` |
| `apifb-{id}` | API-Football | `apifb-54321` |
| `wy-{id}` | Wyscout | `wy-98765` |
| `manual-{uuid}` | Manually added | `manual-1713100000-abc123` |

---

## Frontend Architecture

### Routing
- URL-based language: `/:lang/dashboard`, `/:lang/search`, `/:lang/players`, etc.
- Auth callbacks at root: `/auth/callback`, `/auth/verify`
- All page components lazy-loaded with `React.lazy()` + Suspense

### Key Hooks
| Hook | Purpose |
|------|---------|
| `usePlayerSearch` | Search state, results, photo loading, filters |
| `usePlayerReport` | Single report fetch + similar player photo enrichment |
| `useComparison` | Player selection, comparison generation, verdict, history |
| `useSquad` | Squad CRUD, player add/remove, position/DOB updates, import |
| `useWatchlists` | Watchlist CRUD, player management, filtering |
| `usePlayerPhotoFetch` | On-demand photo fetching with dedup and loading states |
| `usePlayerPhotoUpload` | Photo upload to Supabase Storage |
| `useGeneratedReports` | Track which players have reports (for search results UI) |

### Shared Components
| Component | Purpose |
|-----------|---------|
| `Modal` | Accessible modal with focus trap, Escape key, `aria-modal`, backdrop click dismiss, `max-h-[90vh]`, full-screen on mobile. Used by Squad, Settings, and Delete Account pages |
| `PlayerAvatar` | Player photo with fallback silhouette, loading spinner, AI badge, clickable lightbox, upload overlay |
| `ComparisonRadar` | SVG radar chart for multi-player stat overlay |
| `PasswordGate` | Private beta access gate (SHA-256 hash check) |
| `ConfirmDialog` | Accessible modal confirmation dialog |
| `ScrollableTabBar` | Horizontal scrollable tab navigation |
| `Button` | Shared button with variants, min touch target 44px |
| `Input` | Shared input with `text-base md:text-sm` (iOS zoom prevention) |
| `Select` | Shared select with `aria-hidden` chevron icon |
| `SearchBar` | Search input with `aria-hidden` search icon |

### Shared Utilities
| Utility | Purpose |
|---------|---------|
| `sbPlayersQuery.ts` | Typed helper for `sb_players` table access (not in generated Supabase types) |
| `stripeRedirect.ts` | Validates Stripe URLs (hostname check) before redirect, with local fallback |
| `ageUtils.ts` | `formatAge(birth_date)` — shared age calculation across all views |

### Design System
- Material Design 3 color tokens via CSS custom properties: `var(--color-primary)`, `var(--color-surface)`, etc.
- Never use raw Tailwind palette colors (`blue-500`, `red-600`) or stale MD3 CSS vars (`--md-sys-color-*`)
- Design token classes: `bg-surface`, `text-on-surface`, `bg-primary`, `text-on-primary`, `bg-secondary/10`, etc.
- `font-data` class for statistical/numerical display (tabular numerals)
- Responsive: mobile card layouts, desktop table layouts (breakpoint: `md` = 768px)
- Touch targets: all interactive elements ≥ 44×44px (`min-h-[44px]`)
- iOS zoom prevention: inputs use `text-base md:text-sm` (font-size < 16px causes iOS zoom)
- Dark mode with theme toggle

---

## Deployment

- **Domain:** https://scoutcopilot.com (standalone, not a Predivo subdomain)
- **Branch:** `master` → auto-deploy via GitHub Actions
- **Method:** FTP (lftp) to Metanet `/httpdocs/`
- **Strategy:** Zero-downtime (assets first, root files second, stale cleanup last)
- **Build:** `npm run build` → TypeScript check + Vite build + sitemap generation
- **Edge functions:** Deployed separately via `supabase functions deploy {name}`

---

## Email System

- **Provider:** Metanet SMTP (mail.predivo.ch, port 465, TLS)
- **From:** `ScoutCopilot <noreply@scoutcopilot.com>`
- **Templates (bilingual EN/DE):** Welcome, trial ending, payment failed, plan changed, team invitation, account deleted, admin notification
- **Never uses** Supabase built-in email (2/hour rate limit)

---

## Known Constraints

1. **API-Football squad positions** are generic (Goalkeeper/Defender/Midfielder/Attacker) — users must manually reassign via inline position editor
2. **Claude report generation** does not produce `seasonStats` — comparison metrics fall back to `rawStats` from the data provider
3. **Supabase `verify_jwt`** uses HS256, incompatible with ES256 user JWTs — all edge functions set `verify_jwt = false` and handle auth in code
4. **StatsBomb open data** covers limited competitions/seasons — not all players have stats
5. **TheSportsDB** search is name-based and may return wrong player for common names
6. **API-Football season** uses start year — `month < 7 ? year - 1 : year` logic required
7. **API-Football is enrichment only** — never used for player search. StatsBomb is the single source of truth for search
8. **npm basic-ftp** has 1 high-severity vulnerability (dev dependency only, deploy tooling) — no user impact
9. **API-Football CDN hotlink protection** — `media.api-sports.io` returns 403 in browser `<img>` tags. Resolved: `generate-photo` edge function proxies images server-side to Supabase Storage on first access (2026-04-16)
10. **TheSportsDB CDN migration** — Images moved from `www.thesportsdb.com` to `r2.thesportsdb.com`. Resolved: URL normalization in `generate-photo` + `backfill-reports` edge functions (2026-04-15)
11. **No AI photo generation** — Stitch AI (Google's `generate_screen_from_text` via MCP at `stitch.googleapis.com/mcp`) was tested and removed on 2026-04-16. It was integrated as the last-resort fallback in the photo chain (after API-Football proxy and TheSportsDB). **Problem:** For famous players (e.g. Messi, Ronaldo) Stitch produces decent likenesses because extensive reference material exists online. For lesser-known players (e.g. Swiss Super League reserve/youth players), Stitch generates completely wrong faces — wrong ethnicity, wrong features, no resemblance to the real person. Even with improved prompts including full name, club ("FC Luzern"), nationality, and position, the results were fake faces. **Decision:** Do not use AI to generate player portraits. If no real photo exists via API-Football or TheSportsDB, the player shows a silhouette fallback. Users can always upload a real photo manually. **Cleanup:** All 40 Stitch-generated images (27 in `squad_players`, 13 in `sb_players`) were cleared from the database. The `generateWithStitch` function, Stitch interfaces, constants (`STITCH_MCP_URL`, `MAX_STITCH_PER_REQUEST`), and env var reads (`STITCH_API_KEY`, `STITCH_PROJECT_ID`) were removed from `generate-photo/index.ts`. Client-side dead code (`aiGenerated` prop, `derivePhotoSource` stitch case) remains but is harmless — no googleusercontent URLs exist to trigger it.

---

## Audit History

| Date | Score | Bonus | Key Changes |
|------|-------|-------|-------------|
| 2026-04-08 | 99/100 | +12 | XSS fixed, generate-photo secured, lightbox accessible |
| 2026-04-15 | 99/100 | +23 | 3 critical edge function auth fixes, 5 raw modals → shared Modal, 18 silent catches → logging, DRY utilities, SEO hardening, 44px touch targets |
| 2026-04-16 | — | — | API-Football CDN image proxy (47 squad players fixed), TheSportsDB CDN normalization, Photo Architecture documented. Stitch AI removed — produces fake faces for lesser-known players. |
