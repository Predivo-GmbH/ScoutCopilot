import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:5174';
const DIR = './test-screenshots';
mkdirSync(DIR, { recursive: true });

const publicPages = [
  ['01-landing-top', '/'],
  ['02-landing-mid', '/', { scrollTo: 1200 }],
  ['03-landing-roi', '/', { scrollTo: 2400 }],
  ['04-landing-pricing', '/', { scrollTo: 3600 }],
  ['05-landing-faq', '/', { scrollTo: 4800 }],
  ['06-landing-footer', '/', { scrollToBottom: true }],
  ['07-pricing-top', '/pricing'],
  ['08-pricing-bottom', '/pricing', { scrollToBottom: true }],
  ['09-login', '/login'],
  ['10-signup', '/signup'],
  ['11-forgot-password', '/forgot-password'],
  ['12-privacy', '/privacy'],
  ['13-terms', '/terms'],
  ['14-imprint', '/imprint'],
];

const authPages = [
  ['15-dashboard', '/dashboard'],
  ['16-dashboard-bottom', '/dashboard', { scrollToBottom: true }],
  ['17-search', '/search'],
  ['18-search-history', '/search/history'],
  ['19-reports', '/reports'],
  ['20-watchlists', '/watchlists'],
  ['21-squad', '/squad'],
  ['22-squad-bottom', '/squad', { scrollToBottom: true }],
  ['23-comparison', '/comparison'],
  ['24-settings', '/settings'],
  ['25-alerts', '/alerts'],
];

async function screenshotPage(context, name, path, opts = {}) {
  const page = await context.newPage();
  try {
    // Set sessionStorage to bypass password gate
    await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
    await page.evaluate(() => {
      sessionStorage.setItem('scoutcopilot-unlocked', 'true');
    });
    // Reload to get past the gate
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(500);

    if (opts.scrollTo) {
      await page.evaluate((y) => window.scrollTo(0, y), opts.scrollTo);
      await page.waitForTimeout(300);
    } else if (opts.scrollToBottom) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
    }

    await page.screenshot({ path: `${DIR}/${name}.png`, fullPage: false });
    console.log(`✓ ${name}`);
  } catch (e) {
    console.log(`✗ ${name}: ${e.message.split('\n')[0]}`);
  }
  await page.close();
}

(async () => {
  const browser = await chromium.launch();

  // Public pages (no auth needed, but still need password gate bypass)
  const pubCtx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    colorScheme: 'dark',
  });

  for (const [name, path, opts] of publicPages) {
    await screenshotPage(pubCtx, name, path, opts);
  }
  await pubCtx.close();

  // Auth pages
  const authCtx = await browser.newContext({
    viewport: { width: 430, height: 932 },
    colorScheme: 'dark',
  });

  for (const [name, path, opts] of authPages) {
    await screenshotPage(authCtx, name, path, opts);
  }
  await authCtx.close();

  await browser.close();
  console.log('\nAll screenshots complete.');
})();
