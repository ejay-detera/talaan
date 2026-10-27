---
name: Talaan
description: The notebook, kept — verification-first sari-sari store ledger in high-contrast daylight mode.
colors:
  paper: "#F2F5EC"
  sheet: "#FFFFFF"
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
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
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
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.35
rounded:
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
---

# Design System: Talaan

## Overview

**Creative North Star: "The Notebook, Kept"**

Talaan borrows directly from the physical artifacts Filipino sari-sari store owners already trust at the counter: pale green analysis-pad paper (`paper`), crisp notebook sheets (`sheet`), ballpen blue ink (`ink`), a vertical red margin line (`margin`), and a yellow highlighter (`marker`). Everything verified by deterministic code reads like clean ink on ruled paper; everything requiring the store owner's eyes looks like a yellow highlighter stroke or a red margin mark. If a row is unmarked, it is safe.

**Key Characteristics:**
- **Signal-Only Color:** Red (`margin`) and yellow (`marker`) mark *uncertainty or discrepancy*. Nothing else uses red or yellow.
- **Hyperlegible Tabular Numerals (Zero Monospace):** All UI copy and peso columns (`₱`) use **Atkinson Hyperlegible Next** with `tabular-nums`, giving older eyes on budget 360px phone screens maximum glyph clarity without a monospace terminal costume.
- **Handwriting Quarantine:** **Caveat** appears exclusively inside `.notebook` blocks to quote raw handwritten notebook text—never in UI labels or controls.
- **Phone-First Thumb Geometry:** 360px baseline viewport, one primary action per screen anchored at the bottom (`56px` height), `48px` minimum tap targets.
- **Plain Taglish Copy:** Sentence case everywhere, plain verbs, actionable error recovery, and explicit model provenance (`Muse Glimmer` or `Gemini (test)`).

---

## Colors

Engineered for high-glare tropical daylight and storefront fluorescent bulbs.

### Primary & Action
- **Ballpen Ink** (`#1E3FAE` · `ink`): Primary CTA buttons, interactive links, active focus rings, and confirmed values (`8.6:1` AAA on `sheet`).

### Semantic Signals
- **Red Margin** (`#C8302F` · `margin`): The `2px` vertical notebook margin rule, arithmetic discrepancies (`quantity * unit_price !== amount` or `computed_total !== written_total`), errors, and overdue *utang* (`5.6:1` AA on `sheet`).
- **Highlighter Marker** (`#FFE14D` · `marker`): Background fill only for `needs_review` rows (`confidence < 0.80`).
- **Paid Stamp** (`#1F7A4D` · `paid`): Confirmed pages, recorded *bayad* (payments), and balanced totals (`5.4:1` AA on `sheet`).

### Neutral Surfaces & Ink
- **Analysis Pad Paper** (`#F2F5EC` · `paper`): App canvas background (pale green accounting pad that cuts white screen glare).
- **Notebook Sheet** (`#FFFFFF` · `sheet`): Elevated cards, form inputs, and ledger sheets.
- **Ruled Line** (`#D5DEC6` · `rule`): `1px` horizontal ledger rules, card borders, and section dividers.
- **Graphite Pencil** (`#23262B` · `pencil`): Primary body text and amounts (`15.1:1` AAA on `paper`, `13.2:1` AAA on `marker`).
- **Muted Sage** (`#5B6457` · `muted`): Secondary metadata and timestamps (`4.9:1` AA on `paper`, `5.9:1` AA on `sheet`).

### Named Rules
- **The Uncertainty Signal Rule.** Only discrepancies, errors, and low-confidence fields may use `margin` (`#C8302F`) or `marker` (`#FFE14D`). Never use red or yellow for decoration, branding, or marketing badges.
- **The Marker Contrast Rule.** Never place any text color on `marker` (`#FFE14D`) other than `pencil` (`#23262B`).
- **The Status Label Rule.** Never use `ink` (`#1E3FAE`) to indicate status, and never rely on color alone—every row state pairs a text label with its visual mark (`Needs review`, `Math mismatch`, `Paid`).

---

## Typography

**Display & Headings:** `Bricolage Grotesque` (`700`, `font-optical-sizing: auto`)
**UI, Body & Ledger Amounts:** `Atkinson Hyperlegible Next` (`400`, `600`, `700`)
**Owner's Handwriting (`.notebook` only):** `Caveat` (`500`)

