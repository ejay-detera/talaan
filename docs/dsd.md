# Design System Document (DSD): Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [BRD](brd.md) · [PRD](prd.md) · [SAD](sad.md) · [SDD](sdd.md) · [Flow](flow.md) · [Build](build.md) · [Glossary](glossary.md)

---

> **Source-of-truth rule.** [`foundation.md`](foundation.md) is canonical. Resolve conflicts there first, then propagate.
>
> **Token authority.** [`src/app/globals.css`](../src/app/globals.css) is the implementation authority. Currently `src/app/globals.css` holds the default Next.js starter variables; updating it to the tokens below is part of `TAL-05`.
>
> **Impeccable Direction Contract (`seed:dcbface214fe32da`, `operate` mode).** Talaan uses **"Resibo Carbon & Counter Slip" fused with the "Listahan Red Margin Gutter"** (`Q7`). The visual world lends four things only—**Type, Palette, Density, and Two Signature Verification Moves** (the **Red Margin Gutter** and the **Two-Ply Proof Bar**)—while keeping every control a fast, unmistakable web product component.
>
> **Appearance scope.** Talaan supports **High-Contrast Daylight Mode (Light Mode)**. Dark Mode is **TBD** (§3.2).
>
> **Platform.** Mobile-First Web (`web`, optimized for 360px–430px Android smartphone viewports up to desktop layouts).

---

## 1. Design Philosophy

**Physical Scene & Audience:** One-person Filipino sari-sari store owners checking a handwritten notebook on an Android phone under bright outdoor daylight or harsh storefront fluorescent bulbs. Clarity, speed, and arithmetic trust outrank decoration.

1. **Radical daylight legibility.** High-contrast Deep Carbon Ink (`#141413`) on Warm Counter Bond (`#FAF8F4`). No washed-out gray-on-gray text or low-contrast dark-mode glare.
2. **Sari Emerald (`#0F6E56`) means verified & primary action; Carbon Blue (`#1D4ED8`) means active selection; Red Ballpen (`#DC2626`) means discrepancy or unpaid *utang*; Amber Highlighter (`#D97706`) means needs review.**
3. **Tabular numerals everywhere money or counts appear.** Every peso amount, quantity, unit price, confidence percentage, and running total uses `Geist Mono` with `font-variant-numeric: tabular-nums` so decimals align vertically like a real accounting slip.
4. **Two Signature Verification Moves (Never a Paper Costume):**
   - **The Red Margin Gutter:** A crisp `2px solid #E11D48` vertical margin line on the left of the extraction table where row status icons (`Needs Review`, `Row Discrepancy`, `Verified`) sit like ledger checkmarks.
   - **The Two-Ply Proof Bar:** A sticky bottom reconciliation bar on the Review screen comparing the notebook's `Written Total` against `src/lib/ledger`'s `Computed Total` side by side before the primary **Confirm & Save to Ledger** button.
5. **State and model provenance are always visible.** Every extracted page displays a compact **Model Provenance Badge** (`Muse Glimmer 30B` vs. `Gemini Dev`), and every status pairs a text label with a distinct icon or shape—never color alone.

**Avoid:** Literal torn-paper textures, spiral notebook binder rings, cursive handwriting fonts in UI labels, unlabeled loading spinners, or modals where inline row editing works better.

---

## 2. Design Tokens

Target tokens to be defined in [`src/app/globals.css`](../src/app/globals.css) (`@theme inline` in Tailwind CSS v4). Never hardcode arbitrary hex colors in components.

### 2.1 Brand and semantic colors

