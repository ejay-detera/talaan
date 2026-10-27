# Evidence Registers: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [Grounding protocol](grounding.md) · [ADR index](adr/README.md) · [Glossary](glossary.md)

---

> **Purpose.** The ground truth an agent cites instead of guessing. If a fact, number, name, version, or assumption is not in this file (or in code, or in `foundation.md`), it is **not established**.
>
> **Rules.** Append; do not silently edit history. Retire a claim by moving it to §7. Dates use `YYYY-MM-DD`. The vocabulary is defined in [`grounding.md`](grounding.md) §3.

---

## 1. How to Use

| You need to… | Do this |
|---|---|
| Cite a number | Find or add a row in §3 with a source from §2. No row → write `Not validated` |
| Name an organization | Check §6. Default status is **Prospective target** |
| Rely on a guess | Add it to §4 first so it can be challenged |
| Use a library API | Check §5 for the pinned version and docs URL, then read those docs |
| Re-introduce a removed claim | Check §7 first — it was removed for a reason |

---

## 2. Source Register

| ID | Source | Type | Date | Owner | Location / URL | Supports |
|---|---|---|---|---|---|---|
| S-01 | *Talaan: Notebook-to-Ledger Agent for Sari-Sari Stores* (Project Brief Draft v1) | Brief | 2026-10-27 | Dev Ejay | User prompt / `foundation.md` | Product scope, features, tech stack, evaluation plan, hackathon schedule |
| S-02 | Rest of World — Sari-sari stores and digital tools | Research / Press | 2024 | Rest of World | `restofworld.org/2024/sari-sari-philippines-tech/` | Store count, analog operations, funding access context |
| S-03 | Wikipedia — Sari-sari store | Secondary Reference | 2024–2026 | Wikipedia contributors | `en.wikipedia.org/wiki/Sari-sari_store` | *Utang* notebooks, ~10% markup, DTI digitalization push since June 2024 |
| S-04 | Marketing-Interactive — Packworks data | Press / Company figure | 2024 | Marketing-Interactive | `marketing-interactive.com` | ~23% largest digital player coverage, 1.3M store estimate |
| S-05 | The Ken — Startups and neighborhood stores | Press | 2024 | The Ken | `the-ken.com` | 1.1M store owners, one-person family-run operations |
| S-06 | SMCC Higher Education Research Journal — Nasipit, Agusan del Norte study (n=108) | Academic Study | Cited in `S-01` | SMCC Research Journal | `ejournals.ph/article.php?id=16393` | Majority of surveyed store owners do not formally record accounts |
| S-07 | Barangay Potrero, Malabon Pilot Study | Academic Pilot Study | Cited in `S-01` | Academia.edu | Cited in `S-01` §2, §12 | Lack of record keeping named as a main store survival barrier |
| S-08 | Meta Muse Glimmer 30B Documentation & Model Cards (OpenRouter, DataNorth, RuntimeWire) | Vendor / Model Doc | 2026-10 | Meta / Third-party summaries | Cited in `S-01` §3, §4, §12 | Apache 2.0 license, 30B Q4_K_M (~16.8 GB) + projector (~1.4 GB), 131K context, image+text in / text out, no audio |
| S-09 | Meta Global AI Developer Hackathon Plan (`meta-hackathon-plan.md`) | Competition Brief | 2026-10 | Dev Ejay | Referenced in `S-01` §12 | Hackathon dates (Oct 26 – Nov 4, 2026), judging weights, Kaggle 2x T4 setup, anti-list |
| S-10 | Repository `package.json` & `package-lock.json` | Lockfile / Code | 2026-10-27 | Dev Ejay | `package.json`, `package-lock.json` | Pinned installed versions (`next` 16.4.3, `react` 19.3.0, `tailwindcss` ^4) |

---

## 3. Claims Ledger

Every number, comparison, regulatory statement, and performance figure used anywhere in the suite.

