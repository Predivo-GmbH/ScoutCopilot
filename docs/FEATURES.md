# ScoutCopilot — Feature Registry

**Project:** ScoutCopilot (AI-assisted football scouting & player intelligence)
**Last Updated:** 2026-08-15
**Total Features:** 28 (25 implemented with passing tests, 3 planned)

> This registry is the source of truth for the CI coverage gate
> (`node scripts/check-feature-coverage.mjs`). Every feature with
> **Status: implemented** must list at least one test file that exists on disk.
> Test-file lines use the parser format `Label: \`path\`` where Label is one of
> Unit / Component / Integration / E2E / A11y.
>
> Routes are language-prefixed (`/:lang/...`, EN/DE); auth callbacks live at root
> (`/auth/callback`, `/auth/verify`) because they are fixed Supabase redirect URLs.

## Supporting test coverage (not gated features)

These back the user-facing features above but are unit-/library-level, so they are
tracked here rather than as F-XXX blocks:

| Area | Test File |
|------|-----------|
| Stripe tier config (`src/lib/stripe.ts`) | `src/lib/stripe.test.ts` |
| Age / DOB helpers (`src/lib/ageUtils.ts`) | `src/lib/ageUtils.test.ts` |
| General utils (`src/lib/utils.ts`) | `src/lib/utils.test.ts` |
| Password strength meter | `src/components/auth/password-utils.test.ts` |
| UI primitives (Button, Card, Input, Modal, Select, Table, Tabs, Badge, Skeleton, SearchBar) | `src/components/ui/__tests__/*.test.tsx` |

---

## Public & Marketing

### F-001: Landing Page
**Status:** implemented
**Route:** `/:lang/` (public root)
**Components:** `features/landing/LandingPage.tsx`

**Description:** Marketing homepage with hero, feature showcase, interactive demo, pricing preview, FAQ, and the primary "start free trial" CTA (opens the waitlist while registration is paused).

**Critical Assertions:**
1. Renders hero and section content without errors
2. Single top-level heading present
3. CTAs route / open the waitlist correctly

**Test Files:**
- Component: `src/features/landing/__tests__/LandingPage.test.tsx`

### F-002: Pricing Page
**Status:** implemented
**Route:** `/:lang/pricing`
**Components:** `features/pricing/PricingPage.tsx`

**Description:** Subscription tier comparison (Scout / Pro / Club) with monthly-yearly toggle and CTA buttons.

**Critical Assertions:**
1. All three tiers render
2. Monthly/yearly toggle switches displayed pricing
3. CTA buttons present and accessible

**Test Files:**
- Component: `src/features/pricing/__tests__/PricingPage.test.tsx`
- Unit: `src/lib/stripe.test.ts`

### F-003: Legal Pages (Privacy / Terms / Imprint)
**Status:** implemented
**Route:** `/:lang/privacy`, `/:lang/terms`, `/:lang/imprint`
**Components:** `features/legal/PrivacyPage.tsx`, `features/legal/TermsPage.tsx`, `features/legal/ImprintPage.tsx`

**Description:** GDPR privacy policy, terms of service, and German-law Impressum.

**Critical Assertions:**
1. Each page renders a `<main>` and h1
2. Privacy page has h2 subsections
3. Imprint contains company/contact content

**Test Files:**
- Component: `src/features/legal/__tests__/LegalPages.test.tsx`

### F-006: Marketing SEO Pages (Use-cases & Guides)
**Status:** implemented
**Route:** `/:lang/for/:slug`, `/:lang/guides/:slug`
**Components:** `features/marketing/MarketingPage.tsx`, `features/marketing/pages.ts`

**Description:** Data-driven programmatic-SEO pages (for academies/agents/clubs/analysts/recruiters; guides on data-driven scouting, shortlisting, comparison). Uses React 19 native document metadata (canonical/hreflang/OG). Unknown slugs redirect to the language root.

**Critical Assertions:**
1. Known use-case slug renders its h1
2. Known guide slug renders
3. Section subheadings render from page data
4. Trial CTA wires to the waitlist with source "marketing"
5. Unknown slugs redirect to `/:lang`

**Test Files:**
- Component: `src/features/marketing/__tests__/MarketingPage.test.tsx`

