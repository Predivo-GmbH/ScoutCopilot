# ScoutCopilot — Staging Status & Handoff

**Last updated:** 2026-07-07
**Branch:** `staging` (14 commits ahead of `master`/production — NOT yet merged to prod)
**Staging URL:** https://staging.scoutcopilot.com — browser Basic-auth **`scout` / `Scout-Staging-2026`** (the old `(value retired 2026-09-02 - each app now has its own, see that app's docs/Credentials.txt)` app gate has been REMOVED on this branch)

---

## TL;DR — current state

Three bodies of work sit on the `staging` branch, deployed to staging.scoutcopilot.com and reviewed:

1. **Footer redesign + 9 SEO marketing pages** — Roger APPROVED (2026-07-07).
2. **Coming-soon gate removed + registration closed behind an email waitlist.**
3. **A pile of React 19 fixes** forced out by staging (the app crashed on real/slow networks in ways localhost never showed).

**Production is untouched.** Everything ships to prod only when Roger merges `staging` → `master` and runs the prod deploy. He has NOT given that go yet.

---

## The `staging` branch — what merges to prod

`git log --oneline master..staging` (newest first):

| Commit | What |
|---|---|
| `8c01953` | **Eager-import ALL routes** (kill the React 19 lazy-Suspense-reveal crash class — see below) |
| `bc6b156` | *(other session)* auth reset regression test |
| `3692d16` | Eager-import SignupPage (so /signup waitlist avoids the lazy-reveal bug) |
| `d564efc` | **Remove coming-soon gate + close registration behind a waitlist** |
| `b3b1498` | *(other session)* keep reset success screen after signOut |
| `66e32b6` | *(other session)* edge fns: dynamic AI model resolution (fleet standard) |
| `e826983` | Legal `<title>` single template-literal child (React 19 native metadata) |
| `1fbb683` | Legal pages → React 19 native metadata |
| `4764ec3` | **Bundle en synchronously + eager-import public pages** (fix double-render) |
| `92301db` | Revert 184ffe5 (eager without the i18n fix crashed) |
| `184ffe5` | (reverted) first eager-public-pages attempt |
| `ac8d9db` | **Suspense `fallback={null}`** + eager MarketingPage + native metadata |
| `f1beea3` | Fix staging workflow YAML |
| `3b426a2` | **Staging deploy workflow + footer redesign + 9 SEO pages** |

⚠️ **The merge carries 3 commits from OTHER sessions** (`bc6b156`, `b3b1498`, `66e32b6` — auth-reset + edge-fn-AI-model fixes). They are legit fixes but were authored/tested elsewhere; be aware they go to prod in the same merge.

---

## Staging environment (reference)

- **Plesk** (tertia.sui-inter.net:8443, login `mueller`): subdomain `staging.scoutcopilot.com` = domainId **6220**, docroot `/var/www/vhosts/scoutcopilot.com/staging.scoutcopilot.com/`, same FTP user as prod (`scoutcopilot.com_0pmnrney1xq`).
- **SSL:** Let's Encrypt, auto-renew, HTTP→HTTPS on.
- **Protection:** browser Basic-auth (`.htpasswd` at docroot, `scout` / `Scout-Staging-2026`) + `X-Robots-Tag: noindex` + `robots.txt` disallow-all. The `.htpasswd` is placed on the server and EXCLUDED from the deploy mirror.
- **CI:** `.github/workflows/deploy-staging.yml` — push to `staging` → lint → build → FTPS deploy (`ssl-protect-data no`) → health check. Production (`deploy.yml`, on `master`) is a separate workflow, never triggered by staging.
- **Supabase:** staging REUSES the PROD project `rlcsuqwqzoqjykdiqjye` (anon key only). No separate staging DB.
- **Secrets:** reuses prod FTP_*/VITE_SUPABASE_*; added `STAGING_HTPASSWD_USER`/`STAGING_HTPASSWD_PASS`.
- Full detail: memory `session_scoutcopilot_staging_env_2026_07_03`.

---

