# Talaan — Agent Rules

## 1. Source of Truth and Reference Order

**`docs/foundation.md` is the canonical source of truth for this project.** Confirm any product fact there first. If another document or this file conflicts with it, resolve the conflict in `docs/foundation.md`, then propagate.

**`docs/grounding.md` is the anti-hallucination protocol.** Every agent must follow its evidence hierarchy, canonical status marks (✅ 🟡 ⬜ ❌), claim rules, and stop-and-ask triggers. Never invent facts, numbers, dates, partners, or capabilities.

**`docs/` is the first place to look for context** — before reading code and before asking. Read in this order:

1. `docs/foundation.md` — foundation, lifecycle stage, active modules, source of truth
2. `docs/grounding.md` — evidence hierarchy and anti-hallucination rules
3. `docs/evidence.md` — verified sources, claims ledger, pinned dependencies, entities
4. `docs/glossary.md` — canonical terms, roles, and states
5. `docs/brd.md` — business requirements with as-built status
6. `docs/bpd.md` — commercial readiness, canonical business model, what is still open
7. `docs/prd.md` — personas, requirements, canonical roadmap
8. `docs/sad.md` — architecture, canonical pinned tech stack
9. `docs/sdd.md` — subsystems, configuration, error handling
10. `docs/data-model.md` — schema, state transitions, retention, invariants
11. `docs/api.md` — endpoint contracts and error catalog
12. `docs/security.md` — assets, trust boundaries, threat model, review status
13. `docs/dsd.md` — design system, tokens, accessibility
14. `docs/test-plan.md` — test levels, requirement traceability, quality gates
15. `docs/flow.md` — honest status map: what is built, gated, simulated, or planned
16. `docs/build.md` — setup, commands, guardrails, known issues, Definition of Done
17. `docs/ops.md` — environments, deploy, rollback, monitoring, incident runbooks
18. `docs/sprint.md` — sprint backlog: stories, acceptance criteria, priorities, traces
19. `docs/adr/` — accepted architectural and design decision records

`docs/index.md` maps the whole suite and defines fact ownership.

---

## 2. Mandatory Universal Agent Skills

Every agent operating on this codebase must adhere to these five universal execution skills:

1. **`caveman` (Communication & Token Efficiency):**
   - Active at all times in chat and status output.
   - Terse, technical, answer-first. All fluff, pleasantries, hedging, and ceremony deleted.
   - Every file path, symbol, line number, command, error, and code snippet preserved verbatim.

2. **`ponytail` (Code Economy & Anti-Bloat):**
   - The best code is code never written. Solve tasks with the smallest complete working diff.
   - Reuse existing utilities, hooks, types, and components before adding new code.
   - Zero speculative code, unnecessary wrappers, or premature abstractions (YAGNI).
   - Never cut: security, validation at trust boundaries, error handling, accessibility, or non-trivial tests.
   - Always conclude completions with 1-2 lines on what was skipped/untested and known risks.

3. **`impeccable` (Frontend Design & UI/UX Craft):**
   - Mandatory for every UI screen, component, styling, layout, or design token task.
   - Strictly follow tokens in `docs/dsd.md` (`seed:dcbface214fe32da` — "Resibo Carbon & Counter Slip" with Red Margin Gutter; no arbitrary hex colors).
   - Ensure visual hierarchy, minimum 44x44 touch targets, high contrast in Daylight Mode, responsive layouts, and proper empty/error states. Avoid generic AI design tropes.

4. **`grill-me` (Requirement Clarification & Stop-and-Ask):**
   - Trigger when requirements, edge cases, acceptance criteria, or `TBD` decisions are ambiguous.
   - Interview the user to lock down choices before writing code, rather than guessing. Follow `docs/grounding.md` §6 triggers.

5. **`tdd` (Test-Driven Verification):**
   - Enforce Red-Green-Refactor when building features or fixing defects.
   - Write failing tests first to establish requirements; write the minimal code to pass them.
   - Never mark a feature or story ✅ without actual passing test execution per `docs/test-plan.md`.

---

## 3. Active Domain Modules

Active in `docs/foundation.md` §0; their rules are non-negotiable:

- **Payments and ledger (`docs/modules/payments-ledger.md`):** Active for Talaan's Two-Phase Bookkeeping & *Utang* Ledger (`Prepare` extraction via `POST /api/pages/extract` → human `Confirm` via `POST /api/pages/[id]/confirm`, confirmation idempotency, fail-closed integer-centavo math in `src/lib/ledger/` and `numeric(10,2)` in Postgres, zero LLM arithmetic).
- **AI component (`docs/modules/ai-component.md`):** Active for Meta Muse Glimmer 30B (primary) and Gemini API (local dev testing only) via `src/lib/model.ts` (mandatory human-in-the-loop confirmation before DB balance updates, Zod schema validation in `src/lib/schemas.ts`, active model badge in UI, `model` column logged on `pages`, and 30+ page evaluation strictly on Muse Glimmer).
- **Mobile client:** Inactive (deleted; Talaan is a mobile-first Next.js web app governed by `docs/dsd.md`).

---

## 4. Code & Component Architecture

**Always break large view or logic files into modular sub-units.** Any screen, component, or service that grows beyond ~150 lines must be split into a structured folder:

