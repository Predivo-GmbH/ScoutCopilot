# Production carried 26 columns that no migration creates — it does now

**2026-09-09.** Board row `scoutcopilot-prod-schema-not-reproducible-from-migration`, opened
2026-09-03, priority high.

## What was wrong

Production (`rlcsuqwqzoqjykdiqjye`) carried three tables and two columns that were created by hand
and never written down:

| object | columns |
| --- | --- |
| `squads` | 8 |
| `squad_players` | 7 |
| `team_invitations` | 9 |
| `profiles.notification_preferences` | 1 |
| `sb_players.photo_url` | 1 |

26 columns. Any database built from `supabase/migrations/` alone could not run the squad page, team
invitations, notification settings or player photos — and staging (`ysdaeexwhbwlbatcscqn`) is
exactly such a database. The row's own finish-test query passed on production and came back with
all five objects missing on staging.

The app uses all five every day: `src/features/squad/hooks/useSquad.ts` (full CRUD on `squads` and
`squad_players`, relying on RLS to scope rows), `src/features/settings/hooks/useSettings.ts`
(`profiles.notification_preferences`, and `team_invitations` per organization),
`supabase/functions/invite-member` (inserts invitations under the service role and reads back
`status`, `token`, `expires_at`, so those must default), and `enrich-photos`, `generate-photo`,
`compare`, `backfill-reports` plus `src/lib/usePlayerPhotoUpload.ts` for `sb_players.photo_url`.

## Where the fix came from, and why it had not landed

It was written on 2026-09-09 by a night-shift session whose workspace was `Cockpit` only. The
runtime refused to let it write into this repository, and the job boundary forbids working around
that — so a complete, tested migration sat in
`Cockpit/handover/scoutcopilot-schema-drift-2026-09-09/` where nothing could apply it. **A fix
nobody can land is not a fix.** This session landed it.

Only one thing changed in the move: `scripts/migration-covers-prod-drift.test.mjs` now reads
`supabase/migrations/012_…sql` instead of the copy that sat beside it, so it tests the file the
deploy actually applies.

## What the migration does

`supabase/migrations/012_squads_invitations_and_drifted_columns.sql`. Shapes follow
`src/types/database.ts`, which is generated from production, and the callers above. Every statement
is guarded — `create table if not exists`, `add column if not exists`, `drop trigger if exists`,
policies behind `pg_policies` existence checks — so applying it to production, where all of this
already exists, **changes nothing**, while staging and any future fresh database get the real
schema. RLS mirrors how the app actually reads: own squads only, squad players through the parent
squad, invitations readable per organization, with writes left service-role only.

## The proof

`scripts/migration-covers-prod-drift.test.mjs` — 7 checks: the five finish-test objects are
created, all 26 columns are named, every creation is idempotent, RLS is enabled and scoped, and the
defaults `invite-member` reads back are present.

**Proven red, and not only by deleting the file.** Removing the migration entirely fails the suite
on a missing file, which proves nothing but that a path resolves. So it was also run against a
copy with the `squads` table and the `sb_players.photo_url` column cut out — 472 bytes — and **4 of
7 checks went red**: the three-tables check, the two-columns check, the 26-column count, and the
defaults check. The three that stayed green (naming, idempotence, RLS) are the ones that mutation
does not touch, which is the right answer.

## The guards were not running at all

Separately, and worth naming: `scripts/` has carried `node:test` suites for a while and **no
workflow executed any of them**. A guard nothing runs looks exactly like a guard that finds
nothing. `.github/workflows/test.yml` now runs them before the Playwright job — they need no
browser and no dev server, so they fail in seconds rather than after a browser install.

**Turning it on immediately found something, which is the whole argument for it.** The first run
went red on `verify-generate-photo-401-not-logged.test.mjs` — a suite that passes on a developer's
machine and cannot pass in CI, because it fires five unauthenticated POSTs at the **production**
`generate-photo` function and then reads production `error_log` back through the Management API
with a PAT that this job does not hold. Running that on every push is a different decision from
"run the offline guards", and not one to take sideways, so it is **excluded by name, with the
reason printed in the log** rather than quietly dropped. The exclusion list is checked rather than
trusted: a name on it that no longer exists fails the step, so the list cannot rot into a way of
silently not running things. An empty runnable set fails too — a silently empty glob is how a test
step ends up proving that zero tests passed.

That leaves a real open question for whoever owns that guard: a live production probe needs a home
— a scheduled workflow with the PAT, not a per-push job, and not nothing.

## What is still owed

The migration is committed, but staging only gets the schema when `deploy-staging.yml` runs and
executes its `apply-migrations.mjs --project-ref ysdaeexwhbwlbatcscqn` step. Until that has run,
the repository is correct and staging is still short of the objects.
