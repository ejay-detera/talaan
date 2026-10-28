# Foundation Document: Talaan

**Version:** 1.0
**Date:** 2026-10-27
**Status:** Active Living Foundation
**Owner:** Dev Ejay

> This document is the canonical foundation reference for **Talaan**'s purpose, product thinking, identity, workflow, and technical direction.
>
> **Terminology.** Where this document says "the brief", read **the Talaan project brief** (`S-01` in [`evidence.md`](evidence.md) §2).
>
> **Factual-source boundary:** product facts come from the project brief (`S-01`) and locked user design decisions. Pitch or external research context comes from cited sources (`S-02` to `S-09`). Keep them separate; never merge them.
>
> Because the Lifecycle stage in §0 is **Build** (scaffolded repository; product capabilities planned), this document is **not** evidence that the described product capabilities are deployed, certified, or operating in production. Where the source is silent, write **Open**, **TBD**, or **Not stated**. Never invent an answer. Evidence rules: [`grounding.md`](grounding.md).

---

## 0. Lifecycle Stage, Source Basis, Active Modules

| Item | Value |
|---|---|
| Lifecycle stage | **Build**. Repository contains the Next.js 16.4.3 / React 19.3.0 / Tailwind v4 scaffold (`S-10`); product features are `⬜` Planned across SAD, SDD, PRD, Flow, and Sprint docs. |
| Source basis | **Brief**: `S-01` (*Talaan: Notebook-to-Ledger Agent for Sari-Sari Stores*, Draft v1, 2026-10-27) in [`evidence.md`](evidence.md) §2 |
| Context | **Competition**: Meta Global AI Developer Hackathon (Oct 26 – Nov 4, 2026) · Track: Indie Developer · Problem Statement: *Build for Your World* |

**Active modules.** Inactive module files (`mobile-client.md`) are removed from `docs/modules/`.

| Module | Active? | Why | File |
|---|:---:|---|---|
| Payments and ledger | **Y** | Talaan maintains a financial *utang* (credit), *bayad* (payment), and cash-sale bookkeeping ledger requiring two-phase prepare/confirm, fail-closed centavo arithmetic, and append-only confirmed records (no external payment rail). | [`modules/payments-ledger.md`](modules/payments-ledger.md) |
| Mobile client | **N** | Native mobile apps are out of scope (`S-01` §8). Talaan ships as a mobile-first Next.js web app; 44×44px touch targets and mobile viewport rules live in [`dsd.md`](dsd.md). | Deleted (`N/A`) |
| AI component | **Y** | Core extraction and Taglish reminder drafting call Meta's open-weights **Muse Glimmer 30B** model (and Gemini API for local dev testing only) behind a strict Zod schema and human-in-the-loop gate. | [`modules/ai-component.md`](modules/ai-component.md) |

---

## FOR DEVS + TL;DR

> If you read nothing else, read this section. It separates the product defined by the brief and locked design decisions from open questions that still need validation.

### What we are building

**Talaan** is a mobile-first web application and AI bookkeeping agent that turns a phone photo of a handwritten sari-sari store *utang* (credit) notebook page, supplier receipt, or typed list into a clean, arithmetic-checked digital ledger. The platform manages the complete notebook-to-ledger lifecycle: **1. Capture & Pre-process**, **2. Structured Extraction & Deterministic Discrepancy Check (Prepare Phase)**, **3. Human-in-the-Loop Review & Ledger Commit (Confirm Phase)**, and **4. Customer Balance Tracking & Taglish Reminder Drafting (Act Phase)**.

The brief specifies a **Next.js (App Router) + React + Tailwind CSS** client and API route layer; **TypeScript**; **Supabase (Postgres, Private Storage, Auth + RLS)**; **Meta Muse Glimmer 30B** (Q4_K_M GGUF served by `llama.cpp` `llama-server` on Kaggle 2x T4 GPU via tunnel, with **Gemini API** via OpenAI-compatible client for local dev/testing only); **Zod** for schema validation; **sharp** for image pre-processing; **Vitest** for unit and evaluation testing; and deterministic TypeScript ledger math in `src/lib/ledger`. Currently, only the Next.js 16.4.3 / React 19.3.0 scaffold is installed (`S-10`); all domain features are `⬜` Planned.

### Brief-defined and user-locked product decisions

