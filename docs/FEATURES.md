# ScoutCopilot — Feature Registry

> Last updated: 2026-04-22
>
> This document lists every feature in ScoutCopilot with Feature IDs, routes, components, database tables, edge functions, and test file references.
> Each feature is marked as **implemented** (all features are live in production).

---

## Public Features (No Auth Required)

### F-001: Landing Page
- **Route:** `/:lang/` (public root)
- **Components:** `features/landing/LandingPage.tsx`, `components/layout/PublicNav.tsx`, `components/layout/PublicFooter.tsx`
- **Description:** Marketing homepage with hero, features showcase, interactive radar demo, pricing overview, FAQ, and CTA
- **DB Tables:** None (read-only public content)
- **Edge Functions:** None
- **Critical Assertions:**
  - Hero section visible with CTA button
  - Features section renders all feature cards
  - Interactive radar chart demo loads
  - Pricing comparison table displays all 3 tiers
  - FAQ items expand/collapse
  - Language selector works (EN/DE)
  - All links route correctly
- **Status:** implemented
- **Test Files:** `E2E: e2e/smoke.spec.ts`, `A11y: e2e/accessibility.spec.ts`

### F-002: Pricing Page
- **Route:** `/:lang/pricing`
- **Components:** `features/pricing/PricingPage.tsx`, `components/ui/Button.tsx`, `components/ui/Card.tsx`
- **Description:** Subscription tier comparison with monthly/yearly toggle, feature matrices, checkout buttons
- **DB Tables:** None
- **Edge Functions:** `checkout` (POST)
- **Critical Assertions:**
  - Monthly/yearly toggle switches pricing
  - All 3 tiers display (Scout, Pro, Club)
  - Checkout buttons trigger Stripe session creation
  - Feature checkmarks align per tier
  - CTA buttons are accessible (44px min-height)
- **Status:** implemented
- **Test Files:** `E2E: e2e/smoke.spec.ts`, `A11y: e2e/accessibility.spec.ts`

### F-003: Privacy Policy
- **Route:** `/:lang/privacy`
- **Components:** `features/legal/PrivacyPage.tsx`
- **Description:** GDPR-compliant privacy policy with data collection, processing, and rights sections
- **DB Tables:** None
- **Edge Functions:** None
- **Critical Assertions:**
  - Page renders without errors
  - Proper heading hierarchy
  - All sections readable
- **Status:** implemented
- **Test Files:** `E2E: e2e/smoke.spec.ts`

### F-004: Terms of Service
- **Route:** `/:lang/terms`
- **Components:** `features/legal/TermsPage.tsx`
- **Description:** Terms of service, liability disclaimers, usage restrictions
- **DB Tables:** None
- **Edge Functions:** None
- **Critical Assertions:**
  - Page renders without errors
  - Proper heading hierarchy
- **Status:** implemented
- **Test Files:** `E2E: e2e/smoke.spec.ts`

### F-005: Imprint (German Legal Requirement)
- **Route:** `/:lang/imprint`
- **Components:** `features/legal/ImprintPage.tsx`
- **Description:** Impressum / Imprint with company and contact details
- **DB Tables:** None
- **Edge Functions:** None
- **Critical Assertions:**
  - All company details present
  - Contact information correct
- **Status:** implemented
- **Test Files:** `E2E: e2e/smoke.spec.ts`

---

## Authentication Features

### F-010: User Login (Magic Link)
- **Route:** `/:lang/login`
- **Components:** `features/auth/LoginPage.tsx`, `components/auth/OtpInput.tsx`, `components/auth/ResendTimer.tsx`
- **Description:** Magic link authentication: email entry → OTP sent → OTP verification → session created
- **DB Tables:** `auth.users`, `profiles`
- **Edge Functions:** `send-auth-email` (POST)
- **Critical Assertions:**
  - Email input accepts valid email
  - Form rejects invalid email format
  - Magic link email sent to provided address
  - OTP input accepts 6 digits
  - Correct OTP signs user in
  - Incorrect OTP shows error
  - Resend timer appears and counts down
  - User redirected to onboarding on first login
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/LoginPage.test.tsx`

### F-011: User Signup (Registration)
- **Route:** `/:lang/signup`
- **Components:** `features/auth/SignupPage.tsx`
- **Description:** New user registration with email validation and automatic organization creation
- **DB Tables:** `auth.users`, `profiles`, `organizations`
- **Edge Functions:** `send-auth-email`, `send-welcome` (POST)
- **Critical Assertions:**
  - Email field validates format
  - Signup button disabled until valid email
  - Account created with auth.users entry
  - Welcome email sent to new user
  - User auto-org created (default org)
  - User logged in and redirected to onboarding
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Integration: src/test/SignupFlow.test.tsx`

