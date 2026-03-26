import { test } from '@playwright/test'

const BASE = 'http://localhost:5199'

test('screenshot all authenticated pages', async ({ page }) => {
  // Bypass PasswordGate
  await page.goto(BASE)
  await page.evaluate(() => {
    sessionStorage.setItem('scoutcopilot-unlocked', 'true')
  })

  const pages = [
    { name: 'dashboard', path: '/dashboard?_screenshot' },
    { name: 'search', path: '/search?_screenshot' },
    { name: 'search-results', path: '/search?_screenshot&q=left-backs+under+23' },
    { name: 'report', path: '/report/p1?_screenshot' },
    { name: 'compare', path: '/compare?_screenshot' },
    { name: 'watchlists', path: '/watchlists?_screenshot' },
  ]

  for (const p of pages) {
    await page.goto(`${BASE}${p.path}`)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: `e2e/screenshots/${p.name}.png`, fullPage: true })
    console.log(`Screenshot: ${p.name} at ${page.url()}`)
  }
})
