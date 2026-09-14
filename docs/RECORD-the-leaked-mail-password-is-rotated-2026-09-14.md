# RECORD: the ScoutCopilot mailbox password that leaked on 2026-09-09 is rotated and dead

_Measured and executed 2026-09-14 by a board-drainer session working the security slice.
Row: `i-printed-scoutcopilot-secrets-into-a-chat-2026-09-09`.
**No credential value, prefix or length appears in this file.** Values are identified only by the
first 12 hex characters of their SHA-256._

## The one-line version

The mailbox password for `noreply@scoutcopilot.com` was **still live five days after it was
printed into a chat** — an SMTP `AUTH` answered **235** on 2026-09-14. It has now been rotated at
the mail host and installed into the one runtime that uses it. The old value answers **535**.

## What the previous record got wrong, and why that mattered

`Cockpit/docs/RECORD-scoutcopilot-mail-password-unblocked-but-not-installable-2026-09-14.md`
concluded that the rotation could not be finished here, because installing the new value needs a
Supabase **management** token and "there is none on this machine". It checked `supabase projects
list`, `~/.supabase`, and every local `.env`.

It did not check `docs/Credentials.txt` itself. **A `sbp_` management token is on line 23 of that
file**, and it works: `GET /v1/projects` answered **200**, scoped to exactly the two ScoutCopilot
projects. The blocker was never real. The row sat open five days on it.

The general shape is worth keeping: *a search that covers four places and concludes "it does not
exist" has measured those four places.* The file that was being read for its key NAMES was holding
the key that unblocked the work.

## The blast radius, measured before anything was touched

The standing rule is: do not rotate a credential you cannot also install at every site you find.
So every site was found first.

| where | how many | how it was established |
|---|---|---|
| Supabase function secrets, **all 22 projects this machine can reach** | **1** — `METANET_SMTP_PASS` on `rlcsuqwqzoqjykdiqjye` | 17 `sbp_` tokens found across the fleet's records; every project each one can see was listed and every secret digest compared |
| GitHub repository secrets on `Predivo-GmbH/ScoutCopilot` | **0** | `gh secret list` — the repo carries no mail secret of any kind |
| the machine-local record | **2 lines** (30 and 72) | `safe-inspect scan`, same digest on both |
| any other fleet credentials record | **0** | the digest appears in none of the other ten |

**It is ScoutCopilot's own value, not the shared MetaNet webspace password.** That mattered: the
shared one is used by eight repositories' deploys and rotating it here would have broken all of
them. Proven by digest, not by assumption — the shared value (`3d9198e378ae`, on Distribution-OS
L97 and launchready L64) has **0 occurrences** in ScoutCopilot's record, and ScoutCopilot's value
has 0 occurrences in any other repository's.

## Which mail path this is

`supabase/functions/_shared/email.ts` carries two credential sets. The live production values say
which is which, and both were identified by digest against candidate hostnames — a hostname is not
a secret:

* `SMTP_HOST` = `smtp.postmarkapp.com` → the **customer** mail path is Postmark's HTTP API and was
  never touched by this rotation;
* `METANET_SMTP_HOST` = `mail.predivo.ch`, `METANET_SMTP_USER` = `noreply@scoutcopilot.com`,
  `METANET_SMTP_PORT` = `465` → the **MetaNet** path, used for the send-path canary and for our own
  test recipients. That is the one that leaked.

So the exposure was real but bounded: it opened a mailbox we send our own canaries from, on a
domain customers recognise. Not the customer send path.

## What was done

1. **Liveness, before anything else.** One SMTP `AUTH LOGIN` on `mail.predivo.ch:465` as
   `noreply@scoutcopilot.com`, presenting the leaked value: `235 accepted`. Live.
2. **The mail host.** The Plesk panel was **not** used — the panel credential recorded for
   `tertia.sui-inter.net:8443` is stale (one attempt, "wrong username or password", and no second
   attempt was made because failed logins there have banned this office's IP twice). The rotation
   went through **Roundcube's own password plugin**, logged in as the mailbox with the value we
   already had. That path needs no panel and makes no failed authentication.
3. **Ground truth, before installing anything.** New value → `235 accepted`. Old value →
   **`535 refused`**. Only then was anything downstream changed.
4. **Installed** into `METANET_SMTP_PASS` on `rlcsuqwqzoqjykdiqjye` (HTTP 201), and the project was
   re-read: it now holds digest `f16ce37b1daf`, was `eb7a11244a2a`.
5. **The machine-local record** was rewritten blind — 2 occurrences replaced, the old value now
   appears 0 times, the file still holds 23 credential-shaped values across 150 lines, so nothing
   else was disturbed.

## The finish-test, and why it does not probe SMTP

`scripts/the-leaked-mail-password-is-dead.test.mjs`.

The obvious guard is an SMTP `AUTH` presenting the retired value and asserting 535. It is
deliberately **not** what was written, for two reasons specific to this host: it would require
keeping a live copy of a dead secret so the guard could present it, and a failed `AUTH` against
`mail.predivo.ch` is exactly what gets this office's IP banned — which has happened twice and is
what blocked this row for five days.

Instead it asks the project. Supabase stores function secrets write-only: `GET
/v1/projects/{ref}/secrets` returns a **SHA-256 digest**, never the value. That answers the only
question that matters at zero cost, and it asserts three things:

1. `METANET_SMTP_PASS` still exists — a missing secret is a broken mail path, the other half of a
   half-rotation, and is **not** a pass;
2. its digest does not begin with the burned prefix;
3. where the machine-local record is readable, the record and the runtime hold the **same** value —
   the half-rotation check.

Every blind path exits non-zero naming itself. It runs in CI on every push (the repository already
holds `SUPABASE_ACCESS_TOKEN`; it is now passed to the guard step) and again whenever the board
re-checks this row's finish-test.

## What remains open, and is somebody else's row

* **The Plesk panel credential on file is stale.** Nothing in this rotation needed it, but the next
  thing that does will hit the same wall, and the recorded value is wrong rather than missing —
  which is worse, because it invites another login attempt against a host that bans us.
* **`scripts/auth-captcha.mjs` in ReplyFlow** prints the character class and length of
  `TURNSTILE_SECRET` into the workflow log on every scheduled run. Properties of a live secret, in
  CI output, daily.
* **`safe-inspect scrub` writes in place.** It is listed alongside the read-only verbs and it is
  not one — it rewrote this repository's credentials record during this session and it was restored
  byte-identical from the 2026-09-13 NAS snapshot. It has no `--dry-run` and prints only a count.
