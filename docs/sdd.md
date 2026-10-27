# System Design Document (SDD): Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [BRD](brd.md) · [BPD](bpd.md) · [PRD](prd.md) · [SAD](sad.md) · [DSD](dsd.md) · [Flow](flow.md) · [Build](build.md) · [API](api.md) · [Data model](data-model.md) · [Security](security.md)

---

> **Source-of-truth rule.** [`foundation.md`](foundation.md) is canonical. Resolve conflicts there first, then propagate.
>
> **As-built and planned clarity.** Today (`2026-10-27`), only the Next.js 16.4.3 scaffold (`src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`) exists in the repository. All domain subsystems below are marked `⬜` Planned and mapped to sprint stories (`TAL-01` to `TAL-08`). Evidence rules: [`grounding.md`](grounding.md).

---

## 1. Components and Subsystems

### 1.1 Client subsystems

Each screen or component exceeding ~150 lines is split into a modular folder per `AGENTS.md` §4:

| Subsystem | Location | Responsibility | Status |
|---|---|---|---|
| Root layout & global tokens | `src/app/layout.tsx`, `src/app/globals.css` | Loads `Geist` (`--font-geist-sans`) and `Geist_Mono` (`--font-geist-mono`) and defines CSS design tokens | 🟡 Scaffold exists; custom tokens planned (`TAL-05`) |
| Auth & 1-Tap Demo Login | `src/app/login/page.tsx` | Email/Password sign-in plus 1-tap **"Try Demo Store"** button | ⬜ Planned (`TAL-01`) |
| Upload & Store Dashboard | `src/app/page.tsx`, `src/components/upload/` | Camera/file capture, active model badge, and recent notebook pages list | 🟡 Default Next.js starter exists; Talaan UI `⬜` (`TAL-05`) |
| Review & Discrepancy Screen | `src/app/pages/[id]/review/page.tsx`, `src/components/review/` | Cropped notebook strip, `RedMarginGutter`, editable `EntryReviewRow`, customer match dropdown, and `TwoPlyProofBar` | ⬜ Planned (`TAL-05`) |
| Customer Balances & Detail | `src/app/customers/page.tsx`, `src/app/customers/[id]/page.tsx`, `src/components/customers/` | Per-customer *utang* balance list, confirmed history, and `ReminderDrawer` (`Malumanay` / `Pormal` tone selector + Copy/Share) | ⬜ Planned (`TAL-06`) |
| Client services & hooks | `src/services/`, `src/hooks/` | Typed fetch wrappers (`pages-service.ts`, `customers-service.ts`, `reminders-service.ts`) | ⬜ Planned (`TAL-05`, `TAL-06`) |
| Shared types & Zod schemas | `src/types/ledger.ts`, `src/lib/schemas.ts` | Canonical domain interfaces (`Store`, `Customer`, `Page`, `Entry`, `Reminder`) and Zod validators | ⬜ Planned (`TAL-02`) |

### 1.2 Backend services and library modules

| Service / module | Location | Responsibility | Auth | Status |
|---|---|---|---|---|
| Model provider switch | `src/lib/model.ts` | Single `OpenAI` client switching between `glimmer` (default) and `gemini` (local dev only) via `MODEL_PROVIDER` (`S-01` §4) | Server-only | ⬜ Planned (`TAL-02`) |
| Agent prompts & tool schemas | `src/lib/prompts/` | Versioned system prompts and tool definitions (`extract_rows`, `flag_unreadable`, `draft_reminder`, `restock_list`) | Server-only | ⬜ Planned (`TAL-02`, `TAL-06`) |
| Image pre-processor | `src/lib/image.ts` | `sharp` pipeline: auto-orient via EXIF, resize to max dimension, normalize contrast, encode compressed image | Server-only | ⬜ Planned (`TAL-02`) |
| Deterministic ledger math | `src/lib/ledger/math.ts`, `src/lib/ledger/match.ts` | Integer-centavo row check (`qty * unit_price === amount`), page check (`computed_total === written_total`), customer balance math, and fuzzy customer name matching | Pure TS | ⬜ Planned (`TAL-04`) |
| Supabase server/client helpers | `src/lib/supabase/` | Authenticated server client (RLS) and service helper for private Storage signed URLs | Supabase JWT | ⬜ Planned (`TAL-01`) |
| Prepare Extraction Route | `src/app/api/pages/extract/route.ts` | `POST` handler for Phase 1 (`Prepare`): image upload → `sharp` → `lib/model.ts` → Zod → `lib/ledger` → stage `needs_review` or `retake_requested` | `store_owner` | ⬜ Planned (`TAL-02`) |
| Confirm Ledger Route | `src/app/api/pages/[id]/confirm/route.ts` | `POST` handler for Phase 2 (`Confirm`): idempotency check → re-verify math → link customers → commit `confirmed_by_user = true` & `status = 'confirmed'` | `store_owner` | ⬜ Planned (`TAL-05`) |
| Customers & Balances Route | `src/app/api/customers/route.ts`, `src/app/api/customers/[id]/balance/route.ts` | `GET` / `POST` handlers for customer list, creation, and deterministic balance + history | `store_owner` | ⬜ Planned (`TAL-06`) |
| Reminder Draft Route | `src/app/api/reminders/draft/route.ts` | `POST` handler calling `draft_reminder(customer, tone)` on confirmed unpaid entries and persisting draft to `reminders` | `store_owner` | ⬜ Planned (`TAL-06`) |

