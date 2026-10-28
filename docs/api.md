# API Reference: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [SDD](sdd.md) · [SAD](sad.md) · [Data model](data-model.md) · [Security](security.md) · [Test plan](test-plan.md) · [Grounding](grounding.md)

---

> **As-built and planned rule.** As of `2026-10-27`, zero API routes exist in `src/app/api/`. The 4 endpoints below (`API-01` to `API-04`) are the canonical contract for `TAL-02`, `TAL-05`, and `TAL-06`, validated at runtime by `src/lib/schemas.ts` (Zod). All endpoints are marked `⬜` Planned until implemented and verified by tests.

---

## 1. Conventions

| Topic | Rule |
|---|---|
| Base URL | `/api` (Next.js App Router Route Handlers under `src/app/api/`) |
| Versioning | Unversioned internal App Router endpoints (`/api/pages/*`, `/api/customers/*`, `/api/reminders/*`) |
| Auth | Supabase Auth session cookie / Bearer JWT verified server-side; requires `store_owner` role ([`security.md`](security.md) §5) |
| Content type | `multipart/form-data` for image upload (`API-01`); `application/json` for all other requests and responses |
| Idempotency | `API-02` (`POST /api/pages/[id]/confirm`) checks `pages.status !== 'confirmed'` so confirming an already-confirmed `page_id` returns `409 ALREADY_CONFIRMED` and never duplicates ledger entries |
| Rate limits | **TBD** (local/hackathon demo bound by single-owner session) |
| Error envelope | `{ "error": { "code": "ERROR_CODE", "message": "Plain-language explanation", "details": {} } }` |
| Numbers & Money | JSON payloads carry Peso amounts as numbers rounded to 2 decimal places (`36.00`), validated by Zod and converted immediately to integer centavos (`3600`) inside `src/lib/ledger/` before any calculation; stored in Postgres as `numeric(10,2)` |

---

## 2. Endpoint Index

| ID | Method | Path | Role | Purpose | Status | Idempotent | Tests |
|---|---|---|---|---|---|:---:|---|
| **API-01** | `POST` | `/api/pages/extract` | `store_owner` | **Phase 1 (`Prepare`):** Upload notebook photo, run `sharp` prep, invoke vision model (`extract_rows` / `flag_unreadable`), run deterministic discrepancy check (`src/lib/ledger`), and stage unconfirmed rows | ✅ Built (`TAL-02`, `TAL-05`) | No (creates new `page`) | `T-001`, `T-002`, `T-003` |
| **API-02** | `POST` | `/api/pages/[id]/confirm` | `store_owner` | **Phase 2 (`Confirm`):** Validate human-reviewed rows & customer links, re-verify centavo math in `src/lib/ledger`, and atomically commit `confirmed_by_user = true` & `pages.status = 'confirmed'` via Postgres RPC | ✅ Built (`TAL-05`) | **Yes** (by `page_id`) | `T-005` |
| **CRON-01** | `GET` | `/api/cron/cleanup-demo` | `vercel_cron` | **Scheduled Cleanup:** Delete expired anonymous demo users (>7 days) and remove associated Storage objects | ✅ Built (`TAL-05`) | **Yes** | `demo-cleanup.test.ts` |
| **API-03** | `GET` | `/api/customers` & `/api/customers/[id]/balance` | `store_owner` | List store customers with deterministic *utang* balances (`sum(credit) - sum(payment)` from confirmed entries) and itemized history | ✅ Built (`TAL-06`) | Yes | `T-006` |
| **API-04** | `POST` | `/api/reminders/draft` | `store_owner` | Generate a polite Taglish payment reminder draft (`friendly` / *Malumanay* or `firm` / *Pormal*) from confirmed unpaid entries using `src/lib/model.ts` (`draft_reminder`) | ✅ Built (`TAL-06`) | No (creates new draft) | `T-007` |
| **API-05** | `GET` | `/api/ledger/export` | `store_owner` | Export all confirmed store ledger entries as a UTF-8 BOM CSV attachment (`text/csv; charset=utf-8`) | ✅ Built (`US-08`) | Yes | `T-009` |