| Area | Defined decision | Confidence boundary |
|---|---|---|
| Product category | AI Notebook-to-Ledger Bookkeeping Web App for Sari-Sari Stores | Directly stated (`S-01` §1, §3) |
| Hackathon context | Submitted for **Meta Global AI Developer Hackathon** (Oct 26 – Nov 4, 2026), Indie Developer Track (*Build for Your World*) | Directly stated (`S-01` header) |
| Submitting developer | **Dev Ejay** | Directly stated (User decision) |
| Primary operators | Filipino sari-sari store owners (neighborhood micro-retailers) | Directly stated (`S-01` §2) |
| Core instrument | Handwritten *utang* notebook page / receipt photo converted into verified ledger rows | Directly stated (`S-01` §1, §3) |
| Agent execution pattern | **Two-Phase Split:** Single-turn vision extraction (`extract_rows` / `flag_unreadable`) + deterministic TS math (`find_discrepancies`) on upload; human review gate before DB save (`add_entries`); on-demand tool calls for `draft_reminder` / `restock_list` | Locked user decision (`Q1`) |
| Entry classification | Every row is typed as `'credit'` (*utang* owed), `'payment'` (*bayad* reducing debt), or `'cash_sale'` (paid immediately), with auto-matched or 1-tap created customer records | Locked user decision (`Q2`) |
| Discrepancy checking | **Two-Level Deterministic Math (`src/lib/ledger`):** Row-level (`quantity * unit_price === amount` when unit price is written) + Page-level (`computed_total === written_total`). Zero LLM arithmetic. | Locked user decision (`Q3`) |
| Model policy | **Meta Muse Glimmer 30B** is the canonical primary engine and mandatory for Day 3 handwriting gate, 30+ page evaluation, and final demo. **Gemini API** (`MODEL_PROVIDER=gemini`) is an auxiliary developer backup used for offline building/debugging only. Active model shown in UI badge and logged per page. | Directly stated (`S-01` §4) |
| Design system | **"The Notebook, Kept"** (`impeccable`, [`docs/design.md`](design.md)): High-contrast daylight mode (`#F2F5EC` paper, `#FFFFFF` sheet, `#1E3FAE` ink, `#C8302F` red margin, `#FFE14D` highlighter, `Bricolage Grotesque` + `Atkinson Hyperlegible Next` + `Caveat`) | Locked user decision (`Q7`) |
| Implementation status | Next.js 16.4.3 / Tailwind v4 scaffold with `/` Landing Page, `/login` 1-tap demo auth (`TAL-01`), `POST /api/pages/extract` (`TAL-02`), and `src/lib/ledger` math (`TAL-04`) | Verified in repository (`S-10`) |

### Proposed architecture in one paragraph

Talaan runs as a unified **Next.js App Router** application in TypeScript. On the client, a mobile-first React + Tailwind CSS interface captures or uploads a notebook photo. On the server, Next.js Route Handlers (`src/app/api/`) pre-process the image with `sharp`, store the private image in **Supabase Storage**, and call a unified OpenAI-compatible model client (`src/lib/model.ts`) pointed at **Meta Muse Glimmer 30B** (`llama-server --jinja` on Kaggle 2x T4 exposed via an authenticated tunnel) as its primary engine, with the **Gemini API** available as an auxiliary developer backup for offline UI work. Model outputs are strictly parsed with **Zod** (`src/lib/schemas.ts`), then passed to deterministic ledger functions (`src/lib/ledger/`) that compute row-level and page-level totals in integer centavos. Staged extractions are reviewed and confirmed by the store owner before being committed to **Supabase Postgres** tables protected by **Supabase Auth** and **Row-Level Security (RLS)**.

### Core workflow at a glance

1. **Store Owner** signs in (via Email/Password or 1-tap Demo Store login) and takes or uploads a photo of a handwritten *utang* notebook page, receipt, or list.
2. **Backend Prepare Route (`POST /api/pages/extract`)** optimizes the image via `sharp`, uploads it to private Supabase Storage, and invokes `lib/model.ts` (`extract_rows` or `flag_unreadable`).
3. If unreadable, the agent returns a specific **Retake Request** explaining which region or lighting condition failed (`pages.status = 'retake_requested'`).
4. If readable, **Deterministic Ledger Code (`src/lib/ledger`)** validates the Zod payload, checks row math (`quantity * unit_price === amount`) and page math (`computed_total === written_total`), auto-matches customer names against existing store `customers`, and stages the page (`pages.status = 'needs_review'`).
5. **Store Owner** inspects the **Review & Discrepancy Screen** (featuring the Red Margin Gutter for row flags and the Two-Ply Proof Bar comparing `Written Total` vs. `Computed Total`), edits or confirms flagged rows, and resolves customer links.
6. **Backend Confirm Route (`POST /api/pages/[id]/confirm`)** re-verifies arithmetic and commits confirmed rows (`confirmed_by_user = true`, `pages.status = 'confirmed'`) to Supabase Postgres.
7. **Store Owner** views updated **Customer Balances** (`sum(credit) - sum(payment)`) and requests a **Taglish Reminder Draft** (`Friendly` or `Firm` tone) to copy or share manually via SMS/Messenger (`navigator.share` / `sms:`).

### Scope and status truth table

| Capability | Priority | Defined by brief | Built or deployed today |
|---|---|---:|---:|
| 1. Photo upload of notebook page, receipt, or list | Must (MVP) | Yes (`S-01` §5) | ⬜ Planned |
| 2. Structured extraction (`credit`/`payment`/`cash_sale`, confidence) | Must (MVP) | Yes (`S-01` §5) | ⬜ Planned |
| 3. Review screen with low-confidence highlights & customer matching | Must (MVP) | Yes (`S-01` §5) | ⬜ Planned |
| 4. Two-level deterministic discrepancy finder (row + page totals) | Must (MVP) | Yes (`S-01` §5) | ⬜ Planned |
| 5. Customer balances (`sum(credit) - sum(payment)`) & activity history | Must (MVP) | Yes (`S-01` §5) | ⬜ Planned |
| 6. Taglish reminder drafts with tone selector & copy/share handoff | Must (MVP) | Yes (`S-01` §5) | ⬜ Planned |
| 7. Retake request when a page or region is unreadable | Must (MVP) | Yes (`S-01` §5) | ⬜ Planned |
| S1. Supplier receipt to restock list and cost tracking | Stretch | Yes (`S-01` §5) | ⬜ Planned |
| S2. Weekly summary (top items, total *utang*, estimated profit) | Stretch | Yes (`S-01` §5) | ⬜ Planned |
| S3. Multi-page month view using 131K long context | Stretch | Yes (`S-01` §5) | ⬜ Planned |
| S4. Shelf photo stock count (experimental) | Stretch | Yes (`S-01` §5) | ⬜ Planned |
| S5. Export to CSV or printable ledger | Stretch | Yes (`S-01` §5) | ⬜ Planned |

