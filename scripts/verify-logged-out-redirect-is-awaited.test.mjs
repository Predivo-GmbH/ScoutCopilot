/**
 * Guards the fix for "the check that logged-out visitors can't reach private pages fails at random"
 * (board row `the-check-that-logged-out-visitors-can-t-reach-private-p`, commit cb4a883).
 *
 * THE DEFECT. `e2e/critical-path.spec.ts` asserted that an unauthenticated visitor is redirected off
 * a protected route by reading `page.url()` ONCE after `waitForLoadState('networkidle')`. The guard
 * is client-side — AuthGuard renders a skeleton while the Supabase session check is in flight and
 * only then does <Navigate replace> rewrite the URL — so the redirect lands AFTER networkidle and a
 * single sample raced it, losing systematically on the slower device profile. Four of the last
 * thirty runs of this gate were red on that one line (33680449318 on 2026-09-02, 32833843916 on
 * 2026-08-26), and this gate blocks deploys. Both saved snapshots showed the login form already
 * rendered: nothing was ever insecure, the test was.
 *
 * WHY A GUARD AND NOT JUST THE FIX. Reverting to a single URL read looks like a simplification and
 * reads as one in a diff. It is the bug. So does swapping the dedicated `auth-guard-loading` marker
 * back to a generic `getByRole('status')` probe — /en/settings always carries an unrelated
 * role="status" (the save-action row), so that probe would report a REAL fail-open bypass as a
 * benign "CANNOT VERIFY" environment fault. That is the inverse of what a triager must be told.
 *
 * Contract: `node scripts/verify-logged-out-redirect-is-awaited.test.mjs` -> exit 0.
 * Plain node, like scripts/verify-generate-photo-401-not-logged.test.mjs: vitest.config.ts collects
 * only src/ and lib/, so nothing here can break `npm test`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SPEC = path.join(ROOT, 'e2e', 'critical-path.spec.ts')

let failed = 0
const check = (name, fn) => {
  try {
    fn()
    console.log(`  ok  ${name}`)
  } catch (e) {
    failed = 1
    console.log(`  FAIL ${name}\n       ${e.message}`)
  }
}
const assert = (cond, msg) => { if (!cond) throw new Error(msg) }

if (!fs.existsSync(SPEC)) {
  console.error(`the critical-path spec is missing: ${SPEC}`)
  process.exit(1)
}
const spec = fs.readFileSync(SPEC, 'utf8')

// The block that loops the protected routes, from `for (const route of protectedRoutes)` to the end
// of that describe. Assertions below are scoped to it so an unrelated page.url() elsewhere in the
// file (the failure message names the final URL, and should) does not read as a regression.
const loopStart = spec.indexOf('for (const route of protectedRoutes)')
const loop = loopStart === -1 ? '' : spec.slice(loopStart, spec.indexOf('\n})', loopStart) + 3)

// The loop is heavily commented, and the comments QUOTE the defect they describe
// ("waitForLoadState('networkidle')", "page.url()"). A negative assertion read against the raw text
// would fire on the explanation of the bug rather than on the bug, so the code is read without its
// comments. Found the first time this suite was run, 2026-09-03 — the guard reported a defect that
// was only ever a sentence about the defect.
const loopCode = loop.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')

check('the redirect loop exists at all', () => {
  assert(loopStart !== -1, 'the protected-route loop is gone from critical-path.spec.ts')
  assert(loop.length > 200, `the protected-route loop is only ${loop.length} characters`)
})

check('the redirect is AWAITED, with a bound', () => {
  const m = /page\.waitForURL\(\s*(.+?)\s*,\s*\{\s*timeout:\s*([0-9_]+)/.exec(loopCode)
  assert(m, 'the loop no longer calls page.waitForURL(<pattern>, { timeout }) — a single URL read is the bug this guards')
  assert(/login/.test(m[1]) && /auth/.test(m[1]), `waitForURL no longer waits for the login/auth route: ${m[1]}`)
  const ms = Number(String(m[2]).replace(/_/g, ''))
  assert(ms >= 5000 && ms <= 60000, `the wait is bounded at ${ms}ms — outside the sane 5s..60s range`)
})

check('the loop does not decide on a single sampled URL', () => {
  assert(
    !/waitForLoadState\(\s*'networkidle'\s*\)/.test(loopCode),
    'the loop waits for networkidle again — that is what raced the client-side redirect',
  )
  assert(
    !/expect\(\s*page\.url\(\)\s*\)/.test(loopCode),
    'the loop asserts on a single page.url() sample again — the exact defect cb4a883 removed',
  )
})

check('a missing redirect is still attributed, not guessed', () => {
  assert(
    /assertGuardNeverRedirected\(/.test(loopCode),
    'the loop no longer routes a missing redirect through assertGuardNeverRedirected, so a blank app and a real bypass would read the same',
  )
  assert(
    /async function assertGuardNeverRedirected/.test(spec),
    'assertGuardNeverRedirected is gone from the spec',
  )
})

check('the attribution probes the dedicated marker, not a generic role="status"', () => {
  const fnStart = spec.indexOf('async function assertGuardNeverRedirected')
  const fn = spec.slice(fnStart, spec.indexOf('\n}', fnStart))
  assert(
    /getByTestId\(\s*'auth-guard-loading'\s*\)/.test(fn),
    "the attribution no longer probes data-testid=auth-guard-loading",
  )
  assert(
    !/getByRole\(\s*'status'\s*\)/.test(fn),
    'the attribution probes getByRole("status") again — /en/settings always carries an unrelated one, so a real fail-open bypass would be muffled as "CANNOT VERIFY"',
  )
  assert(
    /empty #root|children\.length \?\? 0\) === 0/.test(fn),
    'the attribution no longer distinguishes "the app never mounted" from a real bypass',
  )
})

check('the marker the attribution depends on still exists in the app', () => {
  const guard = path.join(ROOT, 'src', 'features', 'auth', 'AuthGuard.tsx')
  assert(fs.existsSync(guard), `AuthGuard.tsx not found at ${guard}`)
  const src = fs.readFileSync(guard, 'utf8')
  assert(
    /data-testid=["']auth-guard-loading["']/.test(src),
    'AuthGuard no longer renders data-testid="auth-guard-loading", so the attribution above can never see it',
  )
})

console.log(
  failed
    ? '\nthe logged-out-visitor gate can race the redirect again.'
    : '\n6 checks passed — the redirect is awaited, bounded, and a missing one is attributed rather than guessed.',
)
process.exit(failed)
