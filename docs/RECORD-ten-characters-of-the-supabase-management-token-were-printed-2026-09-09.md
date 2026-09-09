# RECORD — ten characters of ScoutCopilot's Supabase management token were printed into a chat

Row: `scoutcopilot-supabase-pat-prefix-leaked-into-transcript`
Incident date: 2026-09-03. Decided by Roger: 2026-09-09. Written up: 2026-09-09, session `wave2-E3`.

The row carried a note saying, correctly, that this incident had been reported straight onto the
board and **never written up**. This file is that write-up. No credential value, prefix, length or
shape is reproduced anywhere in it.

## What happened

On 2026-09-03, while inspecting the structure of `ScoutCopilot/docs/Credentials.txt`, a session
printed the leading characters of the "Access Token" line into its own transcript in order to learn
the line's shape. That rendered the label plus a short prefix of the live Supabase **Management**
token.

Two things about the report matter and were recorded on the row at the time:

- **It is a self-report.** An agent reported its own behaviour. Roger said nothing about any leak
  and did not ask for this row; the claim is ours. That provenance stamp was added on 2026-09-03
  after he challenged the framing.
- **The house rule is "not even a prefix."** The safe form of the same question is a length or a
  count — never a substring. Asking for "the first N characters of the line" is a substring.

## The correction that mattered

The row recorded the token as roughly 250 characters and therefore treated a 10-character prefix as
about 4% of it. That was wrong, and it was re-measured on 2026-09-09: a Supabase management token is
a short fixed-shape one, not a ~250-character one, so the printed prefix was a materially larger
share of the value than the row assumed. The token was also confirmed **live** that day — it
authenticates against the Supabase management API and lists two projects, and a well-formed but
invented one of the same shape is rejected, so the endpoint is not simply being generous.

The value itself was read into a variable and never printed during that measurement.

## The decision

Asked on the board on 2026-09-09 with two labelled choices and a recommendation:

> Ten characters of ScoutCopilot's Supabase management token were printed into a chat. The token is
> still live and opens 2 projects. Do you want it replaced, or do we accept it?
> **Choices:** Replace it / Accept it. **Recommended:** Accept it.

**Roger's answer (roger@mueller.ro, 2026-09-09): Accept it.** The token is not rotated. This is a
deliberate, recorded acceptance of a partially-disclosed credential, not an oversight — if it is
ever rotated later, this file is the reason it was not rotated in September.

## Why the class cannot repeat silently

The recurrence risk is not this token; it is the next session asking the same unsafe question. That
is closed by a hook, not by a promise:

- `C:/ClaudeShared/hooks/secret-render-guard.js` — **Detector B, "NOT EVEN A PREFIX"** — blocks a
  payload carrying a fragment of a live credential on this machine, and blocks the truncating idioms
  that produce one: `head -c`, `cut -c1-`, an `awk` substring window, `.slice(0,N)`,
  `.Substring(0,N)` and shell parameter truncation.
- Truncating a **digest** stays allowed. Hashing a value and cutting the digest short is the
  sanctioned way to compare two of them without rendering either, and the guard has an explicit
  carve-out for it.
- `C:/ClaudeShared/hooks/secret-render-guard.test.mjs` — 69 assertions, exit 0 on 2026-09-09.
  Case **B2** is this exact incident: *"REFUSES: a prefix of a Supabase PAT."*
- The safe way to ask anything about a file that might hold one remains
  `node C:/ClaudeShared/hooks/safe-inspect.mjs`.

## Status

Closed 2026-09-09. Roger decided; the decision is recorded here; the shape of the mistake is
blocked by a tested guard.
