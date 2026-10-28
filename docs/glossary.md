# Glossary: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [Grounding](grounding.md) · [Data model](data-model.md) · [BRD](brd.md) · [PRD](prd.md)

---

> **Rule.** One term, one meaning. Use the **canonical** term in code identifiers, UI copy, API fields, and documents. If you need a new term, add it here in the same change.

---

## 1. Domain Terms

| Term (canonical) | Definition | Do **not** use | Defined in | Code identifier |
|---|---|---|---|---|
| **Talaan (Ledger)** | The verified digital record of store transactions and customer balances derived from confirmed notebook pages. | "POS log", "blockchain ledger" | [`foundation.md`](foundation.md) §5 | `ledger` |
| **Store** | A single sari-sari store tenant owned by an authenticated `store_owner`. | "merchant account", "organization" | [`data-model.md`](data-model.md) §3 | `Store` / `stores` |
| **Customer** | A neighborhood buyer recorded in the store's notebook who takes items on credit (*utang*) or makes debt payments (*bayad*). | "debtor account", "borrower" | [`data-model.md`](data-model.md) §3 | `Customer` / `customers` |
| **Notebook Page (`Page`)** | A single photographed sheet of a handwritten *utang* notebook, supplier receipt, or typed list uploaded to Talaan. | "scan", "invoice document" | [`data-model.md`](data-model.md) §3 | `Page` / `pages` |
| **Ledger Entry (`Entry`)** | A single extracted line item on a `Page` representing a credit purchase, a debt payment, or a cash sale. | "transaction", "order line" | [`data-model.md`](data-model.md) §3 | `Entry` / `entries` |
| **Utang (`credit`)** | An unpaid purchase recorded on credit that **increases** a customer's owed balance. | "loan", "IOU" | [`foundation.md`](foundation.md) §3.3 | `entry_type: 'credit'` |
| **Bayad (`payment`)** | A partial or full payment made by a customer toward existing *utang* that **decreases** their owed balance. | "refund", "rebate" | [`foundation.md`](foundation.md) §3.3 | `entry_type: 'payment'` |
| **Cash Sale (`cash_sale`)** | A purchase paid immediately at the counter; tracked for sales/restock totals but does **not** change customer *utang* balance. | "paid utang" | [`foundation.md`](foundation.md) §3.3 | `entry_type: 'cash_sale'` |
| **Written Total (`written_total`)** | The handwritten sum written by the store owner at the bottom of the physical notebook page (if present). | "expected total" | [`foundation.md`](foundation.md) §7.3 | `written_total` |
| **Computed Total (`computed_total`)** | The exact sum calculated deterministically in TypeScript (`src/lib/ledger`) from the page's extracted entries. | "AI total", "estimated total" | [`foundation.md`](foundation.md) §3.2 | `computed_total` |
| **Row Discrepancy (`line_discrepancy`)** | A deterministic mismatch on a single row where `quantity * unit_price !== amount`. | "AI error" | [`foundation.md`](foundation.md) §3.2 | `line_discrepancy` |
| **Page Discrepancy** | A deterministic mismatch where `computed_total !== written_total` on a page. | "balance drift" | [`foundation.md`](foundation.md) §3.2 | `has_page_discrepancy` |
| **Confidence Score (`confidence`)** | Model-reported probability (`0.00` to `1.00`) that an extracted row accurately reflects the handwriting. Rows `< 0.80` require review. | "accuracy score" | [`foundation.md`](foundation.md) §3.1 | `confidence` |
| **Needs Review (`needs_review`)** | Boolean flag set when `confidence < 0.80`, `line_discrepancy === true`, or customer match is ambiguous. | "unverified" | [`foundation.md`](foundation.md) §3.2 | `needs_review` |
| **Taglish Reminder Draft (`Reminder`)** | An agent-generated message in Taglish (`friendly` or `firm`) summarizing a customer's owed balance for manual owner sharing. | "automated SMS", "collection notice" | [`foundation.md`](foundation.md) §7.2 | `Reminder` / `reminders` |
| **Two-Ply Proof Bar** | The sticky bottom reconciliation bar on the Review screen comparing `Written Total` vs. `Computed Total` side by side. | "footer summary" | [`dsd.md`](dsd.md) §4.5 | `TwoPlyProofBar` |
| **Red Margin Gutter** | The vertical red margin column on the left side of the ledger review table that houses row status icons and discrepancy flags. | "left sidebar" | [`dsd.md`](dsd.md) §4.5 | `RedMarginGutter` |
| **Handwriting Gate** | The Day 3 milestone testing 10 real notebook pages on Muse Glimmer with a required ≥80% row-level accuracy threshold (`A-05`). | "OCR benchmark" | [`foundation.md`](foundation.md) §14 | `handwriting_gate` |

