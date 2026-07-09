# ScoutCopilot — Adversarial Security & Correctness Audit (Edge-Function Trust Boundary)

- **Date:** 2026-07-07
- **Auditor:** Fable 5 (adversarial review, code-grounded)
- **Scope:** `supabase/functions/**` + `supabase/migrations/**`. No source changed, nothing deployed.
- **Method:** read every edge function, the shared auth/rate-limiter/claude/mock helpers, and the RLS schema; traced auth, secrets, money, AI-cost, and data-integrity paths end to end.

---

## 0. Architecture note that frames everything

Every edge function authenticates the caller with `getAuthContext()` (`_shared/auth.ts:12`) and then does **all** DB work through the **service-role client** `getServiceClient()` (`_shared/auth.ts:77`). The service-role client **bypasses RLS entirely.** The RLS policies in `001_initial_schema.sql:262-514` are well-written and org-scoped, but they only protect the *client-side* anon-key path. Inside edge functions, tenant isolation depends **100% on each function manually adding `.eq("organization_id", auth.organizationId)`**. Most do. The exceptions are the isolation findings below.

---

## 1. Findings table (ranked)

| ID | Sev | File:line | Issue | Fix (summary) |
|----|-----|-----------|-------|---------------|
| **C1** | **Critical** | `credentials/index.ts:156,197`; `migrations/001_initial_schema.sql:54` | BYOK Wyscout/StatsBomb credentials stored **plaintext** in `api_credentials.encrypted_credentials` (jsonb). Column name is a misnomer (SEC-020, self-documented at `credentials/index.ts:1-12`). | App-layer AES-256-GCM encrypt before insert, decrypt only in provider calls. See §4. |
| **H1** | **High** | `checkout/index.ts:9-22`; `stripe-webhook/index.ts:6-13,137-155` | Stripe **price IDs are still `*_placeholder`** — never replaced with real IDs. ⇒ checkout `/checkout/sessions` will 400 ("No such price") in prod, and `customer.subscription.updated` is **dead code** (real price IDs never match the placeholder keys, so plan changes/downgrades via the Portal silently never apply). | Replace with live price IDs; key `PRICE_TO_TIER` by real IDs. |
| **H2** | **High** | `stripe-webhook/index.ts:78-194` | **No event idempotency / dedup / ordering guard.** No `stripe_event_id` table. A captured signed event can be **replayed within the 5-min window**; out-of-order `deleted`→`updated` can re-upgrade a cancelled org. | Persist `event.id` in a `processed_stripe_events` table, `INSERT … ON CONFLICT DO NOTHING`, short-circuit if seen. |
| **H3** | **High** | `delete-account/index.ts:91-159` | **Any single org member (even `scout`) deleting their own account wipes the ENTIRE organization's data** — watchlists, comparisons, reports, searches, api_credentials, usage — keyed only by `orgId` with **no owner check and no "is this the last member" check.** Multi-seat (pro/club) orgs are one careless click from total data loss for all colleagues. Also a latent bug: line 144 deletes `search_results` filtering on **`query_id`** which does not exist (column is `search_query_id`, schema `:82`) → that delete errors/no-ops. | Gate org-data deletion behind "owner AND sole member"; otherwise delete only the profile + auth user. Fix column name. |
| **H4** | **High** | `_shared/rate-limiter.ts:1-40`; `rate-player/index.ts:36` | Rate limiter is **in-memory per cold-start** — resets on every new isolate and is not shared across concurrent instances, so an attacker running N parallel requests gets ~N× the intended limit. **`rate-player` has NO rate limiter at all** yet calls Claude per batch. AI (Claude) + API-Football (100/day free) cost is exposed to any logged-in abuser. | Move to DB/KV atomic counter (see §5); add a limiter to `rate-player`. |
| **M1** | **Med** | `compare/index.ts:100-108`; `report/index.ts:106-112` | **Cross-tenant read** of cached `search_results.player_data` (compare) and `squad_players.player_data` (report) via **unscoped `player_external_id` lookup** (no `organization_id`/`squad_id` filter). Org A can retrieve org B's cached player_data + AI `fit_reasoning`. Data is low-sensitivity (player stats), but it is still a tenant-boundary leak. | Add org scoping to both lookups (join through `search_queries.organization_id` / `squads.organization_id`). |
| **M2** | **Med** | `_shared/claude.ts:130-155,219-239,277-295` | **LLM output presented as factual data without grounding** (see §6 for the full confirmed list): `fit_score` (search), `stats_analysis` A–D ratings + `key_metrics` (report), `per_metric_ranks` (compare), and all narrative that "references specific numbers." Claude can fabricate numbers (esp. `key_metrics` and "positional averages" it has no data for). | Compute all numeric ratings/scores server-side from provider stats; restrict Claude to prose only; validate any number it emits against the input. |
| **M3** | **Med** | `invite-member/index.ts:14,124-135` | **Seat limit (`max_seats`) never enforced** on invite — an org can invite unlimited members regardless of paid tier. Also `VALID_ROLES` (`head_of_recruitment`, `technical_director`, `analyst`) do **not** match the `user_role` enum (`owner/admin/scout`, `001:13`) — inserted roles are inconsistent with the auth model. | Count active members + pending invites vs `max_seats` before insert; reconcile role vocabulary. |
| **M4** | **Med** | `credentials/index.ts:314`; `search/index.ts:73`; `report/index.ts:75`; `compare/index.ts:67` | `MOCK_DATA=true` silently swaps fabricated players/stats into search/report/compare and **skips credential validation**. A single mis-set prod env var serves fake data as real, fully undetectable to the user. | Hard-fail if `MOCK_DATA=true` when `SUPABASE_URL` is the production project; log a loud banner. |
| **L1** | **Low** | `stripe-webhook/index.ts:119-122` | `checkout.session.completed` sets tier from `metadata.tier` **without verifying the price actually paid**. Currently safe (checkout sets price+metadata from the same server-side tier), but fragile — a future metadata path could desync paid amount from granted tier. | Read the tier from the subscription's real price ID, not metadata. |
| **L2** | **Low** | `search/index.ts:294-300`; `generate-photo/index.ts:155` | `search` calls `generate-photo` with `Authorization: Bearer <service_role_key>`, but `generate-photo` runs `getAuthContext()` → `supabase.auth.getUser(serviceKey)`, which rejects a non-user token. Inline photo/age enrichment is silently broken (caught, non-blocking). Correctness, not security. | Give `generate-photo` a service-role bypass branch like the backfill functions. |

