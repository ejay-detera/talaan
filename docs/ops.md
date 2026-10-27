# Operations Runbook: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [SAD](sad.md) · [Build](build.md) · [Security](security.md) · [Test plan](test-plan.md) · [Grounding](grounding.md)

---

> **Reality rule.** This document records which operations actually exist as of `2026-10-27`. Talaan is a hackathon prototype (`Build` stage); there is **no production environment, no automated alerting, and no 24/7 on-call rotation**.
>
> **Scope split.** [`build.md`](build.md) holds local setup, commands, and Kaggle bootstrap steps. This file holds environment definitions, Kaggle tunnel runbooks (`RB-01`, `RB-02`), and incident procedures.

---

## 1. Environments

| Environment | Exists? | Purpose | Location (no secrets) | Data | Deploy method | Owner |
|---|:---:|---|---|---|---|---|
| **Local Dev (`next dev`)** | ✅ | Primary development, evaluation harness, and demo recording (`S-01` §4) | Developer machine (`http://localhost:3000`) | Consented / synthetic test pages | `npm run dev` | Dev Ejay |
| **Kaggle GPU Inference Node (`2x T4`)** | ⬜ Planned (`TAL-03`) | Running `llama.cpp` `llama-server` with **Meta Muse Glimmer 30B** (`Q4_K_M` GGUF) | Ephemeral Kaggle notebook + Cloudflare/ngrok tunnel (`GLIMMER_BASE_URL`) | Stateless inference only | Kaggle script + cached Dataset (`S-01` §4, §8) | Dev Ejay |
| **Supabase Cloud Project (Non-Prod)** | ⬜ Planned (`TAL-01`) | Postgres tables, Auth, RLS, and private Storage bucket for hackathon build | Hosted Supabase project | Consented / synthetic demo data only | `npx supabase db push` | Dev Ejay |
| **Vercel Preview (Optional)** | ⬜ Planned | Hosted web preview (subject to serverless timeout limits against T4 tunnel; `S-01` §4, §8) | Vercel preview URL | Consented / synthetic demo data only | Git push / `vercel` CLI | Dev Ejay |
| **Production** | ❌ Does not exist | — | — | — | — | — |

Never call the Kaggle tunnel, Supabase demo project, or Vercel preview "live" or "in production" (`AGENTS.md` §7).

---

## 2. Deployment (Hackathon Demo & Preview)

| Item | Value |
|---|---|
| Pipeline | Manual local execution (`npm run dev`) + optional Vercel preview deploy |
| Approval | Dev Ejay |
| Pre-deploy / Pre-demo check | `npm run lint && npx tsc --noEmit && npm test` ([`test-plan.md`](test-plan.md) §5) |
| Migration order | Run `npx supabase db push` before starting app against new schema |
| Demo recording setup (`S-01` §4) | 1. Start Kaggle 2x T4 notebook and `llama-server --jinja --api-key` 2. Start Cloudflare/ngrok tunnel 3. Set `GLIMMER_BASE_URL` and `MODEL_PROVIDER=glimmer` in `.env.local` 4. Run `npm run dev` locally |
| Post-start smoke check | Verify UI badge reads `Muse Glimmer 30B` and run 1 test page extraction |

---

## 3. Rollback

| Layer | Method | Tested | Data impact |
|---|---|:---:|---|
| Application code | `git revert` or checkout previous commit | Unproven (`N`) | None |
| Database migration | Re-seed non-production demo database (`npm run seed`) | Unproven (`N`) | Resets demo store to clean state |
| Model provider config | Update `.env.local` (`GLIMMER_BASE_URL` or `MODEL_PROVIDER`) and restart server | Unproven (`N`) | None |

---

## 4. Monitoring and Alerting

**Current state:** None beyond Next.js console output, Kaggle notebook stdout, and per-page `model` + `latency_ms` logging in the `pages` Postgres table (`S-01` §4).

| Signal | Source | Threshold | Alert to | Status |
|---|---|---|---|---|
| Page extraction latency (`latency_ms`) | `pages.latency_ms` column in Postgres | **TBD** (measured in `TAL-07`) | Manual inspection / Eval script | ⬜ (`TAL-02`) |
| Kaggle `llama-server` health | `GET ${GLIMMER_BASE_URL}/health` | HTTP `200` before demo/eval | Manual check | ⬜ (`TAL-03`) |
| Automated production alerting | None | **TBD** | — | ⬜ |

---

## 5. Backup and Recovery

