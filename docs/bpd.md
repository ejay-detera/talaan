# Business Product Document (BPD): Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [BRD](brd.md) · [PRD](prd.md) · [SAD](sad.md) · [SDD](sdd.md) · [DSD](dsd.md) · [Flow](flow.md) · [Build](build.md) · [Evidence](evidence.md) · [Glossary](glossary.md)

---

> **Source-of-truth rule.** [`foundation.md`](foundation.md) is the canonical foundation document. Resolve conflicts there first, then propagate.
>
> **Evidence standard for this document.** One element of the technical-commercial model is decided: **Talaan uses Apache 2.0 open-weights Meta Muse Glimmer 30B so inference can run locally or on a shared community GPU box with zero per-token API fees** (`S-01` §3, §6). Every pricing tier, B2B revenue stream, and market capture figure in `S-01` §6–§7 is explicitly an **unvalidated hypothesis or illustrative assumption** (`A-01` to `A-04`, `C-08`). Full rules: [`grounding.md`](grounding.md).

**Status legend:** defined in [`grounding.md`](grounding.md) §3. In this document ✅ means decided or built, ⬜ means open.

---

## 1. What We Are Selling

### 1.1 Product definition

**Talaan** is a mobile-first web application and AI bookkeeping agent for **Filipino sari-sari store owners** that converts phone photos of handwritten *utang* (credit) notebooks, supplier receipts, and lists into an arithmetic-checked digital ledger, updated customer balances, and ready-to-share Taglish payment reminders.

### 1.2 Value proposition

> Talaan turns a photo of a handwritten *utang* notebook into a clean, checked ledger, using Meta's open-weights Muse Glimmer model running locally, so store owners keep their notebook habit and still get real records. (`S-01` §1)

### 1.3 What is differentiated in Talaan's design

| Differentiator | Why it matters for neighborhood stores |
|---|---|
| **1. Zero Counter Habit Change** | Existing store apps ask busy one-person operators to stop writing on paper and type every item into a phone. Talaan keeps the physical notebook as the primary input instrument (`S-01` §2, `A-01`). |
| **2. Deterministic Two-Level Discrepancy Engine** | LLMs hallucinate math and store owners make addition errors under counter pressure. Talaan extracts the rows with AI, then runs centavo-exact multiplication and addition checks in TypeScript (`src/lib/ledger`) before a human confirms (`S-01` §3, §5). |
| **3. Open-Weights Local Privacy & Zero Token Cost** | Because sari-sari stores run on ~10% margins (`C-04`) and record sensitive neighborhood debts, running **Meta Muse Glimmer 30B (Apache 2.0)** locally or on a cooperative box avoids recurring per-token cloud AI costs and third-party data harvesting (`S-01` §3, §6). |
| **4. Culturally Calibrated Taglish Action** | Generates itemized *Malumanay* (Friendly) or *Pormal* (Firm) Taglish payment reminders that the owner copies or shares manually via SMS/Messenger (`S-01` §5). |

**This is a verification-first bookkeeping product.** Trustworthy records without habit change is the value being built.

### 1.4 What it is not

Talaan is not a payment processor, e-wallet, POS cash register, automated SMS spammer, credit-scoring engine, or BIR tax-filing system (`S-01` §8).

---

## 2. Commercial Readiness — State This First

### 2.1 Hard boundaries

| Boundary | Detail |
|---|---|
| **Stage** | **Hackathon Build Stage** (Meta Global AI Developer Hackathon, Oct 26 – Nov 4, 2026). Currently a Next.js 16.4.3 scaffold (`S-10`) with product features in active sprint backlog (`TAL-01` to `TAL-08`). |
| **Model Runtime** | ⬜ **Meta Muse Glimmer 30B** is the canonical primary engine hosted on Kaggle 2x T4 GPU sessions via authenticated tunnel (`A-06`), with **Gemini API** used strictly as an auxiliary offline developer backup. |
| **Handwriting Gate** | ⬜ **Unverified (`A-05`).** Filipino/Taglish handwriting accuracy on Muse Glimmer must pass the Day 3 Gate (≥80% row accuracy on 10 real pages). |
| **Hosting** | 🟡 Local `next dev` and planned Vercel preview. No production SLA, automated backup, or 24/7 GPU hosting exists ([`ops.md`](ops.md) §1). |
| **Customers** | ❌ **Zero.** No sari-sari store, cooperative, LGU, lender, or distributor has deployed, piloted, or endorsed Talaan. |
| **Revenue** | ❌ **Zero.** No subscription or license fee has been charged. |

