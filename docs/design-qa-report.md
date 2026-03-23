# ScoutCopilot Design QA Report
**Date:** 2026-03-23
**Reviewers:** Typography, Layout & Spacing, Visual Consistency (3 parallel agents)
**Files reviewed:** 11 app screens + brand book + landing page reference

---

## Executive Summary

**Brand book is the only fully compliant file.** All 11 Stitch-generated app screens fail QA. This is expected — Stitch generates creative references, not production code. These screens serve as **visual direction** for implementation, where all issues below will be corrected.

### Critical Issues (P0): 10
### Major Issues (P1): 19
### Minor Issues (P2): 15

---

## P0 — Critical Issues (fix during implementation)

| # | Issue | Files Affected | Source |
|---|---|---|---|
| C-1 | **Wrong icon library**: Material Symbols used everywhere; spec mandates **Lucide** | ALL 11 screens | Visual |
| C-2 | **`primary` token semantic inversion**: `primary: #B4C5FF` (light) instead of `#2563EB` in all Tailwind configs | ALL 11 screens | Visual |
| C-3 | **Space Grotesk font** loaded and used for headlines — only Inter + JetBrains Mono allowed | player-report, player-comparison, watchlists | Typography |
| C-4 | **JetBrains Mono not loaded** — mono font missing entirely | login, onboarding | Typography |
| C-5 | **AI-generated stock photos** (`lh3.googleusercontent.com/aida-public/`) used as player/user images | 7/11 screens | Visual |
| C-6 | **`shadow-2xl`** on PDF preview paper — shadows explicitly prohibited | pdf-export | Layout |
| C-7 | **Pill-shaped elements** (`rounded-full` / `9999px`) on toggles, badges, progress bars | ALL screens | Layout |
| C-8 | **"AI Intelligence Search" header with sparkle icon** — direct anti-slop violation | player-search | Visual |
| C-9 | **Broken table DOM**: comparison data rendered outside `<table>` structure | player-comparison | Visual + Layout |
| C-10 | **Tertiary token inconsistent**: maps to grey, green, or amber depending on file | player-report, pdf-export, pricing | Visual |

---

## P1 — Major Issues (address during implementation)

| # | Issue | Files Affected |
|---|---|---|
| M-1 | **Sidebar active indicator inconsistent**: 3 patterns (border-l-4, border-r-4, solid bg-fill) | ALL sidebar screens |
| M-2 | **Sidebar nav order/icons differ** between screens; pdf-export missing 3 items + has non-existent "Analytics" | ALL sidebar screens |
| M-3 | **Logo font/color inconsistent** across sidebar screens | ALL sidebar screens |
| M-4 | **`max-w-7xl` (1344px)** used instead of spec `max-w-[1280px]` | ALL screens |
| M-5 | **Container borders use opacity** (`/10`, `/15`, `/20`) instead of full `#434655` | ALL screens except pricing + landing |
| M-6 | **Card padding varies** (16-40px) instead of consistent 24px | 9/11 screens |
| M-7 | **h1/display letter-spacing over-tightened**: `-0.05em` used vs spec `-0.02em` / `-0.01em` | 8/11 screens |
| M-8 | **label-sm font-weight**: 700 used everywhere, spec says 500 | 7/11 screens |
| M-9 | **Off-token Tailwind colors** (`text-slate-*`, `text-blue-*`, `text-red-*`) bypassing design token system | player-search, watchlists, settings, landing |
| M-10 | **Settings inactive nav text** uses `text-[#434655]` (border color) — ~2.1:1 contrast ratio, fails WCAG | settings |
| M-11 | **No 96px section padding** on app screens (most use 32px) | 9/11 screens |
| M-12 | **Unauthorized glassmorphism** on pdf-export top bar (only allowed for hover menus) | pdf-export |
| M-13 | **`hover:bg-blue-700`** and other hardcoded hover colors instead of token references | pricing, landing |
| M-14 | **Mono font misapplied** to non-data prose (form labels, breadcrumbs, strengths list) | signup, settings, pdf-export |
| M-15 | **Error/alert colors** use `text-red-500` (`#EF4444`) instead of token `error` (`#FFB4AB`) | watchlists |
| M-16 | **Onboarding main card has no border** — token spec requires `1px solid #434655` | onboarding |
| M-17 | **Non-standard `rounded-ROUND_SIX` custom key** in Tailwind config | player-search |
| M-18 | **Radar chart in pdf-export** is an `<img>` (stock image) not SVG data visualization | pdf-export |
| M-19 | **`#1B253D` color** used in settings — not a defined design token | settings |