```
src/app/[route]/
  page.tsx           ← thin shell: owns primary state, effects, and composition
src/components/[feature]/
  SomeList.tsx       ← receives props, emits events via callbacks
  SomeDrawer.tsx     ← self-contained form state; calls submit callback
```

Rules:
- Shell / screen files hold primary state and data fetching; their return is a short composition.
- Sub-components receive data via props and communicate up via callbacks (e.g., `onUpdate`, `onSubmit`).
- Modals / drawers own internal form validation and reset; they call an `onSubmit` callback with validated data.
- Shared types live in `src/types/` (`src/types/ledger.ts`) and are imported everywhere — never re-declare duplicate interfaces.
- Shared UI patterns live in `src/components/shared/`.
- No `any` casts unless strictly unavoidable; prefer explicit TypeScript/type safety.

---

## 5. Design System & Frontend

`src/app/globals.css` is the token authority. Full specification: `docs/dsd.md` (`seed:dcbface214fe32da`).

- Brand colors: Deep Carbon Indigo shell (`#1E293B`), Warm Counter Bond ground (`#FAF8F4`), Crisp Slip surface (`#FFFFFF`), Sari Emerald primary (`#0F6E56`), Carbon Blue secondary (`#1D4ED8`), Listahan Red Margin rule (`#E11D48`), Amber Review warning (`#B45309` / `#FEF3C7`), and Red Ballpen discrepancy/error (`#DC2626` / `#FEE2E2`). Use tokens from `src/app/globals.css` — never hardcode hex values.
- Typography: `Geist Sans` (`--font-geist-sans`) for all UI, headings, and labels. `Geist Mono` (`--font-geist-mono` with `tabular-nums`) for all peso amounts, quantities, confidence scores, and running totals.
- Appearance: **High-Contrast Daylight Mode (Light Mode)** is the supported appearance. Dark Mode is TBD (`docs/dsd.md` §3.2).
- Signature verification elements: `RedMarginGutter` (left `2px solid #E11D48` status column) and `TwoPlyProofBar` (sticky bottom `Written Total` vs. `Computed Total` reconciliation bar).
- Status presentation: every status must pair a label with an icon or shape, never color alone (`docs/glossary.md` §3).

---

## 6. Data Layer & Backend

- **Reuse first.** Check existing services (`src/services/`), hooks (`src/hooks/`), shared utilities (`src/lib/ledger/`, `src/lib/model.ts`), and schemas (`src/lib/schemas.ts`) before writing new code.
- Screens and UI consume data through services/hooks. Do not introduce mock/placeholder arrays when a real service or schema exists.
- Invariants, state machine rules, and authorization boundaries (Postgres RLS by `stores.owner_id = (select auth.uid())`) must be enforced server-side and in the database layer, not client-side (`docs/security.md` §5).
- Follow `supabase-postgres-best-practices` on all SQL migrations, indexes, `numeric(10,2)` columns, and RLS policies.

---

## 7. Environments & Secrets

- **Never put a secret in client-bundled variables (`NEXT_PUBLIC_*`)**, repository files, logs, or chat.
- **Never present Gemini test output as Muse Glimmer output.** `MODEL_PROVIDER=gemini` is for fast local building only; the Day 3 gate, 30+ page evaluation, and final demo must run on `MODEL_PROVIDER=glimmer`.
- **Hosted non-production environments** are demo/test only (`docs/build.md` §13). Never describe them as "live" or "in production."
- **Irreversible commands** (`supabase db reset`, `DROP TABLE`, `git push --force`): ask before running.
- Default to local/dev stack for all seed and migration scripts. Confirm targets before running.

---

## 8. Git & Development Workflow

- Inspect freely in read-only mode (`git status`, `git log`, `git diff`). Never commit, amend, or push without explicit permission.
- **Plan first.** For every implementation task:
  1. State what files will be created or modified.
  2. List the specific changes per file.
  3. Call out potential gotchas (type constraints, migrations, shared impacts).
  4. Wait for user confirmation, then execute.
- If a task lacks necessary context or decisions, **stop and ask** (use `/grill-me` or ask directly per `docs/grounding.md` §6) rather than guessing.

---

## 9. Validation & Quality Gates

Run before every completion report:
```bash
npm run lint           # zero warnings tolerated
npx tsc --noEmit       # no new `any` or type errors
npm test               # Vitest unit/contract tests must pass (once installed in TAL-04)
```

Quality criteria:
- Every acceptance criterion in `docs/sprint.md` must be satisfied for a story to be Done (`✅`).
- Tests use **Vitest** (`vitest`). Do not introduce unapproved test runners without an ADR.
- Run `npm run lint && npx tsc --noEmit && npm test && npm run build` before any release/demo build (`docs/ops.md` §2).

---

## 10. Keeping Documentation True

- Any change to feature status must update `docs/flow.md` in the same change.
- Any change to a product fact must update `docs/foundation.md` in the same change.
- Any new architectural decision or resolved question from `foundation.md` §14 must be recorded in `docs/adr/`.
- Any new claim, number, or external dependency must be recorded in `docs/evidence.md`.
- Never document an unbuilt capability as working. Use `docs/grounding.md` status marks.
