> **>>> STALE COPY - SUPERSEDED (2026-06-18).** This is an outdated copy of the master playbook (its design step still references the OBSOLETE Pencil flow).
> Single source of truth: `C:/Business/Templates/1-Person AI Business Playbook/docs/ONE_PERSON_AI_BUSINESS_WORKFLOW.md`. Design = Stitch-only; see `C:/Business/Templates/project-starter/docs/DESIGN_PIPELINE.md`.
> Kept only for history - do NOT follow or edit this file.

---

> **>>> DESIGN-STEP NOTICE (2026-06-18).** The design pipeline in "Phase 3 - Step 0" below references Pencil/.pen, which is OBSOLETE.
> The single canonical design workflow is `C:/Business/Templates/project-starter/docs/DESIGN_PIPELINE.md` (Stitch-based). The rest of this playbook (Phases 1-6) remains current.

---

# 🚀 One-Person AI Business — Claude Code Agent Teams Workflow
> Reusable playbook using Claude Code's native **Agent Teams** feature (not subagents).
> Each phase uses a Team Lead + Teammates who communicate directly with each other.

---

## ⚙️ ONE-TIME SETUP (do this before first use)

### 1. Enable Agent Teams
Add to your project's `.claude/settings.json`:
```json
{
  "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
}
```
Or set as an environment variable:
```bash
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
```