### F-012: Forgot Password
- **Route:** `/:lang/forgot-password`
- **Components:** `features/auth/ForgotPasswordPage.tsx`
- **Description:** Password reset flow: email → reset link → new password → session updated
- **DB Tables:** `auth.users`
- **Edge Functions:** `send-auth-email` (POST)
- **Critical Assertions:**
  - Email input accepts valid email
  - Reset link generated and emailed
  - Reset link valid for 1 hour
  - New password accepted
  - User signed in with new password
  - Old password no longer works
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`

### F-013: Reset Password (Via Link)
- **Route:** `/:lang/reset-password?token={token}`
- **Components:** `features/auth/ResetPasswordPage.tsx`
- **Description:** Password reset via magic link token (sent by F-012)
- **DB Tables:** `auth.users`
- **Edge Functions:** None (uses Supabase auth flow)
- **Critical Assertions:**
  - Token validated
  - Password input shows strength meter
  - Min 8 chars enforced
  - Password reset succeeds
  - User session updated
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`

### F-014: Auth Callback (OAuth/MagicLink Redirect)
- **Route:** `/auth/callback?code={code}&type=recovery|recovery_token|magiclink`
- **Components:** `features/auth/AuthCallbackPage.tsx`
- **Description:** Supabase auth redirect handler for all auth flows (magic link, OAuth, password reset)
- **DB Tables:** `auth.users`, `profiles`
- **Edge Functions:** None (Supabase built-in)
- **Critical Assertions:**
  - Valid code accepted and processed
  - Invalid code rejected with error
  - User redirected to dashboard or onboarding
  - Session cookie set
- **Status:** implemented
- **Test Files:** `Integration: src/test/AuthCallback.test.tsx`

### F-015: Auth Verification (Email OTP Confirmation)
- **Route:** `/auth/verify?token={token}&type=email_change|phone_change`
- **Components:** `features/auth/AuthVerifyPage.tsx`
- **Description:** Email confirmation for sensitive operations (password reset, email change)
- **DB Tables:** `auth.users`
- **Edge Functions:** None
- **Critical Assertions:**
  - Token validated
  - Email change confirmed
  - Session updated if needed
  - User redirected to next step
- **Status:** implemented
- **Test Files:** `Integration: src/test/AuthVerify.test.tsx`

