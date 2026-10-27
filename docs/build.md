# Build Guide: Talaan

**Project:** Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores
**Date:** 2026-10-27
**Version:** 1.0
**Owner:** Dev Ejay
**Status:** Active
**Source of truth:** [`foundation.md`](foundation.md)
**Related:** [SAD](sad.md) · [SDD](sdd.md) · [Flow](flow.md) · [Test plan](test-plan.md) · [Ops](ops.md) · [Security](security.md) · [Evidence](evidence.md)

---

> **Source-of-truth rule.** [`foundation.md`](foundation.md) is canonical. Resolve conflicts there first, then propagate.
>
> **As-built.** This file records the real setup, commands, guardrails, and known issues as of `2026-10-27`, clearly distinguishing installed scripts from planned scripts (`TAL-01` to `TAL-07`). See [`grounding.md`](grounding.md).

---

## 1. Prerequisites

Mirrored in [`evidence.md`](evidence.md) §5:

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | `>= 20.x` (`@types/node: ^20` in `package.json`) | Next.js 16 runtime and build tooling |
| **npm** | `>= 10.x` (`package-lock.json` lockfileVersion 3) | Package management |
| **Supabase Project / CLI** | `npx supabase` (⬜ `TAL-01`) | Postgres schema migrations, Auth, RLS, and private Storage bucket |
| **Kaggle Account (Phone Verified)** | GPU T4 × 2 enabled (`S-01` §4, §11) | Running `llama.cpp` `llama-server` with **Meta Muse Glimmer 30B** (`Q4_K_M` GGUF) |
| **Cloudflare Tunnel (`cloudflared`) or `ngrok`** | Latest binary on Kaggle | Exposing Kaggle `llama-server` to Next.js via `GLIMMER_BASE_URL` |

---

## 2. Initial Setup

```bash
git clone <REPO_URL>
cd talaan
npm install
# Create .env.local (git-ignored) with the variables listed in §3
```

---

## 3. Environment Variables

Names and purpose only. **Never commit or paste a real secret value.**

**Client variables** (`.env.local` — bundled into browser code via `NEXT_PUBLIC_*`; never put secrets here):

