# ADR-0003: Atomic Ledger Confirmation via Postgres RPC (`confirm_page`)

**Date:** 2026-10-28
**Status:** Accepted
**Deciders:** Dev Ejay
**Answers:** [`foundation.md`](../foundation.md) §14 `Q1`, `Q2`
**Affects:** [`data-model.md`](../data-model.md), [`api.md`](../api.md), [`sdd.md`](../sdd.md), [`security.md`](../security.md)

---

## Context

Phase 2 confirmation (`POST /api/pages/[id]/confirm`, `API-02`) must perform multiple database operations atomically:
1. Row lock on `pages` to guard against concurrent double-confirmation (`409 ALREADY_CONFIRMED`).
2. Upsert of new customers created during review.
3. Update of confirmed entries with human-approved amounts and customer links.
4. Insertion of user-added entries and deletion of removed entries.
5. Updating page status to `'confirmed'`, committing `computed_total`, and setting `confirmed_at = now()`.

`@supabase/supabase-js` lacks multi-statement transaction support from client-side or route handlers without a dedicated backend database connection pooler. If multiple sequential `.update()` / `.insert()` calls are made from the Node.js Route Handler, a failure midway leaves the database in an inconsistent state (partial entries confirmed while page remains `'needs_review'`).

## Decision

Execute the entire confirmation sequence in a single Postgres stored procedure: `public.confirm_page(p_page_id uuid, p_payload jsonb)` via `supabase.rpc()`.
- **Security:** `security invoker` so Postgres Row Level Security (RLS) policies apply under the authenticated user's session (`stores.owner_id = (select auth.uid())`).
- **Path Isolation:** `set search_path = public, auth, pg_temp` to prevent search path hijacking.
- **Concurrency Control:** `select * from public.pages where id = p_page_id for update;` ensures exactly-once execution.

## Options Rejected

- **Sequential client-side REST calls:** Rejected because network failure midway creates orphaned entries and breaks ledger integrity.
- **Direct connection via `pg` / Prisma in Route Handler:** Rejected because Supabase REST / PostgREST architecture is already deployed, and adding a direct connection increases cold start latency and exposes database connection credentials to serverless functions.

## Consequences

- All customer insertions, entry updates/deletions, and page status changes commit atomically.
- Zero risk of partial confirms or double-tap race conditions.