**State this first with any external audience.** Leading with honesty about the hackathon prototype boundary strengthens credibility during judging.

---

## 3. Market and Customers

### 3.1 Market sizing — **Illustrative Only (`Not validated`, `C-08`)**

The project brief (`S-01` §7) presents an **illustrative TAM / SAM / SOM calculation** to show potential scale, while explicitly stating: *"All numbers below are illustrative and rely on assumptions. Replace them with validated figures."*

| Level | Brief definition (`S-01` §7) | Illustrative stores | Illustrative annual revenue (at assumed ₱1,188/yr `A-02`) | Validation status |
|---|---|---|---|---|
| **TAM** | All Philippine sari-sari stores (`C-01`: 1.1M–1.3M+ range) | ~1.3M | ~₱1.54B | **Not validated** (`C-08`, `A-02`) |
| **SAM** | Stores not on a digital system (~77% `C-03`) × assumed 50% smartphone & photo-workflow willingness (`A-03`) | ~500K | ~₱594M | **Not validated** (`C-08`, `A-02`, `A-03`) |
| **SOM** | Assumed 1% of SAM in Year 1 (`A-04`) | ~5K | ~₱5.9M | **Not validated** (`C-08`, `A-02`–`A-04`) |

A defensible post-hackathon market sizing exercise requires:
1. Primary survey/interview data on store owner willingness to photograph *utang* notebooks vs. typing (`A-01`, `A-03`).
2. Empirical willingness-to-pay testing across price points vs. ~10% store margins (`A-02`).
3. Hardware/electricity cost telemetry for cooperative GPU hub deployments.
4. Partner willingness-to-pay from micro-lenders or FMCG distributors.

### 3.2 The problem being addressed

Detailed in [`brd.md`](brd.md) §2: ~1.1M to 1.3M+ sari-sari stores operate on paper notebooks with thin ~10% margins, suffering from arithmetic errors, uncollected *utang*, and lack of verifiable income records because existing software requires counter habit change.

### 3.3 Customer segments (Hypotheses from `S-01` §6)

| Segment | Role in the model | Motivation | Status |
|---|---|---|---|
| **Sari-Sari Store Owners** | End user / Freemium subscriber hypothesis | Catch addition errors, track who owes what, and send polite Taglish reminders without typing every item | ⬜ None engaged (3–5 discovery interviews planned in Sprint 2) |
| **Cooperatives / Barangay Hubs / LGUs** | Prospective B2B license buyer / local GPU host | Provide neighborhood member stores with private, zero-token-cost digital bookkeeping on a shared local GPU box | ⬜ None engaged |
| **Micro-Lenders / Fintechs** | Prospective B2B partner | Access owner-consented verified ledger summaries to underwrite micro-working-capital loans | ⬜ None engaged |
| **FMCG Distributors** | Prospective B2B partner | Receive aggregated restock lists and order drafts from neighborhood stores | ⬜ None engaged |

### 3.4 Buyer and judge questions we must answer honestly

| Question | Current honest answer |
|---|---|
| "Does Muse Glimmer accurately read messy Filipino cursive and Taglish?" | **Unverified today (`A-05`).** We are running a Day 3 Gate on 10 real pages and a 30+ page evaluation (`TAL-03`, `TAL-07`) and will report exact measured accuracy. |
| "Will a store owner making 10% margins pay ₱99/month?" | **Unknown (`A-02`).** ₱99/mo is an unvalidated assumption. We are interviewing 3–5 store owners this week, and B2B cooperative/lender/distributor models may be more viable than charging owners directly. |
| "What happens if the AI misreads a peso amount?" | **Deterministic code + human confirmation.** `src/lib/ledger` checks row multiplication and page totals against the written total, flags discrepancies in red, and blocks saving until the owner confirms. |
| "Where does the customer debt data go?" | In the target architecture, **Muse Glimmer 30B** runs on open weights locally (or on a cooperative box / private Kaggle instance) and photos sit in a private RLS-protected bucket—never sold to third parties. |

---

## 4. Business Model

> **Canonical home of the business model.** [`foundation.md`](foundation.md) §7.6, [`brd.md`](brd.md) §8, and [`prd.md`](prd.md) §7 link here.