### F-007: Waitlist Capture
**Status:** implemented
**Route:** Modal (opened from Landing/Marketing/Login CTAs) + `/:lang/signup`
**Components:** `features/waitlist/WaitlistForm.tsx`, `features/waitlist/WaitlistProvider.tsx`

**Description:** Pre-launch email capture into the `waitlist` table (anon-insert RLS) while registration is paused. The primary conversion path today.

**Critical Assertions:**
1. Invalid email is rejected without a DB write
2. Valid email inserts `{ email, source }` and shows success
3. Duplicate (Postgres 23505) shown as friendly "already on the list"
4. Insert failure shows an error message

**Test Files:**
- Component: `src/features/waitlist/__tests__/WaitlistForm.test.tsx`

---

## Authentication

### F-010: Login (Password + Magic-Link OTP)
**Status:** implemented
**Route:** `/:lang/login`
**Components:** `features/auth/LoginPage.tsx`, `components/auth/OtpInput.tsx`, `components/auth/ResendTimer.tsx`

**Description:** Two-tab sign-in: password and email magic-link OTP.

**Critical Assertions:**
1. Sign-in heading and both tabs render
2. Password tab shows email + password inputs
3. Email input is type=email; submit + forgot-password + signup links present

**Test Files:**
- Component: `src/features/auth/__tests__/LoginPage.test.tsx`

### F-011: Signup
**Status:** implemented
**Route:** `/:lang/signup`
**Components:** `features/auth/SignupPage.tsx`

**Description:** New-user registration / verified-signup completion.

**Critical Assertions:**
1. Renders form and heading
2. Email validation gates submission

**Test Files:**
- Component: `src/features/auth/__tests__/SignupPage.test.tsx`

### F-012: Forgot Password
**Status:** implemented
**Route:** `/:lang/forgot-password`
**Components:** `features/auth/ForgotPasswordPage.tsx`

**Description:** Request a password-reset email.

**Critical Assertions:**
1. Renders email input and submit
2. Sends reset request for a valid email

**Test Files:**
- Component: `src/features/auth/__tests__/ForgotPasswordPage.test.tsx`

### F-013: Reset Password
**Status:** implemented
**Route:** `/:lang/reset-password`
**Components:** `features/auth/ResetPasswordPage.tsx`, `components/auth/password-utils.ts`

**Description:** Set a new password via reset link, with a live strength meter.

**Critical Assertions:**
1. Password input with strength scoring renders
2. `getPasswordScore` returns correct 0-4 levels
3. Minimum length enforced

**Test Files:**
- Component: `src/features/auth/__tests__/ResetPasswordPage.test.tsx`
- Unit: `src/components/auth/password-utils.test.ts`

### F-014: Auth Callback Handler
**Status:** implemented
**Route:** `/auth/callback`
**Components:** `features/auth/AuthCallbackPage.tsx`

**Description:** Supabase redirect handler for magic-link / OAuth / recovery. Reads the session and routes onward (recovery → reset-password, new user → signup, existing → dashboard, none → login).

**Critical Assertions:**
1. Renders a processing spinner
2. No session / session error → `/login`
3. Existing user (has full_name) → `/dashboard`
4. New user (no metadata) → `/signup`
5. `type=recovery` hash → `/reset-password`

**Test Files:**
- Component: `src/features/auth/__tests__/AuthCallbackPage.test.tsx`

### F-015: OTP Deep-Link Verification
**Status:** implemented
**Route:** `/auth/verify?token&email&type`
**Components:** `features/auth/AuthVerifyPage.tsx`

**Description:** Verifies OTP tokens arriving from email deep-links, then redirects; shows an expired/invalid state on failure.

**Critical Assertions:**
1. Missing token/email → `/login`, no verify call
2. Success (login) → `/dashboard`
3. Signup with incomplete profile → `/signup?verified=true`
4. Failure shows expired/invalid message
5. In-progress shows verifying spinner

**Test Files:**
- Component: `src/features/auth/__tests__/AuthVerifyPage.test.tsx`

### F-016: Onboarding Flow
**Status:** implemented
**Route:** `/:lang/onboarding`
**Components:** `features/auth/OnboardingPage.tsx`

**Description:** Four-step first-run stepper: welcome → connect data (Wyscout/StatsBomb credentials) → preferences (leagues/positions) → ready. Saves best-effort and finishes to the dashboard.