### F-016: Onboarding Flow (Organization Setup)
- **Route:** `/:lang/onboarding`
- **Components:** `features/auth/OnboardingPage.tsx`
- **Description:** First-time user setup: select/create organization, accept terms, choose subscription tier
- **DB Tables:** `organizations`, `profiles`, `usage_tracking`
- **Edge Functions:** `checkout` (POST)
- **Critical Assertions:**
  - Onboarding form shows all steps
  - Organization name accepted
  - Terms checkbox required
  - Subscription tier selection works (defaults to Scout)
  - Checkout link generated for paid tiers
  - Organization created with correct owner
  - User redirected to dashboard on completion
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`

---

## Dashboard Features

### F-020: Dashboard Home
- **Route:** `/:lang/dashboard`
- **Components:** `features/dashboard/DashboardPage.tsx`, `components/layout/AppShell.tsx`, `components/layout/Sidebar.tsx`, `components/layout/TopBar.tsx`
- **Description:** Main dashboard with overview stats, recent searches, quick actions, watchlist alerts feed
- **DB Tables:** `search_queries`, `player_reports`, `watchlists`, `watchlist_players`, `usage_tracking`
- **Edge Functions:** None (read from tables)
- **Critical Assertions:**
  - Overview stats display (searches, reports, players tracked)
  - Monthly API call count shown
  - Recent search history renders with reload buttons
  - Watchlist alerts feed shows latest alerts
  - Quick action buttons visible (search, create watchlist, create squad)
  - Sidebar navigation shows all sections
  - Breadcrumbs or nav title shows current page
  - Responsive: mobile sidebar collapses
- **Status:** implemented
- **Test Files:** `Unit: src/features/dashboard/__tests__/Dashboard.test.tsx` (14 tests), `E2E: e2e/dashboard.spec.ts` (8 tests), `Smoke: e2e/smoke.spec.ts`

### F-021: Alerts Page (Watchlist Notifications)
- **Route:** `/:lang/alerts`
- **Components:** `features/dashboard/AlertsPage.tsx`, `components/ui/Badge.tsx`
- **Description:** Centralized watchlist alerts with status filtering (stable, price change, injury, form change)
- **DB Tables:** `watchlist_players`
- **Edge Functions:** None
- **Critical Assertions:**
  - All watchlist alerts display
  - Status filter works (stable, price change, injury, form change)
  - Alert detail shows player, watchlist, status, date
  - Dismiss alert removes from feed
  - Player name links to report if available
- **Status:** implemented
- **Test Files:** `Unit: src/features/dashboard/__tests__/Alerts.test.tsx` (21 tests), `E2E: e2e/dashboard.spec.ts` (5 tests), `Smoke: e2e/smoke.spec.ts`

---

## Search & Player Features

### F-030: AI Player Search
- **Route:** `/:lang/search`
- **Components:** `features/search/SearchPage.tsx`, `features/search/components/SearchFilters.tsx`, `features/search/components/SearchResultsTable.tsx`
- **Description:** Natural language player search with Claude parsing, multi-provider search, ranking by fit score, photo enrichment
- **DB Tables:** `search_queries`, `search_results`, `player_enrichment_cache`, `sb_players`
- **Edge Functions:** `search` (POST), `generate-photo` (POST)
- **Critical Assertions:**
  - Search form accepts natural language query
  - Submit button disabled while loading
  - Results table renders with pagination
  - Columns sortable (fit score, position, age, club, etc.)
  - Fit score badge shows 0-100 range
  - Player photos load (or fallback to silhouette)
  - Expandable stat rows show detailed metrics
  - CSV export button downloads results
  - Search history persists in DB
  - Tier limits enforced (e.g., Scout max 1 result per search)
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/SearchPage.test.tsx`

### F-031: Search History
- **Route:** `/:lang/search-history`
- **Components:** `features/search/SearchHistoryPage.tsx`
- **Description:** List of all past searches with reload capability
- **DB Tables:** `search_queries`, `search_results`
- **Edge Functions:** None (read from tables)
- **Critical Assertions:**
  - All past searches display
  - Searches sorted by date (newest first)
  - Reload button fetches cached results
  - Delete button removes search
  - Pagination works for large history
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/SearchHistory.test.tsx`

### F-032: AI Scouting Reports
- **Route:** `/:lang/players/:id` (detail view) and `/:lang/players` (list view)
- **Components:** `features/report/ReportPage.tsx`, `features/report/ReportsListPage.tsx`
- **Description:** One-click report generation from search results with AI analysis, similar player matching, transfer timeline, contract info, PDF export
- **DB Tables:** `player_reports`, `watchlist_players`, `player_enrichment_cache`, `search_results`
- **Edge Functions:** `report` (POST), `generate-photo` (POST)
- **Critical Assertions:**
  - Report button generates AI scouting report
  - Report includes: executive summary, strengths, weaknesses, style of play, A-D ratings, recommendation
  - Radar chart displays stat profile
  - Similar players carousel loads with photos
  - Transfer timeline shows past moves
  - Contract info displays (if available)
  - Birth date inline editable
  - PDF export downloads branded report
  - Reports list shows all generated reports
  - Sort by date/name/rating
  - Delete report with confirmation
  - Add to watchlist from report
  - Tier limits enforced (Scout 10/month, Pro unlimited)
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/ReportPage.test.tsx`

