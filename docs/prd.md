# Product Requirements Document (PRD): Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [BRD](brd.md) · [BPD](bpd.md) · [SAD](sad.md) · [SDD](sdd.md) · [DSD](dsd.md) · [Flow](flow.md) · [Build](build.md) · [Test plan](test-plan.md) · [Glossary](glossary.md) · [Evidence](evidence.md)

---

> **Source-of-truth rule.** [`foundation.md`](foundation.md) is the canonical foundation document. If this PRD conflicts with it, resolve the conflict in `foundation.md` first, then propagate.
>
> **This document is as-built.** Feature status reflects what exists in the repository today (`2026-10-27`), with file evidence. Because the repository is currently a fresh Next.js 16.4.3 scaffold (`package.json`), all product features are marked `⬜` (**Planned**) and tracked in [`sprint.md`](sprint.md). Evidence rules: [`grounding.md`](grounding.md).

**Status legend:** defined in [`grounding.md`](grounding.md) §3. ✅ built and verified · 🟡 partial, mocked, simulated, or gated · ⬜ planned, no code · ❌ out of scope for v1

---

## 1. Product Purpose and Value Proposition

**Talaan** is a mobile-first web application and AI bookkeeping agent that turns a phone photo of a handwritten sari-sari store *utang* (credit) notebook page, supplier receipt, or typed list into a clean, arithmetic-checked digital ledger.

**Value proposition (from `foundation.md` §6.2):**

> Talaan turns a photo of a handwritten *utang* notebook into a clean, checked ledger, using Meta's open-weights Muse Glimmer model running locally, so store owners keep their notebook habit and still get real records. (`S-01` §1)

**What the build optimizes for.** **Deterministic financial accuracy and mobile counter speed:** vision extraction happens in a single turn (`Prepare`), all row and page arithmetic is verified in TypeScript integer centavos (`src/lib/ledger`), and a mandatory human review gate (`Confirm`) protects customer balances.

**Operating boundary.** Hackathon prototype using consented/redacted or synthetic notebook pages (`S-01` §4, §8). No requirement in this PRD moves real money or sends automated messages.

---

## 2. Target Personas

### Primary — Aling Nena (Neighborhood Sari-Sari Store Owner, `store_owner`) ⬜

- **Who:** One-person, family-run neighborhood store operator in the Philippines working on ~10% margins (`C-01`, `C-04`). Tracks customer credit (*utang*), debt payments (*bayad*), and daily sales in a physical school notebook (*listahan*).
- **Jobs:**
  1. Photograph a handwritten notebook page or receipt without re-typing items.
  2. Catch multiplication or addition mistakes on the notebook page before losing money.
  3. Confirm extracted rows and link them to repeat neighborhood customers.
  4. Check how much each customer currently owes (`sum(credit) - sum(payment)`).
  5. Generate a polite Taglish reminder message (`Malumanay` or `Pormal`) to copy or share via SMS/Messenger.
- **Surfaces:** `/login`, `/` (Upload & Recent Pages), `/pages/[id]/review` (Review & Discrepancy Screen), `/customers` (Customer Balances List), `/customers/[id]` (Customer Ledger & Taglish Reminder Drawer).
- **Gate:** Must explicitly confirm staged rows (`POST /api/pages/[id]/confirm`) before any entry affects customer balances.

### Roadmap — Cooperative / Barangay Hub Operator ⬜

No cooperative admin role, route, or table exists in v1 scope. In the hackathon MVP, local/shared inference is represented by pointing `GLIMMER_BASE_URL` at the self-hosted/Kaggle `llama-server` endpoint (`S-01` §4).

---

## 3. Core Features, Priorities, and Status

MoSCoW priority reflects `S-01` §5 and locked user refinements (`Q1`–`Q11`). Status reflects current code reality (`2026-10-27`).

