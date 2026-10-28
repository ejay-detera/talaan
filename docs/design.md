---
name: Talaan
description: The notebook, kept — a verification-first sari-sari store ledger built as real paper on a real desk.
colors:
  desk: "#E3E9D3"
  paper: "#F2F5EC"
  sheet: "#FFFFFF"
  slip: "#FFFEF8"
  rule: "#D5DEC6"
  pencil: "#23262B"
  muted: "#5B6457"
  ink: "#1E3FAE"
  margin: "#C8302F"
  marker: "#FFE14D"
  paid: "#1F7A4D"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 1rem + 6vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  h1:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h2:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  amount:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "'tnum' 1"
  small:
    fontFamily: "Atkinson Hyperlegible Next, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  notebook:
    fontFamily: "Caveat, cursive"
    fontSize: "1.375rem"
    fontWeight: 500
    lineHeight: "2rem"
rounded:
  paper: "2px"
  row: "4px"
  sheet: "12px"
  pill: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  base: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.row}"
    height: "56px"
    padding: "0 24px"
  button-scan:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.sheet}"
    rounded: "{rounded.pill}"
    height: "56px"
    padding: "0 28px"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.row}"
    height: "48px"
    padding: "0 16px"
  ledger-sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.pencil}"
    rounded: "{rounded.paper}"
  slip:
    backgroundColor: "{colors.slip}"
    textColor: "{colors.pencil}"
    rounded: "{rounded.paper}"
    padding: "20px 24px"
---

# Design System: Talaan

## Overview

**Creative North Star: "The Notebook, Kept"**

Talaan is paper. Not "paper-inspired", not "a card with a cream background": every surface is a physical sheet of the things a sari-sari store owner already trusts at the counter. Pale green analysis-pad paper (`paper`), crisp ruled notebook sheets (`sheet`), loose slips and receipts (`slip`), ballpen blue ink (`ink`), a vertical red margin line (`margin`), and a yellow highlighter (`marker`), all resting on a slightly darker desk (`desk`).

Everything verified by deterministic code reads like clean ink on ruled paper. Everything that needs the owner's eyes looks like a highlighter stroke or a red margin mark. If a row is unmarked, it is safe.

**Key Characteristics:**
- **Paper has depth, ink has none.** Surfaces are layered paper with real edges and soft contact shadows. Text, numbers, and rules are flat ink printed on top.
- **Signal-only color.** Red (`margin`) and yellow (`marker`) mean uncertainty or discrepancy. Nothing else uses them.
- **Hyperlegible tabular numerals.** All UI copy and every peso column (`₱`) use Atkinson Hyperlegible Next with `tabular-nums`. No monospace anywhere.
- **Handwriting quarantine.** Caveat appears only for raw handwritten owner text and landing-page pinned notes. Never in UI labels or controls.
- **Phone-first thumb geometry.** 360px baseline, one primary action per screen anchored at the bottom (`56px`), `48px` minimum tap targets.
- **Plain Taglish copy.** Sentence case, plain verbs, actionable errors, explicit model provenance.

---

## The Paper System

This section is the contract for how "paper" is drawn. Every surface in the product is exactly one of the four layers below. If a surface does not fit one, it should not exist.

### Layers

| Layer | Token | Where | Edge | Shadow | Radius | Rotation |
|---|---|---|---|---|---|---|
| **Desk** | `desk` + grain | Landing hero and footer bands only | none | none | none | none |
| **Pad** | `paper` + grain | App canvas, landing body | none | none | none | none |
| **Sheet** | `sheet` | Ledger sheets, form cards, reminder card | `1px solid rule` | **none** | `paper` (2px) | never |
| **Slip** | `slip` or `sheet` | Loose paper: proof slips, receipts, pinned notes, page stacks | **none** | `shadow-slip` | `paper` (2px) | landing: ±1° to ±3°, app: never |

**The Edge-or-Shadow Rule.** A surface has either a printed border (it is attached to the pad) or a shadow (it is loose on top of it). Never both. This resolves flat versus tactile: sheets are flat, slips float.

**Paper corners are almost square.** Real paper does not have 12px corners. Use `rounded.paper` (2px) on every sheet and slip. `rounded.sheet` (12px) is reserved for mobile bottom sheets and modals, which are UI chrome, not paper.

**Layer order (z):** desk < pad < sheet < slip < tape < stamp.

### Recipes

Use these exactly. Do not invent alternative shadows, textures, or paper effects.

