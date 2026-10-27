# Architecture and Decision Records: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](../foundation.md)
**Related:** [Foundation §14](../foundation.md) · [Grounding](../grounding.md) · [Evidence](../evidence.md)

---

> **Purpose.** Each open decision in [`foundation.md`](../foundation.md) §14 is resolved here, once, with the reasoning kept. An agent that finds an accepted ADR **follows it**; it does not re-decide.
>
> **An ADR records a decision, not an implementation.** Whether it is built is answered by [`flow.md`](../flow.md).

---

## 1. Rules

1. One decision per file: `ADR-NNNN-short-title.md`. Copy [`ADR-0000-template.md`](ADR-0000-template.md).
2. **Accepted ADRs are immutable.** To change one, write a new ADR that **supersedes** it and mark the old one `Superseded by ADR-NNNN`.
3. A decision that answers a `foundation.md` §14 question: update that row's **Status** and **ADR** columns in the same change. If the decision changes a product fact, update `foundation.md` too.
4. Decide with evidence. Cite [`evidence.md`](../evidence.md) rows; record assumptions as `A-NN`.
5. Record **rejected options** and why. This is what prevents an agent re-proposing them.
6. Statuses: `Proposed` → `Accepted` / `Rejected` → (`Superseded`).

## 2. When to Write One

Write an ADR when the decision is hard to reverse, affects more than one document, constrains future work, or was debated. Examples: stack choice, auth model, tenancy model, data retention, integration approach, a deliberate scope cut, a deliberate gate.

Do **not** write one for reversible implementation detail.

## 3. Index

| ADR | Title | Status | Date | Answers | Supersedes | Affects |
|---|---|---|---|---|---|---|
| `ADR-0001` | Two-Phase Split (`Prepare` vs. `Confirm`) and Deterministic Centavo Ledger Math (`src/lib/ledger`) | Accepted | 2026-10-27 | Foundation `Q1`, `Q2`, `Q3` | — | `foundation.md`, `sad.md`, `sdd.md`, `data-model.md`, `api.md`, `modules/payments-ledger.md` |
| `ADR-0002` | Dual Model Provider Switch (`MODEL_PROVIDER=glimmer\|gemini`) with Mandatory Glimmer Gate/Eval/Demo Policy | Accepted | 2026-10-27 | Foundation `Q5` | — | `foundation.md`, `sad.md`, `sdd.md`, `modules/ai-component.md`, `test-plan.md` |

## 4. Decision Ownership

| Decision area | Owner | Approver |
|---|---|---|
| Product scope & UX (`impeccable`) | Dev Ejay | Dev Ejay |
| Architecture & Data Model | Dev Ejay | Dev Ejay |
| Security and privacy | Dev Ejay | Dev Ejay |
| Legal and regulatory review | Counsel not engaged (`TBD`) | — |

## Self-Check

- [x] Every Accepted ADR appears in §3
- [x] Every answered `foundation.md` §14 row links its ADR or section
- [x] Decision ownership assigned to Dev Ejay
