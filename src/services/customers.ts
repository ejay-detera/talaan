import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type {
  CustomerSummary,
  CustomerBalanceDetail,
  CustomerLedgerEntry,
  ReminderDraft,
} from "@/types/ledger";
import { computeCustomerBalance, toCentavos, toPesos } from "@/lib/ledger/math";

export interface CustomersListResult {
  customers: CustomerSummary[];
  totalStoreUtang: number;
  activeDebtorCount: number;
}

/**
 * Lists all store customers with deterministic balances from confirmed entries.
 */
export async function listCustomersWithBalances(
  supabase: SupabaseClient<Database>
): Promise<CustomersListResult> {
  // 1. Fetch store customers and confirmed entries in parallel
  const [customersRes, entriesRes] = await Promise.all([
    supabase
      .from("customers")
      .select("id, store_id, name, phone_optional, created_at")
      .order("name", { ascending: true }),
    supabase
      .from("entries")
      .select("id, customer_id, amount, entry_type, created_at, confirmed_by_user")
      .eq("confirmed_by_user", true)
      .not("customer_id", "is", null),
  ]);

  if (customersRes.error || !customersRes.data) {
    return { customers: [], totalStoreUtang: 0, activeDebtorCount: 0 };
  }

  const rawCustomers = customersRes.data;
  const rawEntries = entriesRes.data || [];

  // 2. Group confirmed entries by customer_id
  const entriesByCustomer = new Map<string, typeof rawEntries>();
  for (const entry of rawEntries) {
    if (!entry.customer_id) continue;
    const list = entriesByCustomer.get(entry.customer_id) || [];
    list.push(entry);
    entriesByCustomer.set(entry.customer_id, list);
  }

  // 3. Compute deterministic balances
  let totalUtangCentavos = 0;
  let activeDebtorCount = 0;

  const customers: CustomerSummary[] = rawCustomers.map((cust) => {
    const custEntries = entriesByCustomer.get(cust.id) || [];
    const balanceInfo = computeCustomerBalance(
      custEntries.map((e) => ({
        amount: Number(e.amount),
        entry_type: e.entry_type,
        confirmed_by_user: true,
      }))
    );

    // Latest activity from entries or customer creation
    let lastActivityAt: string | null = cust.created_at;
    if (custEntries.length > 0) {
      const sorted = [...custEntries].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      lastActivityAt = sorted[0].created_at;
    }

    if (balanceInfo.balance > 0) {
      totalUtangCentavos += toCentavos(balanceInfo.balance);
      activeDebtorCount += 1;
    }

    return {
      id: cust.id,
      store_id: cust.store_id,
      name: cust.name,
      phone_optional: cust.phone_optional,
      balance: balanceInfo.balance,
      total_credit: balanceInfo.totalCredit,
      total_payment: balanceInfo.totalPayment,
      last_activity_at: lastActivityAt,
    };
  });

  // Sort: active debtors with positive balance first (highest debt first), then zero/negative balance alphabetically
  customers.sort((a, b) => {
    if (a.balance > 0 && b.balance <= 0) return -1;
    if (a.balance <= 0 && b.balance > 0) return 1;
    if (a.balance > 0 && b.balance > 0) return b.balance - a.balance;
    return a.name.localeCompare(b.name);
  });

  return {
    customers,
    totalStoreUtang: toPesos(totalUtangCentavos),
    activeDebtorCount,
  };
}

/**
 * Returns detailed balance, itemized confirmed transactions, and latest reminder draft for a customer.
 */
export async function getCustomerBalanceDetail(
  supabase: SupabaseClient<Database>,
  customerId: string
): Promise<CustomerBalanceDetail | null> {
  const [customerRes, entriesRes, reminderRes] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, phone_optional")
      .eq("id", customerId)
      .maybeSingle(),
    supabase
      .from("entries")
      .select("id, page_id, item, quantity, unit_price, amount, entry_type, created_at, pages(page_date)")
      .eq("customer_id", customerId)
      .eq("confirmed_by_user", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("reminders")
      .select("id, customer_id, tone, message, model, created_at")
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (customerRes.error || !customerRes.data) {
    return null;
  }

  const customer = customerRes.data;
  const rawEntries = entriesRes.data || [];

  const balanceInfo = computeCustomerBalance(
    rawEntries.map((e) => ({
      amount: Number(e.amount),
      entry_type: e.entry_type,
      confirmed_by_user: true,
    }))
  );

  const entries: CustomerLedgerEntry[] = rawEntries.map((e) => {
    // Supabase join on pages
    const pageObj = e.pages as unknown as { page_date: string | null } | null;
    return {
      id: e.id,
      page_id: e.page_id,
      page_date: pageObj?.page_date ?? null,
      item: e.item,
      quantity: e.quantity !== null ? Number(e.quantity) : null,
      unit_price: e.unit_price !== null ? Number(e.unit_price) : null,
      amount: Number(e.amount),
      entry_type: e.entry_type as "credit" | "payment" | "cash_sale",
      created_at: e.created_at,
    };
  });

  let latest_reminder: ReminderDraft | null = null;
  if (reminderRes.data) {
    const r = reminderRes.data;
    latest_reminder = {
      id: r.id,
      customer_id: r.customer_id,
      tone: r.tone as "friendly" | "firm",
      message: r.message,
      model: r.model,
      created_at: r.created_at,
    };
  }

  return {
    customer,
    balance: balanceInfo.balance,
    total_credit: balanceInfo.totalCredit,
    total_payment: balanceInfo.totalPayment,
    entries,
    latest_reminder,
  };
}
import type { SummaryLedgerRow } from "@/lib/ledger/summary";

/**
 * Lists all confirmed ledger entries for the authenticated owner's store,
 * joined with customer name and page date, for summary analytics and CSV export.
 */
export async function listConfirmedStoreLedgerRows(
  supabase: SupabaseClient<Database>
): Promise<SummaryLedgerRow[]> {
  const { data, error } = await supabase
    .from("entries")
    .select(
      "id, page_id, item, quantity, unit_price, amount, entry_type, confirmed_by_user, created_at, customers(name), pages(page_date)"
    )
    .eq("confirmed_by_user", true)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    const custObj = row.customers as unknown as { name: string } | null;
    const pageObj = row.pages as unknown as { page_date: string | null } | null;
    const rawType = row.entry_type;

    return {
      id: row.id,
      page_id: row.page_id,
      page_date: pageObj?.page_date ?? null,
      created_at: row.created_at,
      customer_name: custObj?.name ?? "Suki (Cash)",
      item: row.item,
      quantity: row.quantity !== null ? Number(row.quantity) : null,
      unit_price: row.unit_price !== null ? Number(row.unit_price) : null,
      amount: Number(row.amount),
      entry_type: (rawType === "cash_sale" ? "cash" : rawType) as
        | "credit"
        | "payment"
        | "cash",
      confirmed_by_user: Boolean(row.confirmed_by_user),
    };
  });
}