### Contributor named in the brief

| Track | Member | Role |
|---|---|---|
| Indie Developer | **Dev Ejay** | Solo Developer, Designer, and Researcher |

---

## 1. Where We Started: The Project Brief Context

**Talaan** originates in a written project brief (`S-01`, Draft v1, dated 2026-10-27) authored by **Dev Ejay** for the **Meta Global AI Developer Hackathon** (Oct 26 – Nov 4, 2026, Indie Developer Track, Problem Statement: *Build for Your World*) under the title:

> **Talaan: Notebook-to-Ledger Agent for Sari-Sari Stores**

The brief establishes the one-line pitch, 5 Whys problem analysis, Muse Glimmer 30B rationale, web application tech stack, dual-provider model switch (`glimmer` vs. `gemini`), Supabase data model, MVP and stretch feature set, business model hypotheses, illustrative TAM/SAM/SOM sizing, scope boundaries, risk mitigations, 30+ page evaluation plan, judging criteria mapping, 9-day execution calendar, and cited secondary sources.

The source explicitly marks as **unverified** or **open** (`S-01` §12):

- Muse Glimmer's real accuracy on handwritten Filipino and Taglish (`A-05`);
- Real Muse Glimmer inference speed on 2x T4 GPUs;
- Whether a Cloudflare or ngrok tunnel from Kaggle to a deployed Next.js app works reliably (`A-06`);
- Official hackathon rules regarding credit card requirements for $150 partner credits, non-Meta model usage during development, and exact submission deadline time;
- Store owner willingness to pay ₱99/month (`A-02`), smartphone/photo workflow adoption share (`A-03`), and Year-1 capture rate (`A-04`); and
- Any formal agreements with sari-sari stores, cooperatives, lenders, or FMCG distributors.

Those unverified items are preserved as explicit assumptions (`A-01` to `A-06` in [`evidence.md`](evidence.md) §4) and open questions (§14) rather than stated as established facts.

---

## 2. The Problem Talaan Addresses

Sari-sari store owners in the Philippines (~1.1M to 1.3M+ neighborhood stores, mostly one-person family-run operations handling nearly 70% of manufactured goods sold; `C-01`, `C-02`) run on paper. They track customer credit (*utang*), debt payments (*bayad*), daily sales, and stock in handwritten school notebooks (*listahan*), if they track them at all (`S-02`, `S-03`, `S-06`). Operating on thin ~10% average markups (`C-04`), arithmetic mistakes, uncollected debts, and unrecorded stock erode their working capital. Existing POS and store management apps demand that busy one-person operators abandon their paper habit and type every transaction into a phone at the counter—a behavioral barrier that leaves roughly 77% of stores off digital systems (`C-03`, `A-01`).

### 2.1 Operational failure points (5 Whys from `S-01` §2)

| Problem identified in the brief | Operational consequence expressed in the brief | Evidence status |
|---|---|---|
| **Paper-only or missing records** | Owners do not know their true profit, current stock, or exact total owed per customer. | Cited in `S-02`, `S-06`, `S-07` (`C-06`) |
| **Handwritten arithmetic errors** | Manual addition of running *utang* lists on ~10% margins directly causes cash leakage and disputes. | Cited in `S-03` (`C-04`) |
| **Software demands habit change** | One-person operators lack time to type every item at the counter, so existing apps see low adoption (~23% max claimed coverage by largest player). | Cited in `S-04`, `S-05` (`C-03`); root cause is hypothesis `A-01` |
| **Awkward or forgotten debt follow-ups** | Owners must manually flip through pages to sum what a neighbor owes before sending a reminder. | Stated in `S-01` §2, §5 |
| **Lack of verifiable income records** | Without clean digital ledgers, stores struggle to qualify for formal credit or DTI digital accounting support programs. | Cited in `S-02`, `S-03` (`C-05`) |

### 2.2 Why existing solutions are insufficient

The brief contrasts Talaan with both **unassisted paper notebooks** (zero habit friction, but error-prone and unsearchable) and **traditional POS / store apps** like Packworks Sari.PH Pro (structured data, but high habit friction requiring manual data entry for every transaction). Talaan bridges the full operating chain without changing how the owner works at the counter:

1. **Keep writing in the physical notebook** during busy store hours;
2. **Snap a single phone photo** of the page when convenient;
3. **Extract structured rows** (`credit`, `payment`, `cash_sale`) via local open-weights vision AI;
4. **Verify row and page arithmetic deterministically in code** (`src/lib/ledger`);
5. **Confirm flagged rows with a human-in-the-loop gate** before updating customer balances; and
6. **Turn balances into polite Taglish reminders** and restock insights.

