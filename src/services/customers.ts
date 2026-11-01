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
      .select("id, customer_id, extracted_customer_name, amount, entry_type, created_at, confirmed_by_user")
      .eq("confirmed_by_user", true),
  ]);

  if (customersRes.error || !customersRes.data) {
    return { customers: [], totalStoreUtang: 0, activeDebtorCount: 0 };
  }

  const rawCustomers = customersRes.data;
  const rawEntries = entriesRes.data || [];

  // 2. Map existing customers by ID and normalized name for robust matching
  const customerIdByNormName = new Map<string, string>();
  for (const c of rawCustomers) {
    const norm = c.name.trim().toLowerCase();
    customerIdByNormName.set(norm, c.id);
  }

  // Group confirmed entries by customer_id (fallback to extracted_customer_name match)
  const entriesByCustomerId = new Map<string, typeof rawEntries>();
  const unlinkedByExtractedName = new Map<string, typeof rawEntries>();

  for (const entry of rawEntries) {
    let targetCustId = entry.customer_id;
    if (!targetCustId && entry.extracted_customer_name) {
      const norm = entry.extracted_customer_name.trim().toLowerCase();
      targetCustId = customerIdByNormName.get(norm) || null;
    }

    if (targetCustId) {
      const list = entriesByCustomerId.get(targetCustId) || [];
      list.push(entry);
      entriesByCustomerId.set(targetCustId, list);
    } else if (entry.extracted_customer_name) {
      const name = entry.extracted_customer_name.trim();
      const list = unlinkedByExtractedName.get(name) || [];
      list.push(entry);
      unlinkedByExtractedName.set(name, list);
    }
  }

  // 3. Compute deterministic balances
  let totalUtangCentavos = 0;
  let activeDebtorCount = 0;

  const customers: CustomerSummary[] = rawCustomers
    .filter((cust) => {
      // Only include customers who have at least one confirmed transaction in the store
      const custEntries = entriesByCustomerId.get(cust.id) || [];
      return custEntries.length > 0;
    })
    .map((cust) => {
      const custEntries = entriesByCustomerId.get(cust.id) || [];
      const balanceInfo = computeCustomerBalance(
        custEntries.map((e) => ({
          amount: Number(e.amount),
          entry_type: e.entry_type,
          confirmed_by_user: true,
        }))
      );

      // Latest activity from confirmed entries
      let lastActivityAt: string | null = null;
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
        credit_limit: (cust as unknown as { credit_limit?: number | null }).credit_limit ?? 500,
        balance: balanceInfo.balance,
        total_credit: balanceInfo.totalCredit,
        total_payment: balanceInfo.totalPayment,
        last_activity_at: lastActivityAt,
      };
    });

  // Synthesize any confirmed ledger entries that have an extracted customer name not yet in customers table
  for (const [name, unlinkedEntries] of unlinkedByExtractedName.entries()) {
    const balanceInfo = computeCustomerBalance(
      unlinkedEntries.map((e) => ({
        amount: Number(e.amount),
        entry_type: e.entry_type,
        confirmed_by_user: true,
      }))
    );

    if (balanceInfo.balance > 0) {
      totalUtangCentavos += toCentavos(balanceInfo.balance);
      activeDebtorCount += 1;
    }

    customers.push({
      id: `synthetic-${name.toLowerCase().replace(/\s+/g, "-")}`,
      store_id: rawCustomers[0]?.store_id || "",
      name,
      phone_optional: null,
      credit_limit: 500,
      balance: balanceInfo.balance,
      total_credit: balanceInfo.totalCredit,
      total_payment: balanceInfo.totalPayment,
      last_activity_at: unlinkedEntries[0]?.created_at || null,
    });
  }

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

/**
 * Records a direct counter payment for a customer without requiring a photographed page.
 */
export async function recordDirectPayment(
  supabase: SupabaseClient<Database>,
  params: {
    customerId: string;
    amount: number;
    item?: string;
  }
) {
  const { data: customer, error: custErr } = await supabase
    .from("customers")
    .select("id, store_id")
    .eq("id", params.customerId)
    .single();

  if (custErr || !customer) {
    throw new Error("Customer not found");
  }

  // Resolve a valid page_id to satisfy foreign key and not-null schema constraints
  let pageId: string | null = null;
  const { data: existingPage } = await supabase
    .from("pages")
    .select("id")
    .eq("store_id", customer.store_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingPage) {
    pageId = existingPage.id;
  } else {
    const today = new Date().toISOString().split("T")[0];
    const { data: newPage } = await supabase
      .from("pages")
      .insert({
        store_id: customer.store_id,
        status: "confirmed",
        page_date: today,
        image_path: "counter/direct-payments",
        written_total: params.amount,
        computed_total: params.amount,
        has_page_discrepancy: false,
        model: "counter-terminal",
      })
      .select("id")
      .single();

    if (newPage) {
      pageId = newPage.id;
    }
  }

  const { data: newEntry, error: insertErr } = await supabase
    .from("entries")
    .insert({
      store_id: customer.store_id,
      customer_id: customer.id,
      page_id: pageId,
      item: params.item || "Counter cash payment",
      amount: params.amount,
      entry_type: "payment",
      confirmed_by_user: true,
      confidence: 1.0,
      line_discrepancy: false,
      needs_review: false,
    })
    .select()
    .single();

  if (insertErr || !newEntry) {
    throw new Error(insertErr?.message || "Failed to record payment");
  }

  return newEntry;
}

/**
 * Updates a customer's custom credit limit.
 */
export async function updateCustomerCreditLimit(
  supabase: SupabaseClient<Database>,
  customerId: string,
  creditLimit: number | null
) {
  const { error } = await supabase
    .from("customers")
    .update({ credit_limit: creditLimit })
    .eq("id", customerId);

  if (error) {
    throw new Error(error.message);
  }
}

