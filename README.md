# Talaan — Notebook-to-Ledger Agent for Sari-Sari Stores

> Turns photos of handwritten *utang* (credit) notebooks into clean, checked digital ledgers using Meta's open-weights **Muse Glimmer 30B** running locally. Store owners keep their physical notebook habit and get verified records.

Built for the **Meta Global AI Developer Hackathon** (Oct 26 – Nov 4, 2026) · **Track:** Indie Developer (*Build for Your World*) · **Developer:** Dev Ejay.

---

## Architecture & How It Works

Talaan splits the agent loop into two deterministic phases:

1. **Prepare Phase (`POST /api/pages/extract`):** Photo upload -> server `sharp` prep -> single vision LLM call (`extract_rows` / `flag_unreadable`) -> Zod validation (`src/lib/schemas.ts`) -> deterministic arithmetic check (`src/lib/ledger`) -> staged in database (`needs_review`).
2. **Confirm Phase (`POST /api/pages/[id]/confirm`):** Store owner inspects Red Margin Gutter & Two-Ply Proof Bar (`Written Total` vs. `Computed Total`), links/creates customers, and confirms -> committed to Supabase Postgres as verified ledger entries.
3. **Act Phase:** Per-customer running balances (`sum(credit) - sum(payment)`) + on-demand Taglish payment reminder drafts (`Malumanay` or `Pormal`) with 1-tap Copy and SMS/Messenger share.

*All arithmetic runs in deterministic TypeScript (`src/lib/ledger`) using integer centavos. The LLM never computes totals.*

---

## AI Model Architecture & Policy

> **Important Note for Hackathon Judges:** **Meta Muse Glimmer 30B is the canonical, primary vision model for Talaan.** All benchmark evaluations, the Day 3 handwriting gate, and the final demonstration run strictly on Muse Glimmer 30B. The Gemini API is strictly an auxiliary developer backup used for offline frontend prototyping when away from GPU compute, and is 100% excluded from all evaluation metrics.

- **Primary & Native Engine:** **Meta Muse Glimmer 30B** (`Q4_K_M` GGUF + vision projector) served via `llama.cpp` `llama-server --jinja` on Kaggle 2x T4 GPU over an authenticated secure tunnel. Mandatory for the Day 3 Handwriting Gate, 30+ page evaluation, and final demonstration.
- **Developer Backup Only:** **Gemini API** (`MODEL_PROVIDER=gemini`) via OpenAI-compatible endpoint, used solely as an offline/backup fallback during rapid UI development when GPU instances are offline.
- **Unified Client:** Single abstraction in `src/lib/model.ts` using the `openai` SDK, with transparent model provenance badging in the UI and exact model logging on every database page record.

---

## Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+
- npm 10+
- Supabase account (Postgres + Storage + Auth)
- Kaggle notebook (2x T4 GPU) for Meta Muse Glimmer 30B (or Gemini API key as developer backup fallback)

### 2. Install & Configure
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd talaan
npm install
```

Create `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>

# Model Provider: "glimmer" (PRIMARY - Canonical Meta Muse Glimmer 30B) | "gemini" (BACKUP - Dev test only)
MODEL_PROVIDER=glimmer

# Meta Muse Glimmer 30B (Primary / Canonical Kaggle 2x T4 tunnel endpoint)
GLIMMER_BASE_URL=https://<your-tunnel-url>/v1
GLIMMER_API_KEY=<your-tunnel-api-key>

# Gemini API (Developer Backup / Fallback only when GPU instance is inactive)
# MODEL_PROVIDER=gemini
# GEMINI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
# GEMINI_API_KEY=<your-gemini-key>
# GEMINI_MODEL=gemini-2.0-flash
```

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### 4. Validation
```bash
npm run lint
npx tsc --noEmit
```

---

## Project Documentation

Complete canonical documentation lives in [`docs/`](docs/):
- [`docs/foundation.md`](docs/foundation.md) — Canonical source of truth
- [`docs/dsd.md`](docs/dsd.md) — Design system ("Resibo Carbon & Counter Slip with Red Margin Gutter")
- [`docs/data-model.md`](docs/data-model.md) — Postgres schema, state machines, and RLS policies
- [`docs/sprint.md`](docs/sprint.md) — Hackathon sprint backlog (`TAL-01` to `TAL-08`)
- [`docs/adr/`](docs/adr/) — Architecture decision records (`ADR-0001`, `ADR-0002`)
