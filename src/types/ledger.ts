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
      status: "retake_requested";
      region?: string;
      reason: string;
      model: string;
      latency_ms: number;
    };