| # | Feature | Priority | Status | Evidence / Planned Location |
|---:|---|---|---|---|
| 1 | **1-Tap Demo Store Login & Supabase Auth** | Must | ⬜ Planned | `src/app/login/page.tsx` (`TAL-01`) |
| 2 | **Photo Upload & `sharp` Image Prep** | Must | ⬜ Planned | `src/app/api/pages/extract/route.ts`, `src/lib/image.ts` (`TAL-02`) |
| 3 | **Structured Extraction (`credit`/`payment`/`cash_sale`, confidence, active model badge)** | Must | ⬜ Planned | `src/lib/model.ts`, `src/lib/schemas.ts` (`TAL-02`, `TAL-03`) |
| 4 | **Unreadable Page Retake Request (`flag_unreadable`)** | Must | ⬜ Planned | `src/app/api/pages/extract/route.ts` (`TAL-02`) |
| 5 | **Two-Level Deterministic Discrepancy Finder (`src/lib/ledger`)** | Must | ⬜ Planned | `src/lib/ledger/math.ts` (`TAL-04`) |
| 6 | **Review Screen (Red Margin Gutter, Two-Ply Proof Bar, Customer Auto-Match)** | Must | ⬜ Planned | `src/app/pages/[id]/review/page.tsx`, `src/app/api/pages/[id]/confirm/route.ts` (`TAL-05`) |
| 7 | **Customer Balances Ledger (`sum(credit) - sum(payment)`)** | Must | ⬜ Planned | `src/app/customers/page.tsx`, `src/app/api/customers/route.ts` (`TAL-06`) |
| 8 | **Taglish Reminder Drafts (Tone Selector + Copy & Web Share / `sms:`)** | Must | ⬜ Planned | `src/app/customers/[id]/page.tsx`, `src/app/api/reminders/draft/route.ts` (`TAL-06`) |
| 9 | **30+ Page Muse Glimmer Evaluation Harness** | Must | ⬜ Planned | `scripts/eval-glimmer.ts`, `eval/` (`TAL-03`, `TAL-07`) |
| 10 | **Supplier Receipt to Restock List (`restock_list`)** | Could (Stretch) | ⬜ Roadmap | `S-01` §5 (`US-08`) |
| 11 | **Weekly Summary (Top items, total *utang*, estimated profit)** | Could (Stretch) | ⬜ Roadmap | `S-01` §5 (`US-08`) |
| 12 | **Multi-Page Month View (131K context) & CSV/Print Export** | Could (Stretch) | ⬜ Roadmap | `S-01` §5 (`US-08`) |
| 13 | **Shelf Photo Stock Count (Experimental)** | Could (Stretch) | ⬜ Roadmap | `S-01` §5 (`US-08`) |
| 14 | **Voice / Audio Input** | Won't | ❌ Out of scope | Muse Glimmer has no audio support (`S-01` §3, §8) |
| 15 | **Automated SMS / Messenger Sending** | Won't | ❌ Out of scope | Drafts only; owner sends manually (`S-01` §5, §8) |
| 16 | **Payments, E-Wallets, POS Hardware, BIR Tax Filing** | Won't | ❌ Out of scope | Explicitly excluded (`S-01` §8) |
| 17 | **Credit Scoring, Financial Advice, Native Mobile Apps** | Won't | ❌ Out of scope | Explicitly excluded (`S-01` §8) |

---

## 4. User Stories and Acceptance Criteria

Delivery stories in [`sprint.md`](sprint.md) cite these `US-` IDs.

### US-01 — Authenticate & Upload a Notebook Page Photo ⬜

> As a **Store Owner**, I want to sign in (or tap the 1-Tap Demo Store button) and upload/take a photo of my handwritten *utang* notebook page so that I can digitize my records without re-typing items.

- Given an unauthenticated user on `/login`, when they tap **"Try Demo Store (Aling Nena's Sari-Sari Store)"** or submit valid credentials, then a real Supabase Auth session is established with RLS scoped to their `store_id`.
- Given an authenticated `store_owner`, when they select or capture a notebook photo (`JPEG`, `PNG`, or `WEBP`), then the server resizes, auto-rotates, and enhances contrast via `sharp` (`src/lib/image.ts`), uploads the file to the private Supabase Storage bucket, and creates a `pages` row with `status = 'processing'`.
- **Traces:** BR-01 · TAL-01, TAL-02 · tests T-001