### 4.1 What is decided ✅

1. **Zero-fee hackathon MVP:** The hackathon build is completely free to use in demo/test mode.
2. **Open-weights local inference architecture:** By building on **Meta Muse Glimmer 30B (Apache 2.0)** (`C-07`), the system avoids mandatory per-token commercial LLM API fees, making low-cost cooperative or local deployment structurally possible.

### 4.2 Candidate monetization hypotheses — Open ⬜ (`S-01` §6)

None of the four models below has been validated with paying customers:

| # | Hypothesis (`S-01` §6) | Who pays | Open questions that must be resolved |
|---:|---|---|---|
| 1 | **Freemium Store Subscription** | Store Owner | Free for a limited number of pages/month; paid tier (illustrative assumption: ~₱99/mo `A-02`) for unlimited pages, reminders, and weekly summaries. Must test whether owners pay for any store software (`S-01` §11 Q4). |
| 2 | **Cooperative / Barangay Hub License** | Cooperative, LGU, or Store Association | Self-hosted Muse Glimmer on a shared local GPU box (~2x T4 / consumer GPU class). Requires hardware sizing, local IT maintenance model, and cooperative procurement terms. |
| 3 | **Lender / Fintech Partnership** | Micro-lenders / Fintechs | Owner-consented sharing of verified ledger summaries as proof of cash flow. Requires strict privacy/consent UX, legal review under the PH Data Privacy Act, and lender underwriting criteria. |
| 4 | **Distributor / FMCG Restock Partnership** | Wholesale Distributors | Commission or sponsored restock order drafting from store sales velocity (`restock_list`). Requires distributor catalog integration and fulfillment workflow. |

### 4.3 Unit economics — unknown

No production cost per page has been measured. Determining unit economics requires measuring:
- GPU inference seconds per page on 2x T4 (`TAL-07`) and equivalent local/cloud GPU amortized hourly cost;
- Supabase Storage bytes per `sharp`-compressed notebook photo and Postgres row growth per store/month; and
- Human review time per page for the store owner.

---

## 5. Product Offering by Role

What the repository delivers today vs. what the hackathon MVP (`TAL-01` to `TAL-06`) will deliver. Detail in [PRD](prd.md).

### 5.1 Store Owner (`store_owner`) ⬜ (Planned MVP)

- **Today in code:** Default Next.js 16.4.3 starter page (`src/app/page.tsx`).
- **Planned MVP offering (`TAL-01` to `TAL-06`):**
  1. 1-tap Demo Store login + standard Email/Password auth.
  2. Mobile photo upload of handwritten *utang* pages, receipts, or lists.
  3. Structured extraction (`credit`, `payment`, `cash_sale`) with confidence scores and model provenance badge.
  4. Review & Discrepancy screen featuring the **Red Margin Gutter** and **Two-Ply Proof Bar** (`Written Total` vs. `Computed Total`) plus 1-tap customer matching.
  5. Per-customer *utang* balance tracker and transaction history.
  6. Tone-selectable Taglish payment reminder generator (`Malumanay` / `Pormal`) with 1-tap Copy and native SMS/Messenger share.
  7. Unreadable page retake guidance.

### 5.2 Not yet part of the v1 MVP offering (Stretch / Roadmap)

| Capability | Status | Commercial consequence |
|---|---|---|
| Supplier receipt to restock list (`S1`) | ⬜ Stretch | Needed before testing Distributor/FMCG business model hypothesis |
| Weekly summary & estimated profit (`S2`) | ⬜ Stretch | Needed for paid Freemium tier and Lender proof-of-income hypothesis |
| Multi-page month view (`S3`) | ⬜ Stretch | Needed for monthly bookkeeping audits |
| CSV / printable ledger export (`S5`) | ⬜ Stretch | Needed for offline cooperative/lender submission |

---

## 6. Go-To-Market — Sequence, Not Forecast

### Stage 0 — Hackathon Build & Technical Gate (Oct 27 – Nov 4, 2026 — Current)

Build the core Next.js + Supabase + Muse Glimmer pipeline (`TAL-01` to `TAL-08`), run the **Day 3 Handwriting Gate** on 10 real pages (`A-05`), conduct **3 to 5 store owner discovery interviews** (`S-01` §11), run the **30+ page evaluation harness** on Muse Glimmer (`TAL-07`), and submit the public repo and recorded demo.

