# ADR-0002: Dual Model Provider Switch (`glimmer` vs. `gemini`) with Mandatory Glimmer Gate/Eval/Demo Policy

**Date:** 2026-10-27
**Status:** Accepted
**Deciders:** Dev Ejay
**Answers:** [`foundation.md`](../foundation.md) §14 `Q5`
**Affects:** [`foundation.md`](../foundation.md), [`sad.md`](../sad.md), [`sdd.md`](../sdd.md), [`modules/ai-component.md`](../modules/ai-component.md), [`test-plan.md`](../test-plan.md)

---

## Context

**Meta Muse Glimmer 30B** (`Q4_K_M` GGUF served by `llama.cpp` `llama-server --jinja` on Kaggle 2x T4 GPU) is the core model required for the Meta Global AI Developer Hackathon (`S-01` §3, §4). However, Kaggle GPU quota is limited and 2x T4 responses are slower while scaffolding UI and route handlers (`S-01` §4, §8).

## Decision

1. Route every model call through a single module (`src/lib/model.ts`) using the `openai` npm package pointed at either `GLIMMER_BASE_URL` (default: `MODEL_PROVIDER=glimmer`) or `GEMINI_BASE_URL` (`MODEL_PROVIDER=gemini` in local `.env.local` only).
2. Persist `model` (`"muse-glimmer"` or the active Gemini model name) and `latency_ms` on every `pages` record, and render a visible **Model Provenance Badge** in the UI.
3. Enforce a strict boundary (`S-01` §4, §9, `R-02`): **Muse Glimmer (`MODEL_PROVIDER=glimmer`) is mandatory for the Day 3 Handwriting Gate (`TAL-03`), the 30+ page evaluation (`TAL-07`), and the final demo (`TAL-08`).** Never present Gemini test outputs or metrics as Muse Glimmer results.

## Options Rejected

- **Separate SDK clients (`@google/generative-ai` + custom HTTP client):** Rejected (`ponytail`) because Google provides an OpenAI-compatible endpoint, allowing a single `openai` client in `src/lib/model.ts` to serve both providers.
- **Developing exclusively against Kaggle 2x T4 from Day 1:** Rejected because Kaggle weekly GPU quota would be exhausted during routine UI/CRUD debugging.

## Consequences

- Fast local iteration while building UI (`TAL-02`, `TAL-05`, `TAL-06`), combined with verifiable model provenance in the database (`pages.model`) so evaluation scripts (`scripts/eval-glimmer.ts`) filter exclusively for `muse-glimmer`.
- All prompts and tool schemas (`src/lib/prompts/`) must be re-verified on `llama-server --jinja` by Oct 31 (`S-01` §4, §11).