| ID | Claim | Type | Used in | Source | Status | Verified | Re-verify by |
|---|---|---|---|---|---|---|---|
| C-01 | ~1.1M to 1.3M+ sari-sari stores operate in the Philippines, mostly one-person, family-run operations | Number | `foundation.md` §2, `brd.md` §2, `bpd.md` §3 | S-01, S-02, S-04, S-05 | **Validated** (secondary press/company sources; range noted) | 2026-10-27 | 2026-11-05 |
| C-02 | Sari-sari stores handle nearly 70% of manufactured goods sold in the Philippines (company/press figure) | Number | `foundation.md` §2, `brd.md` §2 | S-01, S-04 | **Validated** (press figure cited in brief) | 2026-10-27 | 2026-11-05 |
| C-03 | Largest digital sari-sari store player claims ~23% coverage (implying ~77% not on that digital system) | Number / Comparison | `foundation.md` §2, `bpd.md` §3 | S-01, S-04 | **Validated** (company-claimed figure in press) | 2026-10-27 | 2026-11-05 |
| C-04 | Average sari-sari store markup is approximately 10% | Number | `foundation.md` §2, `brd.md` §2 | S-01, S-03 | **Validated** (cited in `S-01` / `S-03`) | 2026-10-27 | 2026-11-05 |
| C-05 | DTI has pushed digital accounting for sari-sari stores since June 2024 | Regulatory / Policy Context | `foundation.md` §2, §12 | S-01, S-03 | **Validated** (cited in `S-01` / `S-03`) | 2026-10-27 | 2026-11-05 |
| C-06 | Study of 108 sari-sari store owners in Nasipit, Agusan del Norte found most do not formally record accounts | Number | `foundation.md` §2, `brd.md` §2 | S-01, S-06 | **Validated** (small localized sample noted) | 2026-10-27 | 2026-11-05 |
| C-07 | Muse Glimmer 30B 4-bit GGUF (`Q4_K_M`) is ~16.8 GB plus ~1.4 GB vision projector, with 131K context window and Apache 2.0 open weights, fitting 2x T4 GPUs | Technical / Model Spec | `foundation.md` §3, §4, §10, `sad.md` §2 | S-01, S-08 | **Validated** (per `S-01` §4; runtime speed on 2x T4 is **Not validated** until `TAL-03`) | 2026-10-27 | 2026-10-31 |
| C-08 | Illustrative TAM (~₱1.54B / 1.3M stores), SAM (~₱594M / ~500K stores), and SOM (~₱5.9M / ~5K stores) at ₱99/mo (`₱1,188/yr`) | Number (Illustrative) | `bpd.md` §3.1 | S-01 §7 | **Not validated** (relies on unvalidated assumptions `A-02`, `A-03`, `A-04`) | 2026-10-27 | 2026-11-04 |

---

## 4. Assumptions Register

| ID | Assumption | Why assumed | Risk if wrong | Validate by | Owner | Status |
|---|---|---|---|---|---|---|
| A-01 | The main barrier to digital record keeping is that existing apps force store owners to abandon their paper notebook habit | Core product hypothesis (`S-01` §2) | Store owners may still prefer manual typing or no records at all | 2026-11-01 (3–5 store owner interviews) | Dev Ejay | Open |
| A-02 | Store owners on a paid tier would pay ~₱99/month (`₱1,188/year`) for unlimited pages, reminders, and summaries | Illustrative pricing for TAM/SAM/SOM (`S-01` §6, §7) | ~10% store margins may make direct owner subscriptions unviable without B2B partner subsidies | 2026-11-01 (owner interviews) | Dev Ejay | Open |
| A-03 | 50% of non-digitalized sari-sari store owners have a smartphone and willingness to use a photo workflow | Illustrative SAM filter (`S-01` §7) | SAM could be materially smaller or larger | Post-hackathon pilot | Dev Ejay | Open |
| A-04 | Talaan can capture 1% of SAM (~5,000 stores) in Year 1 | Illustrative SOM estimate (`S-01` §7) | Unvalidated commercial projection | Post-hackathon pilot | Dev Ejay | Open |
| A-05 | Muse Glimmer 30B achieves ≥80% row-level extraction accuracy on handwritten Filipino/Taglish notebook pages | Required for core handwriting workflow (`S-01` §3, §8) | High: if <80%, must narrow scope to printed receipts/typed lists or pivot by Day 3 | 2026-10-29 (Day 3 Gate on 10 pages, `TAL-03`) | Dev Ejay | Open |
| A-06 | `llama-server` on a Kaggle 2x T4 notebook can be reliably reached by Next.js via a Cloudflare or ngrok tunnel | Required for Glimmer inference (`S-01` §4, §8) | If tunnel drops or Vercel times out, demo must run `next dev` locally against the tunnel | 2026-10-28 (Day 1–2 Kaggle setup, `TAL-03`) | Dev Ejay | Open |

Rules: an assumption that blocks a P1 story must be validated or escalated before the story closes.

---

## 5. Verified Technical References

Pinned versions come from `package.json` / `package-lock.json` (`S-10`). Planned packages are explicitly marked `Not yet installed` until added to `package.json`.

