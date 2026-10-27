# Test Plan: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [PRD](prd.md) · [BRD](brd.md) · [Sprint](sprint.md) · [Build](build.md) · [Security](security.md) · [Grounding](grounding.md)

---

> **Evidence rule.** A test is "Passing" only with a command, a last-run date, and an actual result. A requirement with no test is ⬜ or 🟡 in [`flow.md`](flow.md), never ✅.
>
> **No invented coverage or accuracy numbers.** Coverage baselines and Muse Glimmer evaluation metrics stay `Not measured` until executed in `TAL-03`, `TAL-04`, and `TAL-07`.

---

## 1. Test Levels

| Level | Purpose | Tool | Command | In CI |
|---|---|---|---|---|
| **Static (lint, types)** | Catch syntax, lint, and strict TypeScript defects | ESLint 9, TypeScript 5 (✅ Installed) | `npm run lint`, `npx tsc --noEmit` | N |
| **Unit & Property (`tdd`)** | Test integer-centavo math, row/page discrepancy detection, customer balance calculation, and fuzzy customer matching in isolation | **Vitest 5.0.5** (✅ Installed in `TAL-04`) | `npm test` | N |
| **Contract / Schema** | Verify Zod schemas (`PageExtractionSchema`, `ConfirmPageSchema`, `ReminderDraftSchema`) reject malformed/injected LLM outputs and invalid amounts | **Vitest + Zod** (⬜ Planned in `TAL-02`, `TAL-04`) | `npm test` | N |
| **Integration** | Verify Next.js Route Handlers (`/api/pages/extract`, `/api/pages/[id]/confirm`, `/api/customers`, `/api/reminders/draft`) and Supabase RLS / idempotency | **Vitest** (⬜ Planned in `TAL-05`, `TAL-06`) | `npm test` | N |
| **AI Evaluation Harness** | Measure Muse Glimmer 30B accuracy (field, row, total-match, discrepancy detection) and 2x T4 latency on 10-page Day 3 Gate and 30+ labeled pages (`S-01` §8, §9) | Custom TS script (`scripts/eval-glimmer.ts` — ⬜ `TAL-03`, `TAL-07`) | `npm run eval` | N |
| **Accessibility & UI Craft** | Verify 44×44px touch targets, status icon+label pairing, Daylight contrast, and Impeccable mechanical detector | Manual + `impeccable.cmd detect --json` (⬜ `TAL-08`) | `impeccable.cmd detect --json src/app` | N |

Runners excluded by decision: Jest, Mocha, Cypress (use **Vitest** per `S-01` §4; adding another runner requires an ADR).

---

## 2. Environments and Data

Tests and evaluation runs never use unredacted real personal data (`S-01` §4, §8). The 10-page Day 3 Gate (`eval/gate-10/`) and 30+ page evaluation dataset (`eval/pages-30/`) use only consented/redacted or synthetic notebook pages containing diverse handwriting, pens, lighting, Taglish items, and planted arithmetic errors (`S-01` §9).

---

## 3. Traceability Matrix

Every business requirement (`BR-NN`), user story (`US-NN`), and sprint story (`TAL-NN`) traces to a planned test ID:

| Requirement (BR / US / Story) | Acceptance criterion / Invariant | Test ID | Level | Status | Last run | Command |
|---|---|---|---|---|---|---|
| **Scaffold Health** | Clean ESLint and strict TypeScript check on scaffold | **T-000** | Static | **Passing** | 2026-10-27 | `npm run lint && npx tsc --noEmit` |
| **BR-01 / US-01 / TAL-01, TAL-02** | Auth guard + RLS tenant isolation (`T-01`) + `sharp` image resize/orientation prep | **T-001** | Static / Unit | **Passing** | 2026-10-27 | `npm run lint && npx tsc --noEmit && npm test` |
| **BR-02 / US-02, US-07 / TAL-02** | `PageExtractionSchema` (Zod) validates `credit`/`payment`/`cash_sale` rows, rejects malformed/injected JSON (`T-03`), and handles `flag_unreadable` retake state | **T-002** | Contract / Unit | **Passing** | 2026-10-27 | `npm test` |
| **BR-03 / US-03 / TAL-04** | Integer-centavo conversion and row-level discrepancy check (`quantity * unit_price !== amount`) with zero floating-point drift (`T-02`) | **T-003** | Unit / Property | **Passing** | 2026-10-27 | `npm test` |
| **BR-03 / US-03 / TAL-04, TAL-05** | Page-level discrepancy check (`computed_total !== written_total`), synthetic proof dataset (`sample-proof.test.ts`), and `needs_review` flagging (`confidence < 0.80` or math mismatch) (`T-02`) | **T-004** | Unit / Property | **Passing** | 2026-10-27 | `npm test` |
| **BR-04 / US-04 / TAL-05** | Two-Phase Confirm gate: unconfirmed rows excluded from balances; `POST /api/pages/[id]/confirm` commits atomically and rejects duplicate confirm (`409 ALREADY_CONFIRMED`, `T-06`) | **T-005** | Integration / Unit | **Not written** | — | `npm test` |
| **BR-05 / US-05 / TAL-06** | Customer balance calculation: `sum(credit) - sum(payment)` for confirmed entries only (`cash_sale` excluded) + fuzzy customer name matching | **T-006** | Unit | **Passing** | 2026-10-27 | `npm test` |
| **BR-06 / US-06 / TAL-06** | Taglish reminder draft schema validation (`friendly` vs. `firm` tones) citing itemized debt and exact balance | **T-007** | Unit / Contract | **Not written** | — | `npm test` |
| **BR-07 / US-02, US-03 / TAL-03, TAL-07** | **Meta Muse Glimmer Canonical Evaluation Harness:** Day 3 Gate (10 pages, target ≥80% row accuracy) and 30+ page evaluation (field accuracy, row accuracy, total-match, discrepancy detection, 2x T4 latency) strictly excluding auxiliary Gemini dev backup runs | **T-008** | AI Eval Harness | **Not written** | — | `npm run eval` |