**Critical Assertions:**
1. Opens on welcome and greets by profile name
2. Renders the 4-step stepper
3. Continue advances to the connect-data step
4. Reaching "ready" and confirming navigates to `/dashboard` (replace)

**Test Files:**
- Component: `src/features/auth/__tests__/OnboardingPage.test.tsx`

### F-017: Route Guards (Auth / Org)
**Status:** implemented
**Route:** Wraps protected + onboarding routes
**Components:** `features/auth/AuthGuard.tsx` (`AuthGuard`, `AuthOnlyGuard`)

**Description:** `AuthGuard` requires auth + an organization (else onboarding/login); `AuthOnlyGuard` requires only auth.

**Critical Assertions:**
1. Loading → skeleton
2. No user → `/login`
3. User without org → `/onboarding`
4. Authenticated (with org) → renders outlet

**Test Files:**
- Component: `src/features/auth/__tests__/AuthGuard.test.tsx`

---

## Dashboard

### F-020: Dashboard Home
**Status:** implemented
**Route:** `/:lang/dashboard`
**Components:** `features/dashboard/DashboardPage.tsx`

**Description:** Overview stats, recent searches, quick actions, and watchlist alerts feed.

**Critical Assertions:**
1. Renders overview stats and quick actions
2. Recent search history renders
3. Alerts feed renders

**Test Files:**
- Component: `src/features/dashboard/__tests__/Dashboard.test.tsx`

### F-021: Alerts
**Status:** implemented
**Route:** `/:lang/alerts`
**Components:** `features/dashboard/AlertsPage.tsx`

**Description:** Watchlist alerts with status filtering (stable / price change / injury / form change).

**Critical Assertions:**
1. Alerts render
2. Status filter narrows the list
3. Alert detail shows player + status + date

**Test Files:**
- Component: `src/features/dashboard/__tests__/Alerts.test.tsx`

---

## Search, Players & Comparison

### F-030: AI Player Search
**Status:** implemented
**Route:** `/:lang/search`
**Components:** `features/search/SearchPage.tsx`, `features/search/components/*`

**Description:** Natural-language player search with ranked, sortable results and fit scores.

**Critical Assertions:**
1. Search form renders and accepts a query
2. Results table renders with sortable columns
3. Fit-score badges render

**Test Files:**
- Component: `src/features/search/__tests__/SearchPage.test.tsx`

### F-031: Search History
**Status:** implemented
**Route:** `/:lang/search-history`
**Components:** `features/search/SearchHistoryPage.tsx`

**Description:** Past searches with reload/delete.

**Critical Assertions:**
1. Past searches render newest-first
2. Reload re-runs a cached search
3. Delete removes an entry

**Test Files:**
- Component: `src/features/search/__tests__/SearchHistoryPage.test.tsx`

### F-032: AI Scouting Reports (List & Detail)
**Status:** implemented
**Route:** `/:lang/players` (list), `/:lang/players/:id` (detail)
**Components:** `features/report/ReportsListPage.tsx`, `features/report/ReportPage.tsx`

**Description:** The core value screen. List of generated reports plus a per-player detail view: AI summary, strengths/weaknesses, A-D ratings, radar chart, similar players, transfer/contract info, PDF export, and one-click report generation for players without a report.

**Critical Assertions:**
1. List renders with mocked data + single heading
2. Detail shows loading skeletons while fetching
3. Detail shows the "no report yet → Generate Report" empty state for a known player

**Test Files:**
- Component: `src/features/report/__tests__/ReportsListPage.test.tsx`
- Component: `src/features/report/__tests__/ReportPage.test.tsx`

### F-033: Head-to-Head Comparison
**Status:** implemented
**Route:** `/:lang/compare`
**Components:** `features/comparison/ComparisonPage.tsx`, `features/comparison/components/*`

**Description:** 2-10 player side-by-side comparison with per-90 metrics, radar overlay, and AI verdict.

**Critical Assertions:**
1. Page renders with player selector
2. Metrics/comparison structure renders
3. Radar/verdict area present

**Test Files:**
- Component: `src/features/comparison/__tests__/ComparisonPage.test.tsx`

---

## Squad, Watchlists & Settings

### F-040: Squad Management
**Status:** implemented
**Route:** `/:lang/squad`
**Components:** `features/squad/SquadPage.tsx`, `features/squad/components/*`

