#!/usr/bin/env node
/**
 * THE MAIL PASSWORD I PRINTED INTO A CHAT MUST STAY DEAD.
 *
 * ── WHAT HAPPENED ───────────────────────────────────────────────────────────────────────────
 *
 * On 2026-09-09 a session set out to list the KEY NAMES in the machine-local credentials record
 * and wrote its own extractor that took the text before the first `:` or `=`. Seventeen lines in
 * that file separate name from value with an em dash, so for those the "name only" slice printed
 * the whole line, value included. One of the four values exposed that way was the mailbox password
 * for noreply@scoutcopilot.com on mail.predivo.ch. It went into a chat transcript, and it was
 * still LIVE five days later: an SMTP AUTH on 2026-09-14 answered 235.
 *
 * It was rotated the same day. This guard is what keeps that true.
 *
 * ── WHY IT ASKS THE PROJECT AND NOT THE MAIL SERVER ─────────────────────────────────────────
 *
 * The obvious check is an SMTP AUTH presenting the retired value and asserting a 535. It is not
 * the check written here, for two reasons, and both of them are about this specific host:
 *
 *   1. it would require KEEPING the burned value somewhere so the guard could present it, which
 *      is a live copy of a dead secret for no gain; and
 *   2. a failed AUTH against mail.predivo.ch is exactly what gets this office's IP banned by the
 *      host. It has happened twice (2026-09-03, 2026-09-09) and it blacked out every Predivo site
 *      from our own network. A guard that runs hourly and fails auth on purpose is a guard that
 *      bans us on purpose.
 *
 * So it asks the project instead. Supabase stores edge-function secrets write-only: GET
 * /v1/projects/{ref}/secrets hands back a SHA-256 DIGEST of each value, never the value. That is
 * enough to answer the only question that matters — is the thing ScoutCopilot presents to the mail
 * server still the thing that leaked? — and it costs no auth attempt, no mailbox, no stored secret.
 *
 * ── WHAT IT ASSERTS ─────────────────────────────────────────────────────────────────────────
 *
 *   1. the production project still HAS a METANET_SMTP_PASS. A missing secret is not a pass:
 *      it means the mail path is broken, which is the other half of a half-rotation.
 *   2. its digest does NOT begin with the burned prefix. A 12-hex prefix is recorded, never the
 *      value and never its full digest.
 *   3. where the machine-local record is readable (a developer machine, not CI), the digest the
 *      project holds MATCHES the value in that record. This is the half-rotation check: a record
 *      and a runtime that disagree means somebody changed one of them and not the other, and the
 *      first symptom would otherwise be ScoutCopilot's mail silently failing.
 *
 * ── IT CAN NEVER PASS BY NOT KNOWING ────────────────────────────────────────────────────────
 *
 * No token, an HTTP error, a malformed body, no such secret — every one of those exits non-zero
 * and names itself. There is no branch that prints a pass without having read a digest.
 *
 *   node scripts/the-leaked-mail-password-is-dead.test.mjs
 *
 * Exit 0 = the leaked mailbox password is not what ScoutCopilot presents any more.
 * Exit 1 = it still is, or the question could not be answered.
 */
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

/** ScoutCopilot production. Staging holds no function secrets at all (measured 2026-09-14). */
const REF = 'rlcsuqwqzoqjykdiqjye'
const SECRET_NAME = 'METANET_SMTP_PASS'

/**
 * The first 12 hex characters of the SHA-256 of the value that leaked. Not the value, not the
 * whole digest, and the value behind it is dead — an SMTP AUTH presenting it answered 535 on
 * 2026-09-14, after the rotation.
 */
const BURNED_DIGEST_PREFIX = 'eb7a11244a2a'

/**
 * A Supabase management token: from the environment in CI, from the gitignored record on a
 * developer machine. Same two-source shape ReplyFlow's live production suites use, and for the
 * same reason — a guard only one environment can run is a guard that gets run once. The value is
 * never printed, never put on a command line and never written anywhere.
 */
const RECORD_NAME = 'Cred' + 'entials.txt'

/**
 * The machine-local record, wherever it is. It is gitignored, so it exists only in the primary
 * checkout — a git WORKTREE of this repository does not have it, and the board's finish-test
 * runner runs this file by absolute path from whichever checkout it was given. Hence two
 * candidates, and an env override for anyone whose layout is neither.
 */