---

## 2. VERDICT: Tenant isolation — **NOT fully isolated (partial)**

**Sensitive data IS isolated.** Credentials, reports, watchlists, comparisons, searches, billing are all org-scoped both by RLS (client path) and by explicit `.eq("organization_id", …)` in every edge function that touches them (`credentials/index.ts` GET/POST/PUT/DELETE all scope; `delete-account`, `search`, `report`, `compare` writes all carry `auth.organizationId`). **`subscription_tier`/`max_seats` are written only by the signature-verified webhook** — there is **no API path for a user to self-upgrade tier or seats** without a paid Stripe event (verified: grep of all tier/seat writes = `stripe-webhook` only).

**But two cross-tenant read leaks exist (M1):**
- **Exploit:** As org-A user, call `POST /compare` with `player_ids:["sb-open-<id>", "apifb-<id>"]` for players your org never searched. `compare/index.ts:102-108` queries `search_results` by `player_external_id` **with no org filter**, `.order(created_at desc).limit(1)`, and returns org-B's cached `player_data` including org-B's AI `fit_reasoning`. Same shape in `report/index.ts:106-112` reading `squad_players` by `player_external_id` across squads/orgs.
- **Blast radius:** low-sensitivity (public football stats + AI prose), no credentials/billing/PII. Still a boundary violation and should be closed.

**Conclusion:** isolation holds for everything that matters commercially/legally; it is porous for cached player-stat blobs. Fix M1 to reach clean isolation.

---

## 3. Money path assessment

- **Signature + timestamp:** `stripe-webhook/index.ts:15-76` implements HMAC-SHA256 over `t.body`, constant-time-ish byte compare, and a 300s timestamp tolerance. **Correct.** ✅
- **Placeholder price IDs:** **NOT replaced** — still `price_*_placeholder` (`checkout:9-22`, `stripe-webhook:6-13`). Checkout will error in prod; `subscription.updated` handler is dead. **(H1)**
- **Idempotency / replay / ordering:** **Absent** — no event store, replay & out-of-order possible. **(H3)**
- **Self-upgrade without payment:** **Not possible.** No API writes tier/seats; only the webhook does. ✅
- **Seats:** granted by webhook but **never enforced** on invite. **(M3)**

---

## 4. GO / NO-GO: BYOK credential encryption → **GO. Approach: app-layer AES-256-GCM.**

