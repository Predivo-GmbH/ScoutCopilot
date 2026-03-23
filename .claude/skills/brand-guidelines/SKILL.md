# ScoutCopilot Brand Guidelines — Auto-Enforced

This skill is automatically enforced during all frontend coding for ScoutCopilot.

## Token Source
All values come from `docs/design-tokens.json`. Never hardcode colors, fonts, or spacing.

## Color Rules
- Dark mode primary: `#0B1326` background, `#DAE2FD` text
- Primary blue: `#2563EB` — CTAs, active states, links
- Secondary emerald: `#10B981` / `#4EDEA3` — success, positive signals
- Tertiary amber: `#F59E0B` / `#FFB95F` — warnings, alerts, highlights
- Borders: `#434655` (1px hairlines) — NEVER shadows for containers
- Error: `#FFB4AB`

## Typography Rules
- Heading + Body: `Inter` only
- Data/Numbers/Stats: `JetBrains Mono` only
- Display: 56px/700/-0.02em tracking
- Body: 15px/400
- Labels: 13px/500/uppercase for category headers

## Component Rules
- Border radius: 6px max for buttons/cards/inputs. NEVER pill-shaped.
- Buttons: `#2563EB` fill (primary) or transparent + 1px border (secondary)
- Cards: `surface-container-low` background + 1px `outline-variant` border
- Inputs: 1px border, focus → `#2563EB` border
- No drop shadows anywhere. Depth via tonal stepping only.

## Anti-Slop (ENFORCED)
1. NO gradient backgrounds
2. NO stock imagery
3. NO pill buttons (rounded-full)
4. NO decorative icons
5. NO pastel washes
6. NO AI sparkles or "powered by AI" badges
7. NO excessive whitespace in data views
8. NO shadow-heavy design
9. NO fonts other than Inter + JetBrains Mono

## Reference Files
- `docs/design-tokens.json` — canonical tokens
- `docs/DESIGN_SYSTEM.md` — full spec
- `docs/stitch-landing-v14-reference.html` — primary landing page reference
- `docs/stitch-exploration/design-evaluation-report.md` — evaluation with best elements per section