**Grain** (the single texture on desk and pad; never on sheets, slips, inputs, or buttons so text stays crisp):
```css
--paper-grain: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .14 0 0 0 0 .15 0 0 0 0 .17 0 0 0 .07 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
/* body { background: var(--paper-grain), var(--color-paper); } */
/* .desk { background: var(--paper-grain), var(--color-desk); } */
```
Grain alpha stays at or below `0.08`. If it is visible as a pattern at arm's length, it is too strong.

**Slip shadow** (three stacked layers: contact, edge, ambient; tinted with `pencil`, never pure black):
```css
--shadow-slip:      0 1px 1px rgba(35,38,43,.10), 0 3px 6px rgba(35,38,43,.08), 0 14px 28px -10px rgba(35,38,43,.20);
--shadow-slip-lift: 0 1px 1px rgba(35,38,43,.10), 0 6px 12px rgba(35,38,43,.10), 0 22px 40px -12px rgba(35,38,43,.26);
--shadow-bar:       0 -4px 16px rgba(35,38,43,.08);  /* sticky bottom bar only */
```

**Ruling** (functional gradient exception: a repeating hairline is paper ruling, not decoration). Use on `.notebook` blocks and ledger sheet bodies. Line pitch equals text line-height so handwriting sits on the lines:
```css
.ruled {
  --line: 2rem;
  background-image: repeating-linear-gradient(
    to bottom, transparent 0, transparent calc(var(--line) - 1px),
    var(--color-rule) calc(var(--line) - 1px), var(--color-rule) var(--line));
}
```