---

## 4. Coverage

| Metric | Target | Baseline (`2026-10-27`) |
|---|---|---|
| `src/lib/ledger/` line & branch coverage | **100% of arithmetic & discrepancy branches** | 100% (20 passing unit tests in `src/lib/ledger/__tests__/`, 25 total) |
| Requirements with a mapped test ID (§3) | **100% of Must requirements (`BR-01`–`BR-07`)** | 8 / 8 mapped (`6 Passing`, `2 Not written`) |

---

## 5. Quality Gates

**Per story (`AGENTS.md` §2 `tdd`, §9)**
- [ ] Write failing Vitest test first (`Red`), implement minimal code (`Green`), refactor (`Refactor`)
- [ ] All acceptance criteria in [`sprint.md`](sprint.md) met
- [ ] `npm run lint`, `npx tsc --noEmit`, and `npm test` pass with zero errors
- [ ] Traceability matrix (§3) and [`flow.md`](flow.md) updated in the same change

**Before Hackathon Demo & Submission (`TAL-08`)**
- [ ] Day 3 Gate (`TAL-03`) and 30+ Page Evaluation (`TAL-07`) executed on **Muse Glimmer 30B** (`pages.model = 'muse-glimmer'`) and results recorded in `README.md` and [`evidence.md`](evidence.md) §3
- [ ] Manual end-to-end checklist (§6) verified against live Muse Glimmer tunnel
- [ ] `impeccable.cmd detect --json` run on all UI routes with zero unresolved violations

---

## 6. Manual Checklist (Pre-Demo Verification)

| # | Scenario | Role | Expected | Result | Date | Tester |
|---:|---|---|---|---|---|---|
| 1 | 1-Tap Demo Store Login on `/login` | `anon` → `store_owner` | Signs into seeded Demo Store and lands on `/` | | | |
| 2 | Upload notebook page with planted addition error on `MODEL_PROVIDER=glimmer` | `store_owner` | Active badge shows `Muse Glimmer 30B`; `TwoPlyProofBar` highlights `Written Total` vs. `Computed Total` discrepancy in red | | | |
| 3 | Edit flagged row in `RedMarginGutter`, link customer, and tap **Confirm & Save to Ledger** | `store_owner` | Page status becomes `confirmed`; customer *utang* balance updates by exact amount | | | |
| 4 | Upload blurry/unreadable photo | `store_owner` | Agent triggers `flag_unreadable`; UI shows `Retake Photo` instructions without saving bogus rows | | | |
| 5 | Generate `Malumanay` and `Pormal` Taglish reminder drafts and test Copy / Share | `store_owner` | Draft cites exact items and balance; Copy & Web Share / `sms:` work on mobile viewport | | | |

---

## 7. Defect Severity

| Severity | Definition | Response |
|---|---|---|
| **Sev-1** | Arithmetic miscalculation in `src/lib/ledger`, unconfirmed rows leaking into balances, or secret/PII leak | Stop build; fix immediately |
| **Sev-2** | Core flow broken (upload, Glimmer extraction, review confirmation, or reminder draft fails) | Fix before advancing sprint |
| **Sev-3** | UI layout glitch or non-blocking UX friction | Fix in `TAL-08` polish pass |
| **Sev-4** | Minor cosmetic issue | Backlog |

---

## 8. Known Test Gaps

| Gap | Risk | Plan |
|---|---|---|
| `vitest` installed (unit tests `T-003`, `T-004`, `T-006` passing; `T-001`, `T-002`, `T-005`, `T-007` pending) | Integration/contract tests pending Supabase and UI implementation | Write Route Handler integration tests in `TAL-01`, `TAL-05`, `TAL-06` |
| Real Filipino handwriting dataset (`eval/gate-10/` & `eval/pages-30/`) not yet assembled | Cannot measure `A-05` (Glimmer accuracy) until pages are collected | Collect 10 consented/synthetic pages in `TAL-03` (Oct 27–28) and expand to 30+ pages by Nov 2 (`TAL-07`) |

---

## Self-Check

- [x] Static commands (`npm run lint`, `npx tsc --noEmit`) verified on repository
- [x] Unwritten tests are honestly marked `Not written`
- [x] Every Must requirement (`BR-01`–`BR-07`) and security threat (`T-01`–`T-06`) maps to a test ID (`T-001`–`T-008`)
- [x] Zero fabricated coverage or accuracy numbers
