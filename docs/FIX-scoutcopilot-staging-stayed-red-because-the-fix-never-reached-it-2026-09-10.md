# FIX — ScoutCopilot's staging light stayed red because the fix was never pushed to staging

**Date:** 2026-09-10 · **Session:** 20d80e20 · **Raised by:** Roger, from the Cockpit deploy page

Roger: *"scoutcopilot failed again, and you don't do anything about it."* He was right, and the
reason he kept being told it was fixed is written down here so it cannot be told to him again.

---

## 1. The red he was looking at

Cockpit → Deploy Status showed **ScoutCopilot: last staging deploy failed, check the log.**

That red came from run
[34386899296](https://github.com/Predivo-GmbH/ScoutCopilot/actions/runs/34386899296),
2026-09-09 18:05Z, dead in 17 seconds at `npm ci`:

```
npm error `npm ci` can only install packages when your package.json and package-lock.json
npm error are in sync.
npm error Missing: @emnapi/core@1.11.3 from lock file
npm error Missing: @emnapi/wasi-threads@1.2.3 from lock file
```

That is the Windows-pruned optional-dependency subtree: a lockfile edited on Windows drops the
`wasm32` branch of `sharp`'s dependency tree, and every Linux install then refuses.

## 2. Why "it's fixed" was true and useless at the same time

The lockfile **was** fixed. Commit `f22e8b7` *"Regenerate package-lock on Linux (cross-platform
optional deps)"* landed on `master` on 2026-09-09 at 20:03Z — two hours after the red.

But **`master` is not what deploys staging.** The `Deploy to Staging` workflow triggers on push
to the `staging` branch. Nobody moved `staging`. Measured this turn:

```
git rev-list --left-right --count origin/staging...origin/master  ->  0   9
```

`staging` sat 9 commits behind, still pointing at `8b2eda1`, and the newest run on record for
that branch was the failed one. So the Cockpit went on showing 2026-09-09's failure for a full
day while the repair sat on another branch.

Proved rather than assumed — `npm ci --dry-run` run under WSL Ubuntu (Linux, node 22.23.2,
npm 10.9.8) against three refs:

| ref | `npm ci` | meaning |
|---|---|---|
| `99222ad` (what was pushed to staging, 2026-09-09) | **exit 1**, `EUSAGE`, lock out of sync | this is the red |
| `origin/master` (`f22e8b7`) | **exit 0**, 501 packages | the fix is real |
| `origin/staging` (`8b2eda1`) | exit 0 | fine, but 9 commits of stale code |

**This is the third recorded instance of the same shape** — see
`feedback_on_main_is_not_in_effect_2026_09_09.md` and
`feedback_a_fix_in_an_unmerged_pr_is_not_a_fix_2026_09_06.md`. Landing a fix and reporting a fix
are different acts. The light does not go green until the fix reaches the branch the light reads.

