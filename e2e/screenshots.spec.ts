import { test, expect } from '@playwright/test'

const pages = [
  { name: 'dashboard', path: '/en/dashboard' },
  { name: 'search', path: '/en/search' },
  { name: 'players', path: '/en/players' },
  { name: 'player-detail', path: '/en/players/p1' },
  { name: 'compare', path: '/en/compare' },
  { name: 'watchlists', path: '/en/watchlists' },
  { name: 'squad', path: '/en/squad' },
  { name: 'settings', path: '/en/settings' },
]

test('screenshot all authenticated pages', async ({ page }) => {
  for (const p of pages) {
    await page.goto(p.path)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1500)

    // Verify we're not on the login page
    expect(page.url()).not.toContain('/login')

    await page.screenshot({ path: `e2e/screenshots/${p.name}.png`, fullPage: true })
    console.log(`Screenshot: ${p.name} at ${page.url()}`)
  }
})