| CSS Variable / Token | Hex Value | Usage |
|---|---|---|
| `--color-shell` (`bg-shell`) | `#1E293B` | Deep Carbon Indigo top app header & primary navigation bar |
| `--color-primary` (`bg-primary` / `text-primary`) | `#0F6E56` | Sari Emerald — primary CTA buttons, confirmed ledger badge, balanced proof bar |
| `--color-primary-hover` | `#0B5340` | Hover/active state for primary CTA |
| `--color-secondary` (`text-secondary-accent`) | `#1D4ED8` | Carbon Blue — active tab/row selection, interactive links, customer match pill |
| `--color-margin-rule` (`border-margin-rule`) | `#E11D48` | Listahan Red Margin — the `2px` vertical left margin gutter rule and top header accent stripe |
| `--color-warning` / `--color-warning-bg` | `#B45309` / `#FEF3C7` | Amber Highlighter — `needs_review` row highlight (`confidence < 0.80`) |
| `--color-danger` / `--color-danger-bg` | `#DC2626` / `#FEE2E2` | Red Ballpen — arithmetic discrepancy (`line_discrepancy` or `has_page_discrepancy`) & overdue *utang* |
| `--color-border` (`border-rule`) | `#D6D1C7` | Crisp `1px` counter-slip table borders and row dividers |

### 2.2 Surface and text colors (Daylight Mode)

| Token | Daylight Mode (Supported) | Dark Mode (TBD — Not Supported) |
|---|---|---|
| `--color-background` (`bg-background`) | `#FAF8F4` (Warm Counter Bond) | `TBD` |
| `--color-surface` (`bg-surface`) | `#FFFFFF` (Crisp Slip Surface) | `TBD` |
| `--color-surface-subtle` (`bg-surface-subtle`) | `#F2EFE9` (Secondary Panel / Table Header Tint) | `TBD` |
| `--color-foreground` (`text-foreground`) | `#141413` (Deep Carbon Ink) | `TBD` |
| `--color-muted` (`text-muted`) | `#57534E` (Warm Stone Secondary Text — WCAG AA on `#FAF8F4`) | `TBD` |

### 2.3 Spacing, radius, layout (`operate` density)

Base unit: `4px` (`0.25rem`).

| Token | Value | Typical use |
|---|---|---|
| Touch target minimum | `44px × 44px` (`min-h-11 min-w-11`) | All buttons, row checkboxes, customer dropdown triggers, tone toggles |
| Margin gutter width | `36px` (`w-9`) with `2px solid #E11D48` right border | Left status column (`RedMarginGutter`) on ledger tables |
| Card / Slip radius | `6px` (`rounded-md`) | Crisp counter-slip corners (avoid overly rounded `24px` bubble cards) |
| Mobile container width | `100%` up to `max-w-2xl` (`672px`) centered | Optimal single-column mobile/tablet ledger operations |

### 2.4 Typography

Loaded in [`src/app/layout.tsx`](../src/app/layout.tsx) via `next/font/google`: `Geist` (`--font-geist-sans`) and `Geist_Mono` (`--font-geist-mono`). Per `impeccable` `operate` mode, no decorative display serif is used; `Geist Sans` carries all headings, labels, and body copy on a tight `1.15` scale ratio, and `Geist Mono` carries all numeric data.

| Role | Font Family | Weight & Features | Size (Fixed `rem`) |
|---|---|---|---|
| Screen Title (`h1`) | `var(--font-geist-sans)` | `700` (Bold), tight tracking `-0.02em` | `1.375rem` (`22px`) |
| Section / Card Header (`h2`) | `var(--font-geist-sans)` | `600` (SemiBold) | `1.125rem` (`18px`) |
| Table Column Kicker | `var(--font-geist-sans)` | `600` Uppercase, tracking `0.05em` | `0.75rem` (`12px`) |
| Body / Item Description | `var(--font-geist-sans)` | `400` / `500` | `0.9375rem` (`15px`) |
| **Peso Amounts, Quantities, Totals & Confidence** | `var(--font-geist-mono)` | `600`, `font-variant-numeric: tabular-nums` | `0.9375rem`–`1.25rem` |

---

## 3. Appearance Modes

### 3.1 High-Contrast Daylight Mode (Light) — Supported ✅

