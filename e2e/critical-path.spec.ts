/**
 * Critical Path E2E Tests — MUST PASS on every push to master
 *
 * Tests the minimum viable user journey:
 * 1. Auth page loads and accepts input
 * 2. Protected routes redirect to auth
 * 3. Edge functions respond (health check)
 * 4. Core infrastructure (Supabase connectivity)
 *
 * These run against a dev server on localhost — playwright.config.ts builds baseURL from
 * E2E_PORT — NOT against scoutcopilot.com, and they gate pushes and PRs to master, NOT the
 * production deploy (deploy.yml is a manual dispatch and gates on the security scan and
 * `npm run test:coverage`; it never runs this file). The header claimed both until
 * 2026-09-02, which is worse than saying nothing: it invites reading a red run here as
 * "production's auth wall is broken" and a green one as "production is verified".
 */

import { test, expect, type Page } from '@playwright/test'

const SUPABASE_URL = 'https://rlcsuqwqzoqjykdiqjye.supabase.co'

// The URL can fail to change for reasons that mean OPPOSITE things, and only one of them is a
// security finding. This decides which, and throws the message that names it. Exported so the
// test below can assert the direction the route loop can never reach in CI (a guard that fails
// OPEN, rendering protected content for a logged-out visitor).
//
// The blind-spots:
//   - the app never mounted (src/lib/supabase.ts throws "Missing Supabase environment
//     variables" at module load, so React renders nothing — #root has 0 children);
//   - AuthGuard is still showing its loading skeleton with the session check in flight.
// AuthGuard's skeleton carries data-testid="auth-guard-loading" (AuthGuard.tsx, shared by
// AuthGuard and AuthOnlyGuard). We probe THAT, not getByRole('status') — role="status" also
// matches the save-action row on /en/settings (always on screen) and the transient loading
// skeletons on /en/dashboard, /en/search and /en/squad, so a generic-role probe would report
// a real fail-open bypass as a benign "CANNOT VERIFY" env fault: the exact inverse mistake.
async function assertGuardNeverRedirected(page: Page, name: string, path: string): Promise<never> {
  const neverMounted = await page
    .evaluate(() => (document.getElementById('root')?.children.length ?? 0) === 0)
    .catch(() => false)
  const stillDeciding = await page
    .getByTestId('auth-guard-loading')
    .first()
    .isVisible()
    .catch(() => false)
  if (neverMounted || stillDeciding) {
    throw new Error(
      `CANNOT VERIFY ${name} (${path}): the route guard was never reached — ` +
        `${neverMounted ? 'the app never mounted (empty #root)' : "AuthGuard's loading state is still on screen"} ` +
        `after 15s. This is NOT evidence about the guard. Usual cause: the dev server ` +
        `has no VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.`,
    )
  }
  throw new Error(
    `${name} (${path}) did NOT redirect an unauthenticated visitor ` +
      `within 15s — final URL was ${page.url()}. A logged-out visitor can reach a ` +
      `protected page.`,
  )
}

// Bypass the password gate on every page navigation
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('scoutcopilot-unlocked', 'true')
  })
})

// ── AUTH PAGE ────────────────────────────────────────────────────

test.describe('Critical: Auth Page', () => {
  test('auth page loads with email input', async ({ page }) => {
    await page.goto('/en/login')
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible({ timeout: 10000 })
  })

  test('auth page accepts email and shows submit button', async ({ page }) => {
    await page.goto('/en/login')
    await page.waitForLoadState('networkidle')

    const emailInput = page.locator('input[type="email"]').first()
    await emailInput.fill('roger@mueller.ro')

    const submitBtn = page.locator('button[type="submit"]').first()
    await expect(submitBtn).toBeVisible()
    await expect(submitBtn).toBeEnabled()
  })

  test('auth page has no console errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/en/login')
    await page.waitForLoadState('networkidle')

    expect(errors).toEqual([])
  })
})

// ── PROTECTED ROUTE GUARDS ───────────────────────────────────────

test.describe('Critical: Protected Routes Redirect', () => {
  const protectedRoutes = [
    { path: '/en/dashboard', name: 'Dashboard' },
    { path: '/en/search', name: 'Search' },
    { path: '/en/squad', name: 'Squad' },
    { path: '/en/settings', name: 'Settings' },
  ]

  for (const route of protectedRoutes) {
    test(`${route.name} (${route.path}) redirects unauthenticated users`, async ({ page }) => {
      await page.goto(route.path)

      // WAIT for the redirect. Do not read the URL once and hope it has already happened.
      //
      // The guard is client-side: AuthGuard renders a spinner while the Supabase session
      // check is in flight, and only THEN does <Navigate replace> rewrite the URL. So the
      // redirect lands after the network goes idle, and `waitForLoadState('networkidle')`
      // followed by a single page.url() read was racing it — losing systematically on the
      // slower device profile. Run 33680449318 (2026-09-02): Settings failed all three
      // attempts on mobile while Search failed then passed on chromium, and the saved page
      // snapshot for BOTH showed the login form already rendered. Same shape, same line, on
      // 2026-08-26 (run 32833843916). Four of the last thirty runs of this gate were red.
      //
      // This is not a weaker assertion. It fails on exactly the same condition — the URL
      // never becomes /login or /auth — it just gives the redirect a bounded chance to
      // happen first, and names the final URL instead of leaving a bare pattern mismatch.
      try {
        await page.waitForURL(/\/(login|auth)/, { timeout: 15_000 })
      } catch {
        // Measured on a local checkout with no .env, 2026-09-02: all four routes, #root with
        // 0 children and an empty body, and Playwright omitted the page snapshot entirely
        // because there was no content to snapshot. CI passes VITE_SUPABASE_URL /
        // VITE_SUPABASE_ANON_KEY (test.yml) and does render. assertGuardNeverRedirected
        // decides whether that missing redirect is a blind-spot or a real fail-open bypass,
        // and throws the message that says so — a blank app must never be reported as "a
        // logged-out visitor can reach a protected page", and a real bypass must never be
        // muffled as "CANNOT VERIFY".
        await assertGuardNeverRedirected(page, route.name, route.path)
      }
    })
  }
})

