-- Migration 0002: Counter Payments and Customer Credit Limit
-- Supports TAL-10: Direct Counter Payments and Credit Limit Nudge

-- 1. Allow manual counter payments without a photographed page
alter table public.entries alter column page_id drop not null;

-- 2. Add customizable credit limit to customers (default ₱500.00)
alter table public.customers add column if not exists credit_limit numeric(10,2) default 500.00 check (credit_limit is null or credit_limit >= 0);