## 2. Roles

One name per role across docs, code, database, and UI.

| Role (canonical) | Who this is | Code / DB value | Surface | Status |
|---|---|---|---|---|
| **Store Owner** | Authenticated sari-sari store operator managing their store's pages, entries, customers, and reminders | `store_owner` (scoped via `stores.owner_id = auth.uid()`) | Main Web App (`/(app)/*`) | ⬜ Planned |
| **Anonymous Visitor** | Unauthenticated visitor on the login / demo-entry screen | `anon` | Auth Surface (`/login`) | ⬜ Planned |

## 3. States and Statuses

Every enum or state machine value, with its meaning. The legal transitions live in [`data-model.md`](data-model.md) §4. Every UI presentation pairs the label with an icon or shape ([`dsd.md`](dsd.md) §4.4).

| Entity | State | Meaning | Terminal? | UI label |
|---|---|---|:---:|---|
| `pages.status` | `'processing'` | Image uploaded; `sharp` prep and vision model extraction in flight | No | `Reading Page…` |
| `pages.status` | `'needs_review'` | Rows extracted and checked by `src/lib/ledger`; awaiting owner review and confirmation | No | `Needs Review` |
| `pages.status` | `'retake_requested'` | Agent invoked `flag_unreadable`; owner must upload a clearer photo | Yes | `Retake Photo` |
| `pages.status` | `'confirmed'` | Owner reviewed and confirmed all rows; entries committed to customer balances | Yes | `Confirmed in Ledger` |
| `entries.entry_type` | `'credit'` | Unpaid *utang* purchase; adds to customer balance | N/A | `Credit` |
| `entries.entry_type` | `'payment'` | Customer *bayad* payment; subtracts from customer balance | N/A | `Payment` |
| `entries.entry_type` | `'cash_sale'` | Paid cash purchase; does not affect customer *utang* balance | N/A | `Cash Sale` |
| `reminders.tone` | `'friendly'` | Polite, neighborly Taglish reminder | N/A | `Friendly` |
| `reminders.tone` | `'firm'` | Clear, direct Taglish due-balance reminder | N/A | `Firm` |
| `MODEL_PROVIDER` | `'glimmer'` | Meta Muse Glimmer 30B via `llama-server` (CANONICAL PRIMARY: Gate, Eval, Demo, Production) | N/A | Logged server-side (`pages.model`) |
| `MODEL_PROVIDER` | `'gemini'` | Gemini API via OpenAI-compatible client (Auxiliary Developer Backup Only — excluded from evals) | N/A | Logged server-side (`pages.model`) |

## 4. Acronyms and Abbreviations

| Acronym | Expansion | Notes |
|---|---|---|
| BRD / BPD / PRD / SAD / SDD / DSD | Business Requirements / Business Product / Product Requirements / Software Architecture / System Design / Design System Document | Suite documents — see [`index.md`](index.md) |
| ADR | Architecture and Decision Record | See [`adr/README.md`](adr/README.md) |
| RLS | Row-Level Security | Postgres per-row tenant isolation (`stores.owner_id = auth.uid()`) |
| GGUF | GPT-Generated Unified Format | Quantized weight format (`Q4_K_M`) used by `llama.cpp` `llama-server` for Muse Glimmer |
| DTI | Department of Trade and Industry (Philippines) | Referenced in `S-01` §2 (`C-05`) |
| MSME | Micro, Small, and Medium Enterprise | Category that includes neighborhood sari-sari stores |

## 5. Ambiguous or Banned Terms

Words that mean different things to different readers.

| Word | Problem | Use instead |
|---|---|---|
| "partner" | Implies a signed agreement with Packworks, DTI, cooperatives, or lenders | "prospective target" until signed ([`evidence.md`](evidence.md) §6) |
| "live" / "production" | Implies real store owners or real money in operation | State the actual environment (`local dev`, `Kaggle tunnel`, or `Vercel preview`; [`ops.md`](ops.md) §1) |
| "compliant" / "certified" | Implies legal or regulatory attestation (e.g., BIR or NPC certification) | Describe the specific control and name the outstanding review |
| "done" | Ambiguous | Use the status vocabulary in [`grounding.md`](grounding.md) §3 (`✅`, `🟡`, `⬜`, `❌`) |
| "auto-send" / "SMS blast" | Implies Talaan transmits messages without owner action | "Taglish reminder draft with manual copy/share handoff" |
| "AI-calculated total" | Implies the LLM performs arithmetic | "Deterministically computed total (`src/lib/ledger`)" |

## Self-Check

- [x] Every role in code appears in §2 with the same spelling
- [x] Every enum value in [`data-model.md`](data-model.md) appears in §3
- [x] No synonym listed under "Do not use" appears in code or UI copy
- [x] Terms used in the PRD and BRD are defined here
