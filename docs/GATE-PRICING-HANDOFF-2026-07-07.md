# ScoutCopilot — Gate removal + Pricing restore HANDOFF (2026-07-07)

> Two related changes made this session. Read alongside `STAGING_STATUS_AND_HANDOFF.md`.

## ✅ DONE + DEPLOYED — private-beta gate removed (scoutcopilot.com is public)
- The access-code `PasswordGate` wrapped the whole app on `master` (blocked all public access). Removed the wrapper (import + 2 tags) in `src/App.tsx`. `PasswordGate.tsx` left in place (unused) for easy re-add.
- Commit `858532c` "Remove private-beta password gate — publicly open scoutcopilot.com". Build/lint/336 tests passed. Deployed via GitHub Actions → success. **Verified live: scoutcopilot.com/en shows the real landing, no gate.**

## ✅ DONE + DEPLOYED (via the staging→master merge that happened this session) — trial-waitlist pattern LIVE
- `staging` was merged into `master` (master `011b8b8` "Fix stale unit tests after the gate->waitlist merge") and deployed to prod. So the staging overhaul (waitlist model + footer/SEO + React-19 all-eager fixes) is now LIVE on scoutcopilot.com.
- **"Free trials are paused" pattern is live**: `src/features/waitlist/config.ts` → `REGISTRATIONS_OPEN = false`. All sign-up / free-trial CTAs (nav Get Started, landing, pricing tiers, marketing "Start free trial") open an email-waitlist modal titled "Free trials are paused" instead of `/signup` or Stripe checkout. Emails captured to Supabase `waitlist` table. Existing users can still log in. REOPEN = flip the flag (+ re-point CTAs) or `git revert d564efc`.
- ⭐ This is the reusable "can't start a free trial" pattern Roger may want on OTHER products.

## 🔨 PENDING — pricing restore (uncommitted, verified locally, NOT deployed)
Roger asked to "add the pricing from previously" — the pricing page was showing X/Y/Z placeholders (commit `7553d1a` "Replace real pricing with placeholders" had swapped out the real numbers, 2026-03-26). Restored the exact previous prices.
- **4 files changed (uncommitted on `master`):** `src/lib/stripe.ts` (TIER_PRICES + TIER_ANNUAL_TOTAL), `src/i18n/en.json`, `src/i18n/de.json`, `src/features/landing/LandingPage.tsx`.
- **Restored prices** (kept string type → no type ripple, identical display):

  | Tier | Monthly | Annual/mo | Annual total |
  |---|---|---|---|
  | Scout | $149 | $129 | $1548/yr |
  | Pro | $299 | $249 | $2988/yr |
  | Club | $599 | $499 | $5988/yr |
- **Judgment call to confirm:** the ROI headline "ScoutCopilot starts at $X/month" → set to **$149** (Scout monthly entry). Old copy said "$249" but phrasing changed to "starts at". EN + DE both updated (DE format "149 $"). Confirm the number.
- Build ✓, lint 0 errors, i18n + pricing tests (9) pass. Verified rendering on dev (localhost:5233/en/pricing): Annual shows $129/$249/$499 + $1548/$2988/$5988 totals; Monthly shows $149/$299/$599.

### OPEN QUESTIONS FOR ROGER (blocking the pricing deploy)
1. **Deploy the restored pricing to scoutcopilot.com now?** (outward-facing live pricing → confirm before push). Deploy = commit the 4 files + push `master` (auto-deploys via Actions) + monitor + verify.
2. **Is $149 correct for the "starts at" ROI line?** (or $129 annual / keep $249 / other)
3. **"replicate this pattern there as well"** — the trial-waitlist is already live on ScoutCopilot prod; did Roger mean that (done), or apply the same "can't start a free trial" pattern to a DIFFERENT project? If another project: replicate the `src/features/waitlist/` pattern (config flag + CTA rewiring + Supabase waitlist table) — see this repo as the reference.

## NOTES
- I stashed 2 staging doc edits (`DESIGN_BRIEF.md`, `ONE_PERSON_AI_BUSINESS_WORKFLOW.md`) as `stash@{0}` during the master switch — restore with `git checkout staging && git stash pop` if wanted.
- Deploy = FTP (lftp) to Metanet `/httpdocs/`, `master` push triggers `.github/workflows/deploy.yml`. Verify loop: build + lint + test + visual.