**Exit criteria:** Passing Day 3 Gate (≥80% row accuracy on Glimmer or scope adjustment), completed 30+ page evaluation report, 3–5 owner interviews documented, and working end-to-end demo.

### Stage 1 — Local Store Field Trial (Post-Hackathon)

One to three consenting neighborhood sari-sari stores using Talaan alongside their physical notebooks for 2–4 weeks. **Purpose is measurement, not revenue.** Baselines to capture: real handwriting error rates, owner review time per page, reminder usage rate, and whether owners prefer photographing notebooks over typing (`A-01`).

### Stage 2 — Cooperative / Barangay Hub Pilot

Test a persistent self-hosted Muse Glimmer GPU box (replacing temporary Kaggle sessions) serving a local store association or cooperative, measuring hardware cost per active store and privacy/consent workflows.

---

## 7. Prospective Ecosystem

Every entity below is a **prospective target** ([`evidence.md`](evidence.md) §6). Zero agreements or conversations of record exist.

| Category | Prospective entities | Why they would matter |
|---|---|---|
| **Neighborhood Micro-Retailers** | Independent sari-sari store owners | Primary end users and validators of the notebook-to-ledger workflow |
| **Community Organizations** | Barangay associations, credit cooperatives, DTI Negosyo Centers | Potential distribution and shared local GPU hosting hubs (`S-01` §2, §6) |
| **Micro-Finance & Fintech** | Micro-lenders serving MSMEs | Potential underwriters using owner-consented verified ledgers (`S-01` §6) |
| **Wholesale Supply Chain** | Local palengke wholesalers, FMCG distributors | Potential restock fulfillment targets (`S-01` §6) |

---

## 8. Compliance and Commercial Risk

### 8.1 Compliance posture — intent, not attestation

Canonical table: [`brd.md`](brd.md) §10.1. Security review status: [`security.md`](security.md) §9.

### 8.2 Commercial risk register

| Risk | Impact | Status |
|---|---|---|
| **Store owners prefer paper alone or existing free calculators over taking photos (`A-01`)** | High | ⬜ Validate via 3–5 behavioral interviews during Oct 29 – Nov 1 (`S-01` §11) |
| **Thin ~10% store margins preclude direct owner subscriptions (`A-02`)** | High | ⬜ Keep B2B cooperative/lender/distributor models as primary commercial fallback (`S-01` §6) |
| **Data Privacy Act (RA 10173) requirements for customer debt lists and lender sharing** | High | ⬜ No legal review performed; hackathon uses consented/redacted or synthetic pages only |
| **Hardware cost of dedicated 2x T4 / 24GB VRAM GPU for Muse Glimmer 30B** | Medium | ⬜ Requires shared cooperative hub model or smaller quantized model evaluation post-hackathon |

---

## 9. Social Impact

### 9.1 What the product is designed to do for people

Talaan is designed to help one-person, family-run sari-sari stores protect their thin ~10% margins from arithmetic mistakes and forgotten *utang*, reduce social friction when reminding neighbors about unpaid balances, and build clean financial records without giving up their familiar paper notebook. Because zero real stores have deployed Talaan yet, these are **intended design outcomes**, not measured social impact.

### 9.2 Goal alignment

Canonical text: [`foundation.md`](foundation.md) §12.

---

## 10. What a Defensible Business Plan Still Needs

1. **Empirical Muse Glimmer evaluation (`TAL-03`, `TAL-07`)** proving accuracy and latency on 30+ Filipino/Taglish notebook pages.
2. **Store owner behavioral interviews (3–5 owners, `S-01` §11)** testing `A-01` (photo workflow preference) and `A-02` (willingness to pay).
3. **Persistent GPU hosting cost model** beyond temporary Kaggle notebooks.
4. **Legal and privacy review** under the Philippine Data Privacy Act (RA 10173) before storing unredacted customer debt records or sharing summaries with lenders.
5. **One multi-week store field pilot** with measured baseline and retention telemetry.

---

## Self-Check

- [x] Illustrative TAM/SAM/SOM figures explicitly labeled `Not validated` with underlying assumptions (`A-02` to `A-04`) cited
- [x] Named organizations described as prospective targets, not partners
- [x] Commercial readiness (zero customers, zero revenue, hackathon build stage) stated up front
- [x] Unit economics stated as unknown until `TAL-07` latency and pilot telemetry exist
- [x] GTM expressed as a dependency sequence with exit criteria
