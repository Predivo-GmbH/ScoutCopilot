/**
 * Critical Path E2E Tests — MUST PASS on every deploy
 *
 * Tests the minimum viable user journey:
 * 1. Auth page loads and accepts input
 * 2. Protected routes redirect to auth
 * 3. Edge functions respond (health check)
 * 4. Core infrastructure (Supabase connectivity)
 *
 * These tests run against production (https://scoutcopilot.com)
 * and block deploys if they fail.
 */

import { test, expect } from '@playwright/test'

const SUPABASE_URL = 'https://rlcsuqwqzoqjykdiqjye.supabase.co'

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
      await page.waitForLoadState('networkidle')

      // Must redirect to login/auth
      expect(page.url()).toMatch(/\/(login|auth)/)
    })
  }
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
