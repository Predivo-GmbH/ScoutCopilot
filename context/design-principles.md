# ScoutCopilot — Design Principles

**Personality:** "The Analytical Architect" — high-precision, editorial, data-confident, quietly powerful.

---

## I. Core Philosophy

1. **Data-First** — Every screen exists to present data clearly. Information density over whitespace.
2. **Border-First** — Borders define containers, not shadows. No drop shadows anywhere.
3. **Meticulous Craft** — Pixel-perfect alignment, consistent spacing on 4px grid.
4. **Speed** — UI should feel instant; skeleton states for anything >200ms.
5. **Dark Mode Native** — Dark mode is the primary experience (surface: `#0B1326`).
6. **Token Compliance** — Every color, font, spacing, and radius comes from `docs/design-tokens.json`. Never hardcode.
7. **Anti-Slop** — No gradients, no stock imagery, no pill buttons, no AI sparkles, no decorative icons.
8. **Accessibility** — WCAG 2.1 AA minimum; keyboard-navigable, screen-reader friendly.

---

## II. Design System Foundation

### Color Palette (Dark Mode — Primary)

| Token | Value | Usage |
|-------|-------|-------|
| `surface-default` | `#0B1326` | Page background |
| `surface-container-low` | `#131B2E` | Card backgrounds |
| `surface-container` | `#171F33` | Elevated surfaces |
| `surface-container-high` | `#222A3D` | Active/selected surfaces |
| `on-surface` | `#DAE2FD` | Primary text |
| `on-surface-variant` | `#C3C6D7` | Secondary text |
| `primary` | `#2563EB` | CTAs, active states, links |
| `primary-light` | `#B4C5FF` | Primary tint, tags |
| `secondary` | `#10B981` | Success, positive signals |
| `tertiary` | `#F59E0B` | Warnings, highlights |
| `error` | `#FFB4AB` | Error states |
| `outline-variant` | `#434655` | Borders, dividers |

### Typography

| Element | Font | Size | Weight | Letter Spacing |
|---------|------|------|--------|----------------|
| Display LG | Inter | 3.5rem | 700 | -0.02em |
| H1 | Inter | 2.25rem | 700 | -0.01em |
| H2 | Inter | 1.75rem | 600 | -0.01em |
| H3 | Inter | 1.375rem | 600 | 0 |
| H4 | Inter | 1.125rem | 600 | 0 |
| Body | Inter | 0.9375rem | 400 | 0 |
| Body SM | Inter | 0.875rem | 400 | 0 |
| Label | Inter | 0.8125rem | 500 | 0.02em |
| Label SM | Inter | 0.75rem | 500 | 0.05em (uppercase) |
| Data/Numbers | JetBrains Mono | varies | varies | 0 |

**Weight scale**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Spacing

Base unit: **4px** (0.25rem). All spacing must be multiples of 4px.
Key values: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96px.

### Border Radii

| Token | Value | Usage |
|-------|-------|-------|
| `sm` | 2px | Badges |
| `md` (default) | 6px | Buttons, cards, inputs |
| `lg` | 8px | Modals |
| NEVER | `9999px` | Pill shapes are prohibited |

### Borders

- Default: `1px solid #434655`
- Focus: `1px solid #2563EB`
- Philosophy: Asymmetric borders preferred (2-3 sided for editorial feel)
- No full-width horizontal dividers in lists

### Elevation

- **None.** No drop shadows. Depth via tonal surface stepping only.
- Glassmorphism: Only for hover menus (surface-bright at 60% opacity + 20px backdrop-blur)

---

## III. Layout

- Max width: `1280px`
- Grid: 12 columns, 24px gutter
- Sidebar: 256px expanded, 64px collapsed
- Breakpoints: 375px (mobile), 768px (tablet), 1280px (desktop), 1536px (wide)
- Section padding: 96px vertical on landing pages, 32px in app views

### Visual Hierarchy Rules

1. One primary action per view (single prominent CTA)
2. Maximum 3 levels of heading hierarchy per page
3. Important content above the fold
4. Progressive disclosure for complex information

---

## IV. Interaction Design

| Interaction | Duration | Easing | Purpose |
|------------|----------|--------|---------|
| Hover state | 150ms | ease-out | Immediate feedback |
| Button press | 100ms | ease-in | Tactile response |
| Page transition | 200-300ms | ease-in-out | Smooth navigation |
| Modal open | 200ms | ease-out | Entrance |
| Modal close | 150ms | ease-in | Faster exit |
| Skeleton shimmer | 1.5s | linear | Loading indication |

### Loading States

1. **< 200ms**: No indicator (feels instant)
2. **200ms – 1s**: Skeleton screens
3. **> 1s**: Progress bar with context message
4. **> 5s**: Cancel option + estimated time

All animations respect `prefers-reduced-motion`.

---

## V. Icons

- **Library:** Lucide (NOT Material Symbols, NOT Heroicons)
- **Stroke:** 1.5px
- **Sizes:** 16px (sm), 20px (md), 24px (default)
- Functional only — icons communicate meaning, not decoration

---

## VI. CSS & Styling Architecture (Tailwind 4)

### Class Organization Order
```
1. Layout/positioning   (flex, grid, absolute, z-10)
2. Sizing              (w-full, h-14, max-w-sm)
3. Spacing             (p-4, mx-2, gap-3, mb-6)
4. Visual styles       (bg-surface, border, rounded-md)
5. Typography          (text-base, font-semibold)
6. Interactive states  (hover:bg-elevated, focus:ring-2)
7. Responsive variants (md:flex-row, lg:px-8)
```

### Rules

- **NO hardcoded hex values** in components — use CSS custom properties from design tokens
- **NO magic pixel values** — use spacing scale or Tailwind classes
- **NO inline styles** when utility classes exist
- **NO drop shadows** — use border + tonal fill
- All components must support dark mode (primary) and light mode
