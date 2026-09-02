# ScoutCopilot

AI-powered football scouting platform. Search for players, generate detailed scouting reports with AI analysis, compare players side-by-side, manage watchlists, and build squads. Targets independent scouts, small clubs, and academies.

## Tech Stack

- **Frontend:** React 19 + TypeScript 5.9 + Vite 8 + Tailwind CSS 4 + Lucide icons + TanStack Query 5
- **Backend:** Supabase (PostgreSQL + Auth + Edge Functions in Deno)
- **AI:** Claude API (scouting report generation, player analysis)
- **Payments:** Stripe
- **i18n:** i18next (EN + DE, URL-based routing: `/:lang/...`)
- **PDF:** jsPDF (report export)
- **Deploy:** GitHub Actions → FTP (lftp) → Metanet

## Commands

```bash
npm run dev       # Start dev server (localhost:5173)
npm run build     # Type-check + Vite build + generate sitemap
npm run lint      # ESLint
npm run test      # Vitest (run once)
npm run test:watch # Vitest (watch mode)
```

## Supabase

- **Account:** supabase@scoutcopilot.com
- **Project ref:** rlcsuqwqzoqjykdiqjye
- **Credentials:** `docs/Credentials.txt`

## Project Structure

```
src/
├── components/
│   ├── ui/             # Shared UI primitives
│   ├── layout/         # AppShell, LanguageRootLayout
│   ├── shared/         # PasswordGate, ThemeToggle
│   └── auth/           # Auth form components
├── features/
│   ├── auth/           # Login, Signup, ForgotPassword, Onboarding, AuthGuard
│   ├── landing/        # Public landing page
│   ├── dashboard/      # Dashboard + Alerts
│   ├── search/         # Player search + search history
│   ├── report/         # Player detail / scouting report pages
│   ├── comparison/     # Side-by-side player comparison
│   ├── watchlists/     # Watchlist management
│   ├── squad/          # Squad builder
│   ├── settings/       # User/org settings
│   ├── pricing/        # Pricing page
│   └── legal/          # Privacy, Terms, Imprint
├── hooks/              # Custom React hooks
├── i18n/               # en.json, de.json, i18n setup + completeness test
├── lib/                # supabase.ts, api.ts, ai.ts, stripe.ts, utils.ts, mock-data/
├── types/              # TypeScript type definitions
└── test/               # Test setup
supabase/
└── functions/
    ├── _shared/        # cors.ts, auth.ts, claude.ts, email.ts, mock-data.ts, rate-limiter.ts, providers/
    ├── search/         # Player search (TheSportsDB + API-Football)
    ├── report/         # AI scouting report generation
    ├── compare/        # Player comparison data
    ├── enrich-photos/  # Photo enrichment from TheSportsDB
    ├── generate-photo/ # AI-generated placeholder photos
    ├── backfill-reports/       # Batch backfill report data
    ├── backfill-birth-dates/   # Batch backfill birth dates
    ├── checkout/       # Stripe checkout session creation
    ├── billing-portal/ # Stripe billing portal
    ├── stripe-webhook/ # Stripe webhook handler
    ├── send-welcome/   # Welcome email via SMTP
    ├── delete-account/ # Account deletion
    └── credentials/    # Credential management
```

## Key Architectural Decisions

### Data Sources (priority order)
1. **StatsBomb Open Data** — Free match event data for historical stats (limited to competitions StatsBomb covers)
2. **TheSportsDB** — Player photos, metadata, team logos (free tier)
3. **API-Football (api-sports.io)** — Player search, stats, transfers (free tier: 100 req/day)
4. **Claude AI** — Generates narrative scouting analysis from aggregated data

### On-Demand Enrichment
Player data is enriched lazily — photos and metadata are fetched/cached only when a player is viewed, not pre-loaded. The `enrich-photos` and `backfill-*` edge functions handle batch enrichment when needed.

### URL-Based Language Routing
All routes are under `/:lang/` (e.g., `/en/dashboard`, `/de/players`). The `LanguageRootLayout` component syncs the URL lang param with i18next. Auth callbacks (`/auth/callback`, `/auth/verify`) stay at root for Supabase redirect compatibility.

### Auth Flow
AuthProvider → AuthGuard (requires auth + org) or AuthOnlyGuard (auth only, for onboarding). Onboarding creates the user's organization before granting full app access.

## Password Gate

Password: `(value retired 2026-09-02 - each app now has its own, see that app's docs/Credentials.txt)` (unified across all Predivo projects)
Storage: sessionStorage key `scoutcopilot-unlocked`

## Design Conventions

- **MD3 design tokens** — Material Design 3 color system (surface, primary, on-surface, etc.)
- **`font-data` class** — Used for statistical/numerical data display (tabular numerals)
- **No path alias** — Imports use relative paths (no `@/` alias configured)
- **Lazy-loaded routes** — All page components use `React.lazy()` with Suspense
- **Manual Vite chunks** — react-vendor, query-vendor, ui-vendor, supabase-vendor, i18n-vendor, jspdf-vendor

## i18n

- Languages: English (`en.json`) + German (`de.json`)
- Completeness enforced by test: `src/i18n/i18n-completeness.test.ts`
- All user-facing text must use translation keys, never hardcoded strings

## Edge Functions

All edge functions use `_shared/cors.ts` for CORS headers. Auth is handled via `_shared/auth.ts`. AI calls go through `_shared/claude.ts`. Email via `_shared/email.ts` (Metanet SMTP, port 465). Rate limiting via `_shared/rate-limiter.ts`.

Set `verify_jwt=false` on edge functions and handle auth in function code (Supabase verify_jwt uses HS256, rejects ES256 user JWTs).

## Deployment

- **Domain:** https://scoutcopilot.com (standalone domain, not a Predivo subdomain)
- **Branch:** `master` triggers deploy via GitHub Actions
- **Method:** lftp FTP to Metanet `/httpdocs/`
- **Zero-downtime:** Assets uploaded first, then root files, then stale assets cleaned

## Verification Loop

Before reporting any task complete:
1. `npm run build` must succeed
2. `npm run lint` must pass
3. `npm run test` must pass
4. For UI changes: start dev server and verify visually

## Rules

- Never hardcode colors — use Tailwind classes from MD3 design tokens
- All text uses i18n translation keys (EN + DE)
- Supabase Edge Functions use `_shared/cors.ts` for CORS
- Deploy via GitHub Actions FTP — never Vercel
- Financial/statistical data uses `font-data` class
- New hooks/components should have tests