## 1) Footer + SEO pages (APPROVED)

- Footer = ReplyFlow left-anchored layout (brand + `🛡 Swiss-made` + PRODUCT / FOR / GUIDES columns + copyright/legal bottom bar). File: `src/components/layout/PublicFooter.tsx`.
- 9 SEO pages, data-driven from `src/features/marketing/pages.ts` via `src/features/marketing/MarketingPage.tsx`: 5 **For** (academies/agents/clubs/analysts/recruiters) + 4 **Guides** (how-to-scout-with-data / building-a-shortlist / player-comparison / data-driven-scouting). Routes `for/:slug` + `guides/:slug`. English-only content, canonical always `/en/`.
- Sitemap (`scripts/generate-sitemap.ts`) emits the 9 EN-only marketing URLs.
- Detail: memory `decision_footer_standard_and_seo_pages_2026_07_02`.

---

## 2) Gate removal + waitlist

**Gate:** `<PasswordGate>` (the `(value retired 2026-09-02 - each app now has its own, see that app's docs/Credentials.txt)` coming-soon lock) removed from `src/App.tsx`. Public pages are now public; authenticated app pages still behind `AuthGuard` (login). Staging still protected by browser Basic-auth.

**Waitlist:** every sign-up CTA now opens a **"Free trials are paused"** modal (email capture) instead of going to signup. Files in `src/features/waitlist/`:
- `WaitlistForm.tsx` — email → `supabase.from('waitlist').insert({ email, source })`; handles success / duplicate (23505 → "already on the list") / error.
- `WaitlistProvider.tsx` + `useWaitlist.ts` + `waitlist-context.ts` — `openWaitlist(source)`, renders the modal (reuses `ui/Modal` + `ui/Button`). Mounted in App.tsx inside BrowserRouter.
- `config.ts` — **`REGISTRATIONS_OPEN: boolean = false`** (master switch).

**CTAs wired** → `openWaitlist(source)`: PublicNav Get Started (`nav`), LandingPage ×3 (`landing`), MarketingPage "Start free trial" (`marketing`), PricingPage tier buttons + bottom CTA (`pricing`). **Pricing no longer starts Stripe checkout.** `/signup` renders the waitlist (`signup-page`) — the signup FORM is preserved behind `REGISTRATIONS_OPEN`. Login unchanged (existing users can still log in).

**Supabase `waitlist` table** (`supabase/migrations/008_waitlist.sql`): `id, email, source, created_at`. RLS ON; policy = INSERT only for `anon`+`authenticated` (light email check); unique index on `lower(email)`. **The list is NOT publicly readable** (anon can insert, cannot select). Applied DIRECTLY to prod Supabase via psycopg2. **Update 2026-08-21:** the prod migration ledger (`supabase_migrations.schema_migrations`) was backfilled with 001–010 (all probe-verified live) and CI now applies migrations on every deploy (`scripts/apply-migrations.mjs`, wired into `deploy.yml` + `deploy-staging.yml`) — new migrations are committed files, no manual SQL step. Verified: anon insert 201 / select `[]` / duplicate 409.

### What actually happens when someone joins (as-built)
1. One row inserted into the `waitlist` table (email + which button, via `source`). They see "You're on the list."
2. **No email is sent to Roger. No admin screen in the app.** View the list only in the Supabase dashboard: `https://supabase.com/dashboard/project/rlcsuqwqzoqjykdiqjye/editor` → `waitlist` (login `supabase@scoutcopilot.com`).
3. **No notification mechanism exists** — nobody can be emailed "trials reopened" yet. That's deferred (see TODO).

