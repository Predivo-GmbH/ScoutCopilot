/**
 * THE PRODUCTION DATABASE PASSWORD THAT WAS PRINTED INTO A TRANSCRIPT HAS BEEN REPLACED.
 *
 * Board row `rotate-scoutcopilot-production-db-password-2026-09-09` (critical). On 2026-09-09
 * a session wrote its own redaction mask because `safe-inspect` refused to scan
 * `docs/Credentials.txt`; the mask only masked values of 20 characters or more and the
 * password was shorter, so it printed in full. Rotation is the only repair.
 *
 * WHAT THIS ASSERTS, AND WHY IT IS SHAPED LIKE THIS. The honest proof would be "the old
 * password no longer authenticates" — and that is unwritable, because holding the old value
 * to try it is the leak again, and holding the new one would be a second copy of a credential
 * that deliberately has none. What can be checked without touching either value is the ACT:
 *
 *   1. `.github/workflows/rotate-database-password.yml` exists, parses, and still points at
 *      the production project ref — so the rotation is repeatable by anyone, not folklore.
 *   2. That workflow has a run on GitHub that concluded SUCCESS. Its own job only reports
 *      success after the Management API answered 200 to the password change AND the new value
 *      authenticated against the pooler AND a deliberately wrong value was refused. So a green
 *      run is a three-part proof that the password changed, not merely that a job ran.
 *   3. That run started after the leak was recorded (2026-09-09T13:35Z), so an older run
 *      cannot be mistaken for this repair.
 *
 * PROVEN RED BEFORE IT WAS TRUSTED GREEN, and the first attempt at that proof was wrong.
 * This file used to claim `ROTATION_WORKFLOW=keep-alive.yml` made it exit 1. Re-run on
 * 2026-09-10: it PASSES. Keep-alive is scheduled daily and has green runs on 09-09 and 09-10,
 * so it satisfies assertion 2 exactly the way the rotation workflow does. A negative control
 * has to be a workflow that has succeeded but NOT since the leak:
 *
 *   ROTATION_WORKFLOW=security-review.yml  -> fail 1, "no successful run ... since the leak"
 *                                             (last green 2026-08-28, before LEAKED_AT)
 *   ROTATION_WORKFLOW=does-not-exist.yml   -> fail 1, "GitHub answered 404"
 *
 * Both re-run on 2026-09-10 against the live API. Any workflow with recent green runs is
 * NOT a control here, and reading one as a control is how a guard gets believed for nothing.
 *
 * WHY THIS ASKS THE REST API AND NOT THE `gh` CLI (2026-09-10). It used to shell out to
 * `gh run list`. Our self-hosted runner has no `gh` on its PATH, so from the moment this suite
 * was first executed in CI the test failed with `spawnSync gh ENOENT` — assertion 2 could not
 * even be attempted, and Critical Path Tests has been red on master ever since. A guard that
 * cannot run is indistinguishable from a guard that found nothing, which is the exact defect
 * the guard step was added to remove. The REST call needs no binary: CI passes GITHUB_TOKEN,
 * and on a laptop it falls back to `gh auth token` so it stays runnable by hand.
 *
 * Run:  node --test scripts/production-db-password-was-rotated.test.mjs
 */
import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const REPO = 'Predivo-GmbH/ScoutCopilot'
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const WORKFLOW = process.env.ROTATION_WORKFLOW || 'rotate-database-password.yml'
/** The moment the leak was recorded on the board. A run older than this is a different event. */
const LEAKED_AT = Date.parse('2026-09-09T13:35:59Z')
const PROJECT_REF = 'rlcsuqwqzoqjykdiqjye'

/**
 * The workflow runs, asked over HTTPS. No `gh` binary: the self-hosted runner has none.
 * Token order: what CI hands every job, then the two names a shell exports, then — only on a
 * developer machine — `gh auth token`. Unauthenticated is not attempted: this repository is
 * private, so a tokenless call 404s and would read as "no rotation ever happened".
 */
async function listRuns(workflow) {
  const token = ghToken()
  if (!token) throw new Error('no GitHub token: set GITHUB_TOKEN, or run `gh auth login` locally')
  const url = `https://api.github.com/repos/${REPO}/actions/workflows/${workflow}/runs?per_page=10`
  const res = await fetch(url, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: 'application/vnd.github+json',
      'x-github-api-version': '2022-11-28',
      'user-agent': 'scoutcopilot-rotation-guard',
    },
  })
  if (!res.ok) throw new Error(`GitHub answered ${res.status} ${res.statusText} for ${url}`)
  const body = await res.json()
  return (body.workflow_runs || []).map((r) => ({
    databaseId: r.id,
    conclusion: r.conclusion,
    status: r.status,
    createdAt: r.created_at,
    url: r.html_url,
  }))
}

function ghToken() {
  const fromEnv = process.env.GITHUB_TOKEN || process.env.GH_TOKEN
  if (fromEnv) return fromEnv
  try {
    return execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim() || null
  } catch {
    return null
  }
}

test('the rotation is a workflow anyone can re-run, aimed at the production project', () => {
  const p = join(ROOT, '.github', 'workflows', 'rotate-database-password.yml')
  assert.ok(existsSync(p), 'the rotation workflow is gone; the repair is not repeatable')
  const doc = yaml.load(readFileSync(p, 'utf8'))
  const env = doc.jobs.rotate.steps[0].env
  assert.equal(env.PROJECT_REF, PROJECT_REF, 'the workflow no longer points at the production project')
  assert.ok('workflow_dispatch' in doc.on, 'the workflow can no longer be dispatched by hand')
})

test('a run of that workflow has concluded success since the leak was recorded', async () => {
  let runs
  try {
    runs = await listRuns(WORKFLOW)
  } catch (e) {
    assert.fail(`could not ask GitHub for runs of ${WORKFLOW}: ${e.message}`)
  }
  const good = runs.filter((r) => r.status === 'completed' && r.conclusion === 'success' && Date.parse(r.createdAt) > LEAKED_AT)
  assert.ok(good.length > 0, `no successful run of ${WORKFLOW} since the leak; the printed password may still be live`)
  console.log(`rotation proved by run ${good[0].databaseId} (${good[0].createdAt}): ${good[0].url}`)
})