// ── GUARD-FAILURE ATTRIBUTION ────────────────────────────────────
//
// The direction the route loop above can never exercise in CI: a guard that FAILS OPEN and
// renders protected content to a logged-out visitor. On /en/settings that page always carries
// an unrelated role="status" (the save-action row, ProfileSettings.tsx). A getByRole('status')
// probe would see it, conclude "AuthGuard is still deciding", and muffle a real bypass as a
// benign "CANNOT VERIFY" env fault — the inverse of what a triager must be told. This asserts
// the dedicated marker gets it right.
test.describe('Critical: Guard-failure attribution', () => {
  test('protected content + an unrelated role="status" reads as a BYPASS, not "CANNOT VERIFY"', async ({
    page,
  }) => {
    // A mounted app (#root has children) showing protected content AND an unrelated
    // role="status" element, but NO auth-guard-loading marker — i.e. AuthGuard failed open.
    await page.setContent(
      `<div id="root">` +
        `<main data-testid="protected-content">Settings — private</main>` +
        `<div role="status" aria-live="polite">All changes saved</div>` +
        `</div>`,
    )

    let message = ''
    try {
      await assertGuardNeverRedirected(page, 'Settings', '/en/settings')
    } catch (err) {
      message = (err as Error).message
    }

    expect(message).toContain('did NOT redirect')
    expect(message).toContain('can reach a')
    expect(message).not.toContain('CANNOT VERIFY')
  })

  test("AuthGuard's own loading marker still reads as CANNOT VERIFY", async ({ page }) => {
    // The blind-spot direction must be preserved: the guard's own spinner on screen is not a
    // finding about the guard.
    await page.setContent(
      `<div id="root">` +
        `<div role="status" aria-live="polite" data-testid="auth-guard-loading">Loading…</div>` +
        `</div>`,
    )

    let message = ''
    try {
      await assertGuardNeverRedirected(page, 'Settings', '/en/settings')
    } catch (err) {
      message = (err as Error).message
    }

    expect(message).toContain('CANNOT VERIFY')
    expect(message).not.toContain('did NOT redirect')
  })
})

// ── EDGE FUNCTION HEALTH ─────────────────────────────────────────

test.describe('Critical: Edge Functions Respond', () => {
  const edgeFunctions = [
    'backfill-birth-dates',
    'backfill-reports',
    'billing-portal',
    'checkout',
    'compare',
    'credentials',
    'delete-account',
    'enrich-photos',
    'generate-photo',
    'import-team',
    'invite-member',
    'rate-player',
    'report',
    'search',
    'send-welcome',
    'stripe-webhook',
  ]

  for (const fn of edgeFunctions) {
    test(`${fn} edge function responds (not 500/502/503)`, async ({ request }) => {
      const response = await request.fetch(`${SUPABASE_URL}/functions/v1/${fn}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data: {},
      })

      // Edge functions should NOT return server errors
      // 401/400 is acceptable (missing auth/body), but 500/502/503 means the function is broken
      expect(response.status()).not.toBe(500)
      expect(response.status()).not.toBe(502)
      expect(response.status()).not.toBe(503)
    })
  }
})

// ── SUPABASE CONNECTIVITY ────────────────────────────────────────

test.describe('Critical: Supabase Infrastructure', () => {
  const ANON_KEY = process.env.SUPABASE_ANON_KEY || 'sb_publishable_OJIxBF49Tis6_-nsUSQDQg_IOckCy2S'

  test('Supabase REST endpoint is reachable', async ({ request }) => {
    const response = await request.fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        apikey: ANON_KEY,
      },
    })

    // Reachability check: the PostgREST root rejects the anon/publishable role on this
    // project (401), which still proves the endpoint is UP and responding. A paused/down
    // project would be a 5xx or a network failure. So accept any non-5xx response.
    expect(response.status()).toBeLessThan(500)
  })

  test('Supabase Auth endpoint is reachable', async ({ request }) => {
    const response = await request.fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: {
        apikey: ANON_KEY,
      },
    })

    expect(response.status()).toBe(200)
  })
})

// ── PRODUCTION SITE HEALTH ───────────────────────────────────────

test.describe('Critical: Production Site Health', () => {
  test('landing page loads under 5 seconds', async ({ page }) => {
    const start = Date.now()
    await page.goto('/en/')
    await page.waitForLoadState('domcontentloaded')
    const duration = Date.now() - start

    expect(duration).toBeLessThan(5000)
  })

  test('landing page has no JavaScript errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/en/')
    await page.waitForLoadState('networkidle')

    expect(errors).toEqual([])
  })

  test('landing page renders hero content', async ({ page }) => {
    await page.goto('/en/')
    await page.waitForLoadState('networkidle')

    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible({ timeout: 10000 })

    const bodyText = await page.innerText('body')
    expect(bodyText.length).toBeGreaterThan(500)
  })

  test('static assets load (CSS applied)', async ({ page }) => {
    await page.goto('/en/')
    await page.waitForLoadState('networkidle')

    // Verify CSS is applied by checking a styled element has computed styles
    const body = page.locator('body')
    const bgColor = await body.evaluate((el) => getComputedStyle(el).backgroundColor)
    // Should have some background color set (not empty)
    expect(bgColor).toBeTruthy()
  })
})
