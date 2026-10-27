-- Talaan: Initial Schema Migration (TAL-01)
-- Compliant with docs/data-model.md and supabase-postgres-best-practices

-- 1. STORES TABLE
create table if not exists public.stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_stores_owner_id on public.stores(owner_id);

-- 2. CUSTOMERS TABLE
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  normalized_name text not null,
  phone_optional text,
  created_at timestamptz not null default now(),
  constraint unique_store_customer_normalized unique (store_id, normalized_name)
);

create index if not exists idx_customers_store_id on public.customers(store_id);

-- 3. PAGES TABLE
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  image_path text not null,
  page_date date default current_date,
  written_total numeric(10,2) check (written_total is null or written_total >= 0),
  computed_total numeric(10,2) not null default 0.00 check (computed_total >= 0),
  has_page_discrepancy boolean not null default false,
  status text not null default 'processing' check (status in ('processing', 'needs_review', 'retake_requested', 'confirmed')),
  retake_reason text,
  model text not null default 'muse-glimmer',
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create index if not exists idx_pages_store_id on public.pages(store_id);
create index if not exists idx_pages_status on public.pages(store_id, status);

-- 4. ENTRIES TABLE
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  extracted_customer_name text,
  item text not null check (char_length(trim(item)) > 0),
  quantity numeric(10,2) check (quantity is null or quantity > 0),
  unit_price numeric(10,2) check (unit_price is null or unit_price >= 0),
  amount numeric(10,2) not null check (amount >= 0),
  entry_type text not null default 'credit' check (entry_type in ('credit', 'payment', 'cash_sale')),
  line_discrepancy boolean not null default false,
  confidence numeric(3,2) not null default 1.00 check (confidence >= 0 and confidence <= 1),
  needs_review boolean not null default false,
  confirmed_by_user boolean not null default false,
  created_at timestamptz not null default now(),
  constraint check_confirmed_customer check (
    not confirmed_by_user or entry_type = 'cash_sale' or customer_id is not null
  )
);

create index if not exists idx_entries_page_id on public.entries(page_id);
create index if not exists idx_entries_store_id on public.entries(store_id);
create index if not exists idx_entries_customer_id on public.entries(customer_id);
create index if not exists idx_entries_balance_calc on public.entries(store_id, confirmed_by_user, entry_type);

-- 5. REMINDERS TABLE
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  tone text not null default 'friendly' check (tone in ('friendly', 'firm')),
  message text not null check (char_length(trim(message)) > 0),
  model text not null default 'muse-glimmer',
  created_at timestamptz not null default now()
);

create index if not exists idx_reminders_store_id on public.reminders(store_id);
create index if not exists idx_reminders_customer_id on public.reminders(customer_id);

-- 6. ROW LEVEL SECURITY (RLS)
-- Using cached subquery (select auth.uid()) per supabase-postgres-best-practices

alter table public.stores enable row level security;
alter table public.customers enable row level security;
alter table public.pages enable row level security;
alter table public.entries enable row level security;
alter table public.reminders enable row level security;

-- stores policy
create policy "Owners manage their stores"
  on public.stores
  for all
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- customers policy
create policy "Owners manage store customers"
  on public.customers
  for all
  using (store_id in (select id from public.stores where owner_id = (select auth.uid())))
  with check (store_id in (select id from public.stores where owner_id = (select auth.uid())));

-- pages policy
create policy "Owners manage store pages"
  on public.pages
  for all
  using (store_id in (select id from public.stores where owner_id = (select auth.uid())))
  with check (store_id in (select id from public.stores where owner_id = (select auth.uid())));

-- entries policy
create policy "Owners manage store entries"
  on public.entries
  for all
  using (store_id in (select id from public.stores where owner_id = (select auth.uid())))
  with check (store_id in (select id from public.stores where owner_id = (select auth.uid())));

-- reminders policy
create policy "Owners manage store reminders"
  on public.reminders
  for all
  using (store_id in (select id from public.stores where owner_id = (select auth.uid())))
  with check (store_id in (select id from public.stores where owner_id = (select auth.uid())));

-- 7. STORAGE BUCKET: notebook-pages
insert into storage.buckets (id, name, public)
values ('notebook-pages', 'notebook-pages', false)
on conflict (id) do nothing;

create policy "Owners upload notebook images"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'notebook-pages'
    and (storage.foldername(name))[1] in (
      select id::text from public.stores where owner_id = (select auth.uid())
    )
  );

create policy "Owners read their notebook images"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'notebook-pages'
    and (storage.foldername(name))[1] in (
      select id::text from public.stores where owner_id = (select auth.uid())
    )
  );
