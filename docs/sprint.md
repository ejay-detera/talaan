# Sprint Backlog: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [BRD](brd.md) · [PRD](prd.md) · [Flow](flow.md) · [Test plan](test-plan.md) · [Glossary](glossary.md)

---

> **Source-of-truth rule.** This document is the reference for all sprint work across the 9-day Meta Global AI Developer Hackathon calendar (`2026-10-27` to `2026-11-04`, `S-01` §11).
>
> **Status rule.** A story is **Done (`✅`)** only when every acceptance criterion in its block is satisfied and its tests pass per [`test-plan.md`](test-plan.md). Update the story block and [`flow.md`](flow.md) in the same change as the code. Evidence rules: [`grounding.md`](grounding.md).

**Status legend (work items):** ⬜ To Do · 🔄 In Progress · 🟡 Partial · ⛔ Blocked · ✅ Done.

---

## §1. How to Use This Document

- **Planning:** Before starting a story, read its acceptance criteria block and check [`flow.md`](flow.md) for current status.
- **Execution (`tdd` + `ponytail` + `impeccable`):** Write failing Vitest tests first for non-trivial logic, implement the smallest complete working change, and update checkboxes as they are verified.
- **Review:** Close a story only when all criteria are met, validation commands pass (`npm run lint`, `npx tsc --noEmit`, `npm test`), and [`flow.md`](flow.md) is updated.
- **Scope changes:** Record any addition, removal, or re-prioritization in §8 Change Log.

---

## §2. Backlog Conventions

| Field | Meaning |
|---|---|
| **ID** | Unique story identifier: `TAL-NN` |
| **Priority** | `P1` = Must ship (MVP & Evaluation) · `P2` = Should ship · `P3` = Stretch (only after MVP + Gate pass) |
| **Points** | Fibonacci estimate (`1`, `2`, `3`, `5`, `8`) |
| **Status** | Current work-item state (`⬜ To Do`, `🔄 In Progress`, `🟡 Partial`, `⛔ Blocked`, `✅ Done`) |
| **Developer** | `Dev Ejay` |
| **Traces** | Business requirement (`BR-NN`), product story (`US-NN`), and test IDs (`T-NNN` in [`test-plan.md`](test-plan.md) §3) |

---

## §3. Sprint Stories

---

### TAL-01 — Supabase Schema, RLS, Private Storage & 1-Tap Demo Auth

| Field | Value |
|---|---|
| Priority | P1 |
| Points | 3 |
| Status | ✅ Done |
| Developer | Dev Ejay |
| Traces | BR-01 · US-01 · tests T-001 |

> **As a Store Owner**, I want to sign in via Email/Password or a 1-Tap Demo Store button on `/login` with my store's `stores`, `customers`, `pages`, `entries`, and `reminders` data isolated by Postgres RLS and private Storage.

**Acceptance criteria:**
- [x] Install `@supabase/supabase-js` and `@supabase/ssr`; record pinned version in [`evidence.md`](evidence.md) §5.
- [x] Create `supabase/migrations/0001_initial_schema.sql` defining `stores`, `customers`, `pages`, `entries`, and `reminders` with `numeric(10,2)` money columns, FK indexes, `CHECK` constraints, and RLS policies (`stores.owner_id = (select auth.uid())`) per [`data-model.md`](data-model.md).
- [x] Configure private storage bucket `notebook-pages` and seed script for **"Aling Nena's Sari-Sari Store"** (`supabase/seed.sql`).
- [x] Build `/login` screen with Email/Password sign-in and 1-tap **"Subukan ang Demo Store"** button (`src/app/login/page.tsx`, `src/app/api/auth/demo/route.ts`).

---

### TAL-02 — Dual Model Client (`lib/model.ts`), `sharp` Image Prep & Prepare Extraction API (`API-01`)

| Field | Value |
|---|---|
| Priority | P1 |
| Points | 5 |
| Status | ✅ Done |
| Developer | Dev Ejay |
| Traces | BR-01, BR-02 · US-01, US-02, US-07 · tests T-001, T-002 |