### F-033: Head-to-Head Comparison
- **Route:** `/:lang/compare`
- **Components:** `features/comparison/ComparisonPage.tsx`, `features/comparison/components/PlayerSelector.tsx`, `features/comparison/components/ComparisonTable.tsx`
- **Description:** 2-10 player side-by-side comparison with per-90 metrics, radar overlay, AI verdict, tactical context
- **DB Tables:** `player_comparisons`, `search_results`, `player_reports`
- **Edge Functions:** `compare` (POST), `generate-photo` (POST)
- **Critical Assertions:**
  - Player selector adds 2-10 players (tier-dependent)
  - Min 2 players to generate comparison
  - Metrics table shows: Goals/90, Assists/90, Key Passes/90, Pass %, Prog. Carries/90, Tackles/90, Aerial Won %
  - Radar chart overlays all players
  - AI verdict generated (analysis, per-player ranks, highlights, recommendation)
  - Tactical context input optional (e.g., "4-3-3 high-press")
  - Comparison history saved
  - Load/delete past comparisons
  - Tier limits enforced (Scout 3 players, Pro/Club 10)
  - Export comparison as PDF
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/ComparisonPage.test.tsx`

---

## Squad Management

### F-040: Squad Management
- **Route:** `/:lang/squad`
- **Components:** `features/squad/SquadPage.tsx`, `features/squad/components/SquadCard.tsx`, `features/squad/components/SquadTable.tsx`, `features/squad/components/FormationPitch.tsx`, `features/squad/components/GapAnalysisSection.tsx`
- **Description:** Create multiple squads, import rosters from API-Football, manage players, inline position/DOB editing, formation visualization, gap analysis
- **DB Tables:** `squads` (custom table), `squad_players`, `player_enrichment_cache`
- **Edge Functions:** `import-team` (POST), `generate-photo` (POST)
- **Critical Assertions:**
  - Create new squad with name
  - Squad card displays roster summary
  - Player add modal opens with position/name/nationality
  - Inline position editing (10 positions: GK, CB, LB, RB, CDM, CM, CAM, LW, RW, ST)
  - Inline DOB editing
  - Photo upload per player (auto-crop to 400×400 JPEG)
  - Player deletion with confirmation
  - Team import search finds teams
  - Team roster imported with all players
  - Generic positions (from API-Football) reassigned inline
  - Formation pitch visualizes squad layout
  - Gap analysis identifies missing positions/depth
  - Average age and rating calculated per position
  - Tier limits enforced (Scout/Pro limited squads)
  - Players added from search results to squad
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/SquadPage.test.tsx`

---

## Watchlists

### F-050: Watchlist Management
- **Route:** `/:lang/watchlists`
- **Components:** `features/watchlists/WatchlistsPage.tsx`, `features/watchlists/components/WatchlistCard.tsx`, `features/watchlists/components/WatchlistDetail.tsx`
- **Description:** Create categorized watchlists, add players from search/reports, track alert status per player
- **DB Tables:** `watchlists`, `watchlist_players`
- **Edge Functions:** None (read from tables)
- **Critical Assertions:**
  - Create new watchlist with name, category, description
  - Watchlist card displays all players
  - Player add modal opens (search or manual)
  - Alert status selectable (stable, price change, injury, form change)
  - Player notes editable
  - Delete player with confirmation
  - Alert status filters watchlist
  - Player name links to report if available
  - Watchlist edit name/description
  - Delete watchlist with confirmation
  - Sharing controls (if enabled)
  - Tier limits enforced (Scout: no watchlists, Pro: unlimited, Club: unlimited)
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/WatchlistsPage.test.tsx`

---

## Settings & Account

### F-060: Profile Settings
- **Route:** `/:lang/settings`
- **Components:** `features/settings/SettingsPage.tsx`, `features/settings/components/ProfileSettings.tsx`, `features/settings/components/PasswordSettings.tsx`, `features/settings/components/OrgSettings.tsx`
- **Description:** Edit profile name, email, password, organization details, team invitations
- **DB Tables:** `profiles`, `organizations`
- **Edge Functions:** `invite-member` (POST)
- **Critical Assertions:**
  - Profile name editable
  - Email change flow (verify new email via magic link)
  - Password change (old password required)
  - Organization name editable (owner/admin only)
  - Team member list shows all members with roles
  - Invite member by email with role assignment (owner, admin, scout)
  - Invitation email sent
  - Remove member with confirmation
  - Role edit (owner/admin only)
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/SettingsPage.test.tsx`