Designed for storefront counters in bright natural or fluorescent light. Uses `#FAF8F4` Warm Counter Bond background and `#FFFFFF` slip cards with `#141413` high-contrast ink.

### 3.2 Dark Mode — TBD ⬜

 currently `src/app/globals.css` contains the default `@media (prefers-color-scheme: dark)` block from `create-next-app`, which must be removed in `TAL-05` so the app enforces High-Contrast Daylight Mode consistently until a dedicated dark palette is designed and contrast-audited.

---

## 4. Components

### 4.1 Structural rules (`AGENTS.md` §4)

- Any screen or component exceeding ~150 lines must be split into a feature folder (`src/components/review/`, `src/components/customers/`, `src/components/upload/`).
- Screens own primary state, effects, and data fetching; sub-components receive props and emit events via callbacks (`onUpdateRow`, `onSelectCustomer`, `onConfirmPage`).
- Shared domain types live in `src/types/ledger.ts`; shared UI primitives live in `src/components/shared/`.

### 4.2 Buttons

Minimum touch target: **`44px × 44px` (`min-h-11`)**. High-impact actions (`Confirm & Save to Ledger`, `Scan Notebook Page`, `Draft Reminder`) show an explicit in-flight label (`Checking Math…`, `Saving to Ledger…`) and disable double-submission.

| Variant | Fill | Text / Border | Use |
|---|---|---|---|
| **Primary** | `#0F6E56` (`bg-primary`) | `#FFFFFF` bold + leading icon | Single primary action per screen (`Scan Page`, `Confirm & Save to Ledger`, `Share Reminder`) |
| **Secondary** | `#FFFFFF` (`bg-surface`) | `#141413` + `1px solid #D6D1C7` | Alternative actions (`Copy Message`, `Edit Row`, `Try Demo Store`) |
| **Ghost / Tertiary** | `transparent` | `#57534E` | Cancel, back navigation, filter pills |
| **Destructive / Retake** | `#DC2626` (`bg-danger`) | `#FFFFFF` | `Retake Photo` or delete unconfirmed draft |

### 4.3 Status representation (`glossary.md` §3)

Every status badge pairs a **text label** with a **distinct shape or icon**—never color alone:

| State | Icon / Shape | Badge Styling | UI Label |
|---|---|---|---|
| `processing` | Animated pulse dot `●` | Neutral slate `#1E293B` on `#F2EFE9` | `Reading Page…` |
| `needs_review` | Warning triangle `▲` | `#B45309` text/border on `#FEF3C7` | `Needs Review` |
| `line_discrepancy` / `has_page_discrepancy` | Exclamation octagon `✕` | `#DC2626` text/border on `#FEE2E2` | `Math Mismatch` |
| `retake_requested` | Camera alert icon `📷!` | `#DC2626` text/border on `#FEE2E2` | `Retake Photo` |
| `confirmed` | Checkmark shield `✓` | `#0F6E56` text/border on `#D1FAE5` | `Confirmed in Ledger` |
| `entry_type: 'credit'` | Up-arrow pill `↑` | `#DC2626` text on `#FEE2E2` | `Utang (+)` |
| `entry_type: 'payment'` | Down-arrow pill `↓` | `#0F6E56` text on `#D1FAE5` | `Bayad (−)` |
| `entry_type: 'cash_sale'` | Circle dot `•` | `#57534E` text on `#F2EFE9` | `Cash Sale` |
| Model Provenance Badge | CPU chip icon `⚙` | `#1E293B` mono badge in header | `Muse Glimmer 30B` or `Gemini (Dev Test)` |

### 4.4 Special Surfaces (`impeccable` Signature Moves)

