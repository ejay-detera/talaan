import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ExtractionResponse, ReviewEntry, ReviewCustomerCandidate } from "@/types/ledger";
import { findMatchingCustomer } from "@/lib/ledger/match";
import { computeCustomerBalance } from "@/lib/ledger/math";

export async function persistExtraction(
  supabase: SupabaseClient<Database>,
  storeId: string,
  result: ExtractionResponse,
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const pageId = crypto.randomUUID();
  const ext = mimeType.includes("jpeg") || mimeType.includes("jpg") ? "jpg" : "png";
  const imagePath = `${storeId}/${pageId}.${ext}`;

  // 1. Upload normalized image to private storage bucket
  const { error: uploadError } = await supabase.storage
    .from("notebook-pages")
    .upload(imagePath, imageBuffer, { contentType: mimeType, upsert: true });

  if (uploadError) {
    throw new Error(`Failed to upload notebook page image: ${uploadError.message}`);
  }

  // 2. Handle retake_requested state
  if (result.status === "retake_requested") {
    const { error: pageError } = await supabase.from("pages").insert({
      id: pageId,
      store_id: storeId,
      image_path: imagePath,
      status: "retake_requested",
      retake_reason: result.reason,
      model: result.model,
      latency_ms: result.latency_ms,
    });

    if (pageError) {
      throw new Error(`Failed to record retake page: ${pageError.message}`);
    }

    return pageId;
  }

  // 3. Handle needs_review state
  const { error: pageError } = await supabase.from("pages").insert({
    id: pageId,
    store_id: storeId,
    image_path: imagePath,
    page_date: result.page_date || new Date().toISOString().split("T")[0],
    written_total: result.written_total ?? null,
    computed_total: result.computed_total,
    has_page_discrepancy: result.has_page_discrepancy,
    status: "needs_review",
    model: result.model,
    latency_ms: result.latency_ms,
  });

  if (pageError) {
    throw new Error(`Failed to insert review page: ${pageError.message}`);
  }

  // 4. Fetch store's customer candidates for auto-matching
  const { data: storeCustomers } = await supabase
    .from("customers")
    .select("id, name")
    .eq("store_id", storeId);

  const customerCandidates = storeCustomers || [];

  // 5. Bulk insert extracted row entries (staged, unconfirmed)
  if (result.rows && result.rows.length > 0) {
    const entriesToInsert = result.rows.map((row) => {
      const match = findMatchingCustomer(row.customer, customerCandidates);
      return {
        page_id: pageId,
        store_id: storeId,
        customer_id: match ? match.id : null,
        extracted_customer_name: row.customer,
        item: row.item,
        quantity: row.quantity ?? null,
        unit_price: row.unit_price ?? null,
        amount: row.amount,
        entry_type: row.entry_type,
        confidence: row.confidence,
        needs_review: row.needs_review,
        line_discrepancy: row.line_discrepancy,
        confirmed_by_user: false,
      };
    });

    const { error: entriesError } = await supabase.from("entries").insert(entriesToInsert);
    if (entriesError) {
      throw new Error(`Failed to insert page entries: ${entriesError.message}`);
    }
  }

  return pageId;
}

export async function getReviewPage(
  supabase: SupabaseClient<Database>,
  pageId: string
) {
  // Parallel fetch: page metadata and entries
  const [pageRes, entriesRes] = await Promise.all([
    supabase.from("pages").select("*").eq("id", pageId).single(),
    supabase
      .from("entries")
      .select("*")
      .eq("page_id", pageId)
      .order("created_at", { ascending: true }),
  ]);

  if (pageRes.error || !pageRes.data) {
    return null;
  }

  const page = pageRes.data;

  // Fetch store customers, confirmed entries, and signed URL in parallel
  const [customersRes, confirmedEntriesRes, signedUrlRes] = await Promise.all([
    supabase
      .from("customers")
      .select("id, name, credit_limit")
      .eq("store_id", page.store_id)
      .order("name", { ascending: true }),
    supabase
      .from("entries")
      .select("id, customer_id, amount, entry_type, created_at, confirmed_by_user")
      .eq("confirmed_by_user", true)
      .not("customer_id", "is", null),
    supabase.storage
      .from("notebook-pages")
      .createSignedUrl(page.image_path, 3600), // 1 hour expiry
  ]);

  const rawCustomers = customersRes.data || [];
  const rawConfirmed = confirmedEntriesRes.data || [];

  const entriesByCustomer = new Map<string, typeof rawConfirmed>();
  for (const entry of rawConfirmed) {
    if (!entry.customer_id) continue;
    const list = entriesByCustomer.get(entry.customer_id) || [];
    list.push(entry);
    entriesByCustomer.set(entry.customer_id, list);
  }

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;

  const customers: ReviewCustomerCandidate[] = rawCustomers.map((c) => {
    const custEntries = entriesByCustomer.get(c.id) || [];
    const balanceInfo = computeCustomerBalance(
      custEntries.map((e) => ({
        amount: Number(e.amount),
        entry_type: e.entry_type,
        confirmed_by_user: true,
      }))
    );
    const recentPayments = custEntries
      .filter(
        (e) =>
          e.entry_type === "payment" &&
          e.created_at &&
          new Date(e.created_at).getTime() >= oneDayAgo
      )
      .map((e) => ({
        amount: Number(e.amount),
        created_at: e.created_at,
      }));

    return {
      id: c.id,
      name: c.name,
      credit_limit: c.credit_limit !== null ? Number(c.credit_limit) : 500,
      current_balance: balanceInfo.balance,
      recent_payments: recentPayments,
    };
  });

  const customerMap = new Map(customers.map((c) => [c.id, c.name]));

  const entries: ReviewEntry[] = (entriesRes.data || []).map((e) => ({
    id: e.id,
    customer_id: e.customer_id,
    extracted_customer_name: e.extracted_customer_name,
    customer_name:
      (e.customer_id ? customerMap.get(e.customer_id) : null) ||
      e.extracted_customer_name ||
      "Walang Pangalan",
    item: e.item,
    quantity: e.quantity,
    unit_price: e.unit_price,
    amount: e.amount,
    entry_type: e.entry_type,
    confidence: e.confidence,
    needs_review: e.needs_review,
    line_discrepancy: e.line_discrepancy,
  }));

  return {
    page,
    entries,
    customers,
    imageUrl: signedUrlRes.data?.signedUrl || null,
  };
}

export async function listRecentPages(
  supabase: SupabaseClient<Database>,
  limit = 20
) {
  const { data: pages, error } = await supabase
    .from("pages")
    .select("id, page_date, written_total, computed_total, has_page_discrepancy, status, retake_reason, model, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return pages || [];
}
