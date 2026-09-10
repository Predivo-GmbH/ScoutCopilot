# The state of ScoutCopilot — 2026-09-09

Written because Roger said *"I don't even know what's going on there."* Everything below was
checked on 2026-09-09. Where I could not check something, it says so rather than guessing.

## Is it running?

**No — and neither is anything else on that server.** `scoutcopilot.com` resolves to
80.74.145.155 (Metanet) but the connection times out, from this machine AND from a GitHub
runner. Its last three production deploys all failed at the FTP pre-flight step with
`curl exit 28` (timeout), the most recent at 19:34 UTC today.

That is **not a ScoutCopilot fault**. It is the fleet-wide Metanet problem already on the
board as *"Our main web server is refusing every connection"*, owned by another session. When
that clears, ScoutCopilot comes back with everything else.

## Is it selling anything?

**No.**

- Its `fleet_projects` row reads: *"Live with waitlist gate: Stripe pricing & launch pending."*
- The **Predivo GmbH Stripe account has zero subscriptions of any kind** — the Subscriptions
  page shows the "create your first subscription" empty state. Not zero for ScoutCopilot;
  zero full stop.
- The site sits behind a password/waitlist gate, so nobody can reach the product anyway.

**How many people are on the waitlist: UNKNOWN, and I did not fake a number.** The `waitlist`,
`profiles` and `search_queries` tables exist and answer HTTP 200, but only the public anon key
is on this machine, and row-level security makes every count come back 0 — that means "nothing
visible to a stranger", not "nothing there". The real counts need the service-role key, which
lives in GitHub secrets, and I am not extracting a live credential to satisfy curiosity.
Its Supabase project (`rlcsuqwqzoqjykdiqjye`) is also on a Supabase account this browser
session is not signed in to.

The best figure that exists: when somebody with real access read production on **2026-09-02**,
`search_queries` held **38 rows, newest dated 2026-05-05**. Nobody had searched in four months.

## What it costs to just exist

| line | amount | how sure |
|---|---|---|
| Anthropic API | **was ~$1.12/day, now $0** | measured; key disabled today |
| Supabase project | unknown | account not reachable from here |
| Domain + hosting | unknown | shares fleet hosting |

The Anthropic spend was **not** customers. It was our own hourly monitor running real searches,
905 of them in 8 days — $8.38, or 87% of the whole fleet's Claude bill for the period. Fixed
today: the paid checks are off (PR #17) and the `scoutcopilot` API key is **disabled**.

## What still watches it, for free

Every hour: the site loads, login works, the search **page** renders, dashboard and settings
render, public routes are not 404. Everything except actually buying a search.

## What it would take to go either way

**To launch it** — wire Stripe pricing (the one thing its own status line names as missing),
take the waitlist gate down, decide what a search costs us per customer, re-enable the
`scoutcopilot` key, and set `RUN_PAID_SEARCH_CHECKS: '1'` in production-monitor's `monitor.yml`
so the search alarm comes back on.

**To park it properly** — keep the domain and the code, leave the key disabled, drop it from
the hourly monitor entirely so a dead product cannot red the fleet dashboard, and mark its
fleet row `parked` so nothing counts it as a live product again.

**Nothing is decided here.** This page is only what is true today.
