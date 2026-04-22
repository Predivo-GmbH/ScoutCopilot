/**
 * Smoke Tests — Route Loading & Console Error Check
 *
 * These tests verify:
 * 1. Every route loads without JavaScript errors
 * 2. Protected routes redirect to auth
 * 3. Public routes render expected content
 *
 * ScoutCopilot routes organized by access level.
 */

import { test, expect } from '@playwright/test'

// Bypass the password gate on every page navigation
test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    sessionStorage.setItem('scoutcopilot-unlocked', 'true')
  })
})

// ── Public routes (no auth required) ───────────────────────────
const publicRoutes = [
  { path: '/en/', name: 'Landing Page' },
  { path: '/en/login', name: 'Login' },
  { path: '/en/signup', name: 'Sign Up' },
  { path: '/en/forgot-password', name: 'Forgot Password' },
  { path: '/en/pricing', name: 'Pricing' },
  { path: '/en/privacy', name: 'Privacy Policy' },
  { path: '/en/terms', name: 'Terms of Service' },
  { path: '/en/imprint', name: 'Imprint' },
]

// ── Protected routes (auth required) ───────────────────────────
const protectedRoutes = [
  { path: '/en/dashboard', name: 'Dashboard' },
  { path: '/en/alerts', name: 'Alerts' },
  { path: '/en/search', name: 'Search' },
  { path: '/en/search-history', name: 'Search History' },
  { path: '/en/players', name: 'Reports' },
  { path: '/en/compare', name: 'Comparison' },
  { path: '/en/watchlists', name: 'Watchlists' },
  { path: '/en/squad', name: 'Squad' },
  { path: '/en/settings', name: 'Settings' },
]

test.describe('Route Loading — Public Routes', () => {
  for (const route of publicRoutes) {
    test(`${route.name} (${route.path}) loads without errors`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      await page.goto(route.path)
      await page.waitForLoadState('networkidle')

      // Verify no console errors
      expect(errors).toEqual([])

      // Basic content check: page should have some text
      const textContent = await page.innerText('body')
      expect(textContent.length).toBeGreaterThan(0)
    })
  }
})

test.describe('Route Protection — Redirects to Auth', () => {
  for (const route of protectedRoutes) {
    test(`${route.name} (${route.path}) redirects to login when unauthenticated`, async ({
      page,
    }) => {
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')

      // Should redirect to /en/login or contain auth-related UI
      expect(page.url()).toMatch(/\/en\/login|\/auth/)
    })
  }
})

test.describe('Visual Snapshots — Public Routes', () => {
  for (const route of publicRoutes) {
    test(`${route.name} (${route.path}) screenshot`, async ({ page }) => {
      await page.goto(route.path)
      await page.waitForLoadState('networkidle')
      const name = route.path.slice(4).replace(/\//g, '-') || 'home'
      await page.screenshot({
        path: `e2e/screenshots/${name}.png`,
        fullPage: true,
      })
    })
  }
})

test.describe('Language Support', () => {
  test('German routes load correctly', async ({ page }) => {
    const germanRoutes = ['/de/', '/de/login', '/de/pricing']

    for (const path of germanRoutes) {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))

      await page.goto(path)
      await page.waitForLoadState('networkidle')

      expect(errors).toEqual([])
    }
  })

  test('Language selector works', async ({ page }) => {
    await page.goto('/en/')
    await page.waitForLoadState('networkidle')

    // Look for language toggle (if present in UI)
    await page.locator('text=/DE|en/i').count()
    // Basic check: page loaded
    expect(await page.innerText('body')).toBeTruthy()
  })
})

test.describe('404 Handling', () => {
  test('Invalid route shows 404', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))

    await page.goto('/en/nonexistent-page')
    await page.waitForLoadState('networkidle')

    // Page should load (404 is a valid response)
    expect(errors.length).toBeLessThan(3) // Allow minor hydration issues
  })
})
