# ScoutCopilot — Testing Framework Setup

> Last updated: 2026-04-22

## Overview

A complete testing framework has been set up for ScoutCopilot including:
- **Vitest + jsdom** for unit and component tests
- **Playwright** for E2E and accessibility testing
- **@axe-core/playwright** for WCAG 2.1 AA compliance
- **Feature registry** in `docs/FEATURES.md` for test traceability
- **Feature coverage check** script for CI/CD validation

---

## Installation

Before running tests, install all dev dependencies:

```bash
npm install
```

This installs:
- `vitest` (unit test runner)
- `@vitest/coverage-v8` (coverage reports)
- `jsdom` (DOM simulation for unit tests)
- `@testing-library/react` (component testing utilities)
- `@testing-library/jest-dom` (DOM matchers)
- `@testing-library/user-event` (user interaction simulation)
- `@playwright/test` (E2E test runner)
- `@axe-core/playwright` (accessibility scanning)

---

## Test Scripts

All scripts are defined in `package.json`:

### Unit & Component Tests (Vitest)

```bash
npm test                  # Run all tests once (CI mode)
npm run test:watch       # Watch mode for development
npm run test:ci          # Verbose output for CI systems
npm run test:coverage    # Generate coverage report
```

Coverage reports are generated in `coverage/` directory (HTML, JSON, LCOV).

**Target thresholds:** 30% minimum (statements, branches, functions, lines)

### E2E Tests (Playwright)

```bash
npm run test:e2e         # Run all E2E tests (headless)
npm run test:e2e:ui      # Open Playwright Inspector UI
npm run test:a11y        # Accessibility tests only
npm run test:features    # Feature-specific tests only
```

E2E tests run against a live dev server (auto-started).

### Feature Coverage Check

```bash
node scripts/check-feature-coverage.mjs
```

Validates that every "implemented" feature in `docs/FEATURES.md` has at least one test file listed.

---

## File Structure

```
ScoutCopilot/
├── vitest.config.ts                 # Unit test config
├── playwright.config.ts             # E2E test config
├── src/
│   └── test/
│       ├── setup.ts                 # Test environment setup (@testing-library/jest-dom)
│       ├── LoginPage.test.tsx        # Example component test
│       ├── SearchEdgeFunction.test.ts
│       └── ...
├── e2e/
│   ├── smoke.spec.ts               # Route loading + console error check
│   ├── accessibility.spec.ts        # WCAG 2.1 AA compliance
│   ├── features.spec.ts             # Feature-specific user journeys
│   └── screenshots/                 # Baseline screenshots (auto-generated)
├── docs/
│   ├── FEATURES.md                  # Complete feature registry (F-001 through F-092)
│   ├── TESTING.md                   # This file
│   └── PROJECT_SCOPE.md             # Project requirements & constraints
└── scripts/
    └── check-feature-coverage.mjs   # CI validation script
```

---

## Feature Registry (docs/FEATURES.md)

Complete listing of all 52 features with:
- **Feature ID:** F-001 through F-092
- **Route:** URL path
- **Components:** React components involved
- **Description:** What the feature does
- **DB Tables:** Database tables accessed
- **Edge Functions:** Supabase Edge Functions called
- **Critical Assertions:** Test points (for reference)
- **Status:** "implemented" (all features are live)
- **Test Files:** File paths to unit/E2E/integration tests

### Feature Categories

| ID Range | Category | Count |
|----------|----------|-------|
| F-001–005 | Public Features | 5 |
| F-010–016 | Authentication | 7 |
| F-020–021 | Dashboard | 2 |
| F-030–033 | Search & Reports | 4 |
| F-040 | Squad Management | 1 |
| F-050 | Watchlists | 1 |
| F-060–065 | Settings & Account | 6 |
| F-070–072 | Billing & Payments | 3 |
| F-080–081 | Internationalization | 2 |
| F-090–092 | Infrastructure & SEO | 3 |
| Edge Functions | (14 functions) | 14 |

---

## Smoke Tests (e2e/smoke.spec.ts)

Tests route loading and console error detection.

**Coverage:**
- All 8 public routes load without errors
- All 9 protected routes redirect unauthenticated users to auth
- Language support (EN + DE)
- 404 handling

**Run:**
```bash
npm run test:e2e
```

**Example routes tested:**
- `/en/` (landing)
- `/en/login` (public)
- `/en/dashboard` (protected, redirects)
- `/de/login` (German)

---

## Accessibility Tests (e2e/accessibility.spec.ts)

WCAG 2.1 AA compliance scanning using @axe-core/playwright.

**Coverage:**
- No critical/serious violations on all public routes
- Desktop and mobile viewports (375×812px)
- Keyboard navigation
- Touch target sizes (44px minimum on mobile)
- Color contrast
- Form accessibility

**Disabled rules (project-specific):**
- `region` — Not all pages use landmark regions
- `bypass` — Link to main content not always needed

**Run:**
```bash
npm run test:a11y
```

**Example test:**
```
✓ accessibility — landing (0 violations)
✓ accessibility — login (0 violations)
✓ accessibility — pricing (0 violations)
```

---

## Feature Tests (e2e/features.spec.ts)

User journey tests mapped to Feature IDs from `docs/FEATURES.md`.

**Pattern:**
```typescript
test.describe('F-001: Landing Page', () => {
  test('displays hero section with CTA', async ({ page }) => {
    await page.goto('/en/')
    // ... assertions
  })
})
```

