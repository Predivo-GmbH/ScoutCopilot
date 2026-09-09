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
 * PROVEN RED BEFORE IT WAS TRUSTED GREEN: run with ROTATION_WORKFLOW set to a workflow that
 * has never rotated anything and it fails on assertion 2. Done on 2026-09-09 with
 * `ROTATION_WORKFLOW=keep-alive.yml` — exit 1, "no successful run".
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

test('the rotation is a workflow anyone can re-run, aimed at the production project', () => {
  const p = join(ROOT, '.github', 'workflows', 'rotate-database-password.yml')
  assert.ok(existsSync(p), 'the rotation workflow is gone; the repair is not repeatable')
  const doc = yaml.load(readFileSync(p, 'utf8'))
  const env = doc.jobs.rotate.steps[0].env
  assert.equal(env.PROJECT_REF, PROJECT_REF, 'the workflow no longer points at the production project')
  assert.ok('workflow_dispatch' in doc.on, 'the workflow can no longer be dispatched by hand')
})

test('a run of that workflow has concluded success since the leak was recorded', () => {
  let runs
  try {
    runs = JSON.parse(execFileSync('gh', [
      'run', 'list', '-R', REPO, '--workflow', WORKFLOW, '--limit', '10',
      '--json', 'databaseId,conclusion,status,createdAt,url',
    ], { encoding: 'utf8' }))
  } catch (e) {
    assert.fail(`could not ask GitHub for runs of ${WORKFLOW}: ${e.message}`)
  }
  const good = runs.filter((r) => r.status === 'completed' && r.conclusion === 'success' && Date.parse(r.createdAt) > LEAKED_AT)
  assert.ok(good.length > 0, `no successful run of ${WORKFLOW} since the leak; the printed password may still be live`)
  console.log(`rotation proved by run ${good[0].databaseId} (${good[0].createdAt}): ${good[0].url}`)
})