---

## 3. Reference Endpoints

### API-01 — Prepare & Extract Notebook Page (`POST /api/pages/extract`) ✅

**Request** — `POST /api/pages/extract` (`multipart/form-data`)
- `file`: Image file (`image/jpeg`, `image/png`, `image/webp`, max 10 MB)
- `store_id` (optional if owner has a single default store)

**Server sequence**
1. Authenticate `store_owner` via Supabase Auth; verify `store_id` ownership under RLS.
2. Pre-process `file` with `sharp` (`src/lib/image.ts`: EXIF auto-orient, resize max width/height, normalize contrast).
3. Upload processed image to private Supabase Storage bucket `notebook-pages/{store_id}/{page_id}.jpg` and insert `pages` row (`status = 'processing'`).
4. Call `src/lib/model.ts` (`extract_rows` and `flag_unreadable` tool definitions), recording elapsed `latency_ms` and active `modelName` (`"muse-glimmer"` [canonical primary] or dev backup model name).
5. If model calls `flag_unreadable(region, reason)`: update `pages` (`status = 'retake_requested'`, `retake_reason`, `model`, `latency_ms`) and return `200 OK` with retake guidance.
6. If model calls `extract_rows`: validate arguments with `PageExtractionSchema` (Zod).
7. Pass validated rows and `written_total` to `src/lib/ledger/math.ts` to compute `line_discrepancy` (`quantity * unit_price !== amount`), `computed_total`, `has_page_discrepancy` (`computed_total !== written_total`), and `needs_review` (`confidence < 0.80 || line_discrepancy`).
8. Run `src/lib/ledger/match.ts` to suggest matching `customer_id`s from existing store `customers`.
9. Insert staged rows into `entries` (`confirmed_by_user = false`) and update `pages` (`status = 'needs_review'`, `written_total`, `computed_total`, `has_page_discrepancy`, `model`, `latency_ms`).
10. Return `200 OK` with the staged page, entries, and discrepancy summary.

**Response `200 OK` (`needs_review` state)**

```json
{
  "page": {
    "id": "b3f1c2d4-8a9e-4f1b-9c2d-1a2b3c4d5e6f",
    "status": "needs_review",
    "page_date": "2026-10-27",
    "written_total": 840.0,
    "computed_total": 820.0,
    "has_page_discrepancy": true,
    "discrepancy_diff": -20.0,
    "model": "muse-glimmer",
    "latency_ms": 4820
  },
  "entries": [
    {
      "id": "e1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
      "extracted_customer_name": "Aling Nena",
      "matched_customer_id": "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f",
      "item": "Lucky Me Pancit Canton",
      "quantity": 3,
      "unit_price": 12.0,
      "amount": 36.0,
      "entry_type": "credit",
      "line_discrepancy": false,
      "confidence": 0.92,
      "needs_review": false,
      "confirmed_by_user": false
    }
  ]
}
```

---

### API-02 — Confirm Staged Page into Ledger (`POST /api/pages/[id]/confirm`) ✅

**Request** — `POST /api/pages/[id]/confirm` (`application/json`)

```json
{
  "written_total": 840.0,
  "entries": [
    {
      "id": "e1a2b3c4-5d6e-4f7a-8b9c-0d1e2f3a4b5c",
      "customer_id": "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f",
      "new_customer_name": null,
      "item": "Lucky Me Pancit Canton",
      "quantity": 3,
      "unit_price": 12.0,
      "amount": 36.0,
      "entry_type": "credit"
    }
  ]
}
```

**Server sequence**
1. Authenticate `store_owner`; load `pages` row by `id` under RLS.
2. If `pages.status === 'confirmed'`, return `409 ALREADY_CONFIRMED`.
3. Validate request body with `ConfirmPageSchema` (Zod); ensure every `'credit'` and `'payment'` row specifies either an existing `customer_id` or a `new_customer_name` to create.
4. Re-compute `computed_total` and `line_discrepancy` deterministically in `src/lib/ledger/math.ts`.
5. In a DB transaction: create any new `customers`, update `entries` with final values and `confirmed_by_user = true`, and update `pages` (`status = 'confirmed'`, `computed_total`, `confirmed_at = now()`).
6. Return `200 OK` with updated page status and affected customer balances.