| Data store | Method | Frequency | Retention | Last restore test | RPO | RTO |
|---|---|---|---|---|---|---|
| Evaluation dataset (`eval/`) & SQL migrations (`supabase/migrations/`) | Committed in Git repo | Every commit | Permanent | Never | Git commit | Minutes |
| Kaggle `llama-server` binary & Muse Glimmer GGUF weights | Saved as private Kaggle Dataset (`S-01` §8) | Once after initial build (`TAL-03`) | Permanent on Kaggle | Never (Unproven) | — | ~5 min session restart |
| Supabase demo database | Re-runnable seed script (`npm run seed`) | On demand | Hackathon duration | Never (Unproven) | — | ~2 min re-seed |

---

## 6. Configuration and Secrets Operations

- All secrets (`GLIMMER_API_KEY`, `GLIMMER_BASE_URL`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) live in git-ignored `.env.local` ([`security.md`](security.md) §6).
- Because Kaggle generates a new tunnel URL every session (`S-01` §4), `GLIMMER_BASE_URL` is updated in `.env.local` at the start of each Kaggle GPU session.

---

## 7. Incident Response (Hackathon Build & Demo Risks)

| Severity | Definition | Response target | Owner |
|---|---|---|---|
| **SEV-1** | Accidental commit of secret key or unredacted real customer PII; or Day 3 Glimmer handwriting gate < 80% (`A-05`) | Immediate | Dev Ejay |
| **SEV-2** | Kaggle GPU session expires or tunnel disconnects during evaluation or demo recording (`A-06`) | < 15 minutes | Dev Ejay |
| **SEV-3** | T4 inference latency exceeds serverless timeout on hosted preview | Switch to local `next dev` against tunnel (`S-01` §4) | Dev Ejay |

---

## 8. Runbook Entries and Incident Log

| ID | Symptom | Verified cause | Diagnosis | Fix | Escalate to |
|---|---|---|---|---|---|
| **RB-01** | `POST /api/pages/extract` returns `504 MODEL_TIMEOUT` or connection refused when `MODEL_PROVIDER=glimmer` | Kaggle notebook session idled out or Cloudflare/ngrok tunnel URL changed (`S-01` §4, §8) | `curl ${GLIMMER_BASE_URL}/health` | 1. Restart Kaggle notebook using cached private Dataset (`llama-server` + GGUF) 2. Restart tunnel 3. Update `GLIMMER_BASE_URL` in `.env.local` | Dev Ejay |
| **RB-02** | Hosted Vercel route times out waiting for 2x T4 response | Serverless function execution limit is shorter than 30B vision inference on T4 (`S-01` §4, §8) | Check `pages.latency_ms` | 1. Ensure `sharp` pre-crops/resizes image (`src/lib/image.ts`), reasoning is set to low, and `--ctx-size 32768` is set 2. Run `npm run dev` locally against the Kaggle tunnel for evaluation and demo recording | Dev Ejay |
| **RB-03** | Tool-call JSON parsing fails after switching from auxiliary `MODEL_PROVIDER=gemini` backup to canonical `glimmer` | Prompt or tool-call format difference between Gemini and `llama-server --jinja` (`S-01` §4, §8) | Inspect Zod `VALIDATION_ERROR` details | Ensure `llama-server` is started with `--jinja`, test tool call directly against Glimmer, and adjust `src/lib/prompts/` for Glimmer | Dev Ejay |

| Date | Incident | Severity | Root cause | Actions | Status |
|---|---|---|---|---|---|
| — | None recorded | — | — | — | — |

---

## 9. Production-Readiness Checklist

Each row remains ⬜ because Talaan is in hackathon `Build` stage:

| Capability | Status | Evidence |
|---|:---:|---|
| Monitoring and alerting | ⬜ | — |
| Tested backup restore | ⬜ | — |
| Tested rollback | ⬜ | — |
| Incident ownership assigned | ✅ | Dev Ejay (§7) |
| Security reviews done ([`security.md`](security.md) §9) | ⬜ | — |
| Load and capacity characterized (30+ page Glimmer eval `TAL-07`) | ⬜ | — |
| Legal and privacy review done | ⬜ | — |
| Release check passes (`npm run lint && npx tsc --noEmit && npm test`) | 🟡 | Lint & type-check pass on scaffold; unit tests pending `TAL-04` |

---

## Self-Check

- [x] Non-existent production operations are stated honestly as non-existent
- [x] Kaggle tunnel and 2x T4 timeout risks from `S-01` §4 & §8 have concrete runbooks (`RB-01` to `RB-03`)
- [x] Zero secret values appear in this document
