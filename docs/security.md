# Security Document: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [SAD](sad.md) · [Data model](data-model.md) · [API](api.md) · [Ops](ops.md) · [Test plan](test-plan.md) · [Grounding](grounding.md)

---

> **Posture rule.** This document lists planned and implemented controls and how each is verified. It never claims the system "is secure" or "is compliant". A control is ✅ only when code and a test, scan, or review exist. Outstanding reviews remain listed in §9.
>
> **No secret values** here, in client-bundled variables (`NEXT_PUBLIC_*`), in logs, or in chat. Variable names only.

---

## 1. Scope

| Item | Value |
|---|---|
| Lifecycle stage | **Build** (Hackathon prototype; consented/synthetic data only) |
| In scope | Next.js web app (`src/`), Route Handlers (`src/app/api/`), Supabase Postgres + private Storage + Auth/RLS (`supabase/`), and Kaggle `llama-server` tunnel connection (`src/lib/model.ts`) |
| Out of scope | External payment rails, e-wallets, automated SMS gateways, multi-user staff RBAC, and native mobile binaries (`S-01` §8) |
| Regulatory drivers | Philippine Data Privacy Act of 2012 (RA 10173) context for personal debt records. Compliance is design intent, not legal attestation ([`brd.md`](brd.md) §10.1) |

---

## 2. Assets and Data Classification