### 1.3 Data subsystem

0 migrations exist in the repository today. 5 core entities (`stores`, `customers`, `pages`, `entries`, `reminders`) are planned in `supabase/migrations/` (`TAL-01`). Detail: [`data-model.md`](data-model.md).

### 1.4 External services

| Service | Used for | Integration status | Pinned version |
|---|---|---|---|
| **Meta Muse Glimmer 30B** (`llama-server` on Kaggle 2x T4) | Primary vision extraction & Taglish reminder tool calls | ⬜ Planned (`TAL-02`, `TAL-03`) | `Q4_K_M` GGUF ([`evidence.md`](evidence.md) §5) |
| **Gemini API** (OpenAI-compatible endpoint) | Fast local development testing only (`MODEL_PROVIDER=gemini`) | ⬜ Planned (`TAL-02`) | [`evidence.md`](evidence.md) §5 |
| **Supabase** (Postgres, Auth, Private Storage) | Database persistence, RLS auth, private notebook photo storage | ⬜ Planned (`TAL-01`) | [`evidence.md`](evidence.md) §5 |

---

## 2. Contracts

Endpoint index, request/response schemas, and error catalog live in [`api.md`](api.md).

**Conventions preserved across all endpoints:**
1. Authenticate Supabase session first; reject unauthenticated requests with `401 UNAUTHORIZED`.
2. Validate all request bodies and model outputs with **Zod** (`src/lib/schemas.ts`); reject invalid payloads with `400 VALIDATION_ERROR`.
3. Convert all monetary values to integer centavos before any calculation in `src/lib/ledger/`.
4. Log `model` (`"muse-glimmer"` or Gemini model name) and `latency_ms` on every page extraction.
5. Enforce idempotency on `POST /api/pages/[id]/confirm` so a page in `status = 'confirmed'` cannot be confirmed twice.

---

## 3. Data Flow

### 3.1 Phase 1 (`Prepare`) & Phase 2 (`Confirm`) Flow (⬜ Planned)

```mermaid
sequenceDiagram
  actor U as Store Owner
  participant C as Next.js Client
  participant A as Next.js API Routes
  participant L as src/lib/ledger (TS)
  participant M as src/lib/model (Glimmer/Gemini)
  participant D as Supabase (Postgres + Storage)

  U->>C: Upload notebook photo
  C->>A: POST /api/pages/extract (multipart/form-data)
  A->>A: Verify auth + sharp image resize/contrast
  A->>D: Upload to private bucket + insert page (status='processing')
  A->>M: Chat completion with tools (extract_rows, flag_unreadable)
  M-->>A: Tool arguments JSON + latency_ms
  A->>L: Zod validate + checkRowDiscrepancy + computePageTotals + fuzzy match customers
  A->>D: Update page (status='needs_review', written_total, computed_total, model, latency_ms) & insert unconfirmed entries
  A-->>C: Staged Page + Entries + Discrepancy summary
  U->>C: Review Red Margin Gutter & Two-Ply Proof Bar; edit rows & confirm
  C->>A: POST /api/pages/[id]/confirm
  A->>L: Re-verify centavo totals & check status !== 'confirmed'
  A->>D: Upsert new customers, set entries.confirmed_by_user = true, set pages.status = 'confirmed'
  A-->>C: Confirmed page + updated customer balances
```