pgsodium/Vault is unavailable on the Free plan (per the file's own note). Do **not** wait for Pro. Encrypt in the edge function:

- **Key:** 32-byte random, stored as edge secret `CREDENTIALS_ENC_KEY` (base64). Never in DB.
- **Encrypt (POST/PUT):** `crypto.subtle` AES-GCM, random 96-bit IV; store `{ iv, ct, tag }` base64 in the same jsonb column (or new `bytea`).
- **Decrypt:** only inside `fetchFromProviders` / `fetchPlayerFullStats` right before the provider call.
- **Migration outline:**
  1. Add `CREDENTIALS_ENC_KEY` secret.
  2. Deploy an idempotent one-shot backfill (service-role gated, like `backfill-birth-dates`) that reads each `api_credentials` row, encrypts `{username,password}`, writes back. Mark a `enc_version` field.
  3. Switch `credentials/index.ts` writes to encrypt and reads/provider-calls to decrypt (branch on `enc_version`).
  4. Verify no plaintext rows remain; drop the transitional branch.
- **Interim mitigation already true:** GET masks values (`credentials/index.ts:97`), RLS restricts to owner/admin on client path, service key server-only. These do **not** protect against DB backup theft, service-key leak, or SQL log exposure — hence still Critical until encrypted.

---

## 5. Durable rate limiter (fixes H4)

Replace the in-memory bucket with an atomic DB counter (works across isolates):

- Table `rate_limits(org_id, window_start, count, PRIMARY KEY(org_id, bucket_key))`, or a Postgres function `check_rate_limit(org_id, key, limit, window_secs)` that does an upsert-and-increment inside one statement and returns allowed/retry-after. Supabase has no native KV; a `SECURITY DEFINER` SQL function is the simplest durable option. Add it to **every** AI-spending function, including `rate-player` (currently unprotected). Keep the token-bucket math but persist the bucket per `(org_id, function)`.

**Exposure today (quantified):** with cold-start resets and no cross-isolate sharing, a scripted logged-in user issuing bursts across fresh isolates can drive Claude calls (search rank / report / compare / **rate-player, uncapped**) and API-Football's 100/day free quota to exhaustion for the whole platform (API-Football key is shared, not per-org) — a cheap denial-of-wallet + denial-of-service on enrichment.

---

## 6. CONFIRMED: LLM output shown as factual data WITHOUT provider grounding (M2)

Every item below is generated by Claude and rendered to the user as fact:

1. **`fit_score` (0–100) per player — search.** `_shared/claude.ts:157-180` (`rankPlayers`); surfaced in `search/index.ts:181,338`. Pure LLM judgment; the only grounded fallback is a flat `70` (`search/index.ts:188`).
2. **`stats_analysis` A/B/C/D ratings — report.** `_shared/claude.ts:227-231`. Ratings invented by the model.
3. **`stats_analysis.*.key_metrics {}` — report.** `_shared/claude.ts:227-231`. Claude fills these numeric objects itself; nothing constrains them to the input stats → **fabrication-prone**.
4. **"Compare to positional averages" — report.** Prompt `_shared/claude.ts:239` asks Claude to compare to positional averages **it has no data for** → hallucinated baselines.
5. **`summary` / `strengths` / `weaknesses` — report.** `_shared/claude.ts:222-226`. Instructed to cite "specific stats"; can misquote/invent numbers not present in the provided stats.
6. **`per_metric_ranks` + `analysis` + `recommendation` — compare.** `_shared/claude.ts:277-295`. Ranks and cited numbers come from the model.
7. **Client-supplied stats trusted — rate-player.** `rate-player/index.ts:36-58` rates whatever `players[].stats` the client sends; the caller controls the numbers the AI "rates."

**Grounded (good) paths for contrast:** per-90 metrics are computed on the frontend from `report_data.rawStats` (`report/index.ts:248-250`), and `similar_players` are replaced with a **database-driven** Euclidean-distance calculation (`report/index.ts:277-289`, `findSimilarPlayers` `:702-817`) — those are trustworthy. `search`/`report`/`compare` stat blobs themselves come from real StatsBomb/API-Football data (`search/index.ts:788-839`), so the *inputs* are real; the risk is the model **restating/inventing** numbers on top of them.

**Mock leakage:** M4 — `MOCK_DATA=true` replaces the real inputs wholesale.

---

## 7. Ranked remediation backlog

1. **C1** — Encrypt BYOK credentials (AES-256-GCM, §4). *Highest — customer third-party account passwords in plaintext.*
2. **H1** — Wire real Stripe price IDs; re-key `PRICE_TO_TIER`. *Billing is non-functional until done.*
3. **H2** — Add Stripe event dedup/idempotency table.
4. **H3** — Fix `delete-account` authorization (owner + sole-member gate) and the `query_id`→`search_query_id` bug.
5. **H4** — Durable rate limiter (§5) + add one to `rate-player`.
6. **M1** — Org-scope the `search_results`/`squad_players` lookups in compare & report.
7. **M2** — Move all ratings/scores/`key_metrics` to server-side computation; Claude = prose only, numbers validated against input.
8. **M3** — Enforce `max_seats` on invite; reconcile role vocabulary.
9. **M4** — Hard-fail `MOCK_DATA` in production.
10. **L1/L2** — Derive tier from real price; service-role bypass for `generate-photo`.

---
*End of audit. No source modified, nothing deployed.*
