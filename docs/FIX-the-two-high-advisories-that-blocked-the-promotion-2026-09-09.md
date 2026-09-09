# The two HIGH advisories that stood between ScoutCopilot and production

**2026-09-09 · ScoutCopilot · from work-board row `monitor-scoutcopilot-ff4b4a1c`**

## What was wrong

The promotion of `41ef509` failed — run **34348717024**, `workflow_dispatch`, 2026-09-09T12:02Z —
in `gate-security`, on `npm audit --audit-level=high`. Re-running `confirm=deploy` would have
failed again, for the same reason, however many times it was tried.

Audited from `origin/master`'s own manifests this session, not from the run log:

```
{"info":0,"low":0,"moderate":3,"high":2,"critical":0,"total":5}
  HIGH: js-yaml   fixAvailable: true
  HIGH: sharp     fixAvailable: true
```

## What changed

`npm audit fix --package-lock-only`. **`package.json` is untouched** — `sharp` was already declared
as `^0.35.3`, which admits the patched release, so nothing about what this app depends on has
changed. Only the resolved versions moved, and only by a patch:

| package | from | to |
| --- | --- | --- |
| `sharp` (and its 20-odd `@img/sharp-*` platform binaries) | 0.35.3 | 0.35.4 |
| `@img/sharp-libvips-*` | 1.3.2 | 1.3.3 |
| `js-yaml` | 4.3.1 | 4.3.2 |

Re-audited afterwards against the same gate's threshold:

```
{"info":0,"low":0,"moderate":3,"high":0,"critical":0,"total":3}
```

`gate-security` runs at `--audit-level=high`, so the three moderates were deliberately left alone:
they are in the `vitest` / `@vitest/coverage-v8` dev chain, they do not block the gate, and taking
them would mean a major-version move in the test tooling of a customer-facing app on the same day
as a release. That is a separate decision, not a hitchhiker on this one.

## What is still Roger's

Everything above is a dependency patch. The **promotion itself** is not: ScoutCopilot is
customer-facing, so pushing it to production is his call, and the row asks him for it with the
choices and a recommendation. Nothing here promotes anything.

Once he says yes, the promotion is `gh workflow run deploy.yml -R Predivo-GmbH/ScoutCopilot -f confirm=deploy`
on the head of `master` **after** this lockfile change — not on `41ef509`, which still carries the
two advisories and would fail the gate exactly as before.
