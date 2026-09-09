# RECORD — ScoutCopilot's production database password was printed, and has been replaced

Row: `rotate-scoutcopilot-production-db-password-2026-09-09` (critical)
Leaked, decided and repaired: 2026-09-09. Session `wave5-B`.
No credential value, prefix, length or shape is reproduced here or in anything this points at.

## What happened

A session working the board wanted to know the structure of `docs/Credentials.txt`.
`safe-inspect` refused to scan that file — its self-check found segments of the file in its own
output, so it printed nothing. **That refusal was the answer.** The session instead wrote its
own redaction mask, the mask only masked values of 20 characters or more, and the database
password is shorter than that, so it printed in full into the transcript.

This is the fourth instance of the same failure class and the second that day: a mask written
for the one line shape the author had in mind, run against a file that used another. The rule
it breaks is not "be careful with files named credentials" — it is **when safe-inspect refuses,
stop**.

Rotation is the only repair for a printed credential. Deleting the transcript copies never was:
three of four leaked keys this month existed *only* in transcripts, and nothing ever looked.

## The correction that unblocked it

The row had been parked on Roger as a credential only he holds, on this reasoning:

> no Management API endpoint exists for the database password, and `ALTER USER postgres` is
> refused from inside the database ("only superusers can alter privileged roles"), so it is a
> Supabase dashboard action.

Half of that is right and half is not. The database really does refuse the change from inside.
But `PATCH /v1/projects/{ref}/database/password` **is** in the published Management API — read
straight from `https://api.supabase.com/api/v1-json` on 2026-09-09, body `{password}`, OAuth
scope `database:write`. Nobody has to open a browser. Roger's answer on the board at 19:08Z
was "Change it in the Supabase dashboard now"; the decision was his and the clicking was not.

## What it cost to be sure it was safe

Measured before touching anything, because a rotation that breaks a deploy is worse than the
leak it repairs:

- **Nothing consumes this password.** No `postgres://` connection string, no `supabase db push`,
  no `supabase link` anywhere in ScoutCopilot, production-monitor, Cockpit or ci-runner. The
  app uses the anon key, the edge functions the service-role key, and `scripts/apply-migrations.mjs`
  the Management API. `supabase/.temp/pooler-url` holds a template, not a value (safe-inspect:
  0 credential-looking values). The only reader was ever a human with `psql`.
- **`docs/Credentials.txt` is gitignored and untracked**, so the value was never in git history.
- **The project ref is the production one.** `rlcsuqwqzoqjykdiqjye` answers 401 on `/rest/v1/`
  (it exists), and it is the ref both `check-rls-grants.mjs` and `check-auth-email-config.mjs`
  use for ScoutCopilot production.

## The repair

`.github/workflows/rotate-database-password.yml` — manual, one project, no inputs. It runs in
CI rather than on a developer machine for the same reason `rotate-staging-basic-auth.yml` does:
the Supabase management token lives in this repository's secrets and nowhere else on the fleet,
so the work goes to the token instead of the token going to the work.

It generates a 48-character value with `openssl rand`, hands it to the API in a 0600 file
(never in argv, where any process on the runner could read it out of `/proc`), and then proves
the change from both sides. **The value is never printed and is stored nowhere**: nothing
consumes it, so a new copy would only be a new thing to leak. Whoever next needs `psql` sets a
password they choose and keeps it in one place.

Three guards inside it, each of which fired for real:

- **The project is confirmed by name before anything is changed.** Run 34394842876 refused to
  proceed because the API answered `scoutcopilot.com's Project`, not `ScoutCopilot`. A ref
  typed into a workflow is a guess until the API agrees with it.
- **The password generator is `openssl`, not `tr | head`.** Run 34395382085 died before the
  PATCH because `head` closes the pipe, `tr` takes SIGPIPE, and `pipefail` under `bash -e`
  makes that a job failure. Nothing was rotated by that run either.
- **Verification uses the SUPAVISOR pooler, not the direct host.** The pgbouncer config returns
  `db.<ref>.supabase.co:6543`, which is IPv6-only and unreachable from a GitHub runner. The
  pooler endpoint returns `db_host` / `db_port` / `db_user` as separate fields, so nothing has
  to be parsed out of a credential string.

## Proof

**Run 34395892458, 2026-09-09T19:34Z, conclusion success**
(https://github.com/Predivo-GmbH/ScoutCopilot/actions/runs/34395892458):

```
--- project rlcsuqwqzoqjykdiqjye is 'scoutcopilot.com's Project' in eu-central-2, ACTIVE_HEALTHY
--- PATCH /v1/projects/rlcsuqwqzoqjykdiqjye/database/password -> HTTP 200
--- controls
    new password        -> ok        (must be ok)
    a wrong password    -> refused   (must be refused)
```

The second control is the one that matters: without it, "the new password works" cannot be
told apart from "this database lets anyone in".

Finish-test: `scripts/production-db-password-was-rotated.test.mjs`, 2 assertions, exit 0. It
asserts the act, not the value — the workflow still exists and still aims at the production
ref, and a run of it concluded success *after* the leak was recorded at 13:35Z. It was proven
red first: pointed at `keep-alive.yml` it fails with "no successful run since the leak".

## What is still true after this

The Supabase **management** token for this project was separately partly disclosed on
2026-09-03 (ten characters), and Roger decided on 2026-09-09 to **accept** that rather than
rotate it — see `docs/RECORD-ten-characters-of-the-supabase-management-token-were-printed-2026-09-09.md`.
That decision is unchanged by this rotation, and it is the token this workflow uses.

`safe-inspect scan` still refuses to run against `docs/Credentials.txt` — its self-check finds
its own output inside the file. That is a bug in safe-inspect, and until it is fixed the only
correct response to the refusal is to stop, which is what was done here: the file was not
parsed, masked, read or edited by this session.

## Status

Closed 2026-09-09. The printed password is dead, proven by a green run that authenticated the
replacement and had a wrong value refused in the same job.