### US-02 — Extract Structured Ledger Rows with Model Provenance ⬜

> As a **Store Owner**, I want the agent to read my photographed page into structured rows (`customer`, `item`, `quantity`, `unit_price`, `amount`, `entry_type`, `confidence`) and record which AI model processed it so that my credit purchases (*utang*), debt payments (*bayad*), and cash sales are separated accurately.

- Given an uploaded page image, when `POST /api/pages/extract` calls `src/lib/model.ts` (`extract_rows`), then the response is validated against `PageExtractionSchema` (Zod) and classifies each row as `'credit'`, `'payment'`, or `'cash_sale'` with a `confidence` score in `[0, 1]`.
- Given any completed extraction, when the `pages` record is updated, then `pages.model` (`'muse-glimmer'` or active Gemini test model) and `pages.latency_ms` are persisted in Postgres and displayed as a visible **Model Provenance Badge** in the UI.
- **Traces:** BR-02, BR-07 · TAL-02, TAL-03 · tests T-002, T-008

### US-03 — Catch Row and Page Arithmetic Discrepancies in Code ⬜

> As a **Store Owner**, I want Talaan to recompute every row multiplication and the page's running total deterministically in code and compare it with the total I wrote in my notebook so that arithmetic mistakes are highlighted before I save.

- Given an extracted row where both `quantity` and `unit_price` are present, when `Math.round(quantity * toCentavos(unit_price)) !== toCentavos(amount)`, then `src/lib/ledger` sets `line_discrepancy = true` and `needs_review = true`.
- Given an extracted page with a `written_total`, when `src/lib/ledger` sums the rows in integer centavos into `computed_total` and `toCentavos(computed_total) !== toCentavos(written_total)`, then the page is flagged with a page discrepancy and the exact Peso difference (`computed_total - written_total`) is shown in the **Two-Ply Proof Bar**.
- Given any row with `confidence < 0.80`, when staged, then `needs_review` is set to `true`.
- **Traces:** BR-03 · TAL-04 · tests T-003, T-004

### US-04 — Review Flagged Rows, Match Customers & Confirm to Ledger ⬜

> As a **Store Owner**, I want to review highlighted rows, link extracted customer names to my existing customer list (or create a new customer in one tap), and explicitly confirm the page before anything changes my customer balances.

- Given a page in `status = 'needs_review'`, when the owner opens `/pages/[id]/review`, then rows with `needs_review = true` or `line_discrepancy = true` display a warning/error icon + label in the **Red Margin Gutter** and the **Two-Ply Proof Bar** shows `Written Total` vs. `Computed Total`.
- Given an extracted customer name (e.g., `"Ate Nena"`), when the review screen loads, then the UI auto-suggests the closest existing customer (`"Aling Nena"`) or allows 1-tap creation of a new customer record.
- Given unconfirmed staged rows, when `GET /api/customers` computes balances, then unconfirmed rows (`confirmed_by_user = false`) have **zero effect** on customer balances.
- Given owner edits and confirmation on `/pages/[id]/review`, when `POST /api/pages/[id]/confirm` succeeds, then `src/lib/ledger` re-verifies `computed_total`, sets `entries.confirmed_by_user = true` and `pages.status = 'confirmed'` atomically, and rejects duplicate confirmation requests idempotently.
- **Traces:** BR-04 · TAL-05 · tests T-005

### US-05 — View Per-Customer Utang Balances and History ⬜

> As a **Store Owner**, I want to see a list of all customers with their current owed balance (`sum(credit) - sum(payment)`) and last activity date so that I immediately know who owes the store and why.

- Given confirmed ledger entries for a store, when the owner views `/customers` or `/customers/[id]`, then each customer's balance equals the exact centavo sum of confirmed `'credit'` entries minus confirmed `'payment'` entries (excluding `'cash_sale'` entries and unconfirmed rows).
- Given a customer detail view, when opened, then it lists all confirmed `'credit'` and `'payment'` rows with item description, amount, page date, and link to the source page.
- **Traces:** BR-05 · TAL-06 · tests T-006