---

## 3. The Product Response: A Complete Notebook-to-Ledger Lifecycle

Talaan is architected as four linked control planes operating across a **Two-Phase Split** (`Prepare` vs. `Confirm & Act`).

### 3.1 Control Plane 1: Image Prep & Vision Extraction (`Prepare`)

When an owner uploads a photo of a notebook page, supplier receipt, or list, the server normalizes the image with `sharp` (resize, auto-rotate, contrast enhancement, crop) to reduce vision token overhead and improve legibility. The server then makes a single structured call through `src/lib/model.ts` to **Muse Glimmer 30B** (or Gemini in local dev). The model either invokes `flag_unreadable(region, reason)` if lighting/blur prevents reading, or extracts structured rows with per-row confidence scores (`0.00`–`1.00`) and any `written_total` found on the page.

### 3.2 Control Plane 2: Deterministic Discrepancy Engine & Human Review Gate (`Verify`)

Model output is never trusted directly with money. Every response is validated against a **Zod** schema (`src/lib/schemas.ts`) and passed to deterministic TypeScript functions in `src/lib/ledger/`. The discrepancy engine executes a **two-level arithmetic check** in integer centavos:
- **Row-level check:** Where `quantity` and `unit_price` are written (e.g., `3 Lucky Me @ 12 = 36`), verifies `quantity * unit_price === amount`.
- **Page-level check:** Recomputes `computed_total` from extracted rows and compares it against the notebook's `written_total`.

Rows with `confidence < 0.80` or row-level math errors are flagged `needs_review = true`. In the **Review & Discrepancy UI**, the owner sees flagged rows in the Red Margin Gutter, compares `Written Total` vs. `Computed Total` in the Two-Ply Proof Bar, links extracted customer names to existing store customers (or creates new ones in one tap), and explicitly confirms the page before any ledger balance changes.

### 3.3 Control Plane 3: Append-Only Ledger & Customer Balances (`Commit`)

Once confirmed (`POST /api/pages/[id]/confirm`), rows are saved to Supabase Postgres with `confirmed_by_user = true` and `pages.status = 'confirmed'`. Customer balances are computed deterministically in SQL/code:
$$\text{Customer Balance} = \sum \text{amount}_{\text{credit}} - \sum \text{amount}_{\text{payment}}$$
Cash sales (`entry_type = 'cash_sale'`) are recorded for store sales/restock tracking without increasing customer *utang* debt.

### 3.4 Control Plane 4: Taglish Reminder & Restock Assistant (`Act`)

From the Customer Balances view, the owner selects a customer with an overdue balance, picks a communication tone (`Friendly` or `Firm`), and invokes `draft_reminder(customer, tone)`. The agent drafts a culturally natural Taglish message listing the confirmed items and exact balance owed. The owner copies the message or launches their phone's native SMS/Messenger app via Web Share (`navigator.share` / `sms:?body=`)—keeping the owner in full control of every outbound message.

---

## 4. Why the Capabilities Belong Together

### Vision extraction without deterministic code math is unsafe

An LLM vision model can read messy Taglish handwriting (`"3 Lucky Me - 36"`), but LLMs hallucinate arithmetic. Conversely, a deterministic calculator cannot read a handwritten notebook photo. Pairing Muse Glimmer's multimodal extraction with `src/lib/ledger`'s centavo-exact arithmetic verification makes the resulting ledger trustworthy for real money.

### Ledger balances without Taglish actionability leave value on the paper

Knowing a neighbor owes ₱340 is only half the job; collecting it delicately in a tight-knit barangay requires the right wording. Generating itemized, tone-calibrated Taglish reminder drafts directly from verified ledger rows turns passive records into recovered cash flow.

### Cloud-only AI without local open-weights inference breaks privacy and unit economics

Sari-sari store owners operate on ~10% margins and record sensitive neighborhood debts. Running open-weights **Muse Glimmer 30B (Apache 2.0)** locally or on a shared barangay/cooperative box eliminates per-token API fees and keeps customer debt lists off third-party clouds.

> **Product thesis:** Talaan is not a simple image analyzer and not a rigid POS terminal. It is a verification-first bookkeeping agent that lets sari-sari store owners keep their paper notebook while gaining a checked digital ledger, accurate customer balances, and actionable Taglish reminders.

---

## 5. The Name: Talaan

The brief establishes **Talaan** as the product name paired with the descriptor **Notebook-to-Ledger Agent for Sari-Sari Stores**.

In Filipino/Tagalog, *talaan* means "list", "register", "record book", or "ledger" (from *tala*, a written note or entry). The brief does not document rejected name alternatives.

---

## 6. Product Identity

### 6.1 Established positioning

| Identity element | Source-defined form |
|---|---|
| Product name | **Talaan** |
| Product descriptor | **Notebook-to-Ledger Agent for Sari-Sari Stores** |
| Category contrast | Not a simple image analyzer and not a habit-breaking POS app; a verification-first notebook-to-ledger agent |
| Primary audience | Filipino sari-sari store owners (~1.1M to 1.3M+ neighborhood micro-retailers) |
| Core outcome | Keep the handwritten notebook habit while getting arithmetic-checked digital records, accurate *utang* balances, and ready-to-send Taglish reminders |