> **As a Store Owner**, I want my uploaded notebook photo pre-processed with `sharp` and extracted into structured candidate rows (`credit`, `payment`, `cash_sale`, `confidence`) or flagged as unreadable (`flag_unreadable`) through `POST /api/pages/extract`.

**Acceptance criteria:**
- [x] Install `openai`, `zod`, and `sharp`; record pinned versions in [`evidence.md`](evidence.md) §5.
- [x] Implement `src/lib/model.ts` switching between `glimmer` (default) and `gemini` (local dev testing only) via `MODEL_PROVIDER` (`S-01` §4).
- [x] Implement `src/lib/schemas.ts` (`PageExtractionSchema`, `RetakeRequestSchema`) and `src/lib/image.ts` (`sharp` auto-orient, resize, contrast).
- [x] Implement `POST /api/pages/extract` (`API-01`): handles image upload, `sharp` prep, calls `extract_rows` / `flag_unreadable`, logs `model` and `latency_ms`, and returns candidate rows with deterministic math (`confirmed_by_user = false`, `status = 'needs_review'` / `'retake_requested'`). Storage/DB commit hooks into `TAL-01`.

---

### TAL-03 — Kaggle 2x T4 `llama-server` Setup, Tunnel & Day 3 Handwriting Gate (10 Pages)

| Field | Value |
|---|---|
| Priority | P1 |
| Points | 5 |
| Status | ⬜ To Do |
| Developer | Dev Ejay |
| Traces | BR-02, BR-07 · US-02 · tests T-008 |

> **As a Developer**, I want **Meta Muse Glimmer 30B** (`Q4_K_M` GGUF + projector) running on Kaggle 2x T4 via `llama-server --jinja --api-key` over an authenticated tunnel and tested on 10 real notebook pages to verify the ≥80% row-level accuracy gate (`A-05`).

**Acceptance criteria:**
- [ ] Script Kaggle 2x T4 setup (`llama.cpp` CUDA arch 75 build + Muse Glimmer 30B Q4_K_M GGUF + vision projector) and cache as a private Kaggle Dataset (`S-01` §4, §8).
- [ ] Verify Cloudflare/ngrok tunnel connectivity (`GLIMMER_BASE_URL` + `GLIMMER_API_KEY`) from Next.js (`A-06`).
- [ ] Assemble 10 consented/redacted or synthetic test pages (`eval/gate-10/`) and run extraction on `MODEL_PROVIDER=glimmer`.
- [ ] Measure row-level accuracy and latency; if ≥80%, lock full handwriting scope; if <80%, trigger `S-01` §8 fallback decision.

---

### TAL-04 — Deterministic Two-Level Discrepancy Engine & Customer Matching (`src/lib/ledger/`)

| Field | Value |
|---|---|
| Priority | P1 |
| Points | 3 |
| Status | ✅ Done |
| Developer | Dev Ejay |
| Traces | BR-03 · US-03 · tests T-003, T-004, T-006 |

> **As a Store Owner**, I want every row multiplication (`quantity * unit_price === amount`) and page total (`computed_total === written_total`) checked deterministically in integer centavos so arithmetic mistakes are caught with 100% precision.

**Acceptance criteria:**
- [x] Install `vitest` and record pinned version in [`evidence.md`](evidence.md) §5.
- [x] Write failing unit/property tests (`T-003`, `T-004`, `T-006`) in `src/lib/ledger/__tests__/math.test.ts` and `src/lib/ledger/__tests__/match.test.ts` covering floating-point edge cases (`0.1 + 0.2`, `3 * 12.10`), row multiplication mismatches, page total discrepancies, `confidence < 0.80` flags, and `credit` / `payment` / `cash_sale` balance math.
- [x] Implement `src/lib/ledger/math.ts` and `src/lib/ledger/match.ts` (case-insensitive / fuzzy customer name auto-matching) to pass all tests.

---

### TAL-05 — Review & Discrepancy UI (`RedMarginGutter` + `TwoPlyProofBar`) & Confirm API (`API-02`)

| Field | Value |
|---|---|
| Priority | P1 |
| Points | 5 |
| Status | ⬜ To Do |
| Developer | Dev Ejay |
| Traces | BR-04 · US-04 · tests T-005 |