---

### API-03 — Customer Balances & History (`GET /api/customers`, `GET /api/customers/[id]/balance`) ✅

**List Request** — `GET /api/customers`
Returns store customers with deterministic balances (`sum(credit) - sum(payment)` from confirmed entries only) and active debt flags.

**Detail Request** — `GET /api/customers/[id]/balance`
Returns a specific customer's profile, exact centavo balance, and itemized entry history (`credit` purchases and `payment` credits).

---

### API-04 — Draft Taglish Reminder (`POST /api/reminders/draft`) ✅

**Request** — `POST /api/reminders/draft` (`application/json`)

```json
{
  "customer_id": "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f",
  "tone": "friendly"
}
```

**Response `200 OK`**

```json
{
  "reminder": {
    "id": "f4e3d2c1-b0a9-4876-9543-210fedcba987",
    "customer_id": "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f",
    "customer_name": "Aling Nena",
    "balance": 340.0,
    "tone": "friendly",
    "message": "Magandang araw po Aling Nena! Paalala lang po sa inyong listahan sa tindahan (3 Lucky Me ₱36.00 at iba pa), bale ₱340.00 po lahat. Salamat po!",
    "model": "muse-glimmer"
  }
}
```

---

## 4. Error Catalog

| Code | HTTP | Meaning | Client action |
|---|---:|---|---|
| `UNAUTHORIZED` | `401` | Missing or expired Supabase Auth session | Redirect to `/login` |
| `FORBIDDEN` | `403` | Authenticated user does not own the requested `store_id` or `page_id` | Show permission error |
| `VALIDATION_ERROR` | `400` | Request payload or LLM output failed Zod validation | Show field-level validation message or retry extraction |
| `MISSING_CUSTOMER_LINK` | `400` | A `'credit'` or `'payment'` row is being confirmed without a linked or new customer | Highlight the customer dropdown on that row |
| `ALREADY_CONFIRMED` | `409` | `POST /api/pages/[id]/confirm` called on a page already in `status = 'confirmed'` | Refresh page state and show confirmed ledger |
| `MODEL_TIMEOUT` | `504` | Kaggle `llama-server` tunnel or model inference exceeded timeout | Offer retry button; check Kaggle tunnel runbook (`RB-01`, `RB-02`) |

---

## 5. Events and Webhooks

None. Talaan uses synchronous HTTP Route Handlers.

---

## 6. External APIs Consumed

| Service | Version | Used for | Auth | Docs and pinned version |
|---|---|---|---|---|
| **Meta Muse Glimmer 30B (Kaggle `llama-server`)** | OpenAI-compatible `/v1/chat/completions` | Canonical primary vision extraction & Taglish reminder tool calls | `Bearer ${GLIMMER_API_KEY}` | [`evidence.md`](evidence.md) §5 |
| **Gemini API** (Auxiliary dev backup only) | OpenAI-compatible `/v1beta/openai/chat/completions` | Offline local dev iteration when `MODEL_PROVIDER=gemini` | `Bearer ${GEMINI_API_KEY}` | [`evidence.md`](evidence.md) §5 |
| **Supabase API** | REST / Storage / Auth v2 | Database persistence, RLS auth, private Storage bucket | Supabase JWT / Service key | [`evidence.md`](evidence.md) §5 |

---

## 7. Change Policy

Any change to an endpoint request/response shape must update `src/lib/schemas.ts`, `src/types/ledger.ts`, and this document in the same commit, and pass contract tests in [`test-plan.md`](test-plan.md) §1.

---

## Self-Check

- [x] Every endpoint in §2 is honestly marked `⬜ Planned` with sprint story and test IDs
- [x] Error codes match the Two-Phase Split and Kaggle tunnel failure modes
- [x] No secret or real credential appears in any example
