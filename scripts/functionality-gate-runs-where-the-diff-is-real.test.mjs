/**
 * THE GATE HAS TO RUN WHERE THE DIFF IS REAL.
 *
 * signal ScoutCopilot:e3d0685 (2026-09-17): the BLOCKING "Nothing new shipped without its test"
 * gate — scripts/check-new-functionality-registered.mjs — was wired ONLY into deploy.yml. That
 * workflow runs on workflow_dispatch from master, so on a production deploy HEAD === origin/master,
 * the diff range origin/master...HEAD is EMPTY, the checker prints "adds nothing" and exits 0. It
 * could never block. This suite pins two facts so the gate cannot silently return to that state:
 *
 *   (a) on an empty range the checker really does exit 0 "adds nothing" — i.e. it is inert BY
 *       CONSTRUCTION on the master-to-itself deploy, which is why placing it there was worthless;
 *   (b) the checker is now invoked from test.yml, which triggers on pull_request — the one context
 *       where "what the product WAS vs what it BECAME" is a non-empty diff — and that invocation is
 *       guarded to pull_request events, so the gate runs where it can actually refuse something.
 *
 * This is the finish-test the row never had. It needs no network and no browser.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CHECKER = join(ROOT, 'scripts', 'check-new-functionality-registered.mjs')
const TEST_YML = join(ROOT, '.github', 'workflows', 'test.yml')

test('empty range → the checker exits 0 "adds nothing" (why deploy.yml placement could never block)', () => {
  // HEAD...HEAD is an empty symmetric range: exactly the shape a workflow_dispatch deploy from
  // master produces (HEAD === origin/master). The checker must treat it as "nothing new" and pass.
  let out
  try {
    out = execFileSync(process.execPath, [CHECKER, '--diff', 'HEAD...HEAD'], {
      cwd: ROOT, encoding: 'utf-8',
    })
  } catch (e) {
    assert.fail(`checker exited non-zero on an empty range (should be 0):\n${e.stdout || ''}\n${e.stderr || ''}`)
  }
  assert.match(out, /adds nothing/i, `expected "adds nothing" on an empty range, got:\n${out}`)
})

test('test.yml invokes the checker in a pull_request-guarded job (the diff is real there)', () => {
  const yml = readFileSync(TEST_YML, 'utf-8')

  // 1. The workflow triggers on pull_request at all.
  assert.match(yml, /^\s*pull_request:/m, 'test.yml must trigger on pull_request')

  // 2. The checker is invoked from this workflow.
  assert.match(
    yml,
    /check-new-functionality-registered\.mjs/,
    'test.yml must invoke scripts/check-new-functionality-registered.mjs — the functionality gate',
  )

  // 3. That invocation is guarded to pull_request events, so it does NOT run in a master-to-itself
  //    context (push to master / workflow_dispatch) where the range is empty and the gate is inert.
  assert.match(
    yml,
    /github\.event_name\s*==\s*'pull_request'/,
    "the functionality-gate job must be guarded with if: github.event_name == 'pull_request'",
  )
})