### F-061: Billing Settings
- **Route:** `/:lang/settings` (billing tab)
- **Components:** `features/settings/components/BillingSettings.tsx`
- **Description:** Subscription tier display, upgrade/downgrade, payment method management, usage tracking
- **DB Tables:** `organizations`, `usage_tracking`
- **Edge Functions:** `checkout` (POST), `billing-portal` (POST)
- **Critical Assertions:**
  - Current tier displayed
  - Monthly/yearly pricing toggle
  - Upgrade button opens Stripe Checkout
  - Downgrade button opens Stripe Billing Portal
  - Usage metrics shown (API calls/month, reports generated, searches count)
  - Tier limits enforced
  - Payment method editable via Stripe portal
  - Invoices accessible via Stripe portal
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/BillingSettings.test.tsx`

### F-062: AI Methodology Settings (Scoring Weights)
- **Route:** `/:lang/settings` (methodology tab)
- **Components:** `features/settings/components/AiMethodologySettings.tsx`
- **Description:** Customize scoring weights for AI analysis (attacking, defending, passing, physical)
- **DB Tables:** `profiles`
- **Edge Functions:** None
- **Critical Assertions:**
  - All 4 weight sliders render
  - Weights 0-100 range
  - Default values present
  - Save persists to DB
  - Weights influence AI ranking/report generation
- **Status:** implemented
- **Test Files:** `Component: src/test/AiMethodologySettings.test.tsx`

### F-063: API Credentials (BYOK)
- **Route:** `/:lang/settings` (credentials tab)
- **Components:** `features/settings/components/CredentialSettings.tsx`
- **Description:** Manage BYOK API keys (Wyscout, StatsBomb), credential validation, encryption
- **DB Tables:** `api_credentials`
- **Edge Functions:** `credentials` (CRUD)
- **Critical Assertions:**
  - Credential form shows all providers (Wyscout, StatsBomb)
  - Username/password/API key inputs
  - Validate button tests connection before saving
  - Credentials encrypted in DB
  - Edit/delete existing credentials
  - Tier limits enforced (Scout: none, Pro: up to 2, Club: unlimited)
  - Error messages clear (failed validation)
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/CredentialSettings.test.tsx`

### F-064: Player Database Settings
- **Route:** `/:lang/settings` (database tab)
- **Components:** `features/settings/components/PlayerDatabaseSettings.tsx`
- **Description:** Select active data sources for search (StatsBomb Open, API-Football, Wyscout)
- **DB Tables:** `organizations`
- **Edge Functions:** None
- **Critical Assertions:**
  - Checkboxes for each data source
  - StatsBomb Open always available
  - API-Football available for all tiers
  - Wyscout requires BYOK credentials to enable
  - Selection persists to DB
  - Search respects selected sources
- **Status:** implemented
- **Test Files:** `Component: src/test/PlayerDatabaseSettings.test.tsx`

