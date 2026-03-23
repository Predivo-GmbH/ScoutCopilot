# ScoutCopilot — Style Guide

---

## Brand Identity

- **Brand Name**: ScoutCopilot
- **Tagline**: "AI-powered scouting intelligence for your Wyscout & StatsBomb data"
- **Brand Voice**: Professional, data-confident, quietly powerful. Not flashy — trustworthy.
- **Visual Style**: Dark mode, editorial, border-first, information-dense

---

## Color Usage

### Dark Mode (Primary)

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0B1326` | Page background |
| Surface Low | `#131B2E` | Card backgrounds |
| Surface | `#171F33` | Elevated panels |
| Surface High | `#222A3D` | Active/selected |
| Surface Highest | `#2D3449` | Hover states |
| Text Primary | `#DAE2FD` | Body text, headings |
| Text Secondary | `#C3C6D7` | Muted text, descriptions |
| Border | `#434655` | All container borders |
| Primary Blue | `#2563EB` | CTAs, links, active states |
| Primary Light | `#B4C5FF` | Tags, tinted backgrounds |
| Emerald | `#10B981` | Success, positive metrics |
| Emerald Light | `#4EDEA3` | Secondary success |
| Amber | `#F59E0B` | Warnings, highlights |
| Amber Light | `#FFB95F` | Secondary warning |
| Error | `#FFB4AB` | Error text and borders |
| Error Container | `#93000A` | Error backgrounds |

### Light Mode (Secondary)

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#F8FAFC` | Page background |
| Surface Low | `#F1F5F9` | Card backgrounds |
| Surface | `#E2E8F0` | Elevated panels |
| Text Primary | `#0F172A` | Body text |
| Text Secondary | `#475569` | Muted text |
| Border | `#CBD5E1` | Container borders |

---

## Typography

### Font Stack

- **Headings + Body**: `'Inter', system-ui, -apple-system, sans-serif`
- **Data/Numbers/Stats**: `'JetBrains Mono', 'Fira Code', 'Consolas', monospace`

### Rules

- Numbers and statistics ALWAYS use mono font
- `label-sm` uses `text-transform: uppercase` with `+0.05em` letter-spacing
- Display and H1 use negative letter-spacing for premium feel
- h2/h3/h4 weight is 600 (semibold), NOT 700

---

## Component Guidelines

### Buttons

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| Primary | `#2563EB` | `#FFFFFF` | none |
| Secondary | transparent | `#DAE2FD` | `1px solid #434655` |
| Ghost | transparent | `#C3C6D7` | none |
| Destructive | `#93000A` | `#FFB4AB` | none |

- Height: 32px (sm), 40px (md), 48px (lg)
- Border radius: 6px — NEVER pill
- Hover: Use token-based hover colors, never hardcoded

### Cards

- Background: `#131B2E` (surface-container-low)
- Border: `1px solid #434655`
- Border radius: 6px
- Padding: 24px
- NO shadows

### Forms

- Input height: 40px
- Border: `1px solid #434655`
- Focus: `1px solid #2563EB`
- Error: `1px solid #FFB4AB`
- Labels: 13px/500 (Inter), `#C3C6D7`
- Background: `#171F33` (surface-container)

### Tables

- Header: `#171F33` background, `label-sm` uppercase
- Rows: alternating `#0B1326` / `#131B2E`
- Cell padding: 12px horizontal, 16px vertical
- Numbers in `JetBrains Mono`

### Sidebar Navigation

- Width: 256px expanded, 64px collapsed
- Active indicator: `border-l-4` with `#2563EB`
- Active background: `#222A3D`
- Inactive text: `#C3C6D7`
- Icons: Lucide, 20px, 1.5px stroke

---

## Do's and Don'ts

### Do

- Use design tokens from `docs/design-tokens.json` for ALL values
- Use CSS custom properties (not Tailwind arbitrary values where possible)
- Use Lucide icons with 1.5px stroke
- Use JetBrains Mono for all numerical data
- Use 1px borders to define containers
- Use tonal surface stepping for depth hierarchy
- Test dark mode first (primary experience)

### Don't

- Don't use drop shadows (not even subtle ones)
- Don't use pill-shaped elements (max 6px radius)
- Don't use gradient backgrounds
- Don't use stock images — use SVG data visualizations
- Don't use Space Grotesk or any font besides Inter + JetBrains Mono
- Don't use Material Symbols — only Lucide
- Don't hardcode colors — always reference tokens
- Don't use `rounded-full` on buttons, badges, or progress bars