---

## P2 — Minor Issues (polish during implementation)

| # | Issue | Files |
|---|---|---|
| m-1 | `py-2.5` (10px) used — not a 4px multiple | player-search, settings, pdf-export |
| m-2 | Sub-caption `text-[9px]` below minimum 11px token | player-comparison, watchlists, pdf-export |
| m-3 | Duplicate Material Symbols `<link>` tags loaded twice | ALL screens |
| m-4 | Technical label names (`USER_LEGAL_NAME`, `ACCESS_KEY`) in signup | signup |
| m-5 | Wrong Microsoft SSO icon (`window` / `terminal`) | login, signup |
| m-6 | Decorative terminal ASCII art block | onboarding |
| m-7 | `border-outline-variant/10` through `/20` should be documented if intentional | Multiple |
| m-8 | Watchlist card grid gap `gap-4` (16px) vs spec 24px | watchlists |
| m-9 | Inline `font-['Inter']` instead of token class `font-headline` | Multiple |
| m-10 | Notification dot color `bg-tertiary-container` nearly invisible | dashboard |
| m-11 | Fixed footer overlaps content on short viewports | signup, onboarding |
| m-12 | `text-amber-500` / `text-emerald-500` instead of token classes | player-comparison, watchlists |
| m-13 | Hero heading `text-7xl` (4.5rem) exceeds display-lg token max (3.5rem) | landing |
| m-14 | h2/h3/h4 weights generally 700 where tokens specify 600 | Multiple |
| m-15 | Avatar circles use `rounded-full` (document exception or enforce 6px) | Multiple |

---

## File Compliance Scorecard

| File | Typography | Layout | Visual | Overall |
|---|---|---|---|---|
| **brand-book.html** | PASS | PASS | PASS | **A — REFERENCE** |
| stitch-landing-v14 | FAIL (2M) | FAIL (1C, 1M) | FAIL (2M) | B- |
| pricing.html | FAIL (2M) | FAIL (1C, 2M) | FAIL (2C, 2M) | C |
| signup.html | FAIL (2M) | FAIL (3M) | FAIL (1C, 3M) | C- |
| onboarding.html | FAIL (2C, 2M) | FAIL (1C, 4M) | FAIL (1C, 2M) | D+ |
| dashboard.html | FAIL (1M) | FAIL (1C, 4M) | FAIL (2C, 4M) | D |
| login.html | FAIL (1C, 2M) | FAIL (1C, 4M) | FAIL (1C, 4M) | D |
| settings.html | FAIL (2M) | FAIL (2C, 4M) | FAIL (2C, 5M) | D |
| player-search.html | FAIL (3M) | FAIL (2C, 4M) | FAIL (3C, 5M) | D- |
| player-report.html | FAIL (1C, 1M) | FAIL (3C, 3M) | FAIL (3C, 3M) | D- |
| player-comparison.html | FAIL (1C, 2M) | FAIL (3C, 4M) | FAIL (3C, 4M) | F |
| watchlists.html | FAIL (1C, 2M) | FAIL (3C, 4M) | FAIL (3C, 3M) | F |
| pdf-export.html | FAIL (2M) | FAIL (3C, 3M) | FAIL (4C, 3M) | F |

---

## Implementation Guidance

These Stitch screens are **visual references**, not production code. When building the actual app:

1. **Use `brand-book.html` as the canonical CSS reference** — it's the only file with 100% token compliance
2. **Use `design-tokens.json` for all values** — never hardcode colors, spacing, or radii
3. **Use Lucide icons** (not Material Symbols) with 1.5px stroke
4. **Use CSS custom properties** (like brand-book does) instead of Tailwind arbitrary values
5. **Standardize sidebar** from dashboard.html pattern: `border-l-4` active indicator, 256px width, consistent nav order
6. **Replace all stock images** with SVG placeholders or real uploaded assets
7. **Avatar exception**: Document whether circular avatars (`rounded-full`) are an accepted exception to the 6px max radius rule

---

## What Stitch Got Right

Despite the violations, the screens deliver strong **visual direction**:
- Dark mode color atmosphere is consistent and on-brand
- Information density matches "The Analytical Architect" personality
- Layout patterns (sidebar + content, metric cards, data tables) are well-structured
- Natural language search UX in player-search is compelling
- Radar charts and data visualization approach is appropriate
- Overall screen hierarchy and navigation flow makes sense

These screens successfully establish the **look and feel** to implement with proper token compliance.
