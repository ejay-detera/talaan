# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Filipino sari-sari store owners (neighborhood micro-retailers, typically one-person family-run stores operating on thin ~10% margins). They work in bright ambient light (open store fronts, fluorescent bulbs, or outdoor daylight), track customer credit (*utang*), debt payments (*bayad*), and daily cash sales in handwritten school notebooks (*listahan*), and have little time to type individual items into traditional POS apps.

## Product Purpose

Talaan turns a phone photo of a handwritten *utang* notebook page, receipt, or list into a clean, arithmetic-checked digital ledger. It allows store owners to keep their physical notebook habit while getting verified running totals, customer credit balances, and polite Taglish payment reminder drafts.

## Positioning

Unlike POS or inventory apps that require store owners to abandon paper and type every transaction at the counter, Talaan adapts to the existing handwritten notebook. It combines local open-weights vision extraction (Meta Muse Glimmer 30B on local/cooperative GPU hardware) with a deterministic TypeScript arithmetic verification engine (`lib/ledger`) and a mandatory human-in-the-loop review gate before any money record is saved.

## Operating Context

- **Physical Scene:** Storefront counter with a wire-bound or stitched school notebook, ballpen (blue, black, or red ink), calculator, sachets, and canned goods; accessed primarily on a budget Android smartphone browser (`web`, mobile-first viewport).
- **Two-Phase Workflow:**
  1. **Prepare (Capture & Check):** Owner photographs a notebook page -> `sharp` pre-processes image -> Vision model (`extract_rows` or `flag_unreadable`) extracts structured rows (`credit`, `payment`, `cash_sale`, optional `quantity` and `unit_price`, `amount`, `confidence`) -> deterministic code (`lib/ledger`) checks row-level (`quantity * unit_price === amount`) and page-level (`computed_total === written_total`) math -> returns staged rows to the Review UI.
  2. **Confirm & Act:** Owner fixes or confirms flagged rows and links/creates customer names -> confirmed entries save to Supabase Postgres -> owner views per-customer balances and generates Taglish reminder drafts (`Malumanay / Friendly` or `Pormal / Firm`) to copy or share via SMS/Messenger (`navigator.share` / `sms:`).

## Capabilities and Constraints

- **Confirmed Capabilities (MVP Scope — Planned):** Photo upload, structured extraction with row confidence, review screen with low-confidence highlights and customer auto-matching, two-level deterministic discrepancy finder, customer balance ledger, Taglish reminder drafts (copy/share only), and unreadable page retake request.
- **Model Policy:** Meta Muse Glimmer 30B (Q4_K_M GGUF via `llama-server` on Kaggle 2x T4) is the primary model and mandatory for the Day 3 handwriting gate, 30+ page evaluation, and final demo. Gemini API (`MODEL_PROVIDER=gemini`) is permitted for local development speed only. Active model is always badged in UI and logged per page in the database.
- **Hard Boundaries:** No automated message sending (owner sends manually), no payment processing or e-wallet movement, no voice/audio input, and zero LLM-computed arithmetic (all math happens in deterministic code using integer centavos / `numeric(10,2)`).

## Brand Commitments

- **Name:** Talaan — *Notebook-to-Ledger Agent for Sari-Sari Stores*.
- **Language:** English UI with natural Filipino/Taglish domain terms (*Utang*, *Bayad*, *Listahan*) and Taglish reminder outputs.

## Evidence on Hand

- Written hackathon project brief (`S-01`, Meta Global AI Developer Hackathon, Oct 26 – Nov 4, 2026, Indie Developer track, Owner: Dev Ejay).
- Scaffolded Next.js 16.4.3 / React 19.3.0 / Tailwind CSS v4 repository (`package.json`).
- **Absences not to fabricate:** Zero live store customers, zero revenue, unmeasured Muse Glimmer Filipino handwriting accuracy (pending Day 3 gate on 10 pages and 30+ page evaluation set), and unvalidated market/pricing assumptions (`A-01` to `A-06`).

## Product Principles

1. **Adapt to the notebook, never replace it.** The physical notebook remains the primary capture instrument.
2. **Code does the math, humans approve the ledger.** Never trust an LLM with addition; flag every discrepancy and low-confidence row for explicit owner confirmation.
3. **Radical legibility in storefront light.** High contrast, tabular numerals for peso amounts, status badges that always pair an icon/shape with a label, and 44x44px minimum touch targets.
4. **Honest provenance.** Always show which model (`muse-glimmer` vs. `gemini`) extracted a page and distinguish unconfirmed staging rows from confirmed ledger history.

## Accessibility & Inclusion

- Minimum 44x44px touch targets for one-handed mobile operation at a store counter.
- Every status (`processing`, `needs_review`, `retake_requested`, `confirmed`, and row/page discrepancies) pairs a text label with a distinct icon or shape—never color alone.
- High-contrast text readable under bright storefront daylight or fluorescent lighting.
