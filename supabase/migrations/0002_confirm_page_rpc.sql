-- Talaan: Atomic Confirm Page RPC Migration (TAL-05)
-- Compliant with docs/data-model.md, docs/api.md (API-02), and supabase-postgres-best-practices

create or replace function public.confirm_page(
  p_page_id uuid,
  p_payload jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = public, auth, pg_temp
as $$
declare
  v_page public.pages%rowtype;
  v_entry jsonb;
  v_kept_ids uuid[] := array[]::uuid[];
  v_affected_customers uuid[] := array[]::uuid[];
  v_customer_id uuid;
  v_new_entry_id uuid;
  v_new_cust_name text;
  v_norm_cust_name text;
  v_balances jsonb := '[]'::jsonb;
begin
  -- 1. Lock the page row for update to prevent concurrent double-confirmation
  select * into v_page
  from public.pages
  where id = p_page_id
  for update;

  if not found then
    raise exception 'PAGE_NOT_FOUND';
  end if;

  if v_page.status = 'confirmed' then
    raise exception 'ALREADY_CONFIRMED';
  end if;

  -- 2. Process each entry in the human-reviewed payload
  for v_entry in select * from jsonb_array_elements(p_payload->'entries')
  loop
    v_customer_id := null;

    -- Handle new customer creation if specified
    v_new_cust_name := trim(coalesce(v_entry->>'new_customer_name', ''));
    if v_new_cust_name <> '' then
      v_norm_cust_name := lower(regexp_replace(v_new_cust_name, '[.,\-_/]', ' ', 'g'));
      v_norm_cust_name := trim(regexp_replace(v_norm_cust_name, '\s+', ' ', 'g'));

      insert into public.customers (store_id, name, normalized_name)
      values (v_page.store_id, v_new_cust_name, v_norm_cust_name)
      on conflict (store_id, normalized_name) do update
        set name = excluded.name
      returning id into v_customer_id;
    elsif (v_entry->>'customer_id') is not null and (v_entry->>'customer_id') <> '' then
      v_customer_id := (v_entry->>'customer_id')::uuid;
    end if;

    if v_customer_id is not null and not (v_customer_id = any(v_affected_customers)) then
      v_affected_customers := array_append(v_affected_customers, v_customer_id);
    end if;

    -- Update existing entry or insert newly added entry
    if (v_entry->>'id') is not null and (v_entry->>'id') <> '' then
      update public.entries
      set
        customer_id = v_customer_id,
        item = trim(v_entry->>'item'),
        quantity = case when (v_entry->>'quantity') is not null then (v_entry->>'quantity')::numeric else null end,
        unit_price = case when (v_entry->>'unit_price') is not null then (v_entry->>'unit_price')::numeric else null end,
        amount = (v_entry->>'amount')::numeric,
        entry_type = (v_entry->>'entry_type')::text,
        line_discrepancy = coalesce((v_entry->>'line_discrepancy')::boolean, false),
        needs_review = false,
        confirmed_by_user = true
      where id = (v_entry->>'id')::uuid and page_id = p_page_id;

      v_kept_ids := array_append(v_kept_ids, (v_entry->>'id')::uuid);
    else
      insert into public.entries (
        page_id,
        store_id,
        customer_id,
        item,
        quantity,
        unit_price,
        amount,
        entry_type,
        line_discrepancy,
        confidence,
        needs_review,
        confirmed_by_user
      ) values (
        p_page_id,
        v_page.store_id,
        v_customer_id,
        trim(v_entry->>'item'),
        case when (v_entry->>'quantity') is not null then (v_entry->>'quantity')::numeric else null end,
        case when (v_entry->>'unit_price') is not null then (v_entry->>'unit_price')::numeric else null end,
        (v_entry->>'amount')::numeric,
        (v_entry->>'entry_type')::text,
        coalesce((v_entry->>'line_discrepancy')::boolean, false),
        1.00,
        false,
        true
      )
      returning id into v_new_entry_id;

      v_kept_ids := array_append(v_kept_ids, v_new_entry_id);
    end if;
  end loop;

  -- 3. Delete any unkept extracted rows (supporting user-initiated Remove Row)
  delete from public.entries
  where page_id = p_page_id
    and not (id = any(v_kept_ids));

  -- 4. Mark page as confirmed and commit deterministic totals
  update public.pages
  set
    status = 'confirmed',
    computed_total = (p_payload->>'computed_total')::numeric,
    written_total = case when (p_payload->>'written_total') is not null then (p_payload->>'written_total')::numeric else null end,
    has_page_discrepancy = coalesce((p_payload->>'has_page_discrepancy')::boolean, false),
    confirmed_at = now()
  where id = p_page_id;

  -- 5. Calculate updated balances for affected customers
  if array_length(v_affected_customers, 1) > 0 then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'customer_id', bal.customer_id,
          'net_balance', bal.net_balance
        )
      ),
      '[]'::jsonb
    ) into v_balances
    from (
      select
        customer_id,
        coalesce(
          sum(case when entry_type = 'credit' then amount else 0 end) -
          sum(case when entry_type = 'payment' then amount else 0 end),
          0
        ) as net_balance
      from public.entries
      where store_id = v_page.store_id
        and confirmed_by_user = true
        and customer_id is not null
        and customer_id = any(v_affected_customers)
      group by customer_id
    ) bal;
  end if;

  return jsonb_build_object(
    'success', true,
    'page_id', p_page_id,
    'status', 'confirmed',
    'computed_total', (p_payload->>'computed_total')::numeric,
    'balances', v_balances
  );
end;
$$;
