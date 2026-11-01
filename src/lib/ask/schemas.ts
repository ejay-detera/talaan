import { z } from "zod";

export const ListOverdueArgsSchema = z.object({
  min_days: z.number().int().min(1).max(90).optional().default(7),
  limit: z.number().int().min(1).max(20).optional().default(5),
});

export type ListOverdueArgs = z.infer<typeof ListOverdueArgsSchema>;

export const GetCustomerBalanceArgsSchema = z.object({
  name: z.string().min(1).max(100),
});

export type GetCustomerBalanceArgs = z.infer<typeof GetCustomerBalanceArgsSchema>;

export const CheckPageDiscrepanciesArgsSchema = z.object({
  limit: z.number().int().min(1).max(20).optional().default(5),
});

export type CheckPageDiscrepanciesArgs = z.infer<typeof CheckPageDiscrepanciesArgsSchema>;

export const GetStoreSummaryArgsSchema = z.object({
  period: z.enum(["week", "month"]).optional().default("week"),
});

export type GetStoreSummaryArgs = z.infer<typeof GetStoreSummaryArgsSchema>;

/**
 * Structured tool execution result cards emitted to the UI
 */
export interface AskResultCards {
  overdue_customers?: Array<{
    id: string;
    name: string;
    balance: string;
    balance_num: number;
    days_inactive: number;
    reason: string;
  }>;
  customer_balance?: {
    id: string;
    name: string;
    balance: string;
    balance_num: number;
    total_credit: string;
    total_payment: string;
    last_activity_at: string | null;
    recent_entries: Array<{
      item: string;
      amount: string;
      entry_type: string;
      date: string;
    }>;
  };
  ambiguous_candidates?: Array<{
    id: string;
    name: string;
  }>;
  discrepancy_pages?: Array<{
    page_id: string;
    page_number?: number;
    page_date?: string | null;
    written_total: string;
    computed_total: string;
    diff: string;
  }>;
  store_summary?: {
    liquidity_status: string;
    cash_sales: string;
    credit_sales: string;
    total_volume: string;
    debtor_count: number;
  };
}

export const FinalAnswerSchema = z.object({
  answer: z.string().max(600),
  followup_chips: z.array(z.string().max(60)).max(3).default([]),
});

export type FinalAnswer = z.infer<typeof FinalAnswerSchema>;