### 6.2 One-line value proposition

> Talaan turns a photo of a handwritten *utang* notebook into a clean, checked ledger, using Meta's open-weights Muse Glimmer model running locally, so store owners keep their notebook habit and still get real records. (`S-01` §1)

### 6.3 Source-backed messaging pillars

1. **Zero habit change at the counter.** Keep writing in the school notebook you already use; snap a photo when ready (`S-01` §1, §2).
2. **Code does the arithmetic, never the AI.** Every row multiplication and page total is recomputed deterministically in TypeScript (`src/lib/ledger`) to catch both AI misreads and the notebook's own addition mistakes (`S-01` §3, §5).
3. **Human-in-the-loop before anything is saved.** Uncertain rows (`needs_review`) and math discrepancies are highlighted for the owner to fix or confirm before touching customer balances (`S-01` §3, §5).
4. **Private, zero-token-cost local AI via Meta Muse Glimmer.** Open weights (Apache 2.0) allow self-hosting on a local or cooperative GPU box so neighborhood debt records stay private (`S-01` §3, §6).
5. **Culturally fluent Taglish action.** Drafts polite, itemized payment reminders in Taglish ready for the owner to copy or share (`S-01` §3, §5).

---

## 7. Product Vision: The Unified Workflow

### 7.1 End-to-end operating flow

#### Step 1 — Capture & Upload (`Prepare`)
The store owner photographs a handwritten *utang* page, supplier receipt, or typed list on their phone. The server runs `sharp` to resize, orient, and boost contrast, then stores the image in a private Supabase Storage bucket.

#### Step 2 — Structured Vision Extraction (`Prepare`)
The backend calls `src/lib/model.ts` (`extract_rows` or `flag_unreadable`). If the page is too blurry or cut off, the agent triggers a **Retake Request** specifying what to re-photograph. Otherwise, it returns structured rows (`customer`, `item`, `quantity`, `unit_price`, `amount`, `entry_type`, `confidence`) and `written_total`.

#### Step 3 — Deterministic Discrepancy Check (`Verify`)
`src/lib/ledger` validates the Zod schema and runs two-level arithmetic verification in integer centavos:
1. Row check: `quantity * unit_price === amount` (when `quantity` and `unit_price` are present).
2. Page check: `computed_total === written_total` (when `written_total` is present).
It also fuzzy-matches extracted customer strings against the store's existing `customers` table.

#### Step 4 — Human Review & Ledger Confirmation (`Confirm`)
On the **Review & Discrepancy Screen**, low-confidence rows (`confidence < 0.80`) and arithmetic mismatches are flagged in the left **Red Margin Gutter**, and the sticky **Two-Ply Proof Bar** displays `Written Total` vs. `Computed Total`. The owner edits any misread value, confirms customer matches, and taps **Confirm & Save to Ledger** (`POST /api/pages/[id]/confirm`).

#### Step 5 — Balances & Taglish Reminder Handoff (`Act`)
Confirmed rows update customer balances (`sum(credit) - sum(payment)`). On the **Customer Balances Screen**, the owner taps a customer, selects a tone (`Friendly` or `Firm`), generates a **Taglish Reminder Draft**, and taps **Copy** or **Share via SMS / Messenger**.

### 7.2 Proposed core and stretch features

| # | Feature | Tier | Refined behavior |
|---:|---|---|---|
| 1 | **Photo Upload & Image Prep** | MVP (Must) | Mobile camera capture or gallery upload; server-side `sharp` resize, rotation, and contrast prep; stored in private Supabase Storage bucket with signed URLs. |
| 2 | **Structured Row Extraction** | MVP (Must) | Extracts `page_date`, `written_total`, and rows with `customer`, `item`, optional `quantity` & `unit_price`, `amount`, `entry_type` (`credit` \| `payment` \| `cash_sale`), and `confidence` (`0`–`1`). Logs active `model` and `latency_ms`. |
| 3 | **Review Screen & Customer Matching** | MVP (Must) | Highlights `needs_review` rows (`confidence < 0.80` or math mismatch) in the Red Margin Gutter; auto-matches customer names to existing `customers` or creates a new customer in 1 tap; blocks DB ledger commit until owner confirms. |
| 4 | **Two-Level Discrepancy Finder** | MVP (Must) | Deterministic TypeScript (`src/lib/ledger`) recomputes row math (`quantity * unit_price === amount`) and page math (`computed_total === written_total`) in integer centavos; displays side-by-side comparison in the Two-Ply Proof Bar. |
| 5 | **Customer Balances Ledger** | MVP (Must) | Per-customer running balance (`sum(credit) - sum(payment)`), last activity date, and itemized history of confirmed `credit` and `payment` entries. |
| 6 | **Taglish Reminder Drafts** | MVP (Must) | Tone selector (`Friendly` vs. `Firm`); generates polite Taglish message citing itemized unpaid rows and total balance; 1-tap Copy + Web Share API / `sms:?body=` deep-link. Never auto-sends. |
| 7 | **Unreadable Page Retake Request** | MVP (Must) | When `flag_unreadable` is triggered or overall page confidence fails threshold, sets `pages.status = 'retake_requested'` and tells the owner exactly which section/lighting issue to re-photograph. |
| S1 | **Supplier Receipt to Restock List** | Stretch | Extracts supplier receipts into cost records and suggests restock items (`restock_list`). |
| S2 | **Weekly Summary** | Stretch | Aggregates top-selling items, total outstanding *utang*, and estimated profit across confirmed pages. |
| S3 | **Multi-Page Month View** | Stretch | Uses Muse Glimmer's 131K context window for multi-page monthly analysis. |
| S4 | **Shelf Photo Stock Count** | Stretch | Experimental visual stock counting from shelf photos. |
| S5 | **CSV / Printable Ledger Export** | Stretch | Exports confirmed ledger entries and customer balances to CSV or print layout. |

