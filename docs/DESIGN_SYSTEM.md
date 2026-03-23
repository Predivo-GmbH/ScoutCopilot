# ScoutCopilot Design System — The Analytical Architect

**Extracted from:** Stitch project `12024338093937306009`
**Date:** 2026-03-23
**Token file:** `docs/design-tokens.json`

---

## 1. Creative North Star

**"The Analytical Architect"** — High-precision, editorial aesthetic that mirrors the rigor of a technical scouting report. Authoritative, dense, unapologetically professional. Feels like a high-end dashboard in a stadium's tactical room.

**Brand Personality:** Slightly serious, solidly B2B, leaning minimal but data-rich when needed, neutral-cool temperature, dynamic.

---

## 2. Color System

### Dark Mode (Primary)

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#2563EB` | CTAs, primary navigation, active states |
| `secondary` | `#10B981` / `#4EDEA3` | Positive signals, "green flags," success states |
| `tertiary` | `#F59E0B` / `#FFB95F` | Warnings, alerts, highlights |
| `surface` | `#0B1326` | Base background |
| `surface-container-low` | `#131B2E` | Secondary workspaces |
| `surface-container` | `#171F33` | Card backgrounds |
| `surface-container-high` | `#222A3D` | Active modules, hover states |
| `surface-container-highest` | `#2D3449` | Elevated containers |
| `on-surface` | `#DAE2FD` | Primary text |
| `on-surface-variant` | `#C3C6D7` | Secondary text |
| `outline-variant` | `#434655` | Borders (1px hairlines) |
| `outline` | `#8D90A0` | Prominent borders, secondary button borders |
| `error` | `#FFB4AB` | Error text/borders |

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#F8FAFC` | Base background |
| `surface-container` | `#E2E8F0` | Card backgrounds |
| `on-surface` | `#0F172A` | Primary text |
| `outline-variant` | `#CBD5E1` | Borders |

### Rules
- **Border-first:** 1px `outline-variant` hairlines define containers — not shadows
- **Tonal stepping:** Depth via background color changes, not elevation
- **No gradients:** Flat, confident color only
- **Asymmetric borders:** 2-3 sides preferred (e.g., left + bottom) for editorial feel

---

## 3. Typography

### Font Stack
- **Heading + Body:** Inter (400/500/600/700)
- **Data/Numbers:** JetBrains Mono — all statistics, metrics, timestamps, percentages

### Scale

| Token | Size | Weight | Tracking | Usage |
|-------|------|--------|----------|-------|
| `display-lg` | 56px | 700 | -0.02em | Hero headlines |
| `display` | 48px | 700 | -0.02em | Section headlines |
| `h1` | 36px | 700 | -0.01em | Page titles |
| `h2` | 28px | 600 | -0.01em | Section headers |
| `h3` | 22px | 600 | 0 | Sub-headers |
| `h4` | 18px | 600 | 0 | Card titles |
| `body-lg` | 16px | 400 | 0 | Lead paragraphs |
| `body` | 15px | 400 | 0 | Body text |
| `body-sm` | 14px | 400 | 0 | Secondary text |
| `label-lg` | 14px | 500 | 0.02em | Form labels |
| `label` | 13px | 500 | 0.02em | UI labels |
| `label-sm` | 12px | 500 | 0.05em | ALL-CAPS category headers |
| `caption` | 11px | 400 | 0.03em | Metadata, timestamps |

---

## 4. Components

### Buttons
- **Primary:** `#2563EB` background, white text, 6px radius
- **Secondary:** Transparent, 1px `outline` border, 6px radius
- **Constraint:** NEVER pill-shaped. Max 6px radius.

### Cards
- Background: `surface-container-low` or `surface-container`
- Border: 1px `outline-variant`
- Radius: 6px
- Selected state: 2px `primary` left-border

### Inputs
- Border: 1px `outline-variant` all sides
- Focus: border shifts to `primary`, background to `surface-container-high`
- Error: border shifts to `error`
- Radius: 6px

### Data Display
- All numbers in JetBrains Mono
- Percentile bars use `primary` (blue), `secondary` (green), `tertiary` (amber)
- Table rows: alternating `surface` / `surface-container-low`, no full-width dividers

---

## 5. Spacing & Layout

- **Base unit:** 4px
- **Grid:** 12-column, 1280px max-width, 24px gutter
- **Section padding:** 96px vertical (desktop), 48px (mobile)
- **Card padding:** 24px
- **Component gap:** 16px default

---

## 6. Icons

- **Set:** Lucide
- **Stroke:** 1.5px
- **Sizes:** 16px (inline), 20px (nav), 24px (default)
- **Rule:** Functional only — never decorative

---

## 7. Anti-Slop Checklist

1. No gradient backgrounds
2. No stock imagery
3. No pill buttons
4. No decorative icons
5. No pastel washes
6. No AI sparkles or "powered by AI" badges
7. No excessive whitespace in data views
8. No shadow-heavy design
9. No fonts other than Inter + JetBrains Mono