| Package / Service | Pinned version | Lockfile | Official docs (versioned) | Verified | Version-specific notes |
|---|---|---|---|---|---|
| `next` | `16.4.3` | `package-lock.json` | `https://nextjs.org/docs` | 2026-10-27 | App Router (`src/app/`); async `params`/`searchParams` in Next 15/16 |
| `react` / `react-dom` | `19.3.0` | `package-lock.json` | `https://react.dev` | 2026-10-27 | React 19 hooks & Server Components |
| `tailwindcss` / `@tailwindcss/turbopack` | `^4` | `package-lock.json` | `https://tailwindcss.com/docs` | 2026-10-27 | CSS-first `@import "tailwindcss"` and `@theme inline` in `src/app/globals.css` |
| `typescript` | `^5` | `package-lock.json` | `https://www.typescriptlang.org/docs/` | 2026-10-27 | Strict mode enabled in `tsconfig.json` |
| `eslint` / `eslint-config-next` | `^9` / `16.4.3` | `package-lock.json` | `https://eslint.org/docs/latest/` | 2026-10-27 | Flat config in `eslint.config.mjs` |
| `@supabase/supabase-js` / `@supabase/ssr` | `2.118.0` / `0.12.7` | `package-lock.json` | `https://supabase.com/docs/reference/javascript` | 2026-10-27 | Postgres, Storage, Auth + RLS client & Next.js cookie session handler |
| `openai` | `7.45.0` | `package-lock.json` | `https://github.com/openai/openai-node` | 2026-10-27 | Used in `src/lib/model.ts` for both `llama-server` (Muse Glimmer) and Gemini OpenAI-compatible endpoint |
| `zod` | `4.6.7` | `package-lock.json` | `https://zod.dev` | 2026-10-27 | Schema validation of model tool calls and API inputs |
| `sharp` | `0.35.5` | `package-lock.json` | `https://sharp.pixelplumbing.com` | 2026-10-27 | Server-side image resize, auto-rotate, contrast, crop |
| `vitest` | `5.0.5` | `package-lock.json` | `https://vitest.dev` | 2026-10-27 | Unit test runner for `src/lib/ledger` and evaluation harness |
| Meta Muse Glimmer 30B (`llama.cpp` `llama-server`) | `Q4_K_M` GGUF (`~16.8 GB` + `~1.4 GB` projector) | External (Kaggle 2x T4) | `S-08` | 2026-10-27 | Serve with CUDA arch 75 and `--jinja --api-key` |
| Gemini API (OpenAI-compatible endpoint) | Dev-only (`MODEL_PROVIDER=gemini`) | External API | `https://ai.google.dev/gemini-api/docs/openai` | 2026-10-27 | For fast development testing only; excluded from evals and final demo |

---

## 6. Entity Register

Organizations, agencies, vendors, and competitors named anywhere in the suite.

| Entity | Category | Relationship status | Evidence | Date | Notes |
|---|---|---|---|---|---|
| **Meta** | Hackathon Organizer / Model Creator | **Prospective target** (Competition Host) | `S-01`, `S-08` | 2026-10-27 | Creator of open-weights Muse Glimmer model and host of Meta Global AI Developer Hackathon |
| **Packworks (Sari.PH Pro)** | Competitor | **Prospective target** (Competitor) | `S-01` §6, `S-04` | 2026-10-27 | Named competitor in sari-sari store digitization (~23% claimed coverage); no affiliation |
| **Department of Trade and Industry (DTI)** | Government Agency | **Prospective target** | `S-01` §2, `S-03` | 2026-10-27 | Referenced for June 2024 MSME digital accounting push; no endorsement or partnership |
| **Philippine Sari-Sari Store Owners** | End User Segment | **Prospective target** | `S-01` §2, §11 | 2026-10-27 | 3–5 discovery interviews planned; zero live commercial customers |
| **Cooperatives / Barangay Hubs / LGUs** | Prospective B2B Customer | **Prospective target** | `S-01` §3, §6 | 2026-10-27 | Hypothesis for self-hosted local Glimmer GPU boxes; no agreements |
| **Micro-Lenders / Fintechs / FMCG Distributors** | Prospective Ecosystem Target | **Prospective target** | `S-01` §6 | 2026-10-27 | Hypothesis for consented ledger sharing and restock ordering; no agreements |
| **Supabase / Vercel / Kaggle / Google** | Infrastructure Vendors | **Prospective target** (Standard Developer Tier) | `S-01` §4 | 2026-10-27 | Standard cloud/compute tooling used to build and test the hackathon project |

---

## 7. Retired Claims

Claims removed or prohibited so they are not re-introduced.

| ID | Claim | Removed | Reason | Was used in |
|---|---|---|---|---|
| R-01 | Treating illustrative TAM/SAM/SOM (`₱1.54B / ₱594M / ₱5.9M`) as validated market forecasts | 2026-10-27 | Explicitly labeled illustrative in `S-01` §7 based on unvalidated assumptions `A-02..A-04` | Kept only as labeled illustrative assumptions in `C-08` / `bpd.md` §3.1 |
| R-02 | Presenting Gemini API outputs or benchmarks as Muse Glimmer results | 2026-10-27 | Explicitly prohibited by `S-01` §4 and §9 model policy | Prohibited suite-wide |

---

## Self-Check

- [x] Every number used in the suite has a §3 row or is marked `Not validated` / `TBD`
- [x] Every row in §3 cites a §2 source
- [x] §5 matches `package.json` and marks uninstalled packages as `Not yet installed`
- [x] Every entity in the suite appears in §6 with a status
- [x] Open assumptions that block P1 work (`A-05`, `A-06`) are tracked