**Current tests:**
- F-001: Landing page hero, features, FAQ
- F-002: Pricing tiers, toggle
- F-010: Login form validation, OTP
- F-011: Signup form validation
- F-012: Forgot password
- F-080: Language routing (EN/DE)
- F-090: SEO meta tags
- F-092: Password gate
- Protected routes: Auth redirects

**Run:**
```bash
npm run test:e2e
npm run test:features
```

---

## Unit & Component Tests (Vitest)

Write tests for React components and utility functions.

**Setup:** `src/test/setup.ts` imports `@testing-library/jest-dom/vitest` for DOM matchers.

**Example structure:**
```typescript
// src/features/search/SearchPage.test.tsx
import { render, screen } from '@testing-library/react'
import { SearchPage } from './SearchPage'

describe('SearchPage', () => {
  test('renders search form', () => {
    render(<SearchPage />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
  })
})
```

**Naming convention:**
- `src/**/*.test.tsx` for component tests
- `src/**/*.test.ts` for utility tests

**Run:**
```bash
npm test                  # Run all tests once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

---

## Integration Tests

For edge function tests, create files like:
```
src/test/SearchEdgeFunction.test.ts
src/test/CheckoutFlow.test.tsx
src/test/StripeWebhooks.test.ts
```

These can mock Supabase client or use test databases.

---

## Configuration Details

### vitest.config.ts

```typescript
{
  globals: true,              // Use global describe/test/expect
  environment: 'jsdom',       // Browser-like DOM
  setupFiles: ['./src/test/setup.ts'],
  include: ['src/**/*.test.{ts,tsx}'],
  coverage: {
    provider: 'v8',
    reporters: ['text', 'json', 'html', 'lcov'],
    statements: 30,           // Minimum 30%
    branches: 30,
    functions: 30,
    lines: 30,
  }
}
```

### playwright.config.ts

```typescript
{
  testDir: './e2e',
  baseURL: 'http://localhost:5173',
  projects: [
    { name: 'chromium', ... },
    { name: 'mobile', use: devices['Pixel 5'] }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  }
}
```

---

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/test.yml`:

```yaml
name: Tests
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
      - run: npm run test:coverage
      - run: node scripts/check-feature-coverage.mjs

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

### Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
npm test
node scripts/check-feature-coverage.mjs
```

---

## Writing Tests

### Component Test Example

```typescript
// src/features/search/SearchPage.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchPage } from './SearchPage'

describe('SearchPage (F-030)', () => {
  test('accepts natural language query', async () => {
    const user = userEvent.setup()
    render(<SearchPage />)

    const input = screen.getByPlaceholderText(/Search players/i)
    await user.type(input, 'fast left-back under 23')

    const submitButton = screen.getByRole('button', { name: /search/i })
    expect(submitButton).toBeEnabled()
  })

  test('displays results after submit', async () => {
    render(<SearchPage />)
    // ... test result rendering
  })
})
```

### E2E Test Example

```typescript
// e2e/features.spec.ts
test.describe('F-030: AI Player Search', () => {
  test('search form loads and accepts input', async ({ page }) => {
    await page.goto('/en/search')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('fast left-back')

    const submitButton = page.locator('button:has-text(/Search/i)')
    await submitButton.click()

    await page.waitForLoadState('networkidle')
    await expect(page.locator('table')).toBeVisible()
  })
})
```

---

## Coverage Goals

- **Unit tests:** 80%+ coverage of utility functions, hooks
- **Component tests:** 70%+ coverage of shared components
- **E2E smoke tests:** 100% of public routes
- **E2E feature tests:** Critical user journeys (search, reports, billing)
- **Accessibility tests:** 100% of public routes (WCAG 2.1 AA)

---

## Debugging Tests

### Vitest

```bash
npm run test:watch              # Watch mode with re-run on change
npm run test -- --reporter=verbose
npm run test -- src/test/LoginPage.test.tsx  # Single test file
```

### Playwright

```bash
npm run test:e2e:ui             # Interactive Playwright Inspector
npx playwright test --debug     # Debug mode with breakpoints
npx playwright codegen http://localhost:5173  # Record user actions
npx playwright test --headed    # Show browser window
```

---

## Known Issues & Limitations

1. **Protected routes** in E2E tests will redirect to `/en/login`. To test authenticated features, create test sessions or use magic link authentication in tests.

2. **Screenshot mode** may require setting `VITE_SCREENSHOT_MODE=true` environment variable for full-page capture.

3. **Rate-limited edge functions** (search, report, compare) may fail in rapid test execution. Consider adding `test.slow()` or increasing timeouts.

4. **Database state** — E2E tests that create records should clean up after (delete created entities). Consider using database transactions for test isolation.

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/)
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WCAG 2.1 AA Compliance](https://www.w3.org/WAI/WCAG21/quickref/)
- [Feature Registry](./FEATURES.md)

---

## Next Steps

1. **Run smoke tests:** `npm run test:e2e` to verify setup
2. **Write unit tests** for hooks and utility functions
3. **Add component tests** for shared UI components
4. **Implement feature tests** for critical user journeys
5. **Monitor coverage:** `npm run test:coverage` generates HTML report
6. **CI/CD:** Add test.yml workflow to GitHub Actions
7. **Pre-commit:** Add test script to Husky hooks

---

## Support

For questions on specific features, see `docs/FEATURES.md` for component, route, and edge function details.

For PROJECT_SCOPE, data architecture, and constraints, see `docs/PROJECT_SCOPE.md`.