### US-06 — Draft and Share Polite Taglish Payment Reminders ⬜

> As a **Store Owner**, I want to generate a polite Taglish payment reminder (`Malumanay` or `Pormal`) for a customer's overdue balance and copy or share it to SMS/Messenger in one tap so that I can follow up without awkwardness.

- Given a customer with a positive balance (`balance > 0`), when the owner selects tone `'friendly'` (*Malumanay*) or `'firm'` (*Pormal*) and taps **Draft Reminder** (`POST /api/reminders/draft`), then `src/lib/model.ts` (`draft_reminder`) generates a Taglish message citing the customer's name, itemized unpaid items, and exact total balance, and stores it in `reminders`.
- Given a generated reminder draft, when displayed in the UI, then the owner can edit the text, tap **Copy Message**, or tap **Share via SMS / Messenger** (`navigator.share` with `sms:?body=` fallback). The app never transmits a message automatically.
- **Traces:** BR-06 · TAL-06 · tests T-007

### US-07 — Request a Retake for Unreadable Pages ⬜

> As a **Store Owner**, I want the agent to tell me clearly when a photo is too blurry, dark, or cropped to read so that I can retake the photo instead of getting guessed numbers.

- Given an uploaded photo that is unreadable or severely cut off, when `src/lib/model.ts` invokes `flag_unreadable(region, reason)`, then `POST /api/pages/extract` sets `pages.status = 'retake_requested'` and returns the specific `region` and plain-language `reason` to the UI with a 1-tap **Retake Photo** action.
- **Traces:** BR-02 · TAL-02 · tests T-002

### US-08 — Stretch Capabilities (Restock List, Weekly Summary, Multi-Page, Export) ⬜

> As a **Store Owner**, I want to generate a restock list from supplier receipts/sales, view a weekly summary, or export my ledger to CSV once the core MVP loop is verified.

Acceptance criteria are deferred until `US-01` through `US-07` and the Day 3 Handwriting Gate (`TAL-03`) are complete (`S-01` §5, §8).
- **Traces:** BR-08 · Stretch Backlog · tests TBD

---

## 5. Key User Flows

All flows below are currently `⬜` Planned:

**1. Authentication and 1-Tap Demo Entry (`⬜`, `TAL-01`):**
1. Visitor opens `/login`.
2. Taps **"Try Demo Store"** (or enters Email/Password).
3. Supabase Auth establishes session; user redirects to `/` (Store Dashboard & Upload).

**2. Core Notebook-to-Ledger Flow (`⬜`, Two-Phase Split, `TAL-02`–`TAL-05`):**
1. Owner taps **Scan Notebook Page** on `/` and captures/uploads a photo.
2. `POST /api/pages/extract` runs `sharp` prep, uploads to private Supabase Storage, calls `src/lib/model.ts` (`extract_rows`), validates with Zod, and runs `src/lib/ledger` (`find_discrepancies`).
3. UI navigates to `/pages/[id]/review`, displaying the cropped notebook preview, active model badge (`Muse Glimmer 30B`), extracted rows with the **Red Margin Gutter** highlighting any `needs_review` or `line_discrepancy` rows, customer match dropdowns, and the sticky **Two-Ply Proof Bar** (`Written Total` vs. `Computed Total`).
4. Owner resolves any flagged row and taps **Confirm & Save to Ledger** (`POST /api/pages/[id]/confirm`).
5. Page transitions to `confirmed` and customer balances update immediately.

**3. Taglish Reminder Flow (`⬜`, `TAL-06`):**
1. Owner opens `/customers` and selects a customer with an outstanding *utang* balance.
2. Owner chooses tone (`Malumanay / Friendly` or `Pormal / Firm`) and taps **Draft Taglish Reminder**.
3. `POST /api/reminders/draft` returns the itemized Taglish message.
4. Owner taps **Copy Message** or **Share via SMS / Messenger**.

Full status matrix and diagrams: [`flow.md`](flow.md).

---

## 6. Non-Goals for v1