| Variable | Purpose | Required for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Auth & client initialization (`TAL-01`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous key (enforces Postgres RLS) | Auth & RLS queries (`TAL-01`) |

**Backend server-only variables** (git-ignored `.env.local`):

| Variable | Purpose | Notes |
|---|---|---|
| `MODEL_PROVIDER` | Selects `"glimmer"` (default) or `"gemini"` (local dev testing only) | Must be `"glimmer"` for Day 3 gate, 30+ page evaluation, and final demo (`S-01` §4) |
| `GLIMMER_BASE_URL` | Tunnel URL to Kaggle `llama-server` (e.g., `https://<tunnel>/v1`) | Changes per Kaggle session; keep in `.env.local`, never in code |
| `GLIMMER_API_KEY` | `--api-key` secret configured on Kaggle `llama-server` | Protects public tunnel endpoint (`T-04`) |
| `GEMINI_BASE_URL` | Google Gemini OpenAI-compatible endpoint URL | Used only when `MODEL_PROVIDER=gemini` in local dev |
| `GEMINI_API_KEY` | Google AI Studio key | Used only when `MODEL_PROVIDER=gemini` in local dev |
| `GEMINI_MODEL` | Gemini model name for local dev testing | Used only when `MODEL_PROVIDER=gemini` in local dev |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase privileged key | Used only for local seed scripts or server-side signed storage URLs; never expose to client |

---

## 4. Local Development

```bash
npm run dev
```

Opens [http://localhost:3000](http://localhost:3000).

**Planned database migration & seed commands (`TAL-01`):**

```bash
npx supabase db push      # Apply supabase/migrations/ (⬜ Planned in TAL-01)
npm run seed              # Seed Demo Store ("Aling Nena's Sari-Sari Store") (⬜ Planned in TAL-01)
```

**Every seed script defaults to the local/dev target.** Confirm the target before running.

---

## 5. Running the App & Demo Account

```bash
npm run dev
```

**Demo Store Account (`TAL-01` — ⬜ Planned):**
- Accessible via the 1-tap **"Try Demo Store (Aling Nena's Sari-Sari Store)"** button on `/login`.
- Uses only synthetic or consented/redacted notebook pages (`S-01` §4, §8).

---

## 6. Validation

Run before every completion report (`AGENTS.md` §9):

```bash
npm run lint              # ESLint 9 (currently installed & passing)
npx tsc --noEmit          # TypeScript 5 strict type-check (currently installed & passing)
npm test                  # Vitest unit & contract tests (⬜ Planned in TAL-04)
```

### Definition of Done

- [ ] Every acceptance criterion in [`sprint.md`](sprint.md) is met
- [ ] `npm run lint`, `npx tsc --noEmit`, and `npm test` pass with zero errors and zero new `any`
- [ ] Tests exist per [`test-plan.md`](test-plan.md) §5
- [ ] [`flow.md`](flow.md) status updated in the same change
- [ ] Product-fact changes propagated to [`foundation.md`](foundation.md)
- [ ] New dependencies and versions recorded in [`evidence.md`](evidence.md) §5

---

## 7. External Service Bootstrap (Kaggle `llama-server` for Muse Glimmer — ⬜ `TAL-03`)

Per `S-01` §4 and §8, **Meta Muse Glimmer 30B** runs on a Kaggle notebook with **GPU T4 × 2**:

1. **One-time Kaggle Dataset Cache:** Build `llama.cpp` (`llama-server` with CUDA T4 compute capability `75`) and download **Muse Glimmer 30B Q4_K_M GGUF** (`~16.8 GB`) + vision projector (`~1.4 GB`). Save both into a private Kaggle Dataset so subsequent sessions start without recompiling or re-downloading.
2. **Per-Session Startup:**
   - Start `llama-server` with `--model`, `--mmproj`, `--jinja` (for tool calling), `--ctx-size 32768`, and `--api-key <GLIMMER_API_KEY>`.
   - Start Cloudflare (`cloudflared tunnel --url http://localhost:8080`) or `ngrok` tunnel.
3. **Connect Next.js:** Copy the tunnel URL into `.env.local` as `GLIMMER_BASE_URL` and set `MODEL_PROVIDER=glimmer`.

| Variable set afterward | Where its value comes from |
|---|---|
| `GLIMMER_BASE_URL` | Ephemeral Cloudflare / ngrok tunnel URL printed in the Kaggle notebook |
| `GLIMMER_API_KEY` | Secret token passed to `llama-server --api-key` |

---

## 8. Known Issues and Drift

| # | Issue or doc drift | Impact | Status |
|---|---|---|---|
| 1 | Domain dependencies (`@supabase/supabase-js`, `openai`, `zod`, `sharp`, `vitest`) are not yet installed in `package.json` | Scheduled for installation in `TAL-01`, `TAL-02`, and `TAL-04` | ⚠️ Open |
| 2 | `src/app/globals.css` currently contains default `create-next-app` variables and a dark-mode media query instead of [`dsd.md`](dsd.md) Daylight tokens | Scheduled for replacement in `TAL-05` | ⚠️ Open |
| 3 | Template placeholders (`[PROJECT_NAME]`, etc.) across all 19 `docs/` files | Resolved on `2026-10-27` across full suite | ✅ Resolved 2026-10-27 |

---

## 9. Code Patterns

Reuse before writing. Check `src/lib/`, `src/services/`, `src/hooks/`, `src/types/`, and `src/components/shared/` first.

**Add a feature end to end**
1. Types in `src/types/ledger.ts` and Zod schemas in `src/lib/schemas.ts`.
2. Deterministic business/math logic in `src/lib/ledger/` with Vitest unit tests first (`tdd`).
3. Route Handler in `src/app/api/[domain]/route.ts`; update [`api.md`](api.md).
4. Client service in `src/services/[name]-service.ts` and hook in `src/hooks/use-[name].ts`.
5. Screen shell in `src/app/[route]/page.tsx` composing modular sub-components (`< 150` lines per file).
6. Update [`flow.md`](flow.md) and [`test-plan.md`](test-plan.md) §3.

---

## 10. Scripts

Currently in `package.json`:
```bash
npm run dev      # Start Next.js development server
npm run build    # Production Next.js build
npm run start    # Start built Next.js server
npm run lint     # Run ESLint
```

Planned scripts (`TAL-01`, `TAL-04`, `TAL-07`):
```bash
npm test         # Run Vitest unit and contract tests (⬜ TAL-04)
npm run eval     # Run 30+ page Muse Glimmer evaluation harness (⬜ TAL-07)
```

---

## 11. Build and Deployment

```bash
npm run lint
npx tsc --noEmit
npm run build
```

For the hackathon demo recording, running `npm run dev` locally against the active Kaggle tunnel is the primary recommended path (`S-01` §4, §8) to avoid serverless function timeouts on slow 2x T4 inference.

---

## 12. Safety Rules

Detail in [`security.md`](security.md) and [`modules/payments-ledger.md`](modules/payments-ledger.md):
- **Never present Gemini output as Muse Glimmer output** (`S-01` §4).
- **Never compute arithmetic in the LLM**; all math runs in `src/lib/ledger/` in integer centavos.
- **Never update customer balances without human confirmation** (`confirmed_by_user = true`).
- **Never commit real unredacted customer names, notebook photos, or `.env.local` secrets.**

---

## 13. Hosted Non-Production Environment

No hosted staging or production environment exists as of `2026-10-27`.

| Item | Status | Verified |
|---|---|---|
| Local Next.js Dev Server (`localhost:3000`) | ✅ Exists | 2026-10-27 (`package.json`) |
| Kaggle 2x T4 `llama-server` Tunnel | ⬜ Planned (`TAL-03`) | 2026-10-27 |
| Vercel Preview Deployment | ⬜ Optional / Planned | 2026-10-27 |
| Monitoring and alerting | ❌ Does not exist | 2026-10-27 |
| Production deployment | ❌ Does not exist | 2026-10-27 |

**Pre-demo checklist (`TAL-08`)**
- [ ] Start Kaggle 2x T4 `llama-server` (`muse-glimmer`) and verify tunnel health
- [ ] Confirm `MODEL_PROVIDER=glimmer` in `.env.local` and verify UI badge reads `Muse Glimmer 30B`
- [ ] Sign in via 1-Tap Demo Store on `/login`
- [ ] Upload a messy notebook page with a deliberate addition error, verify the **Two-Ply Proof Bar** and **Red Margin Gutter** highlight the discrepancy, confirm to ledger, and generate a Taglish reminder draft

---

## 14. Git Rules

Inspect freely read-only (`git status`, `git log`, `git diff`). Never commit, amend, or push without explicit permission (`AGENTS.md` §8).

---

## Self-Check

- [x] Installed vs. planned packages and scripts distinguished clearly
- [x] Known issues and open setup items catalogued in §8
- [x] Zero secret values appear in this guide
