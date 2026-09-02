#!/usr/bin/env node
/**
 * Regression guard for the defect fixed on 2026-09-02 (commit 4ec9bfe, function v39).
 *
 * WHY THIS EXISTS. `generate-photo` used to write a durable `public.error_log` row for
 * every unauthenticated request it refused. Because `verify_jwt = false` project-wide
 * (this project issues ES256 JWTs the edge runtime's HS256 middleware cannot verify), the
 * endpoint is reachable by anything on the internet, so that was one permanent row per
 * anonymous POST: 4,931 rows by 2026-09-02, which was 94% of every error this product had
 * ever logged. A real ScoutCopilot fault was a needle in it.
 *
 * This test proves the fix the only way that counts - against the LIVE function, by
 * reading the error store back afterwards rather than reasoning about the code.
 *
 *   node scripts/verify-generate-photo-401-not-logged.test.mjs
 *
 * Credentials: SUPABASE_ACCESS_TOKEN (Management API PAT) from the environment, or the
 * "Access Token:" line of the gitignored docs/Credentials.txt. It NEVER prints either
 * one - only lengths, counts and pass/fail.
 *
 * It fails loudly rather than skipping when it cannot run. A guard that reports success
 * for doing nothing is worse than one that fails.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PROJECT_REF = 'rlcsuqwqzoqjykdiqjye'
const FN_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/generate-photo`
const PROBES = 5

function credLine(label) {
  const p = path.join(REPO, 'docs', 'Credentials.txt')
  if (!fs.existsSync(p)) return null
  // Split on the FIRST separator only, and accept every separator this file actually
  // uses. A mask written for "KEY=value" once let a "Label — value" line through intact.
  for (const raw of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = raw.match(/^\s*([^:=—-]+?)\s*(?::|=|—)\s*(.+)\s*$/)
    if (m && m[1].trim().toLowerCase() === label.toLowerCase()) return m[2].trim().split(/\s+/)[0]
  }
  return null
}

const token = process.env.SUPABASE_ACCESS_TOKEN || credLine('Access Token')
const anonKey = process.env.SUPABASE_ANON_KEY || credLine('VITE_SUPABASE_ANON_KEY')
if (!token) {
  console.error('FAIL: no Management API token (SUPABASE_ACCESS_TOKEN or docs/Credentials.txt "Access Token").')
  process.exit(1)
}

async function query(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) throw new Error(`Management API HTTP ${res.status}`)
  return res.json()
}

const fail = (msg) => { console.error(`FAIL: ${msg}`); process.exit(1) }

const [{ t0 }] = await query('select now() as t0')
console.log(`baseline taken at ${t0}`)

// The exact shape a browser with no session sends: supabase-js 2.112.3 builds the
// functions fetch with omitApiKeyAsBearer: true, so a sb_publishable_ key is never sent
// as a Bearer token and a session-less call arrives with NO Authorization header at all.
for (let i = 0; i < PROBES; i++) {
  const res = await fetch(FN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(anonKey ? { apikey: anonKey } : {}) },
    body: JSON.stringify({ probe: 'regression-guard' }),
  })
  const body = await res.json().catch(() => ({}))
  if (res.status !== 401) fail(`probe ${i + 1}: expected 401, got ${res.status}. The auth gate itself changed.`)
  if (body.error !== 'Missing or invalid Authorization header') {
    fail(`probe ${i + 1}: caller-visible message changed to ${JSON.stringify(body.error)}`)
  }
}
console.log(`sent ${PROBES} unauthenticated POSTs, all refused 401 with the expected message`)

// Give the function a moment to have written a row, if it were still going to.
await new Promise((r) => setTimeout(r, 4000))

const [{ n }] = await query(
  `select count(*)::int as n from public.error_log
    where function_name = 'generate-photo' and created_at > '${t0}'`
)

if (n > 0) {
  fail(`${n} error_log row(s) written by ${PROBES} anonymous probes. The 401 is being recorded as an application error again - see commit 4ec9bfe.`)
}
console.log(`error_log rows written by those ${PROBES} probes: 0`)
console.log('PASS: an unauthenticated request is refused without becoming a durable application error.')