- Voice or audio input (`S-01` §3, §8).
- Automatic sending of SMS, Messenger, or WhatsApp messages (`S-01` §5, §8).
- Payment processing, e-wallet links (GCash/Maya), POS hardware integration, or BIR tax filing (`S-01` §8).
- Credit scoring or automated lending decisions (`S-01` §8).
- Native iOS or Android mobile apps (`S-01` §8).
- Multi-user staff roles within a single store (`S-01` §8).

---

## 7. Business Model

Canonical: [`bpd.md`](bpd.md) §4. **Known:** Zero fees in hackathon build; local open-weights inference via Muse Glimmer 30B. **Not yet decided:** Post-hackathon pricing and B2B partnership terms (see [`bpd.md`](bpd.md) §4.2).

---

## 8. Dependencies and Assumptions

**Dependencies**
- **Meta Muse Glimmer 30B** (`Q4_K_M` GGUF + vision projector) running on `llama.cpp` `llama-server` (`--jinja`, CUDA T4 arch 75) on a Kaggle 2x T4 notebook exposed via an authenticated Cloudflare or ngrok tunnel (`S-01` §4) — **Canonical Primary Engine** for all gates, evals, and demos.
- **Gemini API** (OpenAI-compatible endpoint) — strictly an **Auxiliary Developer Backup** for offline development iteration when GPU sessions are closed (`S-01` §4).
- **Supabase** project providing Postgres database, Auth, Row-Level Security, and private Storage bucket (`S-01` §4).

**Assumptions** (tracked in [`evidence.md`](evidence.md) §4)
- `A-01`: Store owners prefer photographing their existing paper notebook over typing entries into a POS app.
- `A-05`: Muse Glimmer 30B achieves ≥80% row-level accuracy on handwritten Filipino/Taglish notebook pages at the Day 3 Gate.
- `A-06`: A Cloudflare or ngrok tunnel from Kaggle 2x T4 to Next.js operates reliably for evaluation and demo recording.

---

## 9. Roadmap — Declared Intent, No Code Yet

| Item | Intended scope | Blocking decisions / dependencies |
|---|---|---|
| **MVP Sprint 1 (`TAL-01`–`TAL-03`)** ⬜ | Supabase schema/RLS/auth, `lib/model.ts`, `sharp` prep, `/api/pages/extract`, Kaggle Glimmer setup, Day 3 Handwriting Gate (10 pages) | Verify `A-05` (Glimmer ≥80% accuracy) & `A-06` (Kaggle tunnel) |
| **MVP Sprint 2 (`TAL-04`–`TAL-06`)** ⬜ | `src/lib/ledger` two-level discrepancy engine, Review UI (Red Margin Gutter + Two-Ply Proof Bar), `/api/pages/[id]/confirm`, Customer Balances, Taglish Reminders, full Glimmer switch by Oct 31 | Sprint 1 completion |
| **MVP Sprint 3 (`TAL-07`–`TAL-08`)** ⬜ | 30+ page Muse Glimmer evaluation harness, README ("Built during the hackathon"), UI polish, and demo video recording | Sprint 2 completion |
| **Stretch: Restock List & Weekly Summary (`S1`, `S2`)** ⬜ | Supplier receipt cost tracking, `restock_list` tool, and weekly top-items/profit summary | MVP feature freeze & passing evaluation |
| **Stretch: Multi-Page Month View & CSV Export (`S3`, `S5`)** ⬜ | 131K context monthly analysis and CSV/printable ledger export | MVP feature freeze |

**This is the canonical roadmap.** [`flow.md`](flow.md) §6 shows status only; [`sad.md`](sad.md) §6 shows architecture impact only.

---

## Self-Check

- [x] Every Must-Have has an honest status mark (`⬜`) and planned file location
- [x] Stretch and roadmap features are clearly separated from MVP Must-Haves
- [x] Operating boundary (hackathon prototype, consented/synthetic data, zero value movement) stated
- [x] User stories (`US-01` to `US-07`) carry Given/When/Then criteria and traces to `BR-NN`, `TAL-NN`, and `T-NNN`