**Margin line** (`2px`, `margin` color, `44px` from the sheet's left edge, full height):
```css
.margin-rule { position: relative; padding-left: 60px; }
.margin-rule::before { content: ""; position: absolute; inset: 0 auto 0 44px; width: 2px; background: var(--color-margin); transform-origin: top; }
```

**Tape** (holds a slip to the pad; max one per slip, centered on a top edge or corner):
`72px × 22px`, `rule` at `70%` opacity, rotated `-4°` to `4°` opposite the slip's own rotation, `1px 1px 2px rgba(35,38,43,.12)` shadow. No blur, no gloss.

**Torn edge** (bottom of notebook-page and receipt slips; the clip-path cuts off box-shadow, so put the shadow on a wrapper via `filter: drop-shadow(0 6px 8px rgba(35,38,43,.15))`):
```css
.torn-bottom { clip-path: polygon(0 0,100% 0,100% calc(100% - 6px),96% 100%,92% calc(100% - 5px),88% 100%,84% calc(100% - 6px),80% 100%,76% calc(100% - 4px),72% 100%,68% calc(100% - 6px),64% 100%,60% calc(100% - 5px),56% 100%,52% calc(100% - 6px),48% 100%,44% calc(100% - 4px),40% 100%,36% calc(100% - 6px),32% 100%,28% calc(100% - 5px),24% 100%,20% calc(100% - 6px),16% 100%,12% calc(100% - 4px),8% 100%,4% calc(100% - 6px),0 100%); }
```

**Stamp** (provenance and paid marks; looks pressed into the paper, never a chip):
`2px solid` in `paid` (paid) or `muted` (provenance), `rounded.row`, Bricolage Grotesque `700`, sentence case, `padding: 4px 12px`, `transform: rotate(-4deg)`, `mix-blend-mode: multiply`, `opacity: .88`. Maximum one stamp per slip or sheet.

**Page stack** (recent notebook pages on the dashboard): the top page is a Slip; two copies sit behind it using pseudo-elements offset `translate(3px, 4px)` and `translate(6px, 8px)`, same `sheet` fill, `shadow-slip` on the lowest only.

### Motion

Two budgets. Never mix them.

**App screens (dashboard, review, customers):** exactly one authored moment. When `/pages/[id]/review` opens, the `2px` margin line draws down the sheet (`scaleY(0)` to `scaleY(1)`, `420ms cubic-bezier(0.22, 1, 0.36, 1)`). Everything else is response to touch: buttons press down `1px`, rows highlight on tap. No idle motion, no entrance animations, no hover-lift on ledger rows.

**Landing page:** three allowed layers.
1. **Settle-in, once on load:** each hero slip starts `-14px` up with `+3°` extra rotation and `opacity 0`, then settles to its resting transform. `600ms cubic-bezier(0.22, 1, 0.36, 1)`, `90ms` stagger, hero only. No scroll-triggered fade-ups on later sections.
2. **Idle drift:** at most **two** secondary slips in the hero drift (`translateY` ±4px, `7s` and `9s ease-in-out infinite`). Transform only; never animate shadow or filter in a loop.
3. **Hover-lift:** only on slips that are interactive (the demo CTA slip). `translateY(-4px)`, swap to `shadow-slip-lift`, `160ms ease-out`.

All motion is disabled under `@media (prefers-reduced-motion: reduce)`; slips render at their resting transform.

---

## Colors

Engineered for high-glare tropical daylight and storefront fluorescent bulbs. (Contrast ratios below are carried over from the previous version; re-verify after any hex change.)

### Primary & Action
- **Ballpen Ink** (`#1E3FAE` · `ink`): Primary CTAs, links, focus rings, confirmed values (`8.6:1` on `sheet`).

### Semantic Signals
- **Red Margin** (`#C8302F` · `margin`): The `2px` margin line, arithmetic discrepancies (`quantity * unit_price !== amount` or `computed_total !== written_total`), errors, overdue *utang* (`5.6:1` on `sheet`).
- **Highlighter Marker** (`#FFE14D` · `marker`): Background fill only for `needs_review` rows (`confidence < 0.80`).
- **Paid Stamp** (`#1F7A4D` · `paid`): Confirmed pages, recorded *bayad*, balanced totals (`5.4:1` on `sheet`).

### Paper Surfaces & Ink
- **Desk** (`#E3E9D3` · `desk`): Landing hero and footer backgrounds only. Text on `desk` is always `pencil`. Its job is to give white sheets and slips something to separate from.
- **Analysis Pad Paper** (`#F2F5EC` · `paper`): App canvas (cuts white screen glare).
- **Notebook Sheet** (`#FFFFFF` · `sheet`): Ledger sheets, form inputs, cards.
- **Loose Slip** (`#FFFEF8` · `slip`): Receipts, proof slips, pinned notes. Warmer than `sheet` so a slip reads as different paper when overlapping a sheet. **Not yellow**: sticky notes are `slip`, never `marker`.
- **Ruled Line** (`#D5DEC6` · `rule`): `1px` ledger rules, sheet borders, dividers, tape.
- **Graphite Pencil** (`#23262B` · `pencil`): Body text and amounts (`15.1:1` on `paper`, `13.2:1` on `marker`).
- **Muted Sage** (`#5B6457` · `muted`): Secondary metadata and timestamps (`4.9:1` on `paper`, `5.9:1` on `sheet`). Not for use on `desk`.

---

## Typography

**Display & Headings:** Bricolage Grotesque (`700`, `font-optical-sizing: auto`)
**UI, Body & Ledger Amounts:** Atkinson Hyperlegible Next (`400`, `600`, `700`)
**Owner's Handwriting:** Caveat (`500`), `.notebook` and landing `.pinned-note` only

**Character:** Warm, grounded signage headers paired with an accessibility-grade body face that disambiguates `3`/`8`, `5`/`6`, `1`/`7`, `0`/`O` on dim phone screens.

### Hierarchy
| Role | Font | Weight & Features | Size / Line-Height | Usage |
|---|---|---|---|---|
| `display` | Bricolage Grotesque | `700`, optical size on, `-0.03em`, `text-wrap: balance` | `clamp(40px, 16px + 6vw, 88px)` / `1.02` | Landing hero headline only |
| `h1` | Bricolage Grotesque | `700`, `-0.02em`, `text-wrap: balance` | `28px` / `1.15` | Screen title |
| `h2` | Bricolage Grotesque | `700`, `-0.01em`, `text-wrap: balance` | `20px` / `1.25` | Section and sheet header |
| `body` | Atkinson Hyperlegible Next | `400` / `600`, `text-wrap: pretty` | `17px` / `1.5` | Default reading and item names (`17px` floor) |
| `amount` | Atkinson Hyperlegible Next | `700`, `tabular-nums` | `20px` / `1.0` | Right-aligned peso column and running totals |
| `small` | Atkinson Hyperlegible Next | `600` | `14px` / `1.4` | Metadata, confidence labels (never below `14px`) |
| `notebook` | Caveat | `500` | `22px` / `32px` | Handwriting on ruled `.notebook` and `.pinned-note` |

**Scale contrast is the point.** On the landing page the headline is at least `5×` the body size at `≥1280px` (88px vs 17px). On app screens, the contrast comes from `amount` (20px bold) against `small` metadata (14px), never from decoration.

Headlines on the landing page are one weight and one color. Do not accent a single word.

### Typography Rules
- **Tabular Peso.** Every peso amount, quantity, unit price, and running balance: Atkinson, `tabular-nums`, right-aligned in its own column, `₱` always shown.
- **Sentence case** everywhere. No all-caps labels. No eyebrow kickers above headings.
- **Measure:** body under `70ch`.

---

## Layout

- **Phone-first baseline:** `360px`–`430px` viewports, `16px` horizontal padding. App screens scale to a centered single column (`max-w-xl`, 576px). The landing page uses a 12-column grid at `max-w-6xl` (1152px).
- **Spacing scale:** `4`, `8`, `12`, `16`, `24`, `32`, `48`, `96`. The `96` step is for landing section gaps only.
- **Single primary action:** every screen has exactly one `ink` CTA (`56px`), in the bottom thumb zone on mobile.
- **Notebook margin rhythm:** ledger sheets reserve a left margin rule separating status indicators from customer/item text and the right-aligned `amount` column.

### Landing page composition

Each section is built around a different paper object and a different alignment. **Never two consecutive sections with the same grid.**

**1. Hero: the proof stack** (desk background, asymmetric, left-aligned)
```
┌──────────────────────────────────────────────────────────────┐
│ desk + grain                                                  │
│ Talaan                                       [Subukan ang demo]│
│                                                               │
│ Kunan ng litrato                   ┌─tape─────────┐           │
│ ang notebook.                      │ .notebook    │  -2.5°    │
│ Ang code ang                       │ (Caveat, ruled)           │
│ magbibilang.                  ┌────┴─────────────┐│           │
│                               │ ledger sheet +1.5°│            │
│ Binabasa ng AI ang sulat-kamay│ ▓▓ needs-review ▓▓│  ┌Paid┐  │
│ mo. Minarkahan namin ang      │ ₱ ₱ ₱ ₱ ₱ ₱ ₱ ₱ │  └────┘   │
│ hindi sigurado.               └──────────────────┘   -4°     │
│ [Scan notebook]                                  bleeds right →│
└──────────────────────────────────────────────────────────────┘
```
- Headline spans columns 1–6; proof stack spans 6–12 and bleeds off the right edge by about `5%` (`overflow-x: clip` on the hero wrapper so there is no horizontal scroll).
- The stack has three overlapping layers: a `.notebook` slip (raw handwriting), a ledger sheet slip (the same rows, cleaned, with one `marker` row and one mismatch), and one `paid` stamp. This is the product's actual promise, shown, not described.
- At `360px`, stack under the headline, reduce rotations to `±1.5°`, show two layers instead of three.

**2. How it works** (`paper`, three objects, a real sequence so numbering is allowed)
Three different paper forms staggered on a descending diagonal, not a row of equal cards: a torn notebook page (`Kunan`), a ledger sheet with a highlighted row (`Suriin`), a receipt slip with the `Paid` stamp (`Kumpirmahin`). Each is a different width and rotation.

**3. The math is never guessed** (`paper`, centered, one large sheet)
One full-width ledger sheet demonstrating a mismatch: written total struck through, computed total in `margin`, the exact peso difference. Short supporting sentence left, large sheet right.

**4. Closing CTA** (`desk`, centered)
A single pinned `.pinned-note` slip reading `Subukan mo gamit ang sample na notebook.` and the demo button on a taped slip. Footer on `desk`, plain text links.

**Spend boldness in one place:** the hero proof stack is the memorable thing. Sections 2–4 are quieter.

### App screens

Same layers, calmer. Canvas is `paper` + grain; content sits on `sheet` (flat, bordered). The only slips are the dashboard's page stack, the provenance stamp, and the paid stamp.

---

## Elevation & Depth

Governed entirely by **The Paper System** above. Summary:
- Sheets: `1px solid rule`, no shadow.
- Slips: `shadow-slip`, no border.
- Sticky bottom bar: `shadow-bar`, the only app-screen shadow outside slips.
- Nothing combines a border and a shadow. No glows. No blur.

---

## Shapes

- **Paper (`2px` · `--radius-paper`):** sheets, slips, receipts, stamps' host surfaces.
- **Row (`4px` · `--radius-row`):** ledger row highlights, inputs, standard buttons, status labels, stamps.
- **Sheet (`12px` · `--radius-sheet`):** mobile bottom sheets and modals only.
- **Pill (`9999px` · `--radius-pill`):** the dashboard **Scan button** only.
- **Touch & focus:** minimum tap target `48px × 48px`. Focus ring `3px solid var(--color-ink)`, `2px` offset.

---

## Components

### Ledger Row
- **Structure:** `[customer + item]` left, `[₱amount]` (`amount` style, right-aligned) right, `1px solid rule` bottom border.
- **States:**
  - `normal`: `sheet` background, `pencil` text. Unmarked means verified.
  - `needs-review`: `marker` fill, `pencil` text, inline label (`Basahin muli · 72%`). Looks like a highlighter stroke: slightly inset from the row edges (`2px` vertical, `0` horizontal) with `rounded.row`.
  - `mismatch`: `4px solid margin` left bar, struck-through written value, computed value in `margin`, 1-tap fix button.

### Discrepancy Banner & Confirm Bar
- Sticky bottom bar on `/pages/[id]/review`, `shadow-bar`, `4px solid margin` left accent when a discrepancy exists.
- Shows `Nakasulat na total`, `Kompyut ng code`, and the exact peso difference above the `56px` primary confirm button.

### Buttons
- **Primary:** `ink` fill, `sheet` bold text, `56px`, `rounded.row`. Press: `translateY(1px)`.
- **Scan (pill):** same as primary with `rounded.pill`, dashboard only.
- **Secondary:** `sheet` fill, `1.5px solid ink`, `ink` text, `48px` minimum.

### Model Provenance Stamp
Use the **Stamp** recipe in `muted` (`14px` `small` text, `1px` rule weight allowed here instead of `2px`). Top-right of every extraction and result screen: `Meta Muse Glimmer 30B` or `Gemini (dev backup)`. No pills, no dots, no chips.

### Reminder Draft Card
`sheet` (flat, bordered, `rounded.paper`), tone switch (`Malumanay` / `Pormal`), editable Taglish textarea (`17px`), actions **Kopyahin** and **I-edit / I-share**. Mandatory footer: `"Draft lang. Ikaw ang magpapadala."`

### Pinned Note (landing only)
`slip`, `.pinned-note` Caveat `22px`, maximum 12 words, one piece of tape, rotation ±2°, never interactive, never yellow.

---

## Screens

| # | Screen | Route | Key content | Paper treatment |
|---|---|---|---|---|
| 1 | Landing | `/` | Headline, proof stack, 1-tap demo CTA | Desk, slips, tape, stamp, motion budget B |
| 2 | Login and 1-tap demo | `/login` | Email form, `Subukan ang demo` primary | One sheet on pad, no slips |
| 3 | Dashboard and scan | `/` (signed in) | Total *utang*, pill scan button, recent pages | Page stack of slips, sheet for totals |
| 4 | Page review | `/pages/[id]/review` | Discrepancy banner, flagged rows, sticky confirm bar | Ruled sheet with margin line, motion budget A |
| 5 | Customers and reminder | `/customers` | Balances list, itemized history, reminder draft | Sheets only, no slips |

---

## Tailwind v4 Tokens (`src/app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-desk: #E3E9D3;
  --color-paper: #F2F5EC;
  --color-sheet: #FFFFFF;
  --color-slip: #FFFEF8;
  --color-rule: #D5DEC6;
  --color-pencil: #23262B;
  --color-muted: #5B6457;
  --color-ink: #1E3FAE;
  --color-margin: #C8302F;
  --color-marker: #FFE14D;
  --color-paid: #1F7A4D;

  --font-display: var(--font-bricolage), system-ui, sans-serif;
  --font-sans: var(--font-atkinson), system-ui, sans-serif;
  --font-hand: var(--font-caveat), cursive;

  --radius-paper: 2px;
  --radius-row: 4px;
  --radius-sheet: 12px;
  --radius-pill: 9999px;

  --shadow-slip: 0 1px 1px rgba(35,38,43,.10), 0 3px 6px rgba(35,38,43,.08), 0 14px 28px -10px rgba(35,38,43,.20);
  --shadow-slip-lift: 0 1px 1px rgba(35,38,43,.10), 0 6px 12px rgba(35,38,43,.10), 0 22px 40px -12px rgba(35,38,43,.26);
  --shadow-bar: 0 -4px 16px rgba(35,38,43,.08);

  --animate-float: float 7s ease-in-out infinite;
  --animate-float-delayed: float 9s ease-in-out 1.2s infinite;
  --animate-settle: settle 600ms cubic-bezier(0.22, 1, 0.36, 1) both;

  @keyframes float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -4px; } }
  @keyframes settle { from { opacity: 0; translate: 0 -14px; } to { opacity: 1; translate: 0 0; } }
}