| Asset | Classification | Stored in | Owner | Retention |
|---|---|---|---|---|
| **Model & Database Server Secrets** (`GLIMMER_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) | **Secret** | `.env.local` (git-ignored) / Hosting env store | Dev Ejay | Rotated per session (`GLIMMER_BASE_URL` / `GLIMMER_API_KEY`) |
| **Handwritten Notebook Photos** (`notebook-pages` bucket) | **Restricted (PII)** | Private Supabase Storage bucket | Store Owner (`store_id`) | [`data-model.md`](data-model.md) §7 (`TBD`) |
| **Customer Names & *Utang* Balances** (`customers`, `entries`, `reminders`) | **Restricted (PII / Financial)** | Supabase Postgres (RLS-protected) | Store Owner (`store_id`) | [`data-model.md`](data-model.md) §7 (`TBD`) |
| **Supabase Auth Session Tokens (JWT)** | **Restricted** | HTTP-only / Supabase auth cookies | Store Owner | Supabase default session lifetime (`TBD`) |
| **Evaluation Dataset (`eval/`)** | **Public (Consented / Synthetic Only)** | Git repository | Dev Ejay | Permanent in public repo (`S-01` §4, §8) |

---

## 3. Trust Boundaries

| Boundary | Crossing mechanism | Verified at the crossing |
|---|---|---|
| **Browser Client → Next.js Route Handlers (`/api/*`)** | HTTPS / Local HTTP + Supabase Auth session | Server-side session check (`auth.getUser()`) + Zod input schema validation (`src/lib/schemas.ts`) |
| **Next.js Route Handlers → Supabase Postgres & Storage** | Authenticated Supabase client (user JWT + RLS) | Postgres Row-Level Security (`stores.owner_id = (select auth.uid())`) and private bucket policies |
| **Next.js Route Handlers → Kaggle `llama-server` Tunnel** | HTTPS tunnel (`GLIMMER_BASE_URL`) + `Bearer ${GLIMMER_API_KEY}` | `llama-server --api-key` authentication + strict Zod validation of returned JSON (`PageExtractionSchema`) |

**Load-bearing trust decision:** Financial arithmetic and ledger mutations are never trusted to the LLM or client browser; they are enforced by deterministic server math (`src/lib/ledger`), human confirmation (`POST /api/pages/[id]/confirm`), and Postgres RLS ([`sad.md`](sad.md) §1.2).

---

## 4. Threat Model

Likelihood (`L`) and Impact (`I`) reflect engineering judgment (`L` / `M` / `H`).

| ID | Threat (STRIDE category) | Asset | Boundary | L / I | Mitigation | Status | Verified by |
|---|---|---|---|---|---|---|---|
| **T-01** | **Information Disclosure / Tampering:** Cross-tenant access to another store's customers, photos, or ledger entries | `customers`, `pages`, `entries`, `reminders`, Storage | Client → API → DB | M / H | Enable Postgres RLS on all 5 tables (`stores.owner_id = (select auth.uid())`) and store photos in private bucket accessed via signed URLs | ⬜ Planned (`TAL-01`) | `T-001` |
| **T-02** | **Tampering (Integrity):** LLM hallucinates row multiplication or page addition, corrupting customer *utang* balances | `pages.computed_total`, `entries.amount`, Customer Balances | Model → API → DB | H / H | **Zero LLM arithmetic:** `src/lib/ledger/math.ts` computes all row/page math in integer centavos and requires human confirmation (`confirmed_by_user = true`) before affecting balances | ⬜ Planned (`TAL-04`, `TAL-05`) | `T-003`, `T-004`, `T-005` |
| **T-03** | **Elevation of Privilege (Prompt Injection):** Handwritten text on a notebook photo contains adversarial instructions attempting to mutate DB records or bypass review | `entries`, `pages` | Image → Model → API | M / M | **Two-Phase Split + Zod validation:** Model call in `POST /api/pages/extract` has no DB-writing tool execution; output is parsed strictly against `PageExtractionSchema` and staged as `confirmed_by_user = false` | ⬜ Planned (`TAL-02`) | `T-002` |
| **T-04** | **Spoofing / Unauthorized Access:** Unauthenticated callers hit the public Cloudflare/ngrok tunnel to Kaggle `llama-server` | Kaggle 2x T4 GPU quota & model endpoint | Internet → Kaggle Tunnel | M / M | Start `llama-server` with `--api-key ${GLIMMER_API_KEY}` and keep `GLIMMER_BASE_URL` and `GLIMMER_API_KEY` server-only in `.env.local` (`S-01` §4) | ⬜ Planned (`TAL-03`) | Manual check (`TAL-03`) |
| **T-05** | **Information Disclosure:** Real neighborhood customer names and debts leaked in public hackathon repo or demo video | Customer PII | Repo / Demo Video | M / H | Use **only consented/redacted or synthetic notebook pages** in the repo, evaluation set, and demo recording (`S-01` §4, §8) | ✅ Policy locked | Pre-commit / Demo review |
| **T-06** | **Tampering (Replay / Double-Submit):** Store owner double-taps Confirm, adding the same *utang* page twice | Customer Balances | Client → `POST /api/pages/[id]/confirm` | M / H | Idempotency check on `pages.status === 'confirmed'` (`409 ALREADY_CONFIRMED`) + disabled in-flight button state | ⬜ Planned (`TAL-05`) | `T-005` |

---

## 5. Authentication and Authorization

| Topic | Decision | Status |
|---|---|---|
| Authentication methods | Supabase Auth Email/Password + **1-Tap Demo Store Login** on `/login` (`Q10`) | ⬜ Planned (`TAL-01`) |
| Session / token lifetime | Supabase Auth default JWT expiry (`TBD` custom tuning) | ⬜ Planned (`TAL-01`) |
| MFA / step-up | Out of scope for hackathon v1 | ❌ |
| Account recovery | Supabase email reset (not required for 1-Tap Demo Store account) | ⬜ |

**Permission matrix.** Roles come from [`glossary.md`](glossary.md) §2.

| Action / resource | `store_owner` (own `store_id`) | `store_owner` (other store) | `anon` | Enforced at |
|---|:---:|:---:|:---:|---|
| Sign in / 1-Tap Demo Store Login (`/login`) | ✅ | ✅ | ✅ | Supabase Auth |
| Upload & extract page (`POST /api/pages/extract`) | ✅ | — | — | Route Handler Auth + Postgres/Storage RLS |
| Confirm staged page (`POST /api/pages/[id]/confirm`) | ✅ | — | — | Route Handler Auth + Postgres RLS |
| Read customers & balances (`GET /api/customers*`) | ✅ | — | — | Route Handler Auth + Postgres RLS |
| Draft Taglish reminder (`POST /api/reminders/draft`) | ✅ | — | — | Route Handler Auth + Postgres RLS |
| View private notebook image (Signed URL) | ✅ | — | — | Supabase Storage RLS + Signed URL |

---

## 6. Secrets

- Local secrets live in git-ignored `.env.local` (verified: `.env*` is listed in `.gitignore`).
- **Never place a secret in a client-bundled variable (`NEXT_PUBLIC_*`)**, repository files, logs, or chat.

| Secret (name only) | Purpose | Stored in | Last rotated | Owner |
|---|---|---|---|---|
| `GLIMMER_API_KEY` | Protects Kaggle `llama-server` tunnel (`--api-key`) | `.env.local` (server-only) | Per Kaggle session | Dev Ejay |
| `GLIMMER_BASE_URL` | Ephemeral Cloudflare/ngrok tunnel URL to Kaggle `llama-server` | `.env.local` (server-only) | Per Kaggle session | Dev Ejay |
| `GEMINI_API_KEY` | Google Gemini API key for local dev testing only | `.env.local` (server-only) | Never (not yet created) | Dev Ejay |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged server-only Supabase key (if used for seed/storage) | `.env.local` (server-only) | Never (not yet created) | Dev Ejay |

---

## 7. Data Protection, Input Validation, Supply Chain

| Control | Where applied | Status |
|---|---|---|
| Encryption in transit (HTTPS) | Supabase APIs, Cloudflare/ngrok tunnel, Vercel preview | ⬜ Planned (`TAL-01`, `TAL-03`) |
| Schema validation of all inputs & LLM outputs (Zod) | `src/lib/schemas.ts` in all `/api/*` routes | ⬜ Planned (`TAL-02`) |
| Exact integer-centavo financial math | `src/lib/ledger/math.ts` + Postgres `numeric(10,2)` | ⬜ Planned (`TAL-04`) |
| Private object storage with signed URLs | Supabase Storage bucket `notebook-pages` | ⬜ Planned (`TAL-01`) |
| Lockfile committed (`package-lock.json`) | Root repository | ✅ Verified (`2026-10-27`) |
| New dependencies recorded in [`evidence.md`](evidence.md) §5 | Documentation gate (`AGENTS.md` §10) | ✅ Active |

---

## 8. Active Domain Modules

- **AI Component ([`modules/ai-component.md`](modules/ai-component.md)):** Enforces human-in-the-loop confirmation, Zod schema validation, active model provenance badging, and prompt-injection containment (`T-03`).
- **Payments and Ledger ([`modules/payments-ledger.md`](modules/payments-ledger.md)):** Enforces Two-Phase Prepare/Confirm separation, confirmation idempotency (`T-06`), and fail-closed centavo arithmetic (`T-02`).

---

## 9. Review Status

| Review | Status | Date | Reviewer | Record |
|---|---|---|---|---|
| Threat model review | ⬜ Outstanding | — | — | — |
| Dependency audit (`npm audit`) | ⬜ Outstanding | — | — | — |
| Penetration test | ⬜ Outstanding | — | — | — |
| Privacy review (PH Data Privacy Act RA 10173) | ⬜ Outstanding | — | — | — |
| Legal / regulatory review | ⬜ Outstanding | — | Counsel not engaged | — |

---

## 10. Open Security Decisions

| # | Decision | Owner | Blocks | Reference |
|---|---|---|---|---|
| 1 | Signed URL TTL duration for private notebook images | Dev Ejay | `TAL-01` storage helper (default 3600s recommended) | — |

---

## Self-Check

- [x] No "secure", "compliant", or "certified" claim appears
- [x] Unbuilt controls are honestly marked `⬜ Planned`
- [x] Permission matrix matches [`glossary.md`](glossary.md) §2 roles
- [x] Zero secret values appear in this document
- [x] Threat IDs (`T-01` to `T-06`) map to tests in [`test-plan.md`](test-plan.md)