**Character:** Warm, grounded signage headers paired with an accessibility-grade body face designed specifically to disambiguate numbers (`3`/`8`, `5`/`6`, `1`/`7`, `0`/`O`) on low-brightness mobile screens. No monospace font is loaded or used.

### Hierarchy
| Role | Font Family | Weight & Features | Size / Line-Height | Usage |
|---|---|---|---|---|
| `display` | `Bricolage Grotesque` | `700`, optical size on, `-0.02em` tracking, `text-wrap: balance` | `40px` (`2.5rem`) / `1.05` | Landing hero headline |
| `h1` | `Bricolage Grotesque` | `700`, optical size on, `-0.02em` tracking, `text-wrap: balance` | `28px` (`1.75rem`) / `1.15` | Screen title |
| `h2` | `Bricolage Grotesque` | `700`, `-0.01em` tracking, `text-wrap: balance` | `20px` (`1.25rem`) / `1.25` | Section & sheet header |
| `body` | `Atkinson Hyperlegible Next` | `400` / `600`, `text-wrap: pretty` | `17px` (`1.0625rem`) / `1.5` | Default reading & item names (`17px` floor for older eyes) |
| `amount` | `Atkinson Hyperlegible Next` | `700`, `font-variant-numeric: tabular-nums` | `20px` (`1.25rem`) / `1.0` | Right-aligned peso (`₱`) column & running totals |
| `small` | `Atkinson Hyperlegible Next` | `600` | `14px` (`0.875rem`) / `1.4` | Metadata, confidence tags, model badge (never below `14px`) |
| `notebook` | `Caveat` | `500` | `20px` (`1.25rem`) / `1.35` | Raw transcribed owner handwriting inside `.notebook` containers |

### Named Rules
- **The Tabular Peso Rule.** Every peso amount, quantity, unit price, and running balance uses `Atkinson Hyperlegible Next` with `font-variant-numeric: tabular-nums`, right-aligned in a dedicated column, with the `₱` symbol always shown.
- **The Sentence-Case Rule.** Use sentence case everywhere. All-caps labels and eyebrow kickers above headings are banned.
- **The Measure Rule.** Keep body copy under `70ch` per line.

---

## Layout

- **Phone-First Baseline:** Designed for `360px`–`430px` Android viewports (`16px` horizontal screen padding), scaling cleanly to a centered single-column ledger (`max-w-xl` / `576px`) on app screens and a two-column split (`max-w-5xl` / `1024px`) on the landing page.
- **Spacing Scale (`px`):** `4`, `8`, `12`, `16`, `24`, `32`, `48`.
- **Single Primary Action:** Every screen has exactly one primary `ink` CTA (`56px` high) positioned in the bottom thumb zone on mobile.
- **Notebook Margin Rhythm:** Ledger sheets reserve a left margin rule (`2px solid var(--color-margin)`) separating status indicators from customer/item text and the right-aligned `amount` column.

---

## Elevation & Depth

Surfaces are **flat by default**. Structural separation comes from `1px solid var(--color-rule)` (`#D5DEC6`) borders and the tonal contrast between `paper` (`#F2F5EC`) and `sheet` (`#FFFFFF`).

### Shadow Vocabulary
- **Sticky Bottom Action Bar** (`box-shadow: 0 -4px 16px rgba(35, 38, 43, 0.08)`): The only shadow in the system, used exclusively to separate the sticky bottom confirm/action bar from scrolling ledger rows beneath it.

### Named Rules
- **The Flat Sheet Rule.** Cards and sheets never combine a `1px` border with a drop shadow.
- **The Single Motion Rule.** One authored motion moment exists in the entire app: when `/pages/[id]/review` opens, the `2px` vertical red margin line (`#C8302F`) draws down the sheet (`transform: scaleY(0)` → `scaleY(1)`, `420ms cubic-bezier(0.22, 1, 0.36, 1)`). Disabled automatically under `@media (prefers-reduced-motion: reduce)`.

---

## Shapes

