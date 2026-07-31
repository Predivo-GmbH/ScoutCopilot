# ScoutCopilot — Design Brief
**Date:** 2026-03-23
**Status:** DRAFT — Awaiting approval

---

## 1. Product Context

**Name:** ScoutCopilot
**Tagline:** "AI-powered scouting intelligence for your Wyscout & StatsBomb data"
**One-liner:** An AI assistant that turns natural language questions into ranked player shortlists, comparison reports, and scouting briefs — in seconds instead of hours.

**Target users:** Professional football scouting departments (Tier 2-4 clubs) and player agencies with Wyscout/StatsBomb API access.

**Core personality:** Professional, data-confident, quietly powerful. Not flashy — trustworthy. The tool a sporting director would show to the board without hesitation.

---

## 2. Brand Direction

### Visual DNA — What to borrow from each reference

| Reference | Borrow | Avoid |
|-----------|--------|-------|
| **StatsBomb** | Blue primary palette, dark slate text on white, clean data presentation, sports credibility | Teko heading font (too condensed/sporty), overly editorial layout |
| **Linear** | Modern polish, tight spacing, subtle shadows, dark mode excellence, Inter font stack, component refinement | Near-black backgrounds feel too developer-oriented for scouts |
| **SciSports** | Professional sports analytics tone, clear hierarchy, blue accent palette | Deep purple text (#21048E) feels too branded, heavy display fonts |
| **Hudl** | Industry trust, orange-as-accent energy (not primary), button simplicity | Generic corporate sports tech feel, lack of data-tool personality |

### Brand Personality Spectrum

```
Playful  ◻◻◻◻◼◻◻◻◻◻  Serious
Consumer ◻◻◻◻◻◻◼◻◻◻  Enterprise
Minimal  ◻◻◻◼◻◻◻◻◻◻  Dense
Warm     ◻◻◻◻◼◻◻◻◻◻  Cool
Static   ◻◻◻◻◻◻◼◻◻◻  Dynamic
```

**In words:** Slightly serious, solidly B2B, leaning minimal but data-rich when needed, neutral-cool temperature, dynamic (data is alive, always updating).

### Color Direction

**Primary palette — "Stadium Blue"**

The football analytics industry has standardized on blue. All three sports references (StatsBomb, SciSports, Hudl) use blue as their primary. ScoutCopilot should own a specific, distinctive blue — not the same #009CE3 as StatsBomb/Hudl, but a deeper, more confident blue that signals both data intelligence and football credibility.

- **Primary blue:** A confident mid-blue — darker than StatsBomb's sky blue, lighter than SciSports' deep purple. Think `#2563EB` range (Tailwind blue-600) — authoritative, high-contrast, works on both light and dark backgrounds.
- **Accent:** A warm signal color for highlights, success states, call-to-actions. Consider `#F59E0B` amber/gold (football pitch energy) or `#10B981` emerald (positive signal, growth).
- **Neutrals:** Slate-based neutral scale (not pure gray). `#0F172A` (slate-900) to `#F8FAFC` (slate-50). Inspired by Linear's sophisticated neutral handling.
- **Semantic:** Standard status colors — green/success, red/error, amber/warning, blue/info.

**Light mode:** White/slate-50 background, dark slate text, blue primary actions.
**Dark mode:** Slate-900/950 background, slate-200 text, blue primary actions remain consistent. Inspired by Linear's dark mode — not pure black (#000), but warm dark slate.

### Typography Direction

**Font strategy:** Two-font system — clean geometric sans-serif for headings, humanist sans-serif for body.

- **Heading:** Inter (700/600) — same as Linear. Universally available, excellent at all sizes, no licensing issues. Tight tracking at large sizes for that premium SaaS feel.
- **Body:** Inter (400/500) — single font family simplifies the system. Inter's x-height and letter spacing are optimized for screen reading at 14-16px.
- **Mono:** JetBrains Mono — for data values, API references, metric labels. Football stats should feel precise.

**Type scale:**
- Display: 48-64px (hero headlines)
- H1: 36px
- H2: 28px
- H3: 22px
- H4: 18px
- Body: 15-16px
- Small: 13-14px
- Caption: 11-12px

### Spacing & Layout

- **Base unit:** 4px (consistent with SciSports/Hudl, finer than 8px allows more precise data layouts)
- **Spacing scale:** 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128
- **Border radius:** Tight — 4px default, 6px for cards, 8px for modals/overlays, 9999px for pills/badges. No heavy rounding. This matches the industry standard (2-4px across all references).
- **Shadows:** Minimal — border-first design for cards and containers (like Linear). Shadows reserved for elevated elements (dropdowns, modals, command palette). Use `box-shadow` with low opacity, cool-toned.
- **Grid:** 12-column, 1280px max-width, 24px gutter. Sidebar: 256px collapsed / 64px icon-only.
- **Breakpoints:** mobile (375px), tablet (768px), desktop (1280px), wide (1536px)

### Iconography

- **Icon set:** Lucide (consistent with Predivo ecosystem)
- **Style:** 1.5px stroke weight, 24px default size, 16px for inline/compact, 20px for nav
- **Usage:** Functional only — icons communicate meaning, not decoration

### Animation & Motion

- **Philosophy:** Purposeful, not performative. Every animation communicates state change.
- **Easing:** `ease-out` for entrances, `ease-in` for exits, `ease-in-out` for transforms
- **Duration:** Fast (100-150ms) for hover/focus, Normal (200-300ms) for transitions, Slow (400-500ms) for page-level
- **Reduce motion:** All animations respect `prefers-reduced-motion`

---

## 3. Anti-Slop Rules

These rules prevent generic AI aesthetics. Enforce during all design and code generation.

1. **NO gradient backgrounds** on sections or cards. Gradients only on specific accent elements (progress bars, charts, hero highlights).
2. **NO generic stock imagery.** Use data visualizations, radar charts, pitch diagrams, or abstract geometric patterns.
3. **NO rounded-full buttons** (pill buttons). Buttons use the standard border-radius (4-6px).
4. **NO decorative icons.** Every icon serves a functional purpose with a clear label.
5. **NO pastel washes.** Colors are either bold (primary/accent) or neutral (slate scale). No baby blue, lavender, or mint tints.
6. **NO "AI" as a design element.** No sparkle emojis, gradient text, or "powered by AI" badges. The AI is invisible — users see results, not technology.
7. **NO excessive whitespace in data views.** Data tools should feel information-dense when displaying search results, player profiles, and comparison tables.
8. **NO generic SaaS dashboard layout.** The sidebar + cards pattern is fine, but every component must be purpose-built for scouting workflows.
9. **NO Comic Sans, Papyrus, or display fonts.** Heading and body fonts are Inter only. Monospace is JetBrains Mono only.
10. **NO shadow-heavy design.** Borders and subtle background fills define containers, not drop shadows.

---

## 4. Scope Decisions

| Decision | Choice |
|----------|--------|
| Color mode | Light + dark |
| Brand collateral | Yes (business cards, email signatures, social templates, letterhead) |
| Component library | Full set (~59 components) |
| Screens to mock up | Landing page, Login/Signup, Dashboard, Player Search, Player Report, Player Comparison, Settings, Onboarding/API setup wizard, Pricing page, Saved searches/watchlists, PDF export preview |

---

## 5. Key Screen Descriptions

### Landing Page
Hero with value prop, problem/solution narrative, 3 feature showcases (NL search, AI reports, comparison), pricing tiers, social proof (testimonials/logos), FAQ, CTA.

### Login / Signup
Clean auth flow with OTP (6-digit, 600s expiry). Organization setup on first login. Supabase Auth.

### Dashboard
Overview of recent searches, saved shortlists, team activity, API usage meter, quick search bar.

### Player Search
Natural language input bar (prominent), search results as sortable/filterable table with key metrics, player cards on hover/click, save to shortlist action.

### Player Report (AI Scouting Report)
Full player profile: photo, bio, position, club, age. Statistical breakdown by category (defensive, offensive, passing, physical). Radar chart. League/position percentile comparisons. AI narrative summary. Export to PDF button.

### Player Comparison
2-4 player side-by-side. Radar overlay chart. Metric-by-metric table with color-coded rankings. AI recommendation narrative. Tactical context selector.

### Settings
Organization settings, team members, API credentials management (Wyscout/StatsBomb), billing/subscription, notification preferences.

### Onboarding / API Setup Wizard
Step-by-step: Welcome → Connect Wyscout API → (optional) Connect StatsBomb API → Verify connection → Select default leagues → Ready.

### Pricing Page
3-tier pricing table (Scout/Pro/Club), feature comparison matrix, annual toggle, CTA per tier.

### Saved Searches / Watchlists
List of saved search queries (re-runnable), player watchlists with status tracking, notes per player.

### PDF Export Preview
Print-ready preview of scouting report or comparison. Club branding placeholder. Download/share actions.

---

## 6. Recraft Style

*To be populated after Step 0.2 (logo generation)*

---

*Design brief prepared 2026-03-23. Awaiting approval before proceeding to logo generation.*

## Footer Standard

Footer must comply with `C:\Business\Internal Projects\footer-standard.md`. Key rules:
- Use a shared Footer component -- never inline footer markup on individual pages
- Copyright: `ScoutCopilot by Predivo GmbH. All rights reserved.`
- Slogan: `Swiss-made` (always English)
- Email templates must also include standard footer
