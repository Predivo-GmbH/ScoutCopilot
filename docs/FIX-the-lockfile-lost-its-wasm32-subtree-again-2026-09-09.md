# The lockfile lost its wasm32 subtree again, and every Linux `npm ci` went red

**2026-09-09 · ScoutCopilot · from work-board row `monitor-scoutcopilot-ff4b4a1c`**

## What was wrong

Commit `99222ad` correctly cleared the two HIGH advisories that were failing gate-security
(sharp 0.35.3→0.35.4, js-yaml 4.3.1→4.3.2 — see
`docs/FIX-the-two-high-advisories-that-blocked-the-promotion-2026-09-09.md`). But it was produced
with `npm audit fix --package-lock-only` **on Windows**, and that mode silently dropped part of
the wasm32 optional subtree: `@tailwindcss/oxide-wasm32-wasi` still declared
`@emnapi/core@^1.11.1` and `@emnapi/wasi-threads@^1.2.2`, yet the lockfile held no entry for
`@emnapi/core` at all.

Every Linux `npm ci` then failed in seconds with:

```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and package-lock.json are in sync.
npm error Missing: @emnapi/core@1.11.3 from lock file
npm error Missing: @emnapi/wasi-threads@1.2.3 from lock file
```

Measured on the live runs, all at the install step, nothing else reached:

- Critical Path Tests on `a6e4bf4` — run **34387288962**, failed in 12s at `Run npm ci`
- Deploy to Staging on `99222ad` — run **34386899296**, failed at `Install deps`
- Regenerate package-lock on Linux — run **34387060702**, npm itself crashed
  (`Cannot read properties of null (reading 'edgesOut')`) trying to reify the broken lock

So the advisory fix that was supposed to unblock the promotion had left the tree unable to build
anywhere but Windows. This is the third time this exact shape has bitten this repo — commits
`8154c3b` and `3600c2a` are the previous two — so this time it gets a guard.

## What changed

- `package-lock.json` regenerated with `npm install --package-lock-only` (npm 11.9.0).
  `package.json` untouched, `sharp` stays at the patched 0.35.4; the only delta is the
  restored wasm32/`@emnapi` entries (56 lines, +30/−26).
- New guard suite `scripts/lockfile-resolves-every-declared-dependency.test.mjs`:
  1. every `package.json` dependency has a lock entry;
  2. **every dependency declared by every lock entry resolves inside the lockfile** — the exact
     invariant `npm ci` checks first, verified platform-independently so it fails on any machine,
     not only on the Linux runner;
  3. the specific wasm32/`@emnapi` entries that keep disappearing are named and required;
  4. `sharp >= 0.35.4` and `js-yaml >= 4.3.2`, so a future regeneration cannot slide either
     back below the gate-security patch floor.

## Proof

- Fixed lockfile: 4 pass, 0 fail.
- Proven red: checked out `origin/master`'s broken lockfile, re-ran the suite — exactly the two
  resolution/wasm32 checks fail, the other two pass. Restored the fixed lockfile afterwards.
- `npm ci --dry-run` passes the sync check; `npm audit --audit-level=high` reports **0 high**
  (the 3 remaining moderates are the vitest dev chain, below the gate threshold, unchanged).

## What is still NOT done, and whose it is

- **This commit is local only.** Pushing is outside the worker boundary, so the fix lands when
  somebody pushes this branch and merges it to `master`. Until then every Linux CI job on
  `master` keeps failing at the install step.
- **The promotion itself remains Roger's gate** (customer-facing product). Once the lockfile fix
  is on `master` and staging is green, promote the head of `master` — never `41ef509`, which
  still carries both advisories — with
  `gh workflow run deploy.yml -R Predivo-GmbH/ScoutCopilot -f confirm=deploy`.
