# Module: AI Component

**Activated in** [`foundation.md`](../foundation.md) §0 (Active Modules). Talaan invokes multimodal LLM inference for handwritten notebook extraction (`extract_rows`), unreadable-page detection (`flag_unreadable`), Taglish reminder drafting (`draft_reminder`), and stretch restock suggestions (`restock_list`).

**Source of truth:** [`foundation.md`](../foundation.md) · **Grounding:** [`grounding.md`](../grounding.md)

This module governs AI **inside the product** (`src/lib/model.ts` and `src/lib/prompts/`). Rules for AI **agents building the product** are in [`grounding.md`](../grounding.md) and `AGENTS.md`.

---

> **Important Note for Hackathon Judges:** **Meta Muse Glimmer 30B is the primary and canonical engine of Talaan.** The product is designed natively for open-weights execution on local/cooperative compute via `llama-server`. The Gemini API is strictly an auxiliary developer backup used for offline frontend prototyping when GPU compute is spun down, and is completely excluded from all benchmark metrics, gates, and demonstrations.

## 1. Inventory

| Component | Model / provider | Pinned version | Purpose | Input data | Output used for | Status |
|---|---|---|---|---|---|---|
| **Primary Vision & Tool Agent** | **Meta Muse Glimmer 30B** via `llama.cpp` `llama-server` (`--jinja`, CUDA T4 arch 75) on Kaggle 2x T4 GPU | `Q4_K_M` GGUF (`~16.8 GB` + `~1.4 GB` vision projector; [`evidence.md`](../evidence.md) §5) | `extract_rows`, `flag_unreadable`, `draft_reminder`, `restock_list` | Pre-processed notebook/receipt image (`sharp`) or confirmed customer debt items | Staged ledger rows (`needs_review`) and Taglish reminder drafts | ⬜ Planned (`TAL-02`, `TAL-03`) |
| **Auxiliary Dev Backup Only** | **Gemini API** (OpenAI-compatible endpoint via `MODEL_PROVIDER=gemini`) | Configured via `GEMINI_MODEL` in `.env.local` ([`evidence.md`](../evidence.md) §5) | Developer backup fallback for rapid offline UI iteration (**never used for Day 3 gate, evaluation, or final demo**) | Synthetic / consented test images and test prompts | Development debugging only (100% excluded from eval metrics via `pages.model` column) | ⬜ Planned (`TAL-02`) |

### Unified Client Rule (`src/lib/model.ts`)
- Every model call goes through `src/lib/model.ts` using the `openai` npm package.
- Default `MODEL_PROVIDER` is `"glimmer"` (Meta Muse Glimmer 30B).
- Every extraction writes the active `modelName` (`"muse-glimmer"` or `process.env.GEMINI_MODEL`) and `latency_ms` into the `pages` table.
- The UI renders a visible **Model Provenance Badge** showing which model produced the current page extraction.

---

## 2. Rules

1. **Human in the loop before any ledger write.** The model never writes directly to confirmed customer balances. `POST /api/pages/extract` stages unconfirmed rows (`confirmed_by_user = false`, `pages.status = 'needs_review'`). Only an explicit human confirmation (`POST /api/pages/[id]/confirm`) transitions rows to `confirmed_by_user = true`.
2. **Zero LLM arithmetic.** The model extracts numbers written on the page (`quantity`, `unit_price`, `amount`, `written_total`), but **all** multiplication, addition, discrepancy detection (`find_discrepancies`), and balance computation (`get_balance`) happen deterministically in TypeScript (`src/lib/ledger/`) and Postgres SQL.
3. **Validate output with Zod.** Parse every tool-call argument and JSON response against `src/lib/schemas.ts` (`PageExtractionSchema`, `RetakeRequestSchema`, `ReminderDraftSchema`). Reject and return a structured error on schema failure. Never render model output unescaped.
4. **Flag uncertainty instead of guessing.** Rows with `confidence < 0.80` or row-level math errors (`quantity * unit_price !== amount`) automatically set `needs_review = true`. When a page or region cannot be read, the agent invokes `flag_unreadable(region, reason)` rather than hallucinating entries.
5. **No unnecessary personal data to third-party clouds.** Demo, repo, and evaluation datasets use only consented, redacted, or synthetic notebook pages (`S-01` §4, §8). In production/cooperative deployments, Muse Glimmer runs locally on open weights.
6. **Treat handwritten and user text as untrusted.** Handwritten text inside notebook photos could contain prompt-injection strings. Because Talaan uses the **Two-Phase Split** (single extraction call returning a strict Zod-validated JSON schema, with no autonomous database-mutating tool execution), handwritten text cannot trigger unauthorized DB writes ([`security.md`](../security.md) §4 `T-03`).
7. **Version prompts.** System prompts and tool definitions live in `src/lib/prompts/`, reviewed and versioned like code. Always re-test prompts and tool schemas on Muse Glimmer after iterating on Gemini (`S-01` §4).
8. **Disclose AI generation and active model.** Display the active model badge (`Muse Glimmer 30B` vs. `Gemini Dev`) on the Review and Reminder screens, and clearly label drafted Taglish reminders as AI drafts for owner review.
9. **No invented performance.** Accuracy and latency figures remain `Not measured` until the Day 3 Gate (`TAL-03`) and the 30+ page Muse Glimmer evaluation (`TAL-07`) are executed and recorded in [`evidence.md`](../evidence.md) §3.