**Current table contents:** 1 row = `roger@mueller.ro` (Roger's own test, source `nav`). Real submissions accumulate here once live.

### How to REOPEN registration later
Flip `REGISTRATIONS_OPEN` to `true` (brings the `/signup` form back) AND re-point the CTAs to `/signup` (nav/landing/pricing/marketing) — or simply `git revert d564efc`. Detail: memory `session_scoutcopilot_waitlist_gate_2026_07_07`.

---

## 3) React 19 lazy-reveal saga (the expensive lesson)

**Symptom:** pages rendered fine on localhost but crashed on staging with the app error boundary ("Something went wrong") — `removeChild` / `useTheme must be used within ThemeProvider` / `useAuth must be used within AuthProvider` / a raw-i18n-keys crash / duplicate `<footer>`.

**Root cause:** React 19.2.5 + `React.lazy` + Suspense reveal is broken on SLOW chunk loads — the revealed route renders detached from its context providers. It ONLY reproduces once the Suspense fallback actually paints (staging/real networks), NEVER on instant localhost. This slipped through local testing twice (the second time = the /login crash Roger caught).

**Fixes applied (cumulative):**
- `Suspense fallback={null}` (removeChild on the fallback div).
- i18n: bundle default lang **en synchronously** (`src/i18n/index.ts`) so eager pages don't race `t(returnObjects)` → `.map is not a function`.
- Marketing + legal pages → **React 19 native document metadata** (single-child `<title>`), dropped `react-helmet-async` on those (helmet's imperative head mutation compounds the React 19 head-reconciliation conflict).
- **Removed `React.lazy` ENTIRELY — every route eager-imported** (`src/App.tsx`). No route can render detached now. Heavy vendors (jspdf/html2canvas) stay dynamically imported in the PDF export handler (`ReportPage` `await import('lib/exportPdf')`), so eager routes do NOT bloat the initial load.

**Rule going forward:** after ANY routing/lazy change, **E2E-click every route on staging (slow load), not just localhost.** Localhost hides this bug.

**E2E sweep 2026-07-07 (all clean, no error boundary, console clean):** login (fresh + form submit), forgot-password, reset-password, landing, signup (waitlist), pricing, privacy, terms, imprint, for/academies, guides/building-a-shortlist, /de (German), a bad URL → 404.

**Known cosmetic/minor items (staging only, not blockers):**
- `site.webmanifest` returns 401 in the console on staging (Basic-auth strips creds from the manifest fetch). Gone on prod (no Basic-auth).
- React-19-native-metadata pages carry a duplicate `<title>` tag (React's + index.html's default). `document.title` is correct; for prod SEO, consider removing the static `<title>` from `index.html`.

---

## OPEN / TODO (nothing here is done)

1. **Merge `staging` → `master` + prod deploy** — PENDING Roger's explicit go. Carries all 14 commits (incl. the 3 other-session ones).
2. **Waitlist "see it" + "notify them"** — DEFERRED by Roger ("we will build this later"): (a) an in-app admin view / CSV export of the waitlist; (b) a "trials reopened" email broadcast (edge function via `noreply@scoutcopilot.com` SMTP). Until built, the waitlist is a passive Supabase table only.
3. **Bundle size / code-splitting** — all-eager grew the main bundle (~497KB raw ≈ ~140KB gz; heavy vendors still separate). Fine for pre-launch; revisit with a real React 19 lazy fix later (and re-E2E every route on staging if code-splitting returns).
4. **Prod SEO `<title>` cleanup** — remove the static `<title>` from `index.html` so native-metadata pages don't double up (do before/with the prod merge).
5. Repeat the footer + SEO-pages pattern on the other thin-footer products (ChannelMover/Valrano/etc.) once this is on prod.

---

## Key files & pointers

- Waitlist: `src/features/waitlist/*`, `supabase/migrations/008_waitlist.sql`, `src/types/database.ts` (waitlist type).
- Routing/eager: `src/App.tsx`. i18n sync: `src/i18n/index.ts`. Footer: `src/components/layout/PublicFooter.tsx`. SEO pages: `src/features/marketing/*`.
- Credentials (FTP, Supabase, gate, SMTP, Stripe): `docs/Credentials.txt`.
- Memories: `session_scoutcopilot_staging_env_2026_07_03`, `session_scoutcopilot_waitlist_gate_2026_07_07`, `decision_footer_standard_and_seo_pages_2026_07_02`, `reference_metanet_ftps_ci_deploy_hang_fix`.