1. **`RedMarginGutter` + `EntryReviewRow` (`/pages/[id]/review`):**
   - Leftmost `36px` column is bounded on the right by a `2px solid #E11D48` vertical rule.
   - Displays `✓` for high-confidence verified rows, `▲` for `confidence < 0.80`, and `✕` for `quantity * unit_price !== amount`.
   - Tapping a flagged row expands inline numeric inputs (`quantity`, `unit_price`, `amount`, `entry_type`) and the **Customer Match Dropdown** (auto-suggesting existing customers or `+ Create "Aling Nena"` in one tap).
2. **`TwoPlyProofBar` (Sticky Bottom Bar on `/pages/[id]/review`):**
   - Top ply shows `Notebook Written Total: ₱840.00` (from `pages.written_total`) beside `Code Computed Total: ₱820.00` (from `src/lib/ledger`).
   - If mismatched, displays a prominent Red Ballpen callout badge: `✕ Discrepancy: −₱20.00 (Check highlighted rows)`. If matched, displays an Emerald badge: `✓ Totals Match (₱840.00)`.
   - Bottom ply houses the full-width `44px+` **Confirm & Save to Ledger** button.
3. **`ReminderDrawer` (`/customers/[id]`):**
   - Segmented control with 2 tone options (`Malumanay / Friendly` vs. `Pormal / Firm`), editable Taglish textarea, and two side-by-side action buttons: **Copy Message** and **Share via SMS / Messenger** (`navigator.share` / `sms:?body=`).

---

## 5. Navigation

Two shells:

| Shell | Pattern | Description |
|---|---|---|
| **Authenticated Store Shell** | Top Carbon Header (`#1E293B` with `2px #E11D48` top stripe + store name + active model badge) + Sticky Bottom Tab Bar on mobile (`Scan / Pages` · `Customer Balances`) | Fast 1-thumb switching between capturing/reviewing notebook pages and checking customer *utang* balances |
| **Auth Shell (`/login`)** | Centered Counter Slip Card | Email/Password form + prominent 1-tap **"Try Demo Store (Aling Nena's Sari-Sari Store)"** button |

---

## 6. Motion

CSS transitions only (`150ms–200ms ease-out`); zero external animation libraries.
- In-flight extraction (`POST /api/pages/extract`) shows a structured skeleton slip with step progress (`1. Enhancing photo…` → `2. Reading handwriting with Muse Glimmer…` → `3. Checking arithmetic in code…`) so the store owner understands why a 2x T4 response takes a few seconds (`S-01` §8).
- Respect `@media (prefers-reduced-motion: reduce)`.

---

## 7. Accessibility

**Committed in design (`TAL-05`, `TAL-06`):**
- `44px × 44px` minimum touch targets on all interactive elements.
- Every status and entry type pairs a text label with an icon/shape (§4.3).
- High-contrast daylight palette (`#141413` on `#FAF8F4` and `#FFFFFF`).
- Explicit `<label>` associations and keyboard/focus rings (`2px solid #1D4ED8`) on all inputs.

**Not yet verified** (pending `TAL-05`–`TAL-08` implementation): automated axe/Lighthouse contrast audit and screen-reader traversal test.

---

## 8. Open Design Work

| Item | Status |
|---|---|
| Apply tokens in `src/app/globals.css` and remove default dark-mode media query | ⬜ Planned (`TAL-05`) |
| Build `RedMarginGutter`, `TwoPlyProofBar`, and `ReminderDrawer` components | ⬜ Planned (`TAL-05`, `TAL-06`) |
| Run `impeccable.cmd detect --json` on built UI routes | ⬜ Planned (`TAL-08`) |

---

## Self-Check

- [x] Token authority mapped to `src/app/globals.css`
- [x] High-Contrast Daylight Mode stated as supported; Dark Mode marked `TBD`
- [x] Status names and badges match [`glossary.md`](glossary.md) §3
- [x] `Geist Mono` (`tabular-nums`) mandated for all numerals and amounts
- [x] Impeccable direction (`seed:dcbface214fe32da` — Resibo Carbon & Counter Slip + Red Margin Gutter) recorded