### 7.3 Canonical extraction schema and agent tools

```json
{
  "page_date": "2026-10-27",
  "rows": [
    {
      "customer": "Aling Nena",
      "item": "Lucky Me Pancit Canton",
      "quantity": 3,
      "unit_price": 12.0,
      "amount": 36.0,
      "entry_type": "credit",
      "confidence": 0.92,
      "needs_review": false
    }
  ],
  "written_total": 840.0,
  "notes": []
}
```

| Tool / Function | Execution Layer | Phase | Purpose |
|---|---|---|---|
| `extract_rows(image)` | LLM Vision Tool (`src/lib/model.ts`) | Phase 1: Prepare | Read handwritten/printed page into structured rows with confidence scores |
| `flag_unreadable(region, reason)` | LLM Vision Tool (`src/lib/model.ts`) | Phase 1: Prepare | Reject unreadable image or region and instruct owner what to re-photograph |
| `find_discrepancies(page)` | Deterministic TS (`src/lib/ledger/`) | Phase 1 & 2 | Recompute row (`quantity * unit_price`) and page (`computed_total`) math in integer centavos |
| `add_entries(page_id, rows)` | Deterministic DB Transaction (`POST /api/pages/[id]/confirm`) | Phase 2: Confirm | Save human-confirmed rows and customer matches to Supabase |
| `get_balance(customer_id)` | Deterministic DB Query (`GET /api/customers/[id]/balance`) | Phase 2: Act | Return exact customer balance (`sum(credit) - sum(payment)`) and entry history |
| `draft_reminder(customer, tone)` | LLM Tool (`src/lib/model.ts`) | Phase 2: Act | Draft a polite Taglish reminder message (`friendly` or `firm`) from confirmed debt rows |
| `restock_list(period)` | LLM Tool + DB Aggregation (Stretch) | Phase 2: Act | Suggest restock items based on confirmed sales velocity |

### 7.4 What success looks like at hackathon evaluation level

Per `S-01` §8–§10, technical and product validation is measured on a labeled evaluation set of **30+ notebook pages** (plus a **Day 3 gate on 10 pages** requiring ≥80% row-level accuracy on Muse Glimmer):
- Field-level extraction accuracy (`customer`, `item`, `amount`, `entry_type`);
- Row-level extraction accuracy (target ≥80% at Day 3 gate; `A-05`);
- Total-match rate (`computed_total === written_total` after review);
- Discrepancy detection rate (planted arithmetic errors caught vs. false alarms);
- Inference latency (`latency_ms` / seconds per page on Kaggle 2x T4); and
- Share of uncertain rows properly flagged for human review (`needs_review`).

### 7.5 Role-oriented product surfaces

| Participant | Defined jobs and visibility |
|---|---|
| **Store Owner (`store_owner`)** | Capture/upload notebook photos, review flagged rows and math discrepancies, confirm entries into the ledger, track customer *utang* balances, and generate/share Taglish payment reminders. |
| **Customer (Debtor — off-system recipient)** | Does not log into Talaan. Receives owner-sent Taglish SMS/Messenger reminders containing itemized *utang* details. |
| **Cooperative / Barangay Hub Operator (Prospective / Roadmap)** | Hosts shared local Muse Glimmer GPU box for neighborhood stores (`S-01` §3, §6); no dedicated role surface in v1 MVP. |

### 7.6 Business model

Canonical home: [`bpd.md`](bpd.md) §4.

The brief (`S-01` §6, §7) outlines four **hypotheses to test** (Freemium store subscription at an assumed ₱99/month `A-02`, Cooperative/barangay hub license, Consented lender/fintech partnership, and Distributor/FMCG restock partnership). Because all pricing and willingness-to-pay figures are explicitly marked as unvalidated assumptions (`A-02`, `A-03`, `A-04`):
- No monetization tier is active in the hackathon build;
- Zero fees are charged and zero revenue exists; and
- Commercial terms remain **Open (`⬜`)** pending store owner interviews (`S-01` §11) and pilot validation.

---

## 8. Target Users and Participants

### 8.1 Primary End Users: Sari-Sari Store Owners
- ~1.1M to 1.3M+ neighborhood micro-retailers in the Philippines (`C-01`), predominantly one-person, family-run stores operating on ~10% markups (`C-04`).
- Currently 0 stores use Talaan in production; 3 to 5 store owner discovery interviews are scheduled during the Oct 29 – Nov 1 sprint (`S-01` §10, §11).