---

## 3. Evaluation Plan (Muse Glimmer Only)

Per `S-01` §8 and §9, evaluation runs exclusively on **Muse Glimmer 30B** (`pages.model = 'muse-glimmer'`), excluding any Gemini test runs:

| Metric | Method | Dataset | Target | Baseline | Status |
|---|---|---|---|---|---|
| **Day 3 Handwriting Gate (Row Accuracy)** | Exact row match (`customer`, `item`, `amount`, `entry_type`) on 10 real pages | `eval/gate-10/` (10 pages) | **≥ 80%** (`A-05`) | Not measured | ⬜ (`TAL-03`) |
| **Field-Level Accuracy** | Per-field accuracy (`customer`, `item`, `amount`, `entry_type`) | `eval/pages-30/` (30+ pages) | **TBD** (report actual) | Not measured | ⬜ (`TAL-07`) |
| **Row-Level Accuracy** | All fields in row match ground truth | `eval/pages-30/` (30+ pages) | **TBD** (report actual) | Not measured | ⬜ (`TAL-07`) |
| **Total-Match Rate** | `computed_total === written_total` after human review | `eval/pages-30/` (30+ pages) | **TBD** (report actual) | Not measured | ⬜ (`TAL-07`) |
| **Discrepancy Detection Rate** | True positive rate & false alarm rate on planted arithmetic errors | `eval/pages-30/` (with planted errors) | **100% deterministic math** once numbers extracted | Not measured | ⬜ (`TAL-07`) |
| **Inference Latency (`latency_ms`)** | Seconds per page on Kaggle 2x T4 across reasoning levels | `eval/pages-30/` on 2x T4 | **TBD** (report actual) | Not measured | ⬜ (`TAL-07`) |
| **Review Flag Rate** | Share of rows flagged `needs_review = true` vs. silent errors | `eval/pages-30/` (30+ pages) | **TBD** (report actual) | Not measured | ⬜ (`TAL-07`) |

---

## 4. Failure Modes

| Failure | Detection | Fallback | Owner |
|---|---|---|---|
| **Illegible handwriting / blurry photo** | `flag_unreadable` tool call or low row confidence (`< 0.80`) | Set `pages.status = 'retake_requested'` and prompt owner with specific retake instructions; highlight `needs_review` rows in Red Margin Gutter | Dev Ejay |
| **Handwriting Gate < 80% on Day 3** | Evaluation script on 10 real pages (`TAL-03`) | Narrow input scope to printed supplier receipts and typed lists, or pivot per `S-01` §8 | Dev Ejay |
| **Malformed JSON / tool-call drift between Gemini and Glimmer** | Zod schema validation (`src/lib/schemas.ts`) fails | Return structured `VALIDATION_ERROR`, log raw response in dev, and tune Glimmer `--jinja` prompt template | Dev Ejay |
| **Kaggle 2x T4 timeout or tunnel drop** | Request timeout (`MODEL_TIMEOUT`) or health-check failure on `GLIMMER_BASE_URL` | Keep calls single-turn (low reasoning, 32K context, `sharp`-cropped image); run `next dev` locally against tunnel for demo (`RB-01`, `RB-02`) | Dev Ejay |
| **Prompt injection in notebook image** | Zod schema enforcement + Two-Phase Split | Ignore non-schema instructions; require explicit owner confirmation (`POST /api/pages/[id]/confirm`) | Dev Ejay |

---

## 5. Cost, Latency, Logging

- **Token cost:** Zero marginal per-token cost on self-hosted / Kaggle **Muse Glimmer 30B** (Apache 2.0 open weights).
- **Latency mitigation (`S-01` §8):** Pre-crop and resize images with `sharp`, use low reasoning setting, cap context at 32K for single-page calls, send one image per call, and show an honest progress state (`Reading Page…`) in the UI.
- **Logging:** Log `model` and `latency_ms` on every `pages` record. Never log API keys or unredacted customer PII in console output.

---

## Self-Check

- [x] Every component names a pinned model/provider in [`evidence.md`](../evidence.md) §5
- [x] High-impact outputs have both a deterministic math check (`src/lib/ledger`) and a human confirmation gate
- [x] No unmeasured accuracy or latency claim appears as established
- [x] Prompt injection and tunnel threats are in [`security.md`](../security.md) §4