### F-065: Delete Account
- **Route:** `/:lang/settings` (account tab)
- **Components:** `features/settings/components/DeleteAccountSettings.tsx`
- **Description:** Cascade delete user, organization, all data, send confirmation email
- **DB Tables:** All tables (cascade delete via RLS)
- **Edge Functions:** `delete-account` (POST)
- **Critical Assertions:**
  - Delete button opens confirmation modal
  - Warning message clear (irreversible)
  - Email confirmation required
  - User logged out after deletion
  - Confirmation email sent
  - All user data removed from DB
  - Organization deleted if user was sole owner
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/DeleteAccountSettings.test.tsx`

---

## Billing & Payments

### F-070: Stripe Checkout
- **Route:** Triggered from `/:lang/pricing` or `/:lang/settings`
- **Components:** None (external Stripe Checkout)
- **Description:** Stripe Checkout modal for new subscriptions
- **DB Tables:** `organizations`
- **Edge Functions:** `checkout` (POST)
- **Critical Assertions:**
  - Checkout session created with correct tier/interval
  - Redirect to Stripe Checkout succeeds
  - Webhook received on payment success
  - `stripe_customer_id` stored in organization
  - User subscribed to correct tier
  - Session redirects to success page
- **Status:** implemented
- **Test Files:** `Integration: src/test/CheckoutFlow.test.tsx`

### F-071: Stripe Billing Portal
- **Route:** Triggered from `/:lang/settings`
- **Components:** None (external Stripe Billing Portal)
- **Description:** Link to Stripe Billing Portal for payment method, invoices, subscription changes
- **DB Tables:** `organizations`
- **Edge Functions:** `billing-portal` (POST)
- **Critical Assertions:**
  - Redirect to Stripe Billing Portal succeeds
  - User can change payment method
  - User can view invoices
  - User can upgrade/downgrade
  - Webhook received on subscription changes
  - Organization updated in ScoutCopilot DB
- **Status:** implemented
- **Test Files:** `Integration: src/test/BillingPortal.test.tsx`

### F-072: Stripe Webhook Handling
- **Route:** `/:lang/webhooks/stripe` (backend only)
- **Components:** None
- **Description:** Process Stripe events (checkout completed, subscription updated/deleted, payment failed)
- **DB Tables:** `organizations`, `usage_tracking`
- **Edge Functions:** `stripe-webhook` (POST)
- **Critical Assertions:**
  - Webhook signature verified
  - Payment succeeded → tier updated
  - Subscription updated → tier updated
  - Subscription deleted → tier reset to free
  - Payment failed → alert sent to user
- **Status:** implemented
- **Test Files:** `Integration: src/test/StripeWebhooks.test.tsx`

---

## Internationalization (i18n)

### F-080: Language Routing
- **Route:** `/:lang/...` (all routes have `:lang` parameter)
- **Components:** `components/layout/LanguageRootLayout.tsx`, `components/shared/LanguageSelector.tsx`
- **Description:** URL-based language routing (EN, DE)
- **DB Tables:** None
- **Edge Functions:** None
- **Critical Assertions:**
  - Routes support `/en/...` and `/de/...` prefixes
  - `/` redirects to `/en/`
  - Language selector switches route and preserves current page
  - i18next instance loads correct language file
  - All content translated
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`, `Component: src/test/LanguageRouting.test.tsx`

### F-081: Translation Completeness
- **Route:** All routes
- **Components:** All components
- **Description:** All user-facing text translated to EN and DE
- **DB Tables:** None
- **Edge Functions:** None
- **Critical Assertions:**
  - English keys exist in `src/i18n/en.json`
  - German keys exist in `src/i18n/de.json`
  - Email templates bilingual (EN/DE)
  - No hardcoded English strings in UI
- **Status:** implemented
- **Test Files:** `Unit: src/test/TranslationCompleteness.test.ts`

---

## Infrastructure & SEO

### F-090: Sitemap Generation
- **Component:** `scripts/generate-sitemap.ts` (build-time)
- **Description:** Auto-generate sitemap.xml from routes at build time
- **Critical Assertions:**
  - Sitemap generated on build
  - All public routes included
  - Protected routes excluded
  - Bilingual routes included (en, de)
  - Valid XML format
- **Status:** implemented
- **Test Files:** `Unit: src/test/SitemapGeneration.test.ts`

### F-091: Open Graph Meta Tags
- **Component:** All pages
- **Description:** og:image, og:title, og:type, og:locale:alternate for SEO
- **Critical Assertions:**
  - Landing page has og:image
  - Pricing page has og:type=website
  - English and German og:locale:alternate tags present
  - og:title matches page title
- **Status:** implemented
- **Test Files:** `E2E: e2e/features.spec.ts`

### F-092: Password Gate (Private Beta)
- **Component:** `components/shared/PasswordGate.tsx`
- **Description:** SHA-256 password check before app access (private beta)
- **Critical Assertions:**
  - Gate shows on app load
  - Incorrect password rejected
  - Correct password unlocks app
  - Password checked against SHA-256 hash in code
  - Gate persists in session storage
- **Status:** implemented
- **Test Files:** `Component: src/test/PasswordGate.test.tsx`

---

## Edge Functions

All edge functions return appropriate HTTP status codes and error messages.

