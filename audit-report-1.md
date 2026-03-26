# ScoutCopilot Audit Report — Round 1

**Date:** 2026-03-24
**Stack:** React 19 + Vite 8 + TypeScript 5.9 + Tailwind CSS 4 + Supabase + Stripe + React Router 7 + React Query 5 + Recharts 3
**Theme:** Dark-only
**Dev Server:** http://localhost:5173/

---

## Summary

| Domain | Critical | High | Medium | Low | Info |
|--------|----------|------|--------|-----|------|
| Security | 0 | 2 | 3 | 2 | 2 |
| SEO | 2 | 3 | 2 | 1 | 0 |
| Performance | 2 | 4 | 4 | 1 | 0 |
| Code Quality | 0 | 2 | 1 | 1 | 0 |
| UI Quality | 2 | 3 | 3 | 4 | 0 |
| Accessibility | 0 | 5 | 3 | 4 | 0 |
| Responsiveness | 3 | 4 | 2 | 1 | 0 |
| **Total** | **9** | **23** | **18** | **14** | **2** |

**Actionable (Critical + High + Medium): 50 findings**

---

## Security

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| S1 | High | Unvalidated Stripe redirect URL | PricingPage.tsx:125 |
| S2 | High | Unvalidated billing portal redirect | BillingSettings.tsx:22 |
| S3 | Medium | Missing security headers (.htaccess) | index.html |
| S4 | Medium | Query param validation (AuthVerifyPage) | AuthVerifyPage.tsx:16-28 |
| S5 | Medium | OAuth callback manual hash parsing | AuthCallbackPage.tsx:26-28 |
| S6 | Low | Stripe placeholder price IDs in bundle | stripe.ts:5-18 |
| S7 | Low | No max-length on name input | SignupPage |

## SEO

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| SEO1 | Critical | Missing og:image and twitter:image | index.html |
| SEO2 | Critical | No per-page meta tags (SPA) | All pages |
| SEO3 | High | Missing canonical URL | index.html |
| SEO4 | High | No robots.txt | public/ |
| SEO5 | High | No JSON-LD structured data | index.html |
| SEO6 | Medium | No sitemap.xml | public/ |
| SEO7 | Medium | FAQ heading hierarchy skips h3 | PricingPage.tsx |
| SEO8 | Low | Navigate buttons instead of Links | LandingPage, PricingPage |

## Performance

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| P1 | Critical | Single 631KB JS bundle (170KB gz) | dist/ |
| P2 | Critical | No route-level code splitting | App.tsx |
| P3 | High | Recharts not lazy-loaded | RadarChart.tsx |
| P4 | High | Missing React.memo on sub-components | DashboardPage.tsx |
| P5 | High | Font files not subsetted (79KB) | public/fonts/ |
| P6 | High | AuthContext value not memoized | AuthContext.tsx |
| P7 | Medium | Vite config missing vendor chunks | vite.config.ts |
| P8 | Medium | Sidebar nav items recreated each render | Sidebar.tsx |
| P9 | Medium | Landing page (785 lines) not lazy | LandingPage.tsx |
| P10 | Medium | useCallback inconsistent | Multiple |
| P11 | Low | Tailwind CSS 70KB (already purged) | index.css |

## Code Quality

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| CQ1 | High | Fast Refresh violations (4 files) | Table.tsx, AuthContext.tsx, PlayerSelector.tsx |
| CQ2 | High | Missing useEffect dependency | AuthVerifyPage.tsx:40 |
| CQ3 | Medium | Silent error suppression | AuthContext.tsx:164 |
| CQ4 | Low | 3 TODO placeholders | hooks/ files |

## UI Quality

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| UI1 | Critical | Hardcoded hex colors in charts | RadarChart.tsx, ComparisonPage.tsx, ReportPage.tsx |
| UI2 | Critical | 12+ rounded-full violations | Multiple (auth, dashboard, report, watchlists) |
| UI3 | High | Z-index stacking conflicts (nav vs modal) | Legal pages, PricingPage, LandingPage |
| UI4 | High | Missing focus/hover states | Sidebar, ReportPage, LandingPage |
| UI5 | High | Text contrast (on-surface-variant) needs verification | Multiple |
| UI6 | Medium | Raw HTML input instead of Input component | ComparisonPage.tsx:32-38 |
| UI7 | Medium | Table header no visual distinction | Table.tsx |
| UI8 | Medium | Inconsistent spacing patterns | Multiple |
| UI9 | Low | Skeleton loader no shimmer | Skeleton.tsx |
| UI10 | Low | PercentileBar label truncation | PercentileBar.tsx:23 |
| UI11 | Low | Modal max-height restrictive on mobile | Modal.tsx:110 |
| UI12 | Low | EmptyState icon fixed size | EmptyState.tsx:17 |

## Accessibility

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| A1 | High | Div role="button" instead of <button> | PlayerCard, DashboardPage, LandingPage |
| A2 | High | Icon-only sidebar collapse missing aria-label | Sidebar.tsx:92-96 |
| A3 | High | SVG charts missing aria-hidden/title | ComparisonPage, ReportPage |
| A4 | High | Select error missing aria-describedby | Select.tsx |
| A5 | High | onClick without onKeyDown (nav, FAQ, report) | LandingPage, ReportPage |
| A6 | Medium | Missing nav landmarks | LandingPage:315, PricingPage footer |
| A7 | Medium | No skip-to-content link | AppShell, LandingPage |
| A8 | Medium | LandingPage missing <main> element | LandingPage.tsx:312 |
| A9 | Low | Focus not restored on route change | App.tsx |
| A10 | Low | Tabs lacks arrow-key navigation | Tabs.tsx |
| A11 | Low | Table sortable headers lack keyboard affordance | Table.tsx |
| A12 | Low | Radar charts lack data table alt | ComparisonPage, ReportPage |

## Responsiveness

| # | Severity | Finding | Location |
|---|----------|---------|----------|
| R1 | Critical | OTP input touch targets too small on mobile | OtpInput.tsx:100 |
| R2 | Critical | Settings sidebar fixed width on mobile | SettingsPage.tsx:31 |
| R3 | Critical | Radar charts fixed size, overflow on mobile | ComparisonPage, ReportPage |
| R4 | High | Dashboard table overflow no scroll indicator | DashboardPage.tsx:92 |
| R5 | High | Pricing comparison table too narrow on mobile | PricingPage.tsx:252 |
| R6 | High | Landing hero text no max-width | LandingPage.tsx:373 |
| R7 | High | Trust bar wrapping issues | LandingPage.tsx:405 |
| R8 | Medium | Nav bar touch targets | LandingPage.tsx:322 |
| R9 | Medium | Watchlists grid not xl responsive | WatchlistsPage.tsx:61 |
| R10 | Low | Missing consistent viewport padding | Multiple |

---

## Fix Priority

### Round 1 Focus: All Critical + High + Medium (50 findings)

Many findings overlap across domains (e.g., rounded-full is UI + design rule, chart SVGs affect both accessibility and responsiveness). Fixes will be grouped by file to maximize efficiency.
