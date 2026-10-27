# Documentation Index: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Lifecycle stage:** Build. Set in [`foundation.md`](foundation.md) §0
**Source of truth:** [`foundation.md`](foundation.md)

---

## 1. Start Here

[`foundation.md`](foundation.md) is the **canonical source of truth**. Any developer or AI agent confirming a product fact reads it first. If a document here conflicts with it, resolve the conflict in `foundation.md`, then propagate.

`docs/` is the **first place to look** for context, before reading code and before asking. AI agents also follow [`grounding.md`](grounding.md): cite evidence, never invent.

---

## 2. Documentation Suite

Read in this order.

### 2.1 Core

| # | Document | File | What it answers |
|---:|---|---|---|
| 1 | Foundation | [foundation.md](foundation.md) | Why this exists, what it is, identity, workflow, lifecycle stage, active modules, open decisions |
| 2 | BRD | [brd.md](brd.md) | Business problem, roles, requirements with status, compliance, risk register, metrics |
| 3 | BPD | [bpd.md](bpd.md) | Commercial readiness, customers, **business model (canonical)**, go-to-market sequence |
| 4 | PRD | [prd.md](prd.md) | Personas, features, user stories, non-goals, **roadmap (canonical)** |
| 5 | SAD | [sad.md](sad.md) | Architecture, **tech stack (canonical)**, communication, quality attributes |
| 6 | SDD | [sdd.md](sdd.md) | Subsystems, data flow, configuration, error handling |
| 7 | Design System | [design.md](design.md) | Canonical visual design system ("The Notebook, Kept"), tokens, components, accessibility |
| 8 | Flow | [flow.md](flow.md) | Honest status map: what works, what is gated or simulated, what is planned |
| 9 | Build | [build.md](build.md) | Setup, commands, guardrails, known issues, Definition of Done |
| 10 | Sprint | [sprint.md](sprint.md) | **Use for anything sprint-related.** Stories with acceptance criteria and traces |

### 2.2 Engineering reference

| Document | File | What it answers |
|---|---|---|
| Data model | [data-model.md](data-model.md) | Entities, fields, states, invariants, retention, migrations |
| API | [api.md](api.md) | Endpoints, conventions, error catalog |
| Security | [security.md](security.md) | Assets, trust boundaries, threat model, permission matrix, review status |
| Test plan | [test-plan.md](test-plan.md) | Test levels, requirement-to-test traceability, quality gates |
| Ops | [ops.md](ops.md) | Environments, deploy, rollback, monitoring, recovery, incidents |

### 2.3 Grounding and decisions

| Document | File | What it answers |
|---|---|---|
| Grounding protocol | [grounding.md](grounding.md) | Evidence hierarchy, **status vocabulary (canonical)**, prohibitions, stop-and-ask rules |
| Evidence registers | [evidence.md](evidence.md) | Sources, claims ledger, assumptions, pinned versions, named entities |
| Glossary | [glossary.md](glossary.md) | One term, one meaning; roles and states |
| ADRs | [adr/README.md](adr/README.md) | Decisions made, options rejected, why |

### 2.4 Optional modules

Activated in [`foundation.md`](foundation.md) §0. Inactive `mobile-client.md` has been removed.

| Module | File |
|---|---|
| Payments and ledger | [modules/payments-ledger.md](modules/payments-ledger.md) |
| AI component | [modules/ai-component.md](modules/ai-component.md) |

### 2.5 Repository documents

| Document | File | Purpose |
|---|---|---|
| Repository readme | [../README.md](../README.md) | Orientation |
| Agent rules | [../AGENTS.md](../AGENTS.md) | Operating rules for AI agents and developers |

---

## 3. Who Owns Which Fact

Write each fact once, in its owner. Everywhere else, link. Duplicates drift.

| Fact | Owner | Other docs |
|---|---|---|
| Product identity, value proposition, scope | foundation | Link only |
| Open decisions | foundation §14 | Answers live in [ADRs](adr/README.md) |
| Competitive comparison | foundation §11 | BRD §9 links |
| Goal alignment | foundation §12 | BRD §12 links |
| Business model, pricing | bpd §4 | foundation, BRD, PRD link |
| Compliance posture | brd §10.1 | BPD links |
| Risk register | brd §10.2 | BPD §8.2 holds commercial risks only |
| Roles | brd §4 and [glossary](glossary.md) §2 | PRD gives jobs; BPD gives offering |
| Roadmap | prd §9 | Flow shows status; SAD shows architecture impact |
| Product user stories | prd §4 | Sprint cites US IDs |
| Tech stack and versions | sad §2 and [evidence](evidence.md) §5 | BRD links |
| Feature status | flow | Everyone else links |
| Schema | `supabase/migrations/` (code), derived in data-model | SDD links |
| Endpoints | contract and code, indexed in api | SDD links |
| Status marks | [grounding](grounding.md) §3 | Never redefine |

---

## 4. Conventions

- **Status marks, evidence labels:** defined only in [`grounding.md`](grounding.md) §3.
- **Placeholders:** `TBD` and `Not stated` stay as written when genuinely undecided.
- **IDs:** `BR-NN` requirement, `US-NN` product story, `TAL-NN` sprint story, `T-NNN` test, `API-NN` endpoint, `T-NN` threat (security), `RB-NN` runbook, `ADR-NNNN`, `S-/C-/A-/R-NN` evidence rows.
- **Section references:** `file.md §N`. Renumbering a section requires a link check.

---

## 5. Platform Summary — As Built

```
Talaan — Hackathon Build Stage (Consented / Synthetic Data Only; Zero Live Customers)

  CLIENT:    Next.js 16.4.3 / React 19.3.0 Web App (Mobile-First), 2 role surfaces
             (store_owner) ⬜ Upload, Review, Balances, Reminders   (anon) ⬜ Login / 1-Tap Demo
  BACKEND:   Next.js App Router Route Handlers (`src/app/api/*`) — Two-Phase Split
             (Prepare extraction + deterministic `src/lib/ledger` check -> Human Confirm)
  DATA:      Supabase Postgres (`numeric(10,2)` money, RLS by `owner_id`) + Private Storage (⬜ Planned)
  EXTERNAL:  Meta Muse Glimmer 30B (CANONICAL PRIMARY on Kaggle 2x T4) .. ⬜ Planned
             Gemini API (Auxiliary Developer Backup Only) ............... ✅ Supported
```

**Not implemented:** All domain routes, Supabase tables, `src/lib/model.ts`, `src/lib/ledger/` (`TAL-01` to `TAL-08`). **Simulated:** None. **Deployed:** Local `next dev` scaffold only. **Out of scope:** Voice input, automated SMS sending, payment processing, POS hardware, native mobile app.

---

## 6. Change Log

| Date | Change | Documents |
|---|---|---|
| 2026-10-27 | Populated full documentation suite from Talaan Project Brief v1 (`S-01`) and locked `/grill-me` + `/impeccable` decisions. | All |

---

## 7. Health Check

- [x] `foundation.md` is named as source of truth in every suite document
- [x] Lifecycle stage (`Build`) and active modules (`payments-ledger`, `ai-component`) are set in `foundation.md` §0
- [x] Every feature claim carries a status mark from `grounding.md`; every ✅ names a test or command
- [x] No fact is written in two places (§3)
- [x] Every number is in the claims ledger or marked `Not validated` / `TBD`
- [x] Every named entity is in the entity register as a prospective target
- [x] Each `foundation.md` §14 question is Open or links an ADR
- [x] Inactive `mobile-client.md` module is deleted; all relative links resolve