> **As a Store Owner**, I want to review extracted rows with the **Red Margin Gutter** and **Two-Ply Proof Bar**, edit any misread amount, link/create customers in 1 tap, and confirm the page into the ledger (`POST /api/pages/[id]/confirm`).

**Acceptance criteria:**
- [ ] Apply [`dsd.md`](dsd.md) High-Contrast Daylight tokens (`#FAF8F4`, `#1E293B`, `#0F6E56`, `#E11D48`, `Geist Mono` `tabular-nums`) in `src/app/globals.css`.
- [ ] Build Upload Dashboard (`src/app/page.tsx`) showing active **Model Provenance Badge** (`Muse Glimmer 30B` vs. `Gemini Dev`) and recent pages.
- [ ] Build `/pages/[id]/review` with cropped notebook strip, `RedMarginGutter` (`✓`, `▲ Needs Review`, `✕ Math Mismatch`), inline row editor, 1-tap customer match/create dropdown, and sticky `TwoPlyProofBar` (`Written Total` vs. `Computed Total`).
- [ ] Implement `POST /api/pages/[id]/confirm` (`API-02`) with idempotency guard (`409 ALREADY_CONFIRMED`), centavo re-verification, and atomic commit (`confirmed_by_user = true`, `pages.status = 'confirmed'`).

---

### TAL-06 — Customer Balances Screen (`API-03`) & Taglish Reminder Generator (`API-04`)

| Field | Value |
|---|---|
| Priority | P1 |
| Points | 5 |
| Status | ⬜ To Do |
| Developer | Dev Ejay |
| Traces | BR-05, BR-06 · US-05, US-06 · tests T-006, T-007 |

> **As a Store Owner**, I want to view each customer's running *utang* balance (`sum(credit) - sum(payment)`) and generate a `Malumanay` or `Pormal` Taglish payment reminder to copy or share via SMS/Messenger.

**Acceptance criteria:**
- [ ] Implement `GET /api/customers` and `GET /api/customers/[id]/balance` (`API-03`) returning deterministic balances from confirmed entries only.
- [ ] Implement `POST /api/reminders/draft` (`API-04`) invoking `draft_reminder(customer, tone)` via `src/lib/model.ts` and saving the draft to `reminders`.
- [ ] Build `/customers` list and `/customers/[id]` detail screen with `ReminderDrawer` (`Malumanay / Friendly` vs. `Pormal / Firm` tone selector, editable text box, 1-tap **Copy Message**, and **Share via SMS / Messenger** via `navigator.share` / `sms:?body=`).
- [ ] Switch development environment strictly to `MODEL_PROVIDER=glimmer` by Oct 31 (`S-01` §11) and verify all tool calls on Muse Glimmer.

---

### TAL-07 — 30+ Page Muse Glimmer Evaluation Harness & Owner Interviews

| Field | Value |
|---|---|
| Priority | P1 |
| Points | 5 |
| Status | ⬜ To Do |
| Developer | Dev Ejay |
| Traces | BR-07 · US-02, US-03 · tests T-008 |

> **As a Developer**, I want to evaluate **Muse Glimmer 30B** across 30+ labeled pages (with planted arithmetic errors) and document 3–5 store owner discovery interviews to substantiate Technical Depth (20%) and Impact (30%).

**Acceptance criteria:**
- [ ] Assemble 30+ consented/redacted or synthetic labeled notebook pages (`eval/pages-30/`) covering diverse handwriting, lighting, Taglish items, and planted arithmetic errors (`S-01` §9).
- [ ] Build `scripts/eval-glimmer.ts` filtering strictly for `model = 'muse-glimmer'` and reporting: field-level accuracy, row-level accuracy, total-match rate, discrepancy detection rate, review flag rate, and seconds per page on 2x T4.
- [ ] Conduct 3 to 5 store owner interviews using the 5 behavioral questions in `S-01` §11 and record findings in [`evidence.md`](evidence.md).

---

### TAL-08 — UI Craft Audit (`impeccable`), README & Demo Video Recording