**Repair:** `git push origin origin/master:refs/heads/staging` (fast-forward, `8b2eda1..f22e8b7`).
Deploy to Staging run
[34525690176](https://github.com/Predivo-GmbH/ScoutCopilot/actions/runs/34525690176) —
**success, 4m48s.**

## 3. The alarm that should have caught it was itself dead

`.github/workflows/waiting-to-land.yml` — *"Nothing may sit ready to land"* — exists precisely to
shout when a finished fix is not landing. It has failed **every scheduled run** since it was
added, three times a day:

```
Error: Cannot find module
'/opt/gh-runners/ScoutCopilot/_work/ScoutCopilot/ScoutCopilot/node_modules/@predivo-gmbh/gate-kit/scripts/verify-nothing-waits-to-land.mjs'
```

Cause: **ScoutCopilot's `package.json` has no `@predivo-gmbh/gate-kit` dependency at all.**
`git show origin/master:package.json | grep -i predivo` → nothing. The workflow that runs the
check landed; the dependency it runs never did. The first install has to come from CI, because
the read-packages token lives there — that is what `bump-gate-kit.yml` is for, and its only
previous run (`34387419170`, 2026-09-09) died on `npm error 401 Unauthorized … authentication
token not provided`. `PACKAGES_READ_TOKEN` was added to the repository 11 minutes later — **and
it was added empty**, which nothing noticed for a day because with no `@predivo-gmbh` dependency
npm never reached the private registry to be refused. Re-dispatched this turn at `0.5.1` (the
version signalscore and ChannelMover pin); it is still blocked, see §5.

Verified this turn that `0.5.1` actually ships the script the workflow calls:
`gate-kit/package.json` `files: ["eslint","crawl","conformance","templates","scripts"]`, and
`scripts/verify-nothing-waits-to-land.mjs` is present in that folder.

## 4. And the third red: a guard that could never run

`Critical Path Tests` has been red on `master` since the guard step was added, on this:

```
not ok 12 - a run of that workflow has concluded success since the leak was recorded
  error: 'could not ask GitHub for runs of rotate-database-password.yml: spawnSync gh ENOENT'
```

`scripts/production-db-password-was-rotated.test.mjs` shelled out to the `gh` CLI. **Our
self-hosted runner has no `gh`.** So the suite could not attempt its assertion — which looks
identical to a suite that checked and found nothing.

Rewritten to ask the REST API over `fetch` (no binary), with `GITHUB_TOKEN: ${{ github.token }}`
on the guard step and `actions: read` on the workflow. It still falls back to `gh auth token` on
a laptop so it stays runnable by hand.

**The negative control in that file was fiction, and is now corrected.** It claimed
`ROTATION_WORKFLOW=keep-alive.yml` proved it red. Re-run on 2026-09-10: it **passes** — keep-alive
is scheduled daily and has green runs on 09-09 and 09-10, so it satisfies the assertion exactly
the way the real rotation workflow does. Controls that do work, both re-run this turn against the
live API:

- `ROTATION_WORKFLOW=security-review.yml` → `fail 1`, *"no successful run … since the leak"*
  (last green 2026-08-28, before `LEAKED_AT`)
- `ROTATION_WORKFLOW=does-not-exist.yml` → `fail 1`, *"GitHub answered 404"*
- unchanged: `fail 0` against the real `rotate-database-password.yml`, proved by run
  `34395892458` (2026-09-09T19:34:46Z)

---

## What actually changed

| # | Change | Proof |
|---|---|---|
| 1 | `staging` fast-forwarded to `master` (`8b2eda1..f22e8b7`) | Deploy to Staging run 34525690176 — success |
| 2 | `@predivo-gmbh/gate-kit@0.5.1` installed, after granting the package Actions read access to this repo | run 34530237420 — success; commit `6f4c6e5` |
| 3 | rotation guard no longer needs the `gh` binary | `node --test` → pass 2 / fail 0; two controls go red |
| 4 | `test.yml`: `actions: read` + `GITHUB_TOKEN` on the guard step | `js-yaml` parse check, this turn |
| 5 | false red-proof note corrected in the test file | re-run shows keep-alive passes |
| 6 | all three workflows fall back to `secrets.GITHUB_TOKEN` when `PACKAGES_READ_TOKEN` is empty | 401 became 403 on the next dispatch |
| 7 | the land guard now fails with the fix instructions, not `MODULE_NOT_FOUND` | preflight step in `waiting-to-land.yml` |
| 8 | `deploy.yml` / `deploy-staging.yml` / `regen-lock.yml` saved from the 401 the gate-kit install would have caused | production run 34532199547 on `fb7055b` — success |
| 9 | `staging` now follows `master` automatically, deploy included | run 34530950129 → staging deploy 34531126572 — both success |

---

## 5. The package grant, done — and the trap it set for production

`Bump gate-kit` failed twice: `401 authentication token not provided` (empty secret), then
`403 permission_denied: read_package` once the `GITHUB_TOKEN` fallback landed. 401 → 403 meant the
token was real and the **package** was refusing. Granted directly in the GitHub UI: org packages →
`gate-kit` → *Manage Actions access* → added `Predivo-GmbH/ScoutCopilot` with **Read**. The page now
reads *2 repositories* (gate-kit Admin, ScoutCopilot Read) and confirmed *"Permissions added for
selected repositories."*

Install then succeeded — run `34530237420`, commit `6f4c6e5` *"chore(deps): gate-kit 0.5.1"*. And
the land guard ran its real check for the first time in its life (run `34530498237`):

```
gate-kit 0.5.1 is installed
open pull requests : 0
OK    nothing is sitting ready to land and unmerged.
```

**That install set a trap, and it was caught before it fired.** With `@predivo-gmbh/gate-kit` now in
`package.json`, *every* `npm ci` in this repo reaches the private registry — including
`deploy.yml` (**production**), `deploy-staging.yml` and `regen-lock.yml`, all three of which still
pointed at the empty `PACKAGES_READ_TOKEN`. The next production deploy would have died on 401. All
three now carry the same fallback; `regen-lock.yml`, which pins its permissions explicitly, also
gained `packages: read`, because an explicit block zeroes every scope it does not name.

Proved on the real thing rather than argued: **Deploy to Production run `34532199547` on
`fb7055b`** — the exact commit carrying the new lockfile — **success**.

## 6. The permanent fix: `staging` follows `master` by itself

Every repair of this bug so far was a person remembering to push a branch. Memory is the component
that failed, four times in five days, so it has been removed from the loop.

`.github/workflows/staging-follows-master.yml` fast-forwards `staging` to `master` on every push to
`master`. It refuses rather than force-pushes if `staging` ever holds a commit `master` does not
(that means someone pushed straight to staging, and overwriting it is how work vanishes). It moves
the branch for documentation-only ranges but skips the deploy, mirroring `deploy-staging.yml`'s own
`paths-ignore` — which a `workflow_dispatch` does not honour.

**It also dispatches the deploy explicitly, and that detail is the whole difference between a fix
and a decoration.** A push made with a workflow's own `GITHUB_TOKEN` does not trigger further
workflow runs — GitHub suppresses that to stop loops. Fast-forwarding `staging` from CI therefore
moves the branch and starts *nothing*: the deploy page would go on showing the same stale run while
this job reported green. That is the original bug wearing a different hat, and it would have been
shipped as the cure. The deploy is now asked for over the API, and the job fails if that call is
refused.

First live run, `34530950129`, unattended end to end:

```
staging is 2 behind and 0 ahead of master
staging fast-forwarded 388dffb -> fb7055b (2 commit(s))
staging deploy requested
```

→ Deploy to Staging run `34531126572` — **success**. `master` and `staging` both at `fb7055b`.

---

## Final state — every workflow's newest run

Grouped by workflow id (which is what the deploy page reads), 2026-09-10:

| workflow | newest run |
|---|---|
| Deploy to Production | ✅ |
| Deploy to Staging | ✅ |
| Critical Path Tests | ✅ |
| Nothing may sit ready to land | ✅ |
| Staging follows master | ✅ |
| Bump gate-kit | ✅ |
| Secret Scan (gitleaks) | ✅ |
| Keep Supabase Alive | ✅ |
| Rotate the production database password | ✅ |
| Regenerate package-lock on Linux | ✅ |

Nothing red. The three failed rotation runs from 2026-09-09 19:23–19:29 belong to the same workflow
as the 19:34 success and are superseded by it — they are earlier attempts within one rotation, not a
standing fault.

**One thing this session could not do:** open a work-board row. `work_open` refused three times —
8 batches in flight against a ceiling of 3, and freeing a slot means parking a whole batch belonging
to other sessions. Priority `critical` bypasses the ceiling and was not used, because that flag
means a customer or a release is affected right now and this was neither by then. The work is
recorded here instead.