@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```
Implementation notes: set each slip's resting rotation with the `rotate` property (not `transform`) so `translate`-based animations compose with it. Define `--paper-grain`, `.ruled`, `.margin-rule`, `.torn-bottom` from **The Paper System** recipes in the same file.

---

## Named Rules

- **The Paper Sovereign Rule.** Every surface is one of the four layers (desk, pad, sheet, slip). Digital elements look like ink on paper or paper slips resting on the desk.
- **The Edge-or-Shadow Rule.** Borders for attached paper, shadows for loose paper. Never both.
- **The Uncertainty Signal Rule.** Only discrepancies, errors, and low-confidence fields use `margin` or `marker`. The one structural exception is the margin line drawn on ledger sheets. Never red or yellow for decoration, branding, or marketing. Sticky notes are `slip`, not yellow.
- **The Marker Contrast Rule.** The only text color on `marker` is `pencil`.
- **The Status Label Rule.** Never use `ink` for status. Never rely on color alone; every row state pairs a text label with its mark (`Needs review`, `Math mismatch`, `Paid`).
- **The Anti-Tag Rule.** No pill tags, no colored-dot badges, no admin chips. Provenance and status are stamps or plain typographic captions.
- **The Zero Monospace Rule.** No monospace fonts or `<code>` on any marketing or UI surface.
- **The Two Motion Budgets Rule.** App screens get one authored moment; the landing page gets settle-in, two idle drifts, and interactive hover-lift. Nothing else moves.
- **The Real Content Rule.** No lorem ipsum, no generic names. Use realistic sari-sari store data (customers like `Aling Nena`, items like `Lucky Me Pancit Canton`, `Gardenia`, `3-in-1 Kape`, plausible peso amounts) in every demo.
- **The Deterministic Total Rule.** Never display a total or balance that `src/lib/ledger/` did not compute. Never auto-send reminders.

---

## Craft Checks (run before calling any screen done)

Build, screenshot at `1440px` and `390px`, then verify each line. Fix failures and screenshot again.

1. Every surface maps to exactly one of the four layers. No surface has both a border and a shadow.
2. Grain is visible on `paper` and `desk` at full size but never on text surfaces.
3. Landing hero: three overlapping paper layers, at least two rotated, one stamp, headline at least `72px` at `1440px`.
4. Landing sections 1–4 use four different layouts; no two adjacent sections share a grid.
5. Landing slips have non-zero rotation; app-screen sheets and rows have none.
6. No horizontal scroll at `360px`.
7. No monospace, no emoji, no pill tags, no all-caps, no gradients except `.ruled` and `--paper-grain`.
8. Red and yellow appear only on discrepancy or low-confidence content (plus the margin line).
9. Peso columns are right-aligned, tabular, and show `₱`.
10. Reduced-motion mode renders every slip at its resting position.
11. List five specific weaknesses against this document, fix them, and verify once more.

When `src/components/landing/Hero.tsx` exists, it is the craft benchmark: match its level of detail for every other section.

---

## Do's and Don'ts

### Do:
- **Do** build with real layered paper: ruled lines, margin lines, tape, torn edges, stamps, overlapping slips.
- **Do** use the shadow, grain, and tape recipes verbatim.
- **Do** load `Bricolage_Grotesque`, `Atkinson_Hyperlegible_Next`, and `Caveat` via `next/font/google` in `src/app/layout.tsx`.
- **Do** apply `tabular-nums` on every peso amount, quantity, unit price, and total.
- **Do** theme browser defaults: `::selection` in `marker` with `pencil` text; `caret-color` and `:focus-visible` in `ink`.
- **Do** use real, local content in every demo state.

### Don't:
- **Don't** make centered stacks of identical white rounded cards. If three things look the same, one of them should be a different piece of paper.
- **Don't** use `shadow-md`, default Tailwind grays or blues, or any color outside the token list.
- **Don't** use pill tags with status dots, badge clouds, or developer chips.
- **Don't** use monospace, emoji icons, glassmorphism, glowing borders, or decorative gradients.
- **Don't** introduce a second accent color or use `margin` / `marker` for decoration.
- **Don't** render Caveat outside `.notebook` and `.pinned-note`.
- **Don't** add scroll-triggered fade-ups, per-card hover transitions, or looping animation on more than two slips.
- **Don't** display any total the deterministic code did not compute, and never auto-send reminders.