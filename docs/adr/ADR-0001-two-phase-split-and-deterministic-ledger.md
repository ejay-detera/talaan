# ADR-0001: Two-Phase Split (`Prepare` vs. `Confirm`) and Deterministic Centavo Ledger Math

**Date:** 2026-10-27
**Status:** Accepted
**Deciders:** Dev Ejay
**Answers:** [`foundation.md`](../foundation.md) §14 `Q1`, `Q2`, `Q3`
**Affects:** [`foundation.md`](../foundation.md), [`sad.md`](../sad.md), [`sdd.md`](../sdd.md), [`data-model.md`](../data-model.md), [`api.md`](../api.md), [`modules/payments-ledger.md`](../modules/payments-ledger.md)

---

## Context

The Talaan project brief (`S-01` §3–§5) defines 7 agent tools (`extract_rows`, `add_entries`, `find_discrepancies`, `get_balance`, `flag_unreadable`, `draft_reminder`, `restock_list`), states that **Meta Muse Glimmer 30B** runs on a Kaggle 2x T4 GPU where inference can be slow, mandates that **all arithmetic happens in code, not in the model**, and requires that **the store owner confirms flagged rows before anything is saved**.

## Decision

1. **Two-Phase Split (`Prepare` vs. `Confirm`):**
   - **Phase 1 (`Prepare` — `POST /api/pages/extract`):** Performs a single vision LLM call (`extract_rows` or `flag_unreadable`) after `sharp` image prep, validates the JSON output with Zod (`src/lib/schemas.ts`), runs deterministic discrepancy math in TypeScript (`src/lib/ledger/math.ts`), and saves staged rows with `confirmed_by_user = false` and `pages.status = 'needs_review'` (or `'retake_requested'`).
   - **Phase 2 (`Confirm` — `POST /api/pages/[id]/confirm`):** Accepts human-reviewed rows and matched `customer_id`s, re-verifies centavo math deterministically, and atomically commits `entries.confirmed_by_user = true` and `pages.status = 'confirmed'`.
2. **Typed Ledger Entries (`entry_type`):** Each row is classified as `'credit'` (*utang* owed), `'payment'` (*bayad* reducing debt), or `'cash_sale'` (paid immediately) so customer balances equal `sum(credit) - sum(payment)` across confirmed rows only.
3. **Two-Level Deterministic Discrepancy Check in Integer Centavos:**
   - **Row-level check:** When `quantity` and `unit_price` are present, verify `Math.round(quantity * toCentavos(unit_price)) === toCentavos(amount)`.
   - **Page-level check:** When `written_total` is present, verify `toCentavos(computed_total) === toCentavos(written_total)`.

## Options Rejected

- **Full multi-turn autonomous agent loop on upload:** Rejected because chaining 3–4 sequential LLM rounds on 2x T4 GPUs risks 60–90s serverless timeouts and risks calling `add_entries` before the user inspects the Review UI.
- **Boolean `paid` column only:** Rejected because real *utang* notebooks contain debt payments (*bayad*) that must subtract from an existing customer balance rather than simply marking a new row as paid.
- **Floating-point or LLM arithmetic:** Rejected because IEEE-754 floats introduce rounding drift (`0.1 + 0.2`) and LLMs hallucinate sums (`T-02`).

## Consequences

- Upload latency is bounded to a single vision LLM turn plus instant TypeScript math.
- Zero unconfirmed rows can pollute customer balances.
