/**
 * THE DEPLOY-TIME GATE MUST LOOK AT EVERYTHING SINCE THE LAST DEPLOY, NOT JUST THE TIP.
 *
 * signal ScoutCopilot: "safety check skips 24 of 30 recent changes" (measured 2026-09-19).
 * The functionality gate — scripts/check-new-functionality-registered.mjs — was wired two ways,
 * and BOTH left production unguarded against a direct push:
 *
 *   - deploy.yml ran it with NO range, so it defaulted to origin/master...HEAD. On a
 *     workflow_dispatch deploy from master, HEAD === origin/master === an EMPTY range: it passed
 *     without inspecting a single commit it was shipping.
 *   - test.yml runs it only in the pull_request context. Anything pushed STRAIGHT to master never
 *     opens a PR, so the gate never sees it. Of the last 30 commits to master, ~24 arrived by
 *     direct push — shipped to production with no functionality gate at any point.
 *
 * The fix diffs from the commit that was live in production at the LAST successful deploy to HEAD,
 * so every commit since we last shipped is checked, however it landed. This suite pins the wiring
 * so the gate cannot silently return to the tip-only / empty-range state. No network, no browser.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CHECKER = join(ROOT, 'scripts', 'check-new-functionality-registered.mjs')
const DEPLOY_YML = join(ROOT, '.github', 'workflows', 'deploy.yml')

test('deploy.yml invokes the checker with a --diff range, never the bare (empty-range) form', () => {
  const yml = readFileSync(DEPLOY_YML, 'utf-8')

  // The checker is present in the deploy job.
  assert.match(yml, /check-new-functionality-registered\.mjs/,
    'deploy.yml must invoke the functionality gate')

  // Every invocation of the checker in deploy.yml must carry a --diff range. A bare invocation
  // defaults to origin/master...HEAD, which is empty on a master-to-itself deploy = the original bug.
  const invocations = [...yml.matchAll(/check-new-functionality-registered\.mjs([^\n]*)/g)]
  assert.ok(invocations.length > 0, 'expected at least one checker invocation in deploy.yml')
  for (const [line, tail] of invocations) {
    assert.match(tail, /--diff/,
      `deploy.yml runs the gate with no --diff range (empty-range no-op): ${line.trim()}`)
  }

  // The range is anchored to the resolved last-production-deploy base ...HEAD.
  assert.match(yml, /--diff\s+"\$\{FUNCTIONALITY_GATE_BASE\}\.\.\.HEAD"/,
    'the gate must diff ${FUNCTIONALITY_GATE_BASE}...HEAD (last production deploy to now)')
})

test('deploy.yml resolves the base from the last SUCCESSFUL deploy run, fail-closed', () => {
  const yml = readFileSync(DEPLOY_YML, 'utf-8')

  // It asks the API for prior successful workflow_dispatch runs of THIS workflow.
  assert.match(yml, /actions\/workflows\/deploy\.yml\/runs\?event=workflow_dispatch&status=success/,
    'must query prior successful workflow_dispatch runs of deploy.yml')

  // It only accepts a run whose deploy job actually concluded success (a confirm!=deploy dispatch
  // skips the deploy job but the run still reads success — its sha would skip real commits).
  assert.match(yml, /select\(\.name == "deploy"\)/,
    'must confirm the deploy job itself concluded success, not merely the run')

  // It writes the resolved base to the environment for the next step.
  assert.match(yml, /FUNCTIONALITY_GATE_BASE=.*>>\s*"\$GITHUB_ENV"/,
    'must export FUNCTIONALITY_GATE_BASE to $GITHUB_ENV')

  // Fail-closed: an unresolvable base blocks the deploy (exit 1), never falls back to a no-op.
  assert.match(yml, /Blocking \(fail-closed\)/,
    'an unresolvable base must fail closed (block the deploy), not silently pass')
  assert.match(yml, /exit 1/, 'the base-resolution step must be able to exit 1')
})

test('the deploy job checks out full history (fetch-depth: 0) so the base is reachable', () => {
  const yml = readFileSync(DEPLOY_YML, 'utf-8')
  // A shallow checkout holds only the tip; git cat-file -e on the last-deploy commit would then
  // fail and (correctly) block. Full history is what lets the gate actually diff the range.
  assert.match(yml, /fetch-depth:\s*0/,
    'the deploy job checkout must use fetch-depth: 0 to reach the last-deploy commit')
})

test('empty range → the checker exits 0 "adds nothing" (documents the inert case the fix avoids)', () => {
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