### 2. Requirements
- Claude Code v2.1.32 or later
- **Opus 4.6 model** (required — Agent Teams won't run on Sonnet/Haiku)
- Pro plan ($20/mo) covers 2–3 Agent Teams sessions/day
- Max plan ($100–200/mo) for heavy daily use
- Optional but recommended: `tmux` installed — gives you a separate terminal pane per teammate so you can watch and redirect each agent independently

### 3. Why Agent Teams instead of subagents?
| Subagents | Agent Teams |
|---|---|
| Report results back to main only | Teammates message **each other directly** |
| Single context window | Each teammate has **its own context window** |
| Fire-and-forget | You can **interrupt/redirect** mid-task via tmux |
| Good for isolated tasks | Built for **cross-cutting work** (frontend ↔ backend ↔ tests) |

**Key benefit for this workflow:** when your backend teammate changes an API interface, it can message your frontend teammate immediately — no conflicts discovered after the fact.

---

## HOW TO READ THIS WORKFLOW
1. Pick the phase you need
2. Paste the prompt block into Claude Code
3. The Team Lead will ask you questions, then spawn teammates automatically
4. Watch progress with `Ctrl+T` (shared task list) or per-pane via tmux
5. Review outputs → approve → move to next phase

### Interaction Rules
- **Always use the `AskUserQuestion` tool** when asking the user to make a decision or answer a question. Never present choices as plain text — always use the interactive clickable UI.
- Ask **one question at a time** — wait for the answer before asking the next.
- When there is a clear recommended option based on the product brief or best practices, mark it with `(Recommended)` and list it first.
- The user can always select "Other" to provide custom input.

---

## PHASE 1 — IDEA VALIDATION
**Goal:** Validated idea + competitive analysis + exact customer language.
**Team setup:** Lead + 3 teammates (research in parallel, then synthesize)

### 📋 Paste into Claude Code:
```
You are my AI business strategist acting as Team Lead.

First, ask me:
1. Do you have a rough idea already, or research from scratch?
   (A) I have an idea  (B) Research from scratch
2. What niche or industry? (e.g. B2B SaaS, creator tools, Swiss SMEs)
3. B2B or B2C?
4. Available build time per week?

Then create an Agent Team with 3 teammates working in parallel:

TeamCreate: "idea-validation"

Teammate 1 — "market-researcher"
Task: Browse Product Hunt for top 20 recent launches in our niche.
Find 3–5 Reddit communities. Pull top upvoted posts describing user frustrations.
Extract the EXACT language customers use to describe their pain (word-for-word).
Output: ranked list of 5 underserved opportunities with market size estimate + buildability score 1–10.
Message team-lead when done.

Teammate 2 — "competitor-analyst"
Task: Search for existing competitors in the niche.
For each competitor: find pricing page, G2/Capterra reviews, top user complaints.
Output: competitor gap matrix showing what's missing in the market.
Message team-lead when done.

Teammate 3 — "idea-validator"
Wait for messages from market-researcher and competitor-analyst.
Synthesize both findings.
Recommend ONE winning idea with: pain point evidence, gap evidence, MRR potential estimate, buildability score for solo dev.
Output: "Winning Idea Brief" (one paragraph) + backup idea.
Message team-lead when done.

Team Lead: After all teammates complete, compile full output to /outputs/phase1_idea_validation.md and ask me: "Phase 1 complete. Ready to proceed to offer design?"

Then ask: "Should I create a new project folder for [winning idea name]?"
If yes:
1. Ask for the project folder path (suggest: /c/Business/[Product Name]/)
2. Create the new folder with this structure:
   /docs/
   /outputs/
   /.claude/settings.json (copy from playbook)
   /.claude/skills/brand-guidelines/ (empty, populated in Phase 3)
3. Copy /outputs/phase1_idea_validation.md to the new project's /outputs/
4. Copy this workflow file to the new project's /docs/ for reference
5. Switch working directory to the new project folder
6. Confirm: "Project folder created at [path]. All future phases will run here. Proceed to Phase 2?"

If no: Continue working in the current playbook folder.
```

> **Important:** Phase 1 (Idea Validation) always runs inside the playbook folder. Once a project is greenlit, a dedicated project folder is created and all subsequent phases (2–6) run there. This keeps the playbook clean as a reusable template and gives each product its own workspace.

### ✅ Output: `phase1_idea_validation.md`

---

## PHASE 2 — PRODUCT BRIEF & OFFER DESIGN
**Goal:** Concrete product brief + irresistible offer with pricing tiers.
**Team setup:** Lead + 2 teammates (product + offer in parallel)

### 📋 Paste into Claude Code:
```
You are my product strategist acting as Team Lead. Read /outputs/phase1_idea_validation.md.

First, ask me:
1. Happy with the winning idea? (Yes / No — if No, which alternative?)
2. Preferred tech stack? (default: React 19 + Vite 8 + TypeScript + Tailwind 4 + Supabase + Metanet FTP)
3. Target price point? (e.g. $29/mo, $99/mo, one-time, usage-based)
4. Exact target customer? (e.g. "Swiss SME owner, 5–50 employees")

Then create an Agent Team with 2 teammates working in parallel:

TeamCreate: "offer-design"

Teammate 1 — "product-definer"
Task: Using the winning idea and my answers above, write a Product Brief including:
- App name (suggest 3 options)
- One-line description
- Specific target persona
- Core problem solved
- Exactly 3 MVP features (no more)
- Chosen tech stack with rationale
- Explicit scope guard: what this is NOT
Save to /outputs/product_brief.md. Message team-lead when done.

Teammate 2 — "offer-designer"
Task: Using the customer pain language from phase1_idea_validation.md and my pricing input, design:
- 3 pricing tiers (Free/Starter/Pro or equivalent) with exact feature lists
- The "Irresistible Offer" hook sentence (e.g. "Replace your entire research team for $49/mo")
- 3 objection busters (top 3 reasons someone would say no + response to each)
- Launch pricing strategy (e.g. lifetime deal, beta discount, founding member rate)
Save to /outputs/offer_design.md. Message team-lead when done.

Team Lead: After both teammates complete, ask me: "Phase 2 complete — review the brief and offer. Approve to start building?"
```

### ✅ Outputs: `product_brief.md`, `offer_design.md`

---

## PHASE 3 — MVP BUILD
**Goal:** Working MVP with core feature, auth, payments, landing page.
**Team setup:** Lead + 4 teammates per sprint (frontend / backend / DB / QA)

### 📋 Step 0: Design Pipeline (before any code)

Before Sprint 1, run the full design pipeline to establish visual identity, brand foundation, component library, and key screen mockups. This ensures all code is built against approved designs with brand tokens enforced from the start — and gives you a complete brand book + design system, not just UI screens.

```
/design-pipeline [product name from product_brief.md]
```

This triggers a **7-step interactive workflow** (logo-first approach) producing **1 single `.pen` file:**
- `design.pen` — All design work in one file: brand book (Layer 1), design system (Layer 2), and mockups (desktop + mobile)

> **Why one file?** Pencil can only have one `.pen` file open at a time. Keeping everything in a single file allows cross-referencing components, reusing logo elements in mockups, and running QA across all layers without switching files. Layers are separated by top-level frame groups.

#### Canvas Organization — 4-Column Layout

The `.pen` file is organized as **4 side-by-side columns** on the canvas (never stacked vertically). This gives a clear visual overview when zoomed out and keeps each layer independently scrollable.

| Column | X Position | Content | Width |
|--------|-----------|---------|-------|
| **1 — Design System** | 1480 | Showcase pages stacked vertically with 100px gaps (same 1200×800 page grid as Brand Book). Each page displays component instances via `ref` nodes. | 1200px |
| **2 — Brand Book** | 2880 | 17–18 pages, stacked vertically with 100px gaps between pages | 1200px |
| **3 — Logo Showcase** | 4280 | Logo showcase container with all 8 variants on proper backgrounds + style references | 1200px |
| **4 — Screens** | 5680+ | All screen mockups (desktop + mobile), stacked vertically with 100px gaps | 1440px (desktop) / 375px (mobile) |

**Logo showcase rules:**
- Each logo variant is displayed inside a background card:
  - Standard variants → sage background (`$surface-page`)
  - Mono-White → dark background (`#1A1D23`) so white elements are visible
  - Mark → accent background (`$accent-default`) to showcase the full icon
  - Favicons → sage background, centered in cards
- The showcase container has a title, subtitle, and a 2×4 grid (4 per row)
- 2 rows: Row 1 = Mark, Wordmark, Horizontal, Vertical. Row 2 = Mono-White, Mono-Dark, Favicon-32, Favicon-16

**Source component placement (no duplication rule):**
- Reusable source components (`reusable: true`) are the single-source-of-truth definitions
- **All source components** (UI components + logo components) are stored in an organized container frame **off-canvas** (x:-5000) — named `_Source Components` with a "DO NOT DELETE" label
- Source components are **never displayed as visible pages** on the canvas — they exist only as hidden definitions. The Design System pages display them via `ref` instances. This prevents content duplication (showing the same buttons/forms/cards twice on the canvas).
- All visible instances use `ref` nodes pointing to these source components — **never** manual recreations
- This applies to: DS showcase pages, screen mockups, login pages, brand book pages, and the logo showcase

**Design System page structure:**
- Uses the **same 1200×800px page grid** as the Brand Book — one page per component category, stacked vertically with 100px gaps
- Each page has the same frame styling: `fill: $surface-default`, `layout: vertical`, `padding: [60, 80]`, `gap: 32`
- Pages are organized by category: Actions, Forms, Display, Navigation, Tables, Feedback, Overlays — each showing component instances (refs) with usage context and specs
- This is the **only place** components are visually displayed — source definitions stay off-canvas

**Brand book page structure:**
- Each page is a 1200×800px frame with consistent styling: `fill: $surface-default`, `layout: vertical`, `padding: [60, 80]`, `gap: 32`
- Standard page template: Section label (JetBrains Mono 11px uppercase) → Title (Plus Jakarta Sans 40px 700) → Accent bar (40×4 rectangle) → Body text → Content area → Optional footer note
- Logo-related pages (Logo Design, Logo Variants, App Icon) use distinct background cards to make logos visually prominent — dark backgrounds for light logos, accent backgrounds for mark showcases

---

#### Pencil Technical Reference

Rules learned from production use of the Pencil MCP. These prevent common errors during design generation:

**Supported properties:**
- Borders: Use `stroke: { fill: "color", thickness: number }` — NOT `borderColor` / `borderWidth`
- Alignment: `alignItems` supports `"start"`, `"center"`, `"end"` only — NOT `"stretch"`
- Layout: Always explicitly set `layout: "horizontal"` on row frames — having `gap` alone does NOT make children flow horizontally
- Wrapping: `flexWrap` is NOT supported in Pencil — split into multiple rows instead

**Sizing rules:**
- `height: "fill_container"` on children inside `fit_content` parents causes circular layout warnings — use `fit_content` or fixed heights on children instead
- When changing a component from fixed width to `fill_container`, **also fix its internal children**: text nodes sharing space with siblings need `width: "fill_container"` + `textGrowth: "fixed-width"` to prevent nested overflow
- Emoji/icon text nodes default to Inter font — always override to the brand font (e.g., Plus Jakarta Sans)

**Component patterns:**
- Reusable components: set `reusable: true` on frames. Instances use `type: "ref"` with `ref: "componentId"`
- Override instance descendants via `U(instanceId+"/childId", {...})` — never recreate children manually
- Component cell pattern: frame with background fill, `cornerRadius: 8`, `padding: 16`, `gap: 10`, name label (11px, muted color)
- Max 25 operations per `batch_design` call — split larger work into logical batches

**QA patterns:**
- After creating horizontal containers, always verify `layout: "horizontal"` is set (most common miss)
- After creating pages, screenshot each one and check for content overflow beyond the 800px page boundary
- Text nodes without `textGrowth: "fixed-width"` and explicit `width` will expand infinitely — always set both on any text that could be long

---

#### Step 0.1: DEFINE — Brand Direction + Scope

Provide reference screenshots/URLs of sites with the desired look and feel. AI analyzes them to extract color palette, typography, spacing, layout patterns, and tone. Combined with product_brief.md to produce:
- `docs/DESIGN_BRIEF.md` — brand direction + anti-slop rules

**Step 0.1a: Firecrawl Brand Scrape (for each reference URL)**

Before manual analysis, run an automated brand extraction on each reference URL using the Firecrawl API. This pulls structured branding data (colors, fonts, typography, spacing, components, layout, and more) directly from live websites — giving you a machine-readable baseline instead of eyeballing screenshots.

**Process:**
1. User provides 1–5 reference URLs (sites with the desired look and feel)
2. For each URL, call the Firecrawl `/v2/scrape` endpoint with `formats: ["branding"]` only (no markdown, summary, links, HTML, screenshot, JSON, or images — just branding)
3. Save each response to `docs/references/brand-scrape-[domain].json`
4. AI analyzes all scraped branding data together to extract:
   - **Color palette** — primary, secondary, accent, background, text colors + color scheme (light/dark)
   - **Typography** — font families, sizes, weights, line heights
   - **Spacing** — base unit, border radius, padding/margin patterns
   - **Components** — button styles, input styles, icon styling
   - **Layout** — grid configuration, header/footer dimensions
   - **Assets** — logo URL, favicon, OG image
   - **Brand personality** — tone, audience, traits
   - **Animations** — transitions, easing, durations
5. Findings are merged with manual analysis (screenshots, user preferences) into `docs/DESIGN_BRIEF.md`

**API call (per URL):**
```bash
curl -X POST https://api.firecrawl.dev/v2/scrape \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $FIRECRAWL_API_KEY" \
  -d '{
    "url": "https://example.com",
    "formats": ["branding"]
  }'
```

**Why this matters:** Instead of manually inspecting reference sites and guessing at exact hex values, font stacks, and spacing systems, the brand scrape gives you precise, structured data. This is especially valuable when the user says "I want it to look like X" — you get the exact design tokens that make X look the way it does.

**Credit cost:** 1 Firecrawl credit per URL scraped. Budget: 1–5 credits per project.

---

**Project-specific questions asked during this step:**
1. Reference URLs to scrape for branding? (1–5 sites with the desired look and feel)
2. Light mode only, or light + dark mode?
3. Include brand collateral section? (business cards, email signatures, social templates)
4. UI component library scope: full set (~59 components) or product-relevant subset only?
5. Key screens to mock up (e.g. login, dashboard, main feature, settings)

These answers shape the scope of Steps 0.2–0.6.

---

#### Step 0.2: LOGO & FAVICON — Brand Mark (logo-first)

**Why logo first?** The logo is the anchor of the entire brand identity. Colors, typography weight, and visual tone are derived from or validated against the logo. Generating tokens before the logo risks misalignment — the logo should inform the tokens, not the other way around. If the project already has an existing logo, this step formalizes it into reusable components and variants instead of generating a new one.

**Logo Generation Method: Recraft MCP (Credit-Conscious)**

Always use the Recraft MCP to generate logos. This produces higher-quality, style-consistent results through a two-phase approach: first creating a style from reference images, then generating logos using that style.

**⚠️ CREDIT BUDGET RULES — Recraft API credits are finite and expensive. Follow these rules strictly:**
- **Check balance first** — Always call `get_user()` before starting to know the credit baseline.
- **Generate 2 images per call, not 6** — Use `numberOfImages: 2` to test direction before committing more credits.
- **Iterate with user approval** — Show each batch to the user. Only generate more if they ask for it.
- **Never bulk-generate** — Do NOT generate 16 images hoping one works. Use 2–3 targeted rounds of 2 images each (4–6 total).
- **Budget target:** ~6–8 images total per logo project (3–4 generate calls).
- **Never use Recraft for background removal** — Use free Python/Pillow instead (see Phase C below).
- **Track credits spent** — Report balance after the final generation so the user knows what was used.

**Phase A — Create a Recraft Style from References**

1. **Collect 3–5 reference logos** — Place reference logo images (PNG, min 400×400px) into the project's `docs/references/Logos/` folder. These represent the visual direction: shape language, weight, negative space, icon style, and type treatment.

2. **Choose references carefully for color consistency** — The custom style absorbs colors from the reference images. If you want black & white output, use only B&W references. Mixing in colored references (e.g. a cyan logo alongside B&W ones) will cause the style to bleed those colors into every generation, overriding prompt instructions like "black and white only." Match reference colors to desired output colors.

3. **Prepare reference images** — Before uploading, ensure all reference images meet Recraft requirements:
   - Minimum resolution: **400×400px** (upscale smaller images with Pillow `resize()` + `LANCZOS`)
   - Format: **PNG with RGBA mode** (convert palette-mode PNGs: `img.convert('RGBA')`)
   - File names: **no spaces** (replace spaces with underscores)
   - Copy prepared images to a clean path without spaces (e.g. `recraft-output/style-refs/`)

4. **Create the style via Recraft MCP** — Call `create_style` with base style `vector_illustration` and all prepared reference image URIs:
   ```
   create_style(
     style: "vector_illustration",
     imageURIs: [
       "file:///C:/path/to/style-refs/ref1.png",
       "file:///C:/path/to/style-refs/ref2.png",
       ...
     ]
   )
   ```
   This returns a **style_id** (e.g. `d1ca0e80-1faf-4e21-9376-3ed159b12a25`). Save this ID — it encodes the visual DNA of the references and will be used for all logo generation.

5. **Store the style_id** — Record the style_id in the project's `docs/DESIGN_BRIEF.md` under a `## Recraft Style` section and in the playbook's `docs/references/recraft-styles.md` for cross-project reuse.

**Phase B — Generate Logo Variations (Iterative, 2 at a time)**

6. **First test batch (2 images)** — Call `generate_image` with `numberOfImages: 2`, the style_id, and a carefully crafted prompt. Show results to user before generating more.

7. **Prompt engineering rules** — The prompt is critical. Follow these rules:
   - **Describe the aesthetic, never name other brands** — Recraft interprets brand names literally and renders them as text. Say "flowing ribbon curves, petal-like overlapping shapes" NOT "like the Fey logo."
   - **Be explicit about what you DON'T want** — Include "no text, no words, no letters below, no decoration" to prevent unwanted elements.
   - **Specify color explicitly** — "black mark on white background, strictly monochrome" or "single color on white." The custom style may override vague color instructions.
   - **Match shape language to references** — If references are soft/organic, say "smooth rounded edges, no sharp points, flowing curves." If references are geometric, say "clean angular lines, sharp edges."
   - **Keep it focused** — "minimal logomark, abstract letter [X], [2–3 shape descriptors], [color], no text" works better than long detailed prompts.

   Example progression (good):
   ```
   Round 1: "minimal logomark, abstract letter A, clean bold lines, black on white, no text"
   → Too geometric/sharp? Adjust:
   Round 2: "minimal logomark, abstract letter A, smooth flowing curves, ribbon-like, black on white, no text, no sharp edges"
   → Getting closer? Refine:
   Round 3: "minimal logomark, abstract letter A, soft rounded petal-like overlapping curves, flowing ribbon with subtle depth, black on white, no text"
   ```

8. **When custom style fights the prompt** — If the custom style overrides prompt instructions (e.g. keeps adding color despite "black and white" in prompt), drop the `styleID` parameter and use `style: "vector_illustration"` directly instead. The base style respects prompt instructions more faithfully. This is a known Recraft behavior: custom styles encode color palettes from references that override prompt-level color instructions.

9. **User picks one** — Present all generated options to the user for selection. Place candidates in the Logo Showcase grid in the .pen file (convert SVGs to PNGs first using `resvg-js` since Pencil can't render SVGs as image fills).

10. **Lock the image file** — Once selected, copy the chosen image to `docs/images/logo-original.png`. This file is the single source of truth. **NEVER regenerate** the logo — AI produces a different image every time. Also copy the SVG source to `docs/images/logo-original.svg` for future vector editing.

**Phase C — Background Removal (Free, No Recraft Credits)**

11. **Remove background with Python/Pillow (FREE)** — Do NOT use Recraft `remove_background` as it burns credits unnecessarily. For logos on solid backgrounds, use Pillow:
    ```python
    from PIL import Image
    img = Image.open('docs/images/logo-original.png').convert('RGBA')
    data = list(img.getdata())
    new_data = []
    for pixel in data:
        if pixel[0] > 240 and pixel[1] > 240 and pixel[2] > 240:  # white/near-white
            new_data.append((pixel[0], pixel[1], pixel[2], 0))     # make transparent
        else:
            new_data.append(pixel)
    img.putdata(new_data)
    img.save('docs/images/logo-transparent.png')
    ```
    Adjust the threshold (240) if the background is not pure white.

12. **Create inverted version for dark backgrounds** — For Mono-White variants, invert the logo:
    ```python
    from PIL import Image, ImageOps
    img = Image.open('docs/images/logo-transparent.png').convert('RGBA')
    r, g, b, a = img.split()
    img_white = Image.merge('RGBA', (ImageOps.invert(r), ImageOps.invert(g), ImageOps.invert(b), a))
    img_white.save('docs/images/logo-white.png')
    ```

13. **SVG to PNG conversion** — Recraft generates SVGs for `vector_illustration` style. Pencil cannot render SVGs as image fills. Convert using `resvg-js` (pure JS, no native dependencies):
    ```bash
    cd /path/to/recraft-output && npm install @resvg/resvg-js
    node -e "
    const { Resvg } = require('@resvg/resvg-js');
    const fs = require('fs');
    const svg = fs.readFileSync('logo.svg', 'utf8');
    const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 800 } });
    fs.writeFileSync('logo.png', resvg.render().asPng());
    "
    ```

**Phase D — Apply Logo to Components**

14. **Use the transparent version everywhere** — Apply `logo-transparent.png` as the fill image on all logo components. Because it has no background, it works correctly on any surface color (dark sidebar, light sidebar, cards, login pages, etc.) without any blend mode hacks.

15. **Update all reusable logo components** — Replace path/shape children in each component with image fills:
    - `Logo/Mark` — `fill: {type: "image", url: "./images/logo-transparent.png", mode: "fit"}`
    - `Logo/Mono-White` — `fill: {type: "image", url: "./images/logo-white.png", mode: "fit"}`
    - `Logo/Mono-Dark` — `fill: {type: "image", url: "./images/logo-transparent.png", mode: "fit"}`
    - `Logo/Favicon-32` and `Logo/Favicon-16` — same transparent PNG, Pencil scales to fit

16. **Logo Showcase backgrounds** — In the Logo Showcase (Column 4), display the same transparent logo on different background cards:
    - Accent card (`$accent`) — shows the mark on brand color
    - Light card (`$surface-default`) — shows how logo looks on light surfaces
    - Dark card (`$surface-dark`) — shows how logo looks on dark surfaces

**Output:** AI generates the product logo as **standalone reusable components** in `design.pen`:
- Primary logo (horizontal lockup: mark + wordmark)
- Logo mark only (icon/symbol for compact use)
- Favicon variants (16px, 32px, 180px apple-touch)
- Monochrome versions (white on dark, black on light)
- Clear space and minimum size rules documented on the brand book page

**Output files in `docs/images/`:**
- `logo-original.png` — chosen logo as-is from Recraft
- `logo-original.svg` — vector source from Recraft
- `logo-transparent.png` — black mark, transparent background
- `logo-white.png` — white mark, transparent background (for dark surfaces)

**Critical rules:**
- **NEVER regenerate a selected logo** — AI produces a different image each time. Once the user picks one, only reference that exact file.
- **NEVER use Recraft `remove_background`** — it burns API credits. Use Pillow instead (free, instant, works perfectly for solid-background logos).
- **NEVER bulk-generate logos** — Generate 2 at a time, get user feedback, iterate. Budget: 6–8 images total.
- **ALWAYS check `get_user()` before and after** generation rounds to track credit spend.
- **ALWAYS convert SVGs to PNGs** before placing in Pencil (use `resvg-js`, not cairosvg which requires native Cairo library on Windows).
- **ALWAYS use the transparent PNG** in all components, screens, and brand book pages.
- **NEVER use Pencil path/shape tools** to create logos — they produce poor results.
- **NEVER use Lucide icons** as logo marks — they are generic and not suitable for brand identity.
- **NEVER name other brands in Recraft prompts** — Recraft renders brand names as literal text. Describe the aesthetic instead.
- **Reference images must be ≥400×400px, RGBA mode, no spaces in filenames** — Recraft API rejects images that don't meet these requirements.

All logo variants are stored as reusable Pencil components within the single `design.pen` file, all referencing the same transparent PNG.

---

#### Step 0.3: MOCKUP — Design Language Discovery (Stitch-First)

Stitch is the design language driver. It receives the raw outputs of Steps 0.1 + 0.2 + the product brief as input and **discovers** the visual language through iteration with the user.

**Why Stitch first?** Pre-generating design tokens before any visual exploration produces arbitrary values that were never validated. Instead, Stitch explores what looks good using real reference data, and tokens are extracted from what it produces.

**Design Context Prefix = Raw Reference Data + Logo + Product Brief**
Every Stitch `generate_screen_from_text` call MUST include a prefix containing:
- **Step 0.1 (Firecrawl) raw data:** Full brand comparison from scraped references — their specific colors, fonts, radii, tone, energy level. What the product should borrow from each and why. What to avoid. Source: `docs/references/brand-scrape-*.json` + comparison in `docs/DESIGN_BRIEF.md`.
- **Step 0.2 (Logo):** Detailed logo description — mark type, visual characteristics, placement rules, sizes. Source: logo specs in `docs/DESIGN_BRIEF.md`.
- **Product brief:** What the product does, target audience, personality, tone. Source: `docs/product_brief.md` or equivalent.
- **User decisions from Step 0.1:** Light/dark mode, screen count, collateral scope, etc.

Do NOT include pre-baked design tokens — let Stitch discover the visual language.

**Stitch API Reliability (learned from production use):**

| Tool | Reliability | Rule |
|------|------------|------|
| `generate_screen_from_text` | ~60% success rate | Always call `get_project` after to verify screens were created (often returns no output even on success) |
| `edit_screens` | **0% success rate** | NEVER use — always fails silently |
| `generate_variants` | Unreliable | NEVER rely on — results are inconsistent |
| `list_screens` | **Broken** | Always returns empty `{}`. Use `get_project` instead (includes `screenInstances` array) |
| `get_screen` | Works | Use `projects/{projectId}/screens/{screenId}` format |

**Best iteration method:** When `generate_screen_from_text` via MCP fails, prepare **paste-ready prompts** for the user to apply directly in the Stitch UI. This works every time.

**Writing good Stitch prompts:**
- **DO** tell Stitch WHAT sections to include and the brand constraints (colors, fonts, radius, personality)
- **DO** include all content sections with real copy — what the product does, who it's for, what each section communicates
- **DO NOT** dictate exact HTML structure or pixel-level layout — let Stitch design
- **DO NOT** use generic placeholder text — use product-specific content derived from the product brief
- Keep prompts content-focused: sections needed, brand personality, constraints. Give Stitch guidance and constraints, not prescriptive layouts.

**Two-phase iteration (structure first, polish last):**
- **Phase 1: STRUCTURE** — Get all sections right, correct content, right UX flow, right elements. Iterate until the page has everything it needs and nothing it doesn't. Focus feedback on what's missing or wrong structurally.
- **Phase 2: POLISH** — Only after structure is approved, fix colors, shadows, spacing, exact token alignment.
- Do NOT waste iterations on color fixes while the structure still needs work.

**Process:**

1. **Create a Stitch project** for the product via `create_project`
2. **Build the Design Context Prefix** from the raw sources listed above — include the full data, not summaries. If the prompt is long, that's fine — better to give Stitch too much context than too little.
3. **Build the base prompt** — combine the Design Context Prefix with the landing page content (all sections, real copy, what the product does, who it's for). This base prompt stays the same across all variations.
4. **Generate 5 landing page variations** — make 5 separate `generate_screen_from_text` calls in the same project, each with the same base prompt but a different one-line style direction appended. Always use `deviceType: "DESKTOP"` and `modelId: "GEMINI_3_1_PRO"`.

   | Variation | Style direction | What varies |
   |-----------|----------------|-------------|
   | 1 | Minimal & spacious — generous whitespace, hero-dominant | Visual density |
   | 2 | Content-rich — detailed sections, feature cards, more visual elements | Information density |
   | 3 | Bold editorial — large typography, expressive layout, magazine feel | Typography & scale |
   | 4 | Trust-first — social proof and metrics prominent, testimonials early | Section ordering & emphasis |
   | 5 | Conversion-focused — strong CTAs, urgency elements, compact flow | Conversion hierarchy |

   All five share the same brand constraints, colors, fonts, logo, and content — only the layout approach and emphasis differ.

5. **Verify all generated** — call `get_project` to confirm screens were created (don't trust silent returns). Stitch may silently create extra screens from retry attempts — include ALL generated screens in the evaluation, not just the original 5. If any required variations are missing, retry or prepare paste-ready prompts for the Stitch UI.
6. **Run multi-agent design evaluation** — spawn 4 expert agents in parallel, each receiving ALL generated screenshot files. Each agent evaluates every variation independently. The evaluation produces a structured Markdown report saved to `docs/stitch-exploration/design-evaluation-report.md`.

   **The 4 Expert Agents:**

   | Agent | Persona | Evaluates |
   |-------|---------|-----------|
   | **Web Designer** | Senior designer from Apple/Pentagram, 20+ years, award-winning websites | Visual aesthetics, typography, color harmony, spacing, visual hierarchy, design excellence |
   | **UX Designer** | Principal UX from Google/IDEO, human psychology + interaction design | User flow, navigation clarity, cognitive load, readability, information architecture, usability |
   | **Copywriter** | David Ogilvy meets modern SaaS, persuasion + messaging hierarchy | Headline strength, value prop clarity, CTA copy, tone, messaging consistency |
   | **CRO Specialist** | CRO lead from Basecamp/Booking.com, data-driven conversion psychology | Trust signals, social proof placement, friction points, conversion flow, action impulse |

   **Scoring criteria (each agent scores each variation 1-10 on all 5):**
   - First impression
   - Clarity of message
   - Visual quality
   - Trust & credibility
   - Action impulse

   **Each agent also provides:**
   - A sharp 2-3 sentence expert comment per variation (in their persona's voice, referencing specific design elements)
   - Their personal winner pick with clear reasoning

   **Report output structure:**
   - Score matrix: all agents × all variations × all criteria
   - Rankings table: grand totals sorted descending with per-agent subtotals
   - Agent winner picks section
   - Expert comments grouped by variation
   - Overall winner with summary of why it won
   - Recommended iteration notes (best elements from non-winning variations worth incorporating)
   - Screen reference table (Stitch IDs + screenshot filenames)

   **Agent prompt template** — each agent receives:
   - Their persona description and evaluation focus
   - Product context (name, value prop, target persona, core mechanism)
   - Paths to ALL screenshot files in `docs/stitch-exploration/`
   - The exact output format (enforced via structured template)
   - Instructions to read every screenshot and provide concrete, specific feedback

   Run all 4 agents in parallel via the Agent tool. After all return, aggregate scores into the final report.

7. **Auto-generate refined Stitch prompt** — immediately after the evaluation report is produced, automatically generate a refined `generate_screen_from_text` prompt that combines:
   - The **winning variation's strengths** (all elements that made it win, explicitly listed)
   - The **iteration notes from all 4 agents** (best elements from non-winning variations)
   - The **full Design Context Prefix** (product context, brand constraints, colors, fonts)
   - An **optimized section order** based on the conversion architecture the agents validated

   **Prompt structure (always follow this template):**

   ```
   Part 1 — Product Context
   One paragraph: app name, what it does, target user, core mechanism.

   Part 2 — Base Direction (from winner)
   "This design MUST retain all the strengths that made [Winner Name] win:"
   Numbered list of 4-6 specific winning elements, each with WHY it works
   (e.g. "Loss-aversion headline — frames status quo as mistake, 2x more motivating")

   Part 3 — CRITICAL IMPROVEMENTS TO INCORPORATE
   One subsection per agent iteration note, formatted as:
   "### From [Agent Name] ([source variation] insight):"
   What to add/change and WHY it tested stronger.

   Part 4 — Brand Constraints
   All hard design rules: colors (hex), fonts, radius, shadows, anti-patterns.

   Part 5 — Section Order
   Numbered list of all sections in optimized conversion flow order.
   Each section gets a one-line description of what it contains.

   Closing line: "This is the FINAL design combining the best elements from
   [N] variations as evaluated by expert agents."
   ```

   Send this prompt to `generate_screen_from_text` with `deviceType: "DESKTOP"` and `modelId: "GEMINI_3_1_PRO"` in the same Stitch project. Verify creation via `get_project`. Download the screenshot to `docs/stitch-exploration/final-refined.png`.

8. **Present final refined design to user** — show the final refined screenshot alongside the evaluation report. The user reviews and either approves the design language or requests further iteration. This is the approval gate.
9. **Refine if needed** — if the user wants changes, iterate by generating new screens in the same Stitch project with adjusted prompts. The user may also manually iterate in the Stitch UI (structure first, polish last). AI prepares paste-ready prompts if needed but does NOT use `edit_screens` or `generate_variants` (both unreliable).
   - **Do NOT proceed to other screens until the user explicitly approves the design language**
10. **Once design language is approved**, generate the remaining screens one-by-one or in small batches (3-5), always using the same Design Context Prefix + the approved design direction
11. **Iterate on each screen** using new `generate_screen_from_text` calls with refined prompts — or paste-ready prompts for the Stitch UI if MCP is unresponsive
12. **Review and approve** all screens before proceeding to Step 0.4

> **Stitch project remains available** for future brainstorming — when you need to explore new screens or major redesigns, start in Stitch first.

**Importing Stitch output for downstream steps:**

All Stitch export methods produce the same two artifacts — an **HTML file** and a **screenshot (PNG)**. No export method provides additional data beyond these two.

| Export method | How to access | Output |
|--------------|---------------|--------|
| **MCP API** | `get_screen` → `htmlCode.downloadUrl` + `screenshot.downloadUrl` | HTML + PNG URLs |
| **ZIP download** (Stitch UI) | Manual download from Stitch | `code.html` + `screen.png` in zip |
| **MCP prompt** (Stitch UI) | Copy → paste into Claude Code | Text with project/screen IDs to call `get_screen` |
| **Code to clipboard** (Stitch UI) | Copy → paste into Claude Code | Raw HTML (identical to file) |

**Preferred method:** Use MCP API (`get_screen`) to retrieve the HTML download URL, then `curl -L` to download. This is fully automatable.

**CRITICAL — Screenshot resolution:** Stitch screenshot URLs (`lh3.googleusercontent.com`) serve **small thumbnails by default** (e.g. 104×512px). Always append `=s0` to the URL to get the **full-resolution** image (e.g. 2560×12616px). Without `=s0`, screenshots are unusable for design evaluation or visual QA.

```
# Wrong (thumbnail):
curl -sL "https://lh3.googleusercontent.com/aida/..." -o screenshot.png

# Correct (full resolution):
curl -sL "https://lh3.googleusercontent.com/aida/...=s0" -o screenshot.png
```

**For design evaluation:** Full-resolution pages are often 10,000+ pixels tall. Crop into ~2500px sections using PIL before feeding to evaluation agents — a single full-page image is too large to evaluate detail. Always verify image dimensions after download before using for any evaluation.

**What the HTML file contains (verified — this is what feeds Step 0.4):**
- **Tailwind config** with all design tokens: colors (semantic names + hex values), font families, border radius values, gradient definitions
- **Custom CSS** with shadow definitions, gradient classes, effects
- **Full semantic HTML** with Tailwind utility classes for every element
- **Google-hosted image URLs** (from Stitch's image generation)
- **Material Symbols icon names**
- **Responsive breakpoint classes** (sm, md, lg)

The HTML's embedded Tailwind config is the primary source for token extraction in Step 0.4.

**What Stitch does NOT export (verified):**
- Stitch's internal design strategy document (design.md) — not accessible via API or any export
- `DESIGN_SYSTEM_INSTANCE` entries visible in `get_project` — not retrievable via `get_screen`
- Project Brief / PRD — available as a separate screen in Stitch but contains only high-level project framing that duplicates information we already have from Step 0.1. Not useful for the workflow.

---

#### Step 0.4: EXTRACT — Design Tokens & System Docs

**Built AFTER Step 0.3 (Stitch approval).** Design tokens are EXTRACTED from the approved Stitch mockups — not invented beforehand.

AI analyzes the approved Stitch screens and creates:
- `docs/design-tokens.json` — canonical brand tokens extracted from what Stitch actually rendered (colors, typography, spacing, radius, shadows, breakpoints)
- `docs/DESIGN_SYSTEM.md` — human-readable design spec documenting the visual patterns Stitch established
- `docs/DESIGN_BRIEF.md` — updated with final brand direction reflecting the approved design language
- `.claude/skills/brand-guidelines/SKILL.md` — auto-enforced during coding

If dark mode was selected in Step 0.1, tokens include both light and dark values.

---

#### Step 0.5: BRAND BOOK — Layer 1 (in `design.pen`)

**Built AFTER Step 0.3 (Stitch approval) and Step 0.4 (token extraction).** The Brand Book formalizes the design language that was established and approved in Stitch. It documents the brand identity as rendered in the approved mockups, not as an abstract spec.

AI builds a comprehensive brand book as frames in `design.pen` (under a "Brand Book" top-level group). Each page is a separate top-level frame. The brand book covers the **full brand identity** — not just the UI.

**Pages:**

1. **Cover** — Product name, logo, tagline, version date. Sets the visual tone for the entire book.

2. **Table of Contents** — Navigation overview of all sections in the brand book.

3. **Brand Introduction** — Brand story, mission, vision, values, positioning statement. Sets context for why the brand exists and what it stands for.

4. **Brand Foundation** — Brand personality traits, target audience summary (pulled from product_brief.md and phase1_idea_validation.md). This is the strategic "why" behind every design decision.

5. **Logo Design** — Primary logo presentation with design rationale. Anatomy and geometry with construction grid overlays.

6. **Logo Variants** — Horizontal lockup, vertical lockup, mark-only. Full-color on various backgrounds, monochrome (black/white/grayscale), and rules for which variant to use when.

7. **Logo Clear Space & Sizing** — Exclusion zone rules (defined in terms of a unit derived from the logo), minimum pixel/mm sizes, sizing system across applications.

8. **Logo Misuse** — Explicit do's and don'ts with visual examples: no stretching, no recoloring, no effects, no improper backgrounds. Side-by-side correct vs. incorrect.

9. **App Icon & Favicon** — Mobile app icon specs (iOS/Android), favicon at 16/32/180px, rounded vs. square adaptations.

10. **Color Palette** — Primary, secondary, accent, neutrals — each with HEX, RGB, HSL values. Semantic roles (surface, ink, edge, status). Correct/incorrect pairing examples. Accessibility contrast ratios (WCAG AA minimum). Dark mode palette if applicable.

11. **Typography** — Font families, weight scale, type ramp (display → body → caption → mono), line heights, letter spacing. Pairing rules. Usage examples for headings, body text, data/financial content, UI labels.

12. **Spacing & Grid** — Base unit, spacing scale (4px/8px grid), page margins, content max-width, column grid (12-col), breakpoints. Demonstrates consistent spacing across card padding, section gaps, component internals.

13. **Shadow & Elevation** — Elevation levels (e.g. none, sm, md, lg, xl) with exact shadow values. When to use each level. If the brand uses border-first design (no shadows on cards), document that rule explicitly here.

14. **Iconography** — Icon family (e.g. Lucide), style rules (line weight, corner radius, sizing grid). Example icon set showing consistency.

15. **Photography & Imagery** — Photo style direction (mood, lighting, composition). AI image prompt guidelines for consistent generated imagery. Rules for filters, saturation, color grading.

16. **Animation & Motion** — Easing curves, duration scale (fast/normal/slow), transition types (fade, slide, scale). Entry/exit patterns. Micro-interaction guidelines (hover states, button press, loading). Reduce-motion accessibility fallbacks.

17. **Voice & Tone** — Brand voice attributes (e.g. "precise, trustworthy, quietly confident"). Writing do's and don'ts with examples. Tone shifts by context (error messages vs. success vs. onboarding vs. marketing). Terminology glossary for domain-specific language.

18. **Brand Collateral** *(optional — only if selected in Step 0.1)* — Business card mockups (front/back with specs), email signature template, social media profile layouts, document header/letterhead.

---

#### Step 0.6: DESIGN SYSTEM — Layer 2 (in `design.pen`)

AI builds the UI component library as reusable Pencil components in `design.pen` (under a "Design System" top-level group). This is the functional building-block layer — every component the product needs, with all variants and states, ready to be composed into screens.

**A. Foundations (top-level frames documenting the token system visually)**

| Frame | Content |
|-------|---------|
| **Colors** | All color tokens as swatches with variable names. Light values (+ dark if applicable). Semantic groupings: primary, secondary, accent, surface, ink, edge, status. |
| **Typography** | Type scale specimens — every size/weight combo with variable name and px value. Font pairing examples. |
| **Spacing** | Visual spacing scale (4px grid), each step shown as a labeled block. |
| **Border Radius** | Radius tokens visualized on sample rectangles (none, sm, md, lg, full). |
| **Shadows** | Each elevation level as a sample card with exact values. |
| **Breakpoints** | Device width reference frames (mobile, tablet, desktop, wide). |

**B. Components (reusable Pencil components with variants and states)**

Scope depends on the choice made in Step 0.1 (full set or product-relevant subset). Components are organized by category:

| Category | Components | States |
|----------|-----------|--------|
| **Actions** | Button (primary, secondary, outline, ghost, destructive, link), Icon Button | default, hover, active, disabled, focus, loading |
| **Forms** | Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Date Picker, OTP Input, Label, Form Field (label + input + helper + error) | default, hover, focus, filled, error, disabled |
| **Display** | Card, Badge/Status Badge, Avatar, Metric Card, Progress, Skeleton, Separator, Tooltip, Kbd | default + contextual variants |
| **Navigation** | Sidebar, Nav Item (default + active), Breadcrumb, Tabs, Pagination, Menubar | default, active, hover, disabled |
| **Tables** | Table Header, Table Row, Table Cell, Data Table (composed) | default, hover, selected |
| **Feedback** | Alert, Toast/Sonner, Dialog, Sheet/Drawer | info, success, warning, error |
| **Overlays** | Modal, Popover, Dropdown Menu, Context Menu, Command Palette | open state with content |
| **Layout** | Section Label, Page Shell, Content Area, Split Pane, Scroll Area, Resizable | structural |

Each component follows a consistent documentation pattern:
- Component name and description
- All variants laid out side-by-side
- All interactive states (default → hover → active → focus → disabled)
- Anatomy callouts (padding, gap, radius, colors as token references)
- Usage do's and don'ts where applicable

**C. Composed Blocks (realistic UI patterns using atomic components)**

| Block | Shows |
|-------|-------|
| **Auth form** | Login/register card using Input, Button, Label components |
| **Dashboard shell** | Sidebar + header + metric cards + table |
| **Data table with filters** | Filter pills + table header + rows + pagination |
| **Detail/review pane** | Split-pane layout with data on both sides |
| **Settings form** | Form fields grouped in cards with save/cancel actions |
| **Empty state** | Icon + message + CTA button |

Additional blocks are added based on the product's key screens identified in Step 0.1.

---

#### Step 0.7: MOCKUP REBUILD — Desktop Screens in Pencil

After Stitch mockups are approved (Step 0.3) and the tokens extracted (Step 0.4), Brand Book (Step 0.5) + Design System (Step 0.6) are built, rebuild the approved Stitch screens in Pencil as the structured source of truth.

1. AI rebuilds each screen in `design.pen` (under a "Mockups — Desktop" top-level group)
2. **Matches the approved Stitch reference** — same layout, hierarchy, spacing, and visual treatment
3. **Uses Design System components** — ensures every element is a reusable Pencil component
4. **References logo components** where appropriate (sidebar, login, favicon)
5. **Applies design tokens** — all colors, fonts, spacing from `design-tokens.json` (no hardcoded values)
6. Each screen is a separate top-level frame at desktop width (1280px or as defined in breakpoints)
7. You review against the Stitch reference, provide feedback, iterate, and approve before moving to mobile views

---

#### Step 0.7b: MOBILE RESPONSIVE — Mobile Views (Stitch → Pencil)

After desktop mockups are approved, the same two-phase approach produces mobile views.

##### Phase A: Generate in Stitch

1. **Generate mobile versions** of each approved desktop screen via `generate_screen_from_text` with `deviceType: "MOBILE"` and the same Design Context Prefix from Step 0.3
2. Prompt should reference the desktop version: "Mobile version of [screen name] — same data and actions, responsive layout"
3. **Iterate** by generating new screens in the same project with adjusted prompts (same approach as Step 0.3 — `edit_screens` and `generate_variants` are unreliable, do NOT use them). If MCP generation fails, prepare paste-ready prompts for the Stitch UI.
4. Approve and export HTML + screenshots via `get_screen`

##### Phase B: Rebuild in Pencil

AI creates the mobile responsive version of every screen in `design.pen` (under a "Mockups — Mobile" top-level group), matching the approved Stitch mobile references.

**For each desktop screen, the mobile view defines how every element adapts:**

| Desktop element | Mobile behavior |
|----------------|----------------|
| **Sidebar navigation** | Collapses to bottom tab bar or hamburger menu |
| **Multi-column layouts** | Stack vertically (single column) |
| **Data tables** | Switch to card/list view or horizontal scroll |
| **Metric card rows** | Stack vertically, full-width cards |
| **Side-by-side panels** | Stack with primary panel on top |
| **Modal dialogs** | Full-screen sheets (slide up from bottom) |
| **Horizontal filter bars** | Scrollable horizontal strip or expandable filter drawer |
| **Large headings/text** | Scaled down per mobile type ramp |
| **Fixed sidebars** | Hidden, accessible via toggle |
| **Pagination** | Simplified (prev/next only) or infinite scroll |

**Each mobile mockup frame includes:**
- Screen at mobile width (375px or as defined in breakpoints)
- All content visible — nothing removed, only reorganized
- Touch-friendly tap targets (minimum 44px)
- Adjusted spacing using the mobile spacing scale
- Navigation state (which tab is active, hamburger open/closed)

**Output:** A complete side-by-side reference — every desktop screen has a corresponding mobile frame showing exactly how the UI reflows. This eliminates guesswork during frontend implementation.

---

#### Step 0.8: DESIGN QA — Automated Quality Audit

After every layer in `design.pen` is created or significantly modified (brand book, design system, desktop mockups, or mobile mockups), an automated QA pass runs before human review. This catches layout bugs, text overflow, visual inconsistencies, and structural issues that are easy to miss at a glance.

**Process:**

1. **Spawn 3 parallel reviewer agents** — each takes a screenshot of every section/page and analyzes it from a different lens:

   | Agent | Role | What it checks |
   |-------|------|----------------|
   | **Typography & Text Reviewer** | Text specialist | Text overflow, truncation, clipping, missing placeholders, poor contrast, inconsistent font sizes, label misalignment, text touching borders |
   | **Layout & Spacing Reviewer** | Layout specialist | Components extending beyond containers, uneven gaps, inconsistent cell sizes in rows, misaligned elements, wasted whitespace, cramped elements, circular layout sizing |
   | **Visual Consistency Reviewer** | Design director | Cell height consistency across rows, uniform styling between similar components, clear visual hierarchy, proper section ordering, missing states, production readiness, naming consistency |

2. **Each agent works independently:**
   - Takes a screenshot of **every section/page** via `get_screenshot`
   - Reads the **node structure** via `batch_get` to verify properties (gap, padding, width, height, alignment)
   - Documents every issue found with: section name, specific description, affected node ID, suggested fix

3. **Compile unified report** — deduplicate findings across all 3 agents, categorize by severity (High / Medium / Low), and present a prioritized fix list to the user.

4. **Fix in priority order:**
   - **Global fixes first** — issues that affect all sections at once (e.g., adding `width: "fill_container"` to all cells, standardizing row gaps). These resolve the most issues with the fewest operations.
   - **Section-specific fixes next** — individual component issues (e.g., missing placeholders, checkbox structure, alert icon alignment).
   - **Re-screenshot and verify** after each batch of fixes.

5. **Repeat until clean** — if new issues surface after fixes (e.g., circular layout warnings from conflicting sizing), fix those too. The audit is complete when all sections pass visual inspection.

**Common issues this step catches:**

| Category | Examples |
|----------|----------|
| **Overflow** | Components wider than their container, text running beyond cell boundaries, fixed-width content in flex rows, **nested content overlapping within responsive components** (e.g., text + buttons inside a pagination that was resized to `fill_container` — the internal text still needs `width: fill_container` + `textGrowth: fixed-width` to prevent overlap) |
| **Spacing** | Inconsistent gaps between rows (12px vs 16px vs 24px), cells not filling available width, uneven cell heights in same row |
| **Text** | Missing placeholder text, labels without enough contrast, text truncation at fixed column widths, empty input fields in showcase |
| **Structure** | Components with `fill_container` inside `fit_content` parents (circular sizing), check icons as siblings instead of nested children, alert icons center-aligned on multi-line text |
| **Consistency** | Sections missing cell wrappers, components in wrong sections (e.g., SearchBar in Feedback), inconsistent naming conventions across labels |
| **Completeness** | Missing design system header (title/version), no foundation sections (colors, typography), missing interactive states |

**Key rules:**
- Always try **global batch fixes** before individual fixes — one `batch_design` call updating all row gaps is better than 10 separate calls
- Watch for **circular layout warnings** — `height: "fill_container"` on children inside `fit_content` parents causes conflicts. Use fixed heights or remove the fill.
- After every batch of fixes, **re-screenshot** the affected sections to verify visually — zoom into individual cells, not just section-level screenshots
- When changing a component to `fill_container`, **also check its internal children** — unconstrained text nodes inside a now-smaller component will still overflow. Fix by adding `width: "fill_container"` + `textGrowth: "fixed-width"` to text nodes that share space with sibling elements
- **Post-fix verification must be as rigorous as the initial audit.** Don't just re-screenshot at section level and glance. Screenshot each *individual cell* that was modified, read its node structure at depth 3+, and verify that children at every nesting level fit within their parent. Fixing one overflow can create a second-order overflow one level deeper.
- This step is **non-blocking** — the user decides which issues to fix and which to accept

**Output:** A clean, visually verified design system where every component is properly contained, labeled, and readable.

---

**Why this matters:** Iterating on mockups and brand decisions is free. Iterating on code is expensive. Anti-slop rules are baked into the design brief so generic AI aesthetics are blocked at design time, not just at code time. The Stitch → Pencil workflow ensures high-quality AI-generated designs (Stitch) are captured as structured, token-enforced components (Pencil) — giving you both creative quality and implementation precision. A complete brand book + design system ensures consistency across not just the app UI, but also marketing materials, proposals, social content, and anything else the brand touches.

**Outputs (1 design file + docs, all QA-verified):**

| Artifact | Location | Purpose |
|----------|----------|---------|
| Brand Book | `design.pen` → "Brand Book" group | Brand identity, logo rules, color/type/spacing specs, voice & tone (~18 pages) |
| Design System | `design.pen` → "Design System" group | Foundations + reusable UI components + composed blocks |
| Stitch Project | Stitch MCP (cloud) | AI-generated reference screens (creative source of truth) |
| Desktop Mockups | `design.pen` → "Mockups — Desktop" group | Key app screens at desktop width (rebuilt from Stitch references) |
| Mobile Mockups | `design.pen` → "Mockups — Mobile" group | Responsive mobile views (rebuilt from Stitch references) |
| Design Tokens | `docs/design-tokens.json` | Canonical token values (absolute truth for code) |
| Design System Spec | `docs/DESIGN_SYSTEM.md` | Human-readable design spec |
| Design Brief | `docs/DESIGN_BRIEF.md` | Brand direction + anti-slop rules |
| Brand Guidelines Skill | `.claude/skills/brand-guidelines/SKILL.md` | Auto-enforced during all frontend coding |

Step 0.7 (Design QA) runs automatically after each layer in `design.pen` is delivered. All design artifacts are QA-verified before Sprints 1–4 begin. The brand-guidelines skill ensures every line of frontend code matches the approved designs.

> Skip this step only if you already have an existing design system and brand book. For existing projects, see the "Existing Projects" workflow in `project-starter/docs/DESIGN_PIPELINE.md`.

### 📋 Step 1: Paste into Claude Code to start building:
```
You are my lead engineer acting as Team Lead. Read /outputs/product_brief.md, /outputs/offer_design.md, and docs/DESIGN_BRIEF.md.

The design system is already set up:
- docs/design-tokens.json — canonical brand tokens (absolute truth)
- .claude/skills/brand-guidelines/SKILL.md — auto-enforced during all frontend work
- docs/DESIGN_SYSTEM.md — human-readable design spec
- design.pen — approved mockups (desktop + mobile) from the design pipeline

All frontend work MUST match the approved mockups and use design tokens. Never hardcode colors, fonts, or spacing.

First, ask me:
1. Existing codebase or start from scratch?
2. Any third-party APIs that must be integrated? (e.g. Stripe, Anthropic Claude API, Supabase)
3. Hosting: Metanet FTP (default for all predivo.ch subdomains) or other?
4. Which sprint should I start with? (Scaffold / Core Feature / Auth+Payments / Landing Page)

IMPORTANT: Use the project-starter template (`/c/Business/Internal Projects/project-starter/`) to bootstrap:
- Copy `.claude/`, `.github/`, `context/` directories
- Copy Supabase shared helpers (auth.ts, cors.ts) if using Supabase
- Copy `.htaccess` template for SPA routing
- Rename deploy.yml.template → deploy.yml and customize subdomain + app dir

Then for EACH sprint, create a fresh Agent Team:

--- SPRINT 1: PROJECT SCAFFOLD ---
TeamCreate: "scaffold"
Teammate 1 — "project-setup": Initialize repo, folder structure, README, .env.example per tech stack in product_brief.md. Set up Tailwind config with design tokens from docs/design-tokens.json. Configure CSS variables / theme from brand-guidelines.
Teammate 2 — "db-architect": Design and write database schema for all core entities. Create migrations.
Teammates message each other to align on naming conventions before writing files.
Team Lead: Stitch together, verify it runs locally. Verify design tokens are wired into Tailwind/CSS. Ask me: "Scaffold done. Start core feature sprint?"

--- SPRINT 2: CORE FEATURE ---
TeamCreate: "core-feature"
Teammate 1 — "backend-dev": Build API routes for the core feature. Document the interface.
Teammate 2 — "db-dev": Write migrations, seed data, schema validation. Coordinate with backend-dev on data shapes.
Teammate 3 — "frontend-dev": Build main UI component. Coordinate with backend-dev on API contract.
Teammate 4 — "qa-reviewer": Review the output of all three. Flag conflicts, missing error handling, security issues. Message each teammate directly with specific fixes.
Teammates use lateral messaging to coordinate API contracts in real time.
Team Lead: Stitch, verify end-to-end. Ask me: "Core feature done. Start auth+payments sprint?"

--- SPRINT 3: AUTH + PAYMENTS ---
TeamCreate: "auth-payments"
Teammate 1 — "auth-dev": Implement authentication using Supabase Auth (OTP — 6 digits, 600s expiry). Auto-create profile + organization on signup via DB trigger.
Teammate 2 — "payments-dev": Implement Stripe checkout for pricing tiers from offer_design.md. Coordinate with auth-dev on user identity linking.
Team Lead: Verify login and checkout flows work. Ask me: "Auth and payments done. Start landing page sprint?"

--- SPRINT 4: LANDING PAGE ---
TeamCreate: "landing-page"
Teammate 1 — "copywriter": Write all copy using the exact customer pain language from phase1_idea_validation.md. Sections: Hero, Problem, Solution, Features, Pricing, FAQ, CTA.
Teammate 2 — "frontend-builder": Build the landing page with the copy from the copywriter teammate. Use the approved mockups as the visual reference. All colors, fonts, spacing from design-tokens.json — brand-guidelines skill is auto-enforced. Coordinate directly with copywriter for copy handoff.
Teammate 3 — "conversion-reviewer": Review the page for conversion best practices AND brand compliance (matches approved mockups, uses design tokens). Message frontend-builder directly with specific changes.
Team Lead: Final review. Verify design matches approved mockups. Ask me: "MVP complete. Ready to build the marketing pipeline?"
```

### ✅ Output: Working local MVP

---

## PHASE 4 — MARKETING CONTENT PIPELINE
**Goal:** 7-day content calendar across platforms + outreach templates.
**Team setup:** Lead + 3 teammates (written / video / outreach in parallel)

> **Distribution strategy:** Before diving into content, read `DISTRIBUTION_PLAYBOOK.md` (in the playbook root) — the six-engine framework (Pull, Push, Bridge, Search, Equity, Persistence) for choosing and sequencing your go-to-market channels. Pick one primary engine first. The content pipeline below supports primarily the Push engine (audience building + waitlist) and Pull engine (SEO content).

### 📋 Paste into Claude Code:
```
You are my content strategist acting as Team Lead. Read all files in /outputs/.

First, ask me:
1. Which platforms? (select: X/Twitter, LinkedIn, Instagram, YouTube, TikTok)
2. Posting frequency goal? (e.g. daily, 3x/week)
3. Narrative angle: "build in public" or direct launch campaign?
4. Personal brand angle? (e.g. "Swiss dev going indie", "ex-corporate founder")

Then create an Agent Team with 3 teammates:

TeamCreate: "marketing-pipeline"

Teammate 1 — "written-content"
Task: Using exact customer pain language from phase1_idea_validation.md, produce for each of 7 days:
- 1x short-form written post for X/LinkedIn
- 1x LinkedIn article outline (for 1 post that week)
Write like a founder, not a copywriter. No generic AI marketing language.
Message outreach-writer with the top 3 pain phrases to use in DMs.
Save to /outputs/marketing_written.md

Teammate 2 — "video-scripts"
Task: For each of 7 days, produce:
- 1x short-form video script (60–90 sec) for Instagram/TikTok/YouTube Shorts
- 1x thumbnail brief (text description of visual concept)
Coordinate with written-content teammate to ensure messaging is consistent.
Save to /outputs/marketing_video.md

Teammate 3 — "outreach-writer"
Wait for pain phrases from written-content teammate.
Then produce:
- 5x personalized B2B outreach DM templates (for direct outreach to target customers)
- 3x email subject line options for launch announcement
- 1x launch announcement email (full draft)
Save to /outputs/marketing_outreach.md

Team Lead: Compile all three into /outputs/marketing_week1.md. Ask me: "Marketing pipeline ready. Review and approve posts before I schedule them."
```

### ✅ Outputs: `marketing_week1.md` (written + video + outreach combined)

---

## PHASE 5 — DEAL CLOSING (PROPOSAL GENERATOR)
**Goal:** Sales call transcript → tailored client proposal in under 5 minutes.
**Team setup:** Lead + 2 teammates (proposal writer + objection handler)

### 📋 Paste into Claude Code:
```
You are my sales strategist acting as Team Lead.

First, ask me:
1. Paste the sales call transcript or describe the conversation.
2. Client's industry and company size?
3. Target deal size?
4. Your delivery timeline estimate?
5. Pricing format: fixed / monthly retainer / milestone-based?

Then create an Agent Team with 2 teammates:

TeamCreate: "proposal-[client-name]"

Teammate 1 — "proposal-writer"
Task: Draft a fully tailored proposal using the client's exact words where possible.
Structure:
1. Executive Summary (2 sentences — mirror the client's language back)
2. Their Problem (as they described it, not as we interpreted it)
3. Our Solution (specific to their situation)
4. Scope of Work (3–5 bullet points, time-boxed)
5. Deliverables (format + timeline)
6. Investment (Good / Better / Best pricing tiers)
7. Why Us (specific proof, no generic claims)
8. Next Steps (single CTA: "Reply YES to reserve your spot")
Message objection-handler with the 3 biggest hesitations the client expressed.
Save to /outputs/proposal_[client].md

Teammate 2 — "objection-handler"
Wait for hesitations from proposal-writer.
Then produce:
- Objection handling cheat sheet (top 5 objections + specific responses)
- 1x follow-up email (to send 48h after proposal if no reply)
- 1x "closing nudge" message (friendly short message for day 5)
Append all to /outputs/proposal_[client].md

Team Lead: Review the compiled proposal. Ask me: "Proposal ready. Want me to adjust pricing tiers or any section before you send?"
```

### ✅ Output: `proposal_[client].md` with follow-up sequence

---

## PHASE 6 — DAILY OPERATING ROUTINE
**Goal:** Run the full one-person business loop in one focused daily session.
**Team setup:** Varies by business phase — Lead spins up lightweight teams as needed.

### 📋 Paste into Claude Code:
```
Run my daily AI business routine. I use Agent Teams. Act as Team Lead.

First, ask me:
1. Business phase today?
   (A) Pre-launch — still building
   (B) Launch week
   (C) Post-launch — growing MRR
   (D) Closing active deals
2. Any blockers or priorities to address first?

Then run these blocks in sequence. Pause and ask my approval between each:

--- MORNING: MARKET PULSE (15 min) ---
TeamCreate: "daily-research"
Teammate 1 — "market-watcher": Search for new competitor moves, community posts, trends in our niche (read product_brief.md for context). Output: 3-bullet "Market Pulse" summary.
Save to /outputs/daily_summary_[today's date].md

--- MID-MORNING: BUILD SPRINT ---
Ask me: "What is the single most important thing to build or fix today?"
TeamCreate: "daily-build"
Spawn teammates based on what I answer (e.g. frontend + backend if it's a feature; single reviewer if it's a bug).
Run ONE focused sprint. Teammates coordinate directly on any cross-cutting changes.
Append progress to daily summary.

--- AFTERNOON: CONTENT (20 min) ---
TeamCreate: "daily-content"
Teammate 1 — "post-writer": Take today's build progress (from daily summary) and write 1x post (X/LinkedIn).
Teammate 2 — "script-writer": Write 1x short video script based on same update. Coordinate with post-writer for consistency.
Teammate 3 — "thumbnail-designer": Write 1x thumbnail brief.
Save to /outputs/content_[today's date].md
Ask me: "Content ready — approve to schedule?"

--- EVENING: OUTREACH / PROPOSALS ---
Ask me: "Do you have a new lead to proposal, or should I write outreach DMs?"
If lead: run Phase 5 flow (proposal team).
If no lead:
TeamCreate: "daily-outreach"
Teammate 1 — "prospect-researcher": Find 3 new target prospects matching our ideal customer profile.
Teammate 2 — "dm-writer": Write 3 personalized outreach DMs using prospect research. Coordinate directly with prospect-researcher.
Save to /outputs/outreach_[today's date].md

Team Lead: End of day — append to daily summary:
- What shipped today
- What's next
- One risk to watch
```

---

## 📁 FILE STRUCTURE

There are two distinct folder structures: the **playbook** (reusable template) and each **project** (specific product).

### Playbook Folder (this folder — reusable template)
```
1-Person AI Business Playbook/
  docs/
    ONE_PERSON_AI_BUSINESS_WORKFLOW.md  <-- This file (the workflow)
    references/                         <-- Design reference screenshots for Step 0.1
  outputs/                              <-- Phase 1 outputs (before project folder exists)
    phase1_idea_validation.md
  DISTRIBUTION_PLAYBOOK.md              <-- Six-engine go-to-market framework
  .claude/
    settings.json                       <-- Agent Teams config
```

### Project Starter Template (shared infrastructure)
```
project-starter/                        <-- Copy from here when creating new projects
  .claude/
    agents/                             <-- build-validator, code-review, design-review, security-review
    commands/                           <-- /code-review, /design-review, /security-review, /plan, /learn
    skills/                             <-- brand-guidelines, design-pipeline, reviews, plan, learn
    settings.json
  .github/workflows/
    deploy.yml.template                 <-- Metanet FTP zero-downtime deploy (customize subdomain)
    keep-alive.yml.template             <-- Supabase free-tier ping (every 2 days)
    code-review.yml                     <-- Automated PR code review
    design-review.yml                   <-- Automated PR design review
    security-review.yml                 <-- Automated PR security review
  supabase/functions/_shared/
    auth.template.ts                    <-- JWT auth + admin/user client factory
    cors.template.ts                    <-- Dynamic CORS with origin allowlist
  context/
    design-principles.md                <-- Customizable design checklist
    style-guide.md                      <-- Customizable brand style guide
  public/
    .htaccess.template                  <-- SPA routing for Apache/Metanet
  CLAUDE.md.template                    <-- Base CLAUDE.md with all standard sections
```

> **Rule:** The playbook folder never contains project-specific artifacts (design tokens, design briefs, brand skills, `.pen` files). Those are created inside each project's own folder.

### Project Folder (created per product — e.g. `/c/Business/Internal Projects/[Product Name]/`)
```
[Product Name]/
  design.pen                            <-- Single design file (brand book + design system + mockups)
  docs/
    DESIGN_BRIEF.md                     <-- Brand direction + anti-slop rules
    design-tokens.json                  <-- Canonical tokens (absolute truth)
    DESIGN_SYSTEM.md                    <-- Human-readable design spec
  outputs/
    product_brief.md
    offer_design.md
    marketing_week1.md
  src/                                  <-- Frontend (React + TypeScript + Vite + Tailwind)
  supabase/
    functions/                          <-- Edge Functions (Deno)
      _shared/                          <-- auth.ts, cors.ts, email.ts
      [function-name]/index.ts
    migrations/                         <-- SQL migrations (applied by CI on deploy via scripts/apply-migrations.mjs — never by hand)
  public/
    .htaccess                           <-- SPA routing for Metanet
  .claude/
    settings.json
    agents/                             <-- build-validator, code-review, design-review, security-review
    commands/                           <-- /code-review, /design-review, /security-review, /plan
    skills/brand-guidelines/
      SKILL.md                          <-- Auto-enforced during all frontend work
  .github/workflows/
    deploy.yml                          <-- Metanet FTP zero-downtime deploy
    keep-alive.yml                      <-- Supabase free-tier ping
  context/
    design-principles.md
    style-guide.md
  CLAUDE.md                             <-- Project-specific rules and verification loop
```

---

## 🔁 WORKFLOW DECISION TREE
```
New business idea?
  └─> PHASE 1 (Idea Validation — runs in PLAYBOOK folder)
      └─> Create new project folder? (Y/N)
          └─> PHASE 2 (Brief + Offer — runs in PROJECT folder)
              └─> PHASE 3 Step 0: /design-pipeline (brand book + design system in Pencil, screen mockups via Stitch → Pencil)
                  └─> PHASE 3 Sprints 1-4 (MVP Build — 4-agent teams)
                      └─> PHASE 4 (Marketing — 3-agent team, repeat weekly)
                          └─> PHASE 5 (Proposals — 2-agent team, per deal)
                              └─> PHASE 6 (Daily Routine — lightweight teams, every day)

Already have an idea?     → Create project folder, then start at PHASE 2
Already have a product?   → Start at PHASE 4 (in project folder)
Hot lead right now?       → Run PHASE 5 standalone
Just need today's loop?   → Run PHASE 6
Need a design system?     → Run /design-pipeline standalone
```

> **Folder rule:** Phase 1 always runs in the playbook folder. Phases 2–6 always run in the dedicated project folder.

---

## 💡 AGENT TEAMS TIPS

**Ctrl+T** — View the shared task list at any time to see what each teammate is doing.

**tmux panes** — If you have tmux installed, each teammate appears in its own terminal pane. You can type directly into any pane to redirect a specific agent without going through the lead.

**Token cost warning** — Agent Teams use significantly more tokens than a single session. For simple single-file tasks, use a regular Claude Code session instead. Use teams when work genuinely spans multiple layers (frontend + backend + tests).

**Context tip** — Teammates don't inherit the lead's conversation history. Always include relevant file paths in spawn prompts so teammates load the right context (they auto-load CLAUDE.md and MCP servers, but not prior chat).

**Shutdown order** — Always shut down teammates before running cleanup. Never have a teammate run cleanup.

---

## ⏰ SCHEDULING — PUT THE PLAYBOOK ON AUTOPILOT

> Released March 7, 2026. Two flavors — pick the right one for each task.

### The Two Scheduling Tools

| | `/loop` + Cron (CLI) | Desktop Scheduled Tasks |
|---|---|---|
| **Where** | Claude Code terminal session | Claude Desktop app (macOS/Windows) |
| **Survives restart?** | ❌ Dies when you close terminal | ✅ Persistent across restarts |
| **Max duration** | 3 days (auto-expires) | Indefinite |
| **Best for** | In-session polling, deploy checks | Daily/weekly recurring business tasks |
| **Setup** | Type `/loop` in Claude Code | Click "Scheduled" in Desktop sidebar |

---

### 🔄 SESSION-SCOPED: `/loop` (Claude Code CLI)

Use this during active work sessions for real-time monitoring and in-session automation.

**Syntax:**
```
/loop [interval] [prompt or slash command]
```

**Practical examples for this playbook:**

```bash
# Phase 3 — Monitor a deployment while you work on something else
/loop 5m check if the deploy at localhost:3000 is healthy and report any errors

# Phase 3 — Auto-review PRs as they come in during a sprint
/loop 15m /review-pr check for any open PRs and flag issues directly to the relevant teammate

# Phase 4 — Check if scheduled posts went live
/loop 30m check if today's content in /outputs/content_[today].md has been published and confirm

# Phase 1 — Poll for new Product Hunt launches during research
/loop 1h check Product Hunt for any new launches in our niche and append findings to /outputs/phase1_idea_validation.md

# General — One-time reminder (fires once, then deletes itself)
remind me at 5pm to review and approve today's outreach DMs before sending
```

**Rules to know:**
- Default interval if you omit it: every 10 minutes
- Units: `s` (seconds), `m` (minutes), `h` (hours), `d` (days)
- Max 50 scheduled tasks per session
- Auto-expires after 3 days — recreate if needed
- Tasks run between your turns, not while Claude is responding
- No catch-up: if Claude was busy when a task was due, it fires once when idle

---

### 📅 PERSISTENT: Desktop Scheduled Tasks

Use this for recurring business automation that should run every day or week, with or without an active session.

**Setup:** Open Claude Desktop → click **"Scheduled"** in the left sidebar → **"+ New task"**

**Where prompts are stored:** `~/.claude/scheduled-tasks/<task-name>/SKILL.md`

> ⚠️ Requires computer to be awake and Claude Desktop open. If the machine is asleep, it runs automatically once you wake it.

---

### 🗓️ RECOMMENDED SCHEDULE FOR THIS PLAYBOOK

Set these up once in Claude Desktop and let them run automatically:

**Every weekday at 7:30am — Morning Market Pulse**
```
Read /outputs/product_brief.md to understand our niche.
Search for: new competitor moves, relevant Reddit/community posts, and trending topics in our market from the last 24 hours.
Write a 3-bullet "Market Pulse" summary.
Append it to /outputs/daily_summary_[today's date].md
```

**Every Sunday at 9:00am — Weekly Marketing Refresh**
```
Read /outputs/phase1_idea_validation.md, /outputs/product_brief.md, and last week's marketing files.
Generate a new 7-day content calendar:
- 7x short-form posts (X/LinkedIn)
- 7x video scripts (60–90 sec)
- 7x thumbnail briefs
Use the customer pain language from phase1_idea_validation.md. Write like a founder, not a copywriter.
Save to /outputs/marketing_week_[YYYY-MM-DD].md
```

**Every weekday at 6:00pm — Outreach Pipeline**
```
Read /outputs/product_brief.md and /outputs/phase1_idea_validation.md.
Find 3 new target prospects matching our ideal customer profile.
Write 3 personalized B2B outreach DMs — use the exact pain language from phase1_idea_validation.md.
Save to /outputs/outreach_[today's date].md
```

**Every Friday at 4:00pm — Weekly Business Review**
```
Read all files created this week in /outputs/.
Summarize:
- What shipped (features, content, outreach sent)
- MRR/revenue progress (if any deal files exist)
- Top 3 things to prioritize next week
- One risk to watch
Save to /outputs/weekly_review_[YYYY-MM-DD].md
```

**Every Monday at 8:00am — Competitor Check**
```
Read /outputs/product_brief.md.
Search for any product updates, pricing changes, or new features from our top competitors in the last 7 days.
Flag anything we should react to.
Append to /outputs/daily_summary_[today's date].md
```

---

### 🔗 COMBINING SCHEDULING WITH AGENT TEAMS

For the most powerful automation, trigger an Agent Team from a scheduled task:

```
# In your Desktop scheduled task prompt:
You are Team Lead. Today is [date].

Create an Agent Team "weekly-marketing":
  Teammate 1 — research new customer pain posts from Reddit this week
  Teammate 2 — write 7 posts using findings from teammate 1
  Teammate 3 — write 7 video scripts consistent with teammate 2's posts

Compile all outputs to /outputs/marketing_week_[today].md
```

This runs every Sunday without you touching anything — a full 3-agent marketing team fires automatically.

---

### ⚡ QUICK REFERENCE: WHICH SCHEDULER TO USE

| Task | Use |
|---|---|
| Monitor a deploy during a sprint | `/loop 5m` |
| Check if build tests pass | `/loop 2m` |
| Daily morning market brief | Desktop Scheduled Task (7:30am daily) |
| Weekly content calendar | Desktop Scheduled Task (Sunday 9am) |
| Auto outreach DMs | Desktop Scheduled Task (weekdays 6pm) |
| Remind yourself mid-session | `/loop` one-shot reminder |
| Weekly business review | Desktop Scheduled Task (Friday 4pm) |

---

*Built for: Predivo GmbH / Roger*
*Features: Claude Code Agent Teams (v2.1.32+, Opus 4.6 required) + Scheduling (/loop + Desktop, v2.1.32+)*
*Last updated: 2026-03-18 — synced with project-starter template, Supabase patterns, Metanet deploy workflow*