**Description:** Create squads, import rosters, inline position/DOB editing, formation pitch, and gap analysis.

**Critical Assertions:**
1. Page renders with squad UI
2. Squad roster/table structure renders
3. Formation/gap sections present

**Test Files:**
- Component: `src/features/squad/__tests__/SquadPage.test.tsx`

### F-050: Watchlist Management
**Status:** implemented
**Route:** `/:lang/watchlists`
**Components:** `features/watchlists/WatchlistsPage.tsx`, `features/watchlists/components/*`

**Description:** Categorized watchlists; add players, per-player alert status, notes.

**Critical Assertions:**
1. Page renders watchlist UI
2. Watchlist cards/list render
3. Add-player affordance present

**Test Files:**
- Component: `src/features/watchlists/__tests__/WatchlistsPage.test.tsx`

### F-060: Settings & Account
**Status:** implemented
**Route:** `/:lang/settings`
**Components:** `features/settings/SettingsPage.tsx`, `features/settings/components/*` (Profile, Password, Org, Billing, AiMethodology, Credentials, PlayerDatabase, DeleteAccount)

**Description:** Tabbed account settings: profile, password, organization/team, billing, AI scoring methodology, BYOK credentials, data-source selection, and account deletion.

**Critical Assertions:**
1. Settings page renders with tabs
2. Tab navigation renders the settings sections
3. Renders without errors under mocked auth/org

**Test Files:**
- Component: `src/features/settings/__tests__/SettingsPage.test.tsx`

---

## Cross-cutting

### F-070: 404 Not Found
**Status:** implemented
**Route:** `/:lang/*`
**Components:** `features/errors/NotFoundPage.tsx`

**Description:** In-language 404 with Go Back / Go to Dashboard and a noindex meta.

**Critical Assertions:**
1. Renders heading + description
2. Go Back navigates back (-1)
3. Go to Dashboard navigates to `/dashboard`

**Test Files:**
- Component: `src/features/errors/__tests__/NotFoundPage.test.tsx`

### F-080: Theme (Dark / Light)
**Status:** implemented
**Route:** Global
**Components:** `components/shared/ThemeProvider`

**Description:** Dark default with light toggle, persisted to localStorage, applied via `data-theme`.

**Critical Assertions:**
1. Defaults to dark when no stored value
2. Switching to light persists to localStorage
3. `data-theme` applied to document; invalid stored value handled gracefully

**Test Files:**
- Component: `src/components/shared/__tests__/ThemeProvider.test.tsx`

### F-081: Internationalization (EN / DE)
**Status:** implemented
**Route:** All routes (`/:lang/...`)
**Components:** `src/i18n/*`

**Description:** URL-prefixed EN/DE routing with i18next; translation-completeness is asserted so EN and DE key sets stay in sync.

**Critical Assertions:**
1. EN and DE key sets are complete / in parity
2. No missing keys across namespaces

**Test Files:**
- Unit: `src/i18n/i18n-completeness.test.ts`

---

## Planned / Untested (honest coverage gaps)

> These are genuinely wired in the product (edge functions under
> `supabase/functions/`) but have **no verified passing test in this repo**, so
> they are marked `planned` and skipped by the coverage gate. The frontend
> surfaces that trigger them (Pricing F-002, Settings F-060) are tested; the
> server-side money paths are not.

### F-090: Stripe Checkout
**Status:** planned
**Route:** Triggered from `/:lang/pricing` and `/:lang/settings`
**Components:** edge function `supabase/functions/checkout`

**Description:** Creates a Stripe Checkout session for a chosen tier/interval and redirects.

> TODO: test needed — no integration/E2E test exists for the checkout edge function or the redirect handshake.

### F-091: Stripe Billing Portal
**Status:** planned
**Route:** Triggered from `/:lang/settings`
**Components:** edge function `supabase/functions/billing-portal`

**Description:** Generates a Stripe Billing Portal link for payment method / invoices / plan changes.

> TODO: test needed — no test covers the billing-portal edge function.

### F-092: Stripe Webhook Processing
**Status:** planned
**Route:** Backend only
**Components:** edge function `supabase/functions/stripe-webhook`

**Description:** Verifies Stripe signatures and syncs subscription state (tier upgrade/downgrade/cancel, payment failure) to the org.

> TODO: test needed — signature verification and tier-sync branches are untested; this is the highest-risk gap.