### 8.2 Prospective Ecosystem Targets (Not Partners)
- **Cooperatives, LGUs, and Barangay Associations:** Prospective hosts for shared local Muse Glimmer GPU boxes (`S-01` §3, §6).
- **Micro-Lenders and Fintechs:** Prospective consumers of owner-consented verified ledger summaries for credit access (`S-01` §6).
- **FMCG Distributors:** Prospective recipients of restock order drafts (`S-01` §6).

Naming these groups in the brief establishes product positioning only—no endorsement, pilot, or partnership exists ([`evidence.md`](evidence.md) §6).

---

## 9. Proposed Technology and Architecture

### 9.1 Technology stack stated in the brief

| Layer | Technology | Proposed role | Current repo status |
|---|---|---|---|
| Framework | **Next.js 16.4.3 (App Router) + TypeScript 5** | Unified mobile-first web UI and API Route Handlers | ✅ Installed (`package.json`) |
| UI & Styling | **React 19.3.0 + Tailwind CSS v4** | Component rendering and responsive styling tokens (`src/app/globals.css`) | ✅ Installed (`package.json`) |
| Database & Auth | **Supabase (Postgres + Auth + RLS + Private Storage)** | Store/customer/page/entry/reminder persistence, tenant isolation, and private notebook photo storage | ✅ Installed (`@supabase/supabase-js`, `supabase/migrations/`) |
| Main AI Model | **Meta Muse Glimmer 30B** (Q4_K_M GGUF ~16.8 GB + ~1.4 GB vision projector) | Multimodal handwriting extraction & Taglish tool calling via `llama.cpp` `llama-server --jinja` on Kaggle 2x T4 GPU | ⬜ Planned (`TAL-03`) |
| Auxiliary Backup AI Model | **Gemini API** (OpenAI-compatible endpoint) | Auxiliary developer backup during offline development only (`MODEL_PROVIDER=gemini`); 100% excluded from evals, gates, and final demo | ✅ Supported (`src/lib/model.ts`) |
| Model Client | **`openai` npm package (`src/lib/model.ts`)** | Single client abstraction switching between `glimmer` (canonical default) and `gemini` (dev backup) via env vars | ✅ Installed (`package.json`) |
| Schema Validation | **Zod (`src/lib/schemas.ts`)** | Fail-closed validation of all LLM outputs and API payloads before DB writes | ✅ Installed (`package.json`) |
| Image Prep | **`sharp` (`src/lib/image.ts`)** | Server-side resize, auto-rotate, contrast enhancement, and cropping | ✅ Installed (`package.json`) |
| Ledger Math | **TypeScript (`src/lib/ledger/`)** | Deterministic centavo-exact row and page arithmetic & discrepancy detection | ✅ Implemented & Tested (`TAL-04`) |
| Testing & Eval | **Vitest** + 30+ labeled notebook pages | Unit tests for `lib/ledger` and accuracy/latency evaluation harness for Muse Glimmer | ✅ Vitest installed; eval dataset ⬜ Planned (`TAL-03`, `TAL-07`) |

### 9.2 Security, privacy, and audit intent

- **Local open-weights privacy:** Muse Glimmer runs on self-hosted/Kaggle GPU instances rather than third-party commercial data-harvesting clouds (`S-01` §3).
- **Consented/synthetic data only:** Only synthetic or explicitly consented, redacted notebook pages are used in the repo, evaluation set, and demo (`S-01` §4, §8).
- **Private storage & RLS:** Notebook photos reside in a private Supabase Storage bucket accessed via signed URLs; all Postgres tables enforce Row-Level Security (`stores.owner_id = auth.uid()`).
- **Deterministic financial integrity:** All arithmetic happens in code (`src/lib/ledger`), and every row requires human confirmation (`confirmed_by_user = true`) before affecting balances.

---

## 10. Why Meta Muse Glimmer 30B, According to the Brief

The brief selects **Meta Muse Glimmer 30B** as the core AI engine for four reasons (`S-01` §3, §4):

1. **Multimodal image-to-text understanding:** Reads handwritten notebook pages, receipts, and lists directly from phone photos.
2. **Native tool calling & failure recovery (`--jinja`):** Drives structured extraction (`extract_rows`), unreadable-page recovery (`flag_unreadable`), and Taglish reminder generation (`draft_reminder`).
3. **Apache 2.0 open weights (~18.2 GB total 4-bit footprint):** Fits on 2x T4 GPUs (16 GB × 2 on Kaggle) or a local cooperative server with zero per-token cost and strict data locality (`C-07`).
4. **131K context window & multilingual pretraining:** Capable of holding multi-page monthly ledgers and processing English/Filipino/Taglish text (`C-07`).

These capabilities are subject to empirical verification in the **Day 3 Handwriting Gate** (10 real pages) and the **30+ Page Evaluation Plan** (`S-01` §8, §9).

---

## 11. Competitive Positioning

Reproduced from `S-01` §2, §3, §6 as product positioning (not an independently audited market study):

