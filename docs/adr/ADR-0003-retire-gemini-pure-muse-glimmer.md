# ADR-0003: Pure Meta Muse Glimmer 30B Open-Weights Execution (Retiring Gemini)

| Field | Value |
|---|---|
| Status | Accepted |
| Date | 2026-11-02 |
| Deciders | Dev Ejay |
| Answers | `foundation.md` §14 Q6 |
| Supersedes | `ADR-0002` (Dual Model Provider Switch) |
| Affects | `foundation.md`, `sad.md`, `sdd.md`, `modules/ai-component.md`, `build.md`, `ops.md`, `evidence.md`, `src/lib/model.ts` |

## Context

In `ADR-0002`, Talaan implemented a dual-model switch (`MODEL_PROVIDER=glimmer|gemini`) to conserve Kaggle GPU hours during early frontend scaffolding. With the arrival of live NVIDIA NIM and Kaggle endpoints for **Meta Muse Glimmer 30B** (`meta/muse-glimmer-30b`), inference was verified end-to-end on real sari-sari store notebook images. 

Maintaining dual providers introduced schema drift risks between Gemini function calling and Glimmer's native vision tool-calling templates (`extract_rows`), created prompt divergence, and conflicted with the hackathon objective of building natively on Meta's open-weights models (`S-01` §4, §9).

## Decision drivers

- **Meta Hackathon Alignment:** Complete fidelity to Meta's open-weights ecosystem by running exclusively on Meta Muse Glimmer 30B.
- **Architectural Simplicity & Anti-Bloat (`ponytail`):** Removing branching logic, duplicate environment variables, and fallback complexity from `src/lib/model.ts`.
- **Zero Schema Drift:** Ensuring prompts and tool definitions are tuned and verified against one single multimodal vision engine.
- **Vercel Deployment Security:** Clean, production-safe error masking on missing environment credentials.

## Options considered

| Option | Pros | Cons | Evidence |
|---|---|---|---|
| A. Pure Meta Muse Glimmer 30B (Retire Gemini) | Zero drift, 100% hackathon compliance, simpler codebase, fail-closed security | Requires live Glimmer endpoint for extraction | Verified live on NVIDIA NIM (`meta/muse-glimmer-30b`) |
| B. Retain Gemini as silent offline fallback | Allows offline prototyping without network | Violates single-model compliance; masks Glimmer failures; prompt divergence | `S-01` §4, §9 |
| C. Do nothing (Keep `MODEL_PROVIDER` switch) | Familiar configuration | Ongoing maintenance burden of two parallel providers; dead code | `ADR-0002` |

## Decision

We will completely retire Gemini across all source code, evaluation runners, scripts, and project documentation. Talaan will operate **100% exclusively on Meta Muse Glimmer 30B** (`meta/muse-glimmer-30b`).

Key implementation rules:
1. **Single Client:** `src/lib/model.ts` configures a single `OpenAI` client pointing to `GLIMMER_BASE_URL` and `GLIMMER_API_KEY`.
2. **Environment Variable Removal:** Delete `MODEL_PROVIDER`, `GEMINI_BASE_URL`, `GEMINI_API_KEY`, and `GEMINI_MODEL` from all `.env` files and documentation.
3. **Model Provenance:** Persist `process.env.GLIMMER_MODEL || "meta/muse-glimmer-30b"` directly into the `pages.model` column for evaluation traceability.
4. **Fail-Closed Vercel Error:** If `GLIMMER_BASE_URL` or `GLIMMER_API_KEY` is missing or unreachable, throw a vague, production-safe error: `"The Model is currently unavailable, please try again later."`

## Consequences

- **Positive:** Guaranteed compliance with Meta Global AI Developer Hackathon criteria; eliminated all risk of submitting or presenting non-Meta model outputs; simplified backend codebase to a single client path.
- **Negative / accepted trade-off:** Extraction features require active Glimmer endpoint connectivity; offline extraction without GPU/API credentials fails closed.
- **Follow-up work:** Execute 30+ page evaluation strictly on Meta Muse Glimmer 30B (`TAL-07`).

## Rejected options — do not re-propose without new evidence

- **Multi-provider fallbacks:** Rejected because silent fallbacks can cause unverified non-Meta outputs to be evaluated or presented as Meta model results.
- **Verbose client-facing API errors:** Rejected to prevent internal credential configuration details from leaking in hosted non-production/Vercel environments.

## Verification

- `grep -rn -i "gemini" src/` returns 0 matches.
- All 19 test suites in `npm test` pass.
- Live notebook extraction successfully calls `meta/muse-glimmer-30b`.