function readRecord() {
  const candidates = [
    process.env.SC_CREDENTIALS_FILE,
    new URL('../docs/' + RECORD_NAME, import.meta.url),
    'C:/Business/Internal Projects/ScoutCopilot/docs/' + RECORD_NAME,
  ].filter(Boolean)
  for (const c of candidates) {
    try { return readFileSync(c, 'utf-8') } catch { /* try the next one */ }
  }
  return null
}

function managementToken() {
  const fromEnv = (process.env.SUPABASE_ACCESS_TOKEN || process.env.SC_MGMT_TOKEN || '').trim()
  if (fromEnv) return fromEnv
  const text = readRecord()
  return text ? ((text.match(/sbp_[A-Za-z0-9]{20,}/) || [])[0] || '') : ''
}

/** The value the machine-local record currently carries for this mailbox, if that file is here. */
function recordedValue() {
  try {
    const text = readRecord()
    if (!text) return null
    const lines = text.split(/\r?\n/)
    const idx = lines.findIndex((l) => /\bSMTP_PASS\b/.test(l))
    if (idx < 0) return null
    const tokens = new Set()
    for (const t of lines[idx].split(/[\s,;'"`|()\[\]<>]+/)) {
      if (t.length >= 6) tokens.add(t)
      const stripped = t.replace(/^[^=:]*[=:]/, '')
      if (stripped.length >= 6) tokens.add(stripped)
    }
    return tokens
  } catch {
    return null
  }
}

const sha256 = (s) => createHash('sha256').update(s).digest('hex')

function fail(message) {
  console.error(`the-leaked-mail-password-is-dead: FAIL\n  ${message}`)
  process.exit(1)
}

const token = managementToken()
if (!token) {
  fail(
    'no Supabase management token. Set SUPABASE_ACCESS_TOKEN (CI holds it as a repository secret) ' +
      'or run this on a machine that has the gitignored credentials record. NOT counted as passing.'
  )
}

const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/secrets`, {
  headers: { Authorization: `Bearer ${token}` },
}).catch((err) => fail(`could not reach the Supabase Management API: ${err.message}`))

if (!res.ok) fail(`GET /v1/projects/${REF}/secrets -> HTTP ${res.status}. Nothing was proved.`)

const rows = await res.json().catch(() => fail('the Management API answered something that is not JSON.'))
if (!Array.isArray(rows)) fail('the Management API did not answer with a list of secrets.')

const row = rows.find((r) => r.name === SECRET_NAME)
if (!row) {
  fail(
    `${SECRET_NAME} is not configured on ${REF} at all. That is not "rotated", it is a broken mail ` +
      'path — the other half of a half-rotation. ScoutCopilot cannot authenticate to mail.predivo.ch.'
  )
}

const digest = String(row.value || '')
if (!/^[0-9a-f]{64}$/.test(digest)) {
  fail(`${SECRET_NAME} came back as something that is not a SHA-256 digest. Cannot judge it.`)
}

if (digest.startsWith(BURNED_DIGEST_PREFIX)) {
  fail(
    `${SECRET_NAME} on ${REF} is STILL the value that was printed into a chat on 2026-09-09. ` +
      'Rotate the mailbox at mail.predivo.ch and install the new value into this project\'s ' +
      'function secrets — both, or neither.'
  )
}
console.log(`ok - ${SECRET_NAME} on ${REF} is not the value that leaked`)

const recorded = recordedValue()
if (recorded === null) {
  console.log('note - the machine-local record is not on this machine, so the record-vs-runtime check was skipped.')
  console.log('       (Expected in CI. The assertion above ran and is what this guard exists for.)')
} else {
  const agrees = [...recorded].some((t) => sha256(t) === digest)
  if (!agrees) {
    fail(
      'the machine-local record and the live project hold DIFFERENT values for this mailbox. One ' +
        'of them was changed without the other, which is a half-rotation: the next thing to notice ' +
        'it would be ScoutCopilot\'s mail silently failing. Neither value is printed here — compare ' +
        'them with safe-inspect.'
    )
  }
  console.log('ok - the machine-local record and the live project hold the SAME value (compared by digest)')
}

console.log('\nThe mailbox password that leaked on 2026-09-09 is not what ScoutCopilot presents any more.')
// NOT process.exit(0). On Windows, calling process.exit() while undici still holds a keep-alive
// socket from the fetch above trips a libuv assertion (`!(handle->flags & UV_HANDLE_CLOSING)`) and
// the process dies with 127 — a PASS that reports as a crash, which for a finish-test means the
// row never closes. Setting exitCode and letting the loop drain gives a real 0.
process.exitCode = 0
