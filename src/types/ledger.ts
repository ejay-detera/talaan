export type EntryType = "credit" | "payment" | "cash_sale";

export interface ExtractedRow {
  customer: string;
  item: string;
  quantity?: number;
  unit_price?: number;
  amount: number;
  entry_type: EntryType;
  confidence: number;
  needs_review: boolean;
  line_discrepancy: boolean;
}

export interface ExtractedPageData {
  page_date?: string;
  written_total?: number;
  rows: ExtractedRow[];
  notes?: string[];
}

export interface RetakeRequestData {
  is_unreadable: true;
  region?: string;
  reason: string;
}

export type ExtractionResponse =
  | {
      page_id?: string;
      status: "needs_review";
      page_date?: string;
      written_total?: number;
      computed_total: number;
      has_page_discrepancy: boolean;
      discrepancy_diff: number;
      rows: ExtractedRow[];
      model: string;
      latency_ms: number;
    }
  | {
      page_id?: string;
      status: "retake_requested";
      region?: string;
      reason: string;
      model: string;
      latency_ms: number;
    };

export interface ReviewEntry {
  id?: string;
  customer_id?: string | null;
  extracted_customer_name?: string | null;
  customer_name: string;
  item: string;
  quantity?: number | null;
  unit_price?: number | null;
  amount: number;
  entry_type: EntryType;
  confidence: number;
  needs_review: boolean;
  line_discrepancy: boolean;
  accept_written?: boolean;
}

export interface ConfirmEntryInput {
  id?: string | null;
  customer_id?: string | null;
  new_customer_name?: string | null;
  item: string;
  quantity?: number | null;
  unit_price?: number | null;
  amount: number;
  entry_type: EntryType;
  accept_written?: boolean;
}

export type ReminderTone = "friendly" | "firm";

export interface CustomerSummary {
  id: string;
  store_id: string;
  name: string;
  phone_optional: string | null;
  balance: number;
  total_credit: number;
  total_payment: number;
  last_activity_at: string | null;
}

export interface CustomerLedgerEntry {
  id: string;
  page_id: string;
  page_date: string | null;
  item: string;
  quantity: number | null;
  unit_price: number | null;
  amount: number;
  entry_type: EntryType;
  created_at: string;
}

export interface ReminderDraft {
  id: string;
  customer_id: string;
  tone: ReminderTone;
  message: string;
  model: string;
  created_at: string;
}

export interface CustomerBalanceDetail {
  customer: {
    id: string;
    name: string;
    phone_optional: string | null;
  };
  balance: number;
  total_credit: number;
  total_payment: number;
  entries: CustomerLedgerEntry[];
  latest_reminder: ReminderDraft | null;
}
