import { defineConfig, devices } from '@playwright/test'

// The dev-server port used to be hardcoded to 5173 in three places. That is safe on
// GitHub's throwaway runners - one VM per job - but our self-hosted host runs 24 runners
// for 14 repos in ONE network namespace, so two Vite e2e suites that overlap fight over
// the port. Both failure modes were live on 2026-08-25: ReplyFlow got "5173 is already
// used", and ScoutCopilot got ERR_CONNECTION_REFUSED because Vite quietly moved to 5174
// while Playwright kept polling 5173. CI hands us a free port; 5173 stays the local default.
const PORT = process.env.E2E_PORT || '5173'
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: process.env.CI ? [['./e2e/strip-runner-artifacts.reporter.ts'], ['html']] : 'html',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    // --strictPort: without it Vite silently falls back to the next free port and
    // Playwright waits on a URL nothing is listening on.
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