- **Row & Badge Radius (`4px` · `--radius-row`):** Ledger row highlights, inputs, standard buttons, and status pills use crisp `4px` corners.
- **Sheet Radius (`12px` · `--radius-sheet`):** Notebook page containers, cards, and bottom sheets use `12px` corners with `1px solid #D5DEC6` borders.
- **Scan Pill Radius (`9999px` · `--radius-pill`):** Reserved exclusively for the primary **Scan button** on the dashboard so the capture trigger has a distinct silhouette.
- **Touch & Focus Geometry:** Minimum tap target `48px × 48px`. Keyboard and input focus ring is `3px solid var(--color-ink)` with `2px` offset.

---

## Components

### Ledger Row
- **Structure:** `[customer + item]` on the left, `[₱amount]` (`20px`, `700`, `tabular-nums`, right-aligned) on the right, `1px solid var(--color-rule)` bottom border.
- **States:**
  - `normal`: `sheet` (`#FFFFFF`) background, `pencil` text. Unmarked means verified.
  - `needs-review`: `marker` (`#FFE14D`) highlighter fill, `pencil` (`#23262B`) text, inline confidence label (e.g., `Basahin muli · 72%`).
  - `mismatch`: `4px solid var(--color-margin)` (`#C8302F`) left bar, struck-through written value, and computed value in `margin` with a 1-tap fix button.

### Discrepancy Banner & Two-Ply Confirm Bar
- **Structure:** Sticky bottom bar on `/pages/[id]/review` with `4px solid var(--color-margin)` left accent when a discrepancy exists.
- **Content:** States `Nakasulat na total` (Written total), `Kompyut ng code` (Computed total), and the exact peso difference before the `56px` primary confirm button.

### Buttons
- **Primary Button:** `ink` (`#1E3FAE`) fill, `sheet` (`#FFFFFF`) bold text, `56px` height, `4px` radius (`9999px` pill only for the primary Scan CTA).
- **Secondary Button:** `sheet` (`#FFFFFF`) fill, `1.5px solid var(--color-ink)` border, `ink` (`#1E3FAE`) text, `48px` minimum height.

### Model Badge
- **Structure:** `14px` (`small`) pill with `1px solid var(--color-rule)` border on `sheet` surface, positioned top-right on all extraction/result screens (`Muse Glimmer` or `Gemini (test)`).

### Reminder Draft Card
- **Structure:** `sheet` card (`12px` radius, `1px solid var(--color-rule)`), tone switch (`Malumanay` / `Pormal`), editable Taglish textarea (`17px` body), and two actions: **Kopyahin** and **I-edit / I-share**.
- **Mandatory Footer Label:** `"Draft lang. Ikaw ang magpapadala."`

---

## Screens

| # | Screen | Route | Key content |
|---|---|---|---|
| 1 | Landing | `/` | Headline, `.notebook`-to-ledger visual proof, 1-tap demo CTA |
| 2 | Mobile login and 1-tap demo | `/login` | Email form, `"Subukan ang demo"` one-tap primary button |
| 3 | Mobile dashboard and scan | `/` (signed in) | Total *utang*, pill scan button, recent notebook pages |
| 4 | Page review and discrepancy inspector | `/pages/[id]/review` | Discrepancy banner, flagged rows, sticky confirm bar |
| 5 | Customer balances and Taglish reminder | `/customers` | Customer balances list, itemized history, reminder draft card |

---

## Tailwind v4 Tokens (`src/app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-paper: #F2F5EC;
  --color-sheet: #FFFFFF;
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

  --radius-row: 4px;
  --radius-sheet: 12px;
  --radius-pill: 9999px;
}
```

---

## Do's and Don'ts

### Do:
- **Do** load `Bricolage_Grotesque`, `Atkinson_Hyperlegible_Next`, and `Caveat` via `next/font/google` in `src/app/layout.tsx` and eliminate all monospace fonts.
- **Do** apply `font-variant-numeric: tabular-nums` on every peso amount (`₱`), quantity, unit price, and total.
- **Do** theme browser defaults (`::selection` in `marker` `#FFE14D` with `pencil` `#23262B` text; `caret-color` and `:focus-visible` in `ink` `#1E3FAE`).

### Don't:
- **Don't** use gradients, glassmorphism, glow effects, or emoji icons.
- **Don't** introduce a second accent color or use `margin` (`#C8302F`) / `marker` (`#FFE14D`) for decoration.
- **Don't** render `Caveat` outside `.notebook` blocks or use all-caps labels anywhere in the UI.
- **Don't** display any total or balance the deterministic code in `src/lib/ledger/` did not compute, and never auto-send reminders.