| Field | Value |
|---|---|
| Priority | P1 |
| Points | 3 |
| Status | ⬜ To Do |
| Developer | Dev Ejay |
| Traces | BR-01..07 · US-01..07 · Manual Checklist (§6 of `test-plan.md`) |

> **As a Submitter**, I want the UI audited by `impeccable.cmd detect`, a complete public `README.md` with a "Built during the hackathon" section and evaluation table, and a recorded demo video showing a messy notebook page with a planted addition error turning into a verified ledger on Muse Glimmer.

**Acceptance criteria:**
- [ ] Run `C:\Users\Detera\.agents\skills\impeccable\scripts\impeccable.cmd detect --json` over all built routes and fix any findings.
- [ ] Update root `README.md` with architecture diagram, setup instructions, "Built during the hackathon" section, and measured Muse Glimmer evaluation metrics (`S-01` §4, §11).
- [ ] Record final demo video (plus backup take) running against Muse Glimmer on Nov 3 (`S-01` §11).

---

## §4. Hackathon Sprint Schedule (`S-01` §11)

| Sprint | Dates | Goal | Status |
|---|---|---|---|
| **Sprint 1** | **Oct 27 – Oct 28, 2026** | Scaffold DB/Auth (`TAL-01`), Extraction API (`TAL-02`), Kaggle Glimmer setup & Day 3 Gate (`TAL-03`) | 🔄 Active (Docs locked Oct 27) |
| **Sprint 2** | **Oct 29 – Nov 1, 2026** | Deterministic Ledger (`TAL-04`), Review/Confirm UI (`TAL-05`), Balances & Taglish Reminders (`TAL-06`), Full Glimmer switch by Oct 31, Owner Interviews | ⬜ Planned |
| **Sprint 3** | **Nov 2 – Nov 4, 2026** | Feature Freeze & 30+ Page Glimmer Eval (`TAL-07`, Nov 2), Demo Video Recording (`TAL-08`, Nov 3), Final Polish & Submission (Nov 4) | ⬜ Planned |

---

## §5. Velocity and Metrics

| Sprint | Planned stories | Planned points | Completed points | Status |
|---|---|---|---|---|
| Sprint 1 (Oct 27–28) | `TAL-01`, `TAL-02`, `TAL-03` | 13 | 0 | 🔄 In Progress |
| Sprint 2 (Oct 29–Nov 1) | `TAL-04`, `TAL-05`, `TAL-06` | 13 | 0 | ⬜ Not started |
| Sprint 3 (Nov 2–Nov 4) | `TAL-07`, `TAL-08` | 8 | 0 | ⬜ Not started |

---

## §6. Roles and Capabilities Assumed by the Backlog

| Role | In backlog | In code (`2026-10-27`) | Notes |
|---|---|---|---|
| `store_owner` | Yes (`TAL-01`–`TAL-06`) | ⬜ Planned | Scoped via `stores.owner_id = auth.uid()` |
| `anon` | Yes (`TAL-01`) | ⬜ Planned | `/login` with 1-Tap Demo Store entry |

---

## §7. Out of Scope for Current Backlog

- Voice/audio input (`S-01` §3, §8).
- Automated SMS/Messenger sending (`S-01` §5, §8).
- Payment processing, e-wallets, POS hardware, and BIR tax filing (`S-01` §8).
- Stretch items (`S1`–`S5`: Restock list, Weekly summary, Multi-page month view, Shelf count, CSV export) until `TAL-01` through `TAL-07` are complete (`S-01` §5, §8).

---

## §8. Change Log

| Date | Change | Reason | Stories affected |
|---|---|---|---|
| 2026-10-27 | Created 3-sprint hackathon backlog (`TAL-01` to `TAL-08`) from Project Brief v1 (`S-01`) and locked `/grill-me` decisions. | Initial project planning | `TAL-01`–`TAL-08` |

---

## §9. Backlog Integrity Rules

1. **Status comes from `flow.md`, not from this document.**
2. **A story is Done (`✅`) only when all acceptance criteria and tests in `test-plan.md` are met.**
3. **Scope changes must be logged in §8.**
4. **Acceptance criteria are not weakened to fit a broken implementation.**
5. **The backlog is not evidence of capability.** Check [`flow.md`](flow.md).