| Function | Method | Rate Limit | Purpose | Edge Function Tests |
|----------|--------|-----------|---------|---------------------|
| `search` | POST | 30/min/org | NL player search across all providers | `Integration: src/test/SearchEdgeFunction.test.ts` |
| `report` | POST | 10/min/org, 10/month (scout) | AI scouting report generation | `Integration: src/test/ReportEdgeFunction.test.ts` |
| `compare` | POST | 20/min/org | Head-to-head comparison | `Integration: src/test/CompareEdgeFunction.test.ts` |
| `rate-player` | POST | None (batch max 10) | AI player rating (1-99) | `Integration: src/test/RatePlayerEdgeFunction.test.ts` |
| `import-team` | POST | 30/min/org | Team roster import from API-Football | `Integration: src/test/ImportTeamEdgeFunction.test.ts` |
| `generate-photo` | POST | 10/min/org | Photo fetching/caching | `Integration: src/test/GeneratePhotoEdgeFunction.test.ts` |
| `checkout` | POST | 5/min/org | Stripe checkout session | `Integration: src/test/CheckoutEdgeFunction.test.ts` |
| `billing-portal` | POST | 10/min/org | Stripe billing portal link | `Integration: src/test/BillingPortalEdgeFunction.test.ts` |
| `stripe-webhook` | POST | None | Stripe event processing | `Integration: src/test/StripeWebhookEdgeFunction.test.ts` |
| `credentials` | CRUD | 10/min/org | API credential management | `Integration: src/test/CredentialsEdgeFunction.test.ts` |
| `invite-member` | POST | 5/min/org | Team invitation email | `Integration: src/test/InviteMemberEdgeFunction.test.ts` |
| `send-auth-email` | POST | None | Auth email (magic link, reset) | `Integration: src/test/SendAuthEmailEdgeFunction.test.ts` |
| `send-welcome` | POST | 5/min/user | Welcome email on signup | `Integration: src/test/SendWelcomeEdgeFunction.test.ts` |
| `delete-account` | POST | 3/min/user | Cascade delete user + send confirmation | `Integration: src/test/DeleteAccountEdgeFunction.test.ts` |

---

## Shared Components & Hooks

### Components
- `Modal` — Accessible modal with focus trap, Escape key dismiss
- `PlayerAvatar` — Player photo with silhouette fallback, upload overlay
- `ComparisonRadar` — SVG radar chart for multi-player overlay
- `PasswordGate` — Private beta access control
- `ConfirmDialog` — Accessible confirmation modal
- `ScrollableTabBar` — Horizontal tab navigation
- `Button`, `Input`, `Select`, `SearchBar` — UI primitives with 44px touch targets

### Hooks
- `usePlayerSearch` — Search state, results, filtering
- `usePlayerReport` — Single report fetch + enrichment
- `useComparison` — Player selection, comparison generation
- `useSquad` — Squad CRUD, player management
- `useWatchlists` — Watchlist CRUD, player management
- `usePlayerPhotoFetch` — On-demand photo fetching
- `usePlayerPhotoUpload` — Photo upload with auto-crop
- `useGeneratedReports` — Track which players have reports

---

## Known Constraints & Notes

1. **API-Football squad positions** are generic (Goalkeeper/Defender/Midfielder/Attacker) — users reassign via inline editor
2. **Tier limits** enforced per feature (see tier comparison in PROJECT_SCOPE.md)
3. **Supabase `verify_jwt`** set to false (ES256 incompatibility) — auth handled in function code
4. **StatsBomb open data** covers limited competitions — some players may lack stats
5. **API-Football CDN** blocked browser hotlinking — images proxied server-side to Supabase Storage
6. **TheSportsDB CDN** migrated to r2.thesportsdb.com — URL normalization applied
7. **No AI photo generation** — uses silhouette fallback if no real photo available

---

## Coverage Status

- **Total Features:** 52
- **Public Features:** 5
- **Auth Features:** 7
- **Dashboard Features:** 2
- **Search & Player Features:** 4
- **Squad Management:** 1
- **Watchlists:** 1
- **Settings & Account:** 6
- **Billing & Payments:** 3
- **Internationalization:** 2
- **Infrastructure & SEO:** 3
- **Edge Functions:** 14 (all tested)

**Target Test Coverage:** 80%+ unit, 60%+ integration, 100% smoke tests, 100% accessibility audit