| Capability | Paper *Utang* Notebook | Traditional POS / Store Apps (e.g., Packworks) | **Talaan** |
|---|:---:|:---:|:---:|
| Zero counter habit change (keep writing on paper) | Yes | No (must type items in app) | **Yes (photo of notebook)** |
| Automatic arithmetic & discrepancy verification | No (manual calculator) | Yes (for typed entries) | **Yes (deterministic code check on written math)** |
| Running per-customer *utang* balances | Manual page flipping | Yes | **Yes** |
| Instant itemized Taglish payment reminder drafts | No | Limited / generic | **Yes (`Malumanay` / `Pormal` tones)** |
| Can run on local open-weights AI without cloud token fees | N/A | No | **Yes (Meta Muse Glimmer 30B)** |

---

## 12. Goal Alignment Named in the Brief

Talaan aligns with:
- **Meta Global AI Developer Hackathon — *Build for Your World* (Indie Developer Track):** Solving an everyday grassroots economic problem in the Philippines using Meta's open-weights Muse Glimmer model (`S-01` header, §10).
- **Financial Inclusion & Grassroots Digitalization (DTI MSME Digitalization Alignment):** Helping neighborhood sari-sari stores transition from error-prone paper notebooks to verifiable digital records that can support working-capital management and future credit access (`S-01` §2, `C-05`).

---

## 13. What Talaan Is Not

| Boundary | Source-backed reason |
|---|---|
| **Not a "simple image analyzer"** | Talaan executes a multi-stage verification workflow: vision extraction, deterministic code math checks, human review, database ledger persistence, and Taglish reminder drafting (`S-01` §3). |
| **Not an LLM calculator** | The model never computes totals or balances; all arithmetic runs deterministically in TypeScript (`src/lib/ledger`) and SQL (`S-01` §3, §4). |
| **Not an automated SMS/chat spammer** | Reminders are drafted only; the owner reviews and sends them manually via copy or native share (`S-01` §5, §8). |
| **Not a payment processor, e-wallet, POS hardware, or tax/BIR filing tool** | Explicitly out of scope (`S-01` §8). |
| **Not a voice/audio assistant** | Muse Glimmer does not support audio input; voice features are out of scope (`S-01` §3, §8). |
| **Not a credit-scoring, financial-advice, medical, legal, political, or job-screening system** | Explicitly excluded per hackathon anti-list and scope rules (`S-01` §8). |
| **Not evidenced as a live commercial deployment** | Currently in hackathon `Build` stage with zero live store customers (`S-01` §6–§8). |

---

## 14. Open Decisions and Living Questions

| # | Decision area | Current source posture | Why it must be resolved |
|---:|---|---|---|
| **Q1** | Agent execution pattern (Autonomous loop vs. Two-Phase Split) | Resolved via user decision: **Two-Phase Split** | Prevents 60s+ multi-turn T4 timeouts and guarantees human confirmation before DB writes |
| **Q2** | Ledger entry types & customer matching | Resolved via user decision: `credit \| payment \| cash_sale` + fuzzy customer match | Required so debt payments (*bayad*) subtract from *utang* balances accurately |
| **Q3** | Discrepancy check depth | Resolved via user decision: **Two-level check** (row `qty * unit_price` + page `computed_total vs written_total`) | Catches both line-item multiplication errors and page addition mistakes |
| **Q4** | Muse Glimmer Filipino/Taglish handwriting accuracy | **Open (`A-05`)** — Day 3 Gate on 10 real pages (target ≥80% row accuracy) | Determines whether MVP processes messy cursive/handwriting or narrows to printed receipts/typed lists |
| **Q5** | Kaggle 2x T4 inference latency & tunnel stability | **Open (`A-06`)** — Must benchmark `llama-server` via Cloudflare/ngrok tunnel | Determines whether deployed Vercel app can call Kaggle or if demo runs `next dev` locally against the tunnel |
| **Q6** | Hackathon rules on Gemini dev testing & $150 credits | **Open** — Verify in Official Rules (`S-01` §4, §11, §12) | Ensures strict compliance with Meta hackathon eligibility rules |
| **Q7** | Visual design system & token authority | Resolved via user decision (`impeccable`): **The Notebook, Kept** | Establishes token authority in `src/app/globals.css` and [`design.md`](design.md) |
| **Q8** | Commercial pricing & store owner willingness to pay | **Open (`A-02`, `A-03`, `A-04`)** — Pending 3–5 store owner interviews | Required before any post-hackathon commercial or SAM/SOM claim can be validated |

### 14.1 Resolution tracker

| # | Status | ADR / Reference | Decided on |
|---:|---|---|---|
| Q1 | **Decided** | `ADR-0001` (Two-Phase Split & Deterministic Ledger Math) | 2026-10-27 |
| Q2 | **Decided** | `ADR-0001` / [`data-model.md`](data-model.md) §3 | 2026-10-27 |
| Q3 | **Decided** | `ADR-0001` / [`modules/payments-ledger.md`](modules/payments-ledger.md) | 2026-10-27 |
| Q4 | **Open** | Pending Day 3 Gate (`TAL-03`) | — |
| Q5 | **Open** | `ADR-0002` (Dual Model Provider Switch) / Pending benchmark (`TAL-03`) | — |
| Q6 | **Open** | Pending organizer verification (`S-01` §11) | — |
| Q7 | **Decided** | [`design.md`](design.md) ("The Notebook, Kept") | 2026-10-27 |
| Q8 | **Open** | [`bpd.md`](bpd.md) §4 / Pending interviews | — |