### 3.2 Gated, simulated, or environment-switched behavior

| Behavior | Status | Why | Switch (file / env var) | Rules |
|---|---|---|---|---|
| **Model Provider Switch (`glimmer` vs. `gemini`)** | ⬜ Planned (`TAL-02`) | Fast local building vs. mandatory Muse Glimmer gate/eval/demo (`S-01` §4) | `MODEL_PROVIDER` in `.env.local` read by `src/lib/model.ts` | Default is `"glimmer"`. Active model badge shown in UI and logged in `pages.model`. Gemini runs excluded from evaluation metrics. |

---

## 4. Data Layer

Entities, fields, states, and migrations: [`data-model.md`](data-model.md). Policy matrix: [`security.md`](security.md) §5.

| Pattern | Mechanism | Effect |
|---|---|---|
| Tenant scoping | Postgres RLS (`stores.owner_id = auth.uid()`) | Store owners can only read/write their own store's customers, pages, entries, and reminders |
| Exact monetary types | Postgres `numeric(10,2)` + TS integer centavos | Zero floating-point rounding errors |
| Staging isolation | `entries.confirmed_by_user = true` filter on balance queries | Unconfirmed AI extractions never pollute customer *utang* balances |
| Confirmation idempotency | Status check (`pages.status = 'needs_review'`) in `POST /api/pages/[id]/confirm` | Prevents duplicate debt entries on double-tap |

---

## 5. Configuration and Environments

**Client variables** (names only; inlined in client bundle — never put secrets here):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Backend server-only environment variables** (git-ignored `.env.local`):
- `SUPABASE_SERVICE_ROLE_KEY` (if needed for signed storage helpers; otherwise use user-scoped server client)
- `MODEL_PROVIDER` (`"glimmer"` default | `"gemini"` for local dev testing only)
- `GLIMMER_BASE_URL` (Cloudflare / ngrok tunnel URL to Kaggle `llama-server`)
- `GLIMMER_API_KEY` (`--api-key` secret configured on `llama-server`)
- `GEMINI_BASE_URL` (Google Gemini OpenAI-compatible base URL)
- `GEMINI_API_KEY` (Google AI Studio key for local dev testing)
- `GEMINI_MODEL` (Gemini model identifier for local dev testing)

Environments: [`ops.md`](ops.md) §1.

---

## 6. Error Handling and Observability

- **Unreadable image recovery:** When `flag_unreadable` is returned by the model, the API returns HTTP `200` with `status: "retake_requested"` and a plain-language instruction banner so the user is guided to retake the photo rather than seeing a crash.
- **Schema / model failures:** If the model returns invalid JSON or times out, the API catches the error, updates `pages.status` or returns a structured error envelope (`VALIDATION_ERROR` / `MODEL_TIMEOUT`), and prompts the user to retry.
- **Observability:** Every extraction records `model` and `latency_ms` in the `pages` table to support the 30+ page evaluation harness (`S-01` §4, §9).

---

## 7. AI Component

See [`modules/ai-component.md`](modules/ai-component.md) for the full specification of `src/lib/model.ts`, prompt versioning, Zod validation, and the 30+ page Muse Glimmer evaluation harness.

---

## 8. Open Design Decisions

Tracked in [`foundation.md`](foundation.md) §14 and [`adr/README.md`](adr/README.md):

| Area | Question | Reference |
|---|---|---|
| Two-Phase Split & Deterministic Math | Separating single-turn extraction from deterministic math and human confirmation | `ADR-0001` (Decided) |
| Dual Model Provider Switch | Routing `glimmer` (default) and `gemini` (dev test) through `src/lib/model.ts` | `ADR-0002` (Decided) |
| Kaggle Tunnel & 2x T4 Latency | Measuring real inference speed and tunnel stability on 10-page gate | `foundation.md` `Q4`, `Q5` (`TAL-03`) |

---

## Self-Check

- [x] Subsystems listed with target paths and honest `⬜` / `🟡` status marks
- [x] Flows match the Two-Phase Prepare/Confirm architecture
- [x] Config lists variable names only (zero secrets)
- [x] Section 7 links to [`modules/ai-component.md`](modules/ai-component.md)
- [x] Active modules (`ai-component`, `payments-ledger`) integrated into §1.2, §3, and §4
