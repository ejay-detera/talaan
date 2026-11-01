import type { ChatCompletionTool } from "openai/resources/chat/completions";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { listCustomersWithBalances } from "@/services/customers";
import { listRecentPages } from "@/services/pages";
import { findOverdueCustomers } from "@/lib/ledger/overdue";
import { findMatchingCustomer, normalizeCustomerName } from "@/lib/ledger/match";
import { computeLiquidityHealth, type LiquidityEntry } from "@/lib/ledger/liquidity";
import { toCentavos } from "@/lib/ledger/math";
import type { AskResultCards } from "./schemas";

export const ASK_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "list_overdue_customers",
      description: "List customers with unpaid balances who have not transacted recently (>= 7 days) or have exceeded their credit limit.",
      parameters: {
        type: "object",
        properties: {
          min_days: { type: "number", description: "Minimum days inactive (default 7)" },
          limit: { type: "number", description: "Max customers to return (default 5)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_customer_balance",
      description: "Get the current balance and recent transactions for a specific customer by name.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name of the customer, e.g. 'Nanay Cora' or 'Jun'" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_page_discrepancies",
      description: "Check for notebook pages where the computed total does not match the handwritten written total.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", description: "Max pages to inspect (default 5)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_store_summary",
      description: "Get general store health including liquidity ratio (cash vs credit) and total customer debtors.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["week", "month"], description: "Time period (default 'week')" },
        },
        required: [],
      },
    },
  },
];

export interface ToolExecutionContext {
  supabase: SupabaseClient<Database>;
}

export interface ToolExecutionOutput {
  toolName: string;
  result: Record<string, unknown>;
  cards?: AskResultCards;
  allowedAmountsCentavos: number[];
}

export async function executeAskTool(
  toolName: string,
  rawArgs: Record<string, unknown>,
  ctx: ToolExecutionContext
): Promise<ToolExecutionOutput> {
  const allowedAmountsCentavos: number[] = [];

  switch (toolName) {
    case "list_overdue_customers": {
      const minDays = typeof rawArgs.min_days === "number" ? rawArgs.min_days : 7;
      const limit = typeof rawArgs.limit === "number" ? rawArgs.limit : 5;

      const { customers } = await listCustomersWithBalances(ctx.supabase);
      const overdueSummary = findOverdueCustomers(customers, { minDays, limit });

      for (const c of overdueSummary.overdue_customers) {
        allowedAmountsCentavos.push(c.balance_centavos);
      }
      allowedAmountsCentavos.push(overdueSummary.total_overdue_centavos);

      const cards: AskResultCards = {
        overdue_customers: overdueSummary.overdue_customers.map((c) => ({
          id: c.id,
          name: c.name,
          balance: c.balance_formatted,
          balance_num: c.balance,
          days_inactive: c.days_inactive,
          reason: c.reason,
        })),
      };

      return {
        toolName,
        result: {
          overdue_customers: overdueSummary.overdue_customers,
          total_overdue: overdueSummary.total_overdue_formatted,
          total_overdue_centavos: overdueSummary.total_overdue_centavos,
          count: overdueSummary.overdue_count,
        },
        cards,
        allowedAmountsCentavos,
      };
    }

    case "get_customer_balance": {
      const searchName = String(rawArgs.name || "").trim();
      const { customers } = await listCustomersWithBalances(ctx.supabase);

      const matched = findMatchingCustomer(searchName, customers);

      if (!matched) {
        // Check for partial or ambiguous candidates
        const normSearch = normalizeCustomerName(searchName);
        const candidates = customers
          .filter((c) => normalizeCustomerName(c.name).includes(normSearch))
          .map((c) => ({ id: c.id, name: c.name }));

        if (candidates.length > 1) {
          return {
            toolName,
            result: { ambiguous: true, candidates },
            cards: { ambiguous_candidates: candidates },
            allowedAmountsCentavos: [],
          };
        }

        return {
          toolName,
          result: { not_found: true, searched_name: searchName },
          cards: {},
          allowedAmountsCentavos: [],
        };
      }

      const fullCustomer = customers.find((c) => c.id === matched.id);
      const balance = fullCustomer?.balance ?? 0;
      const balanceCentavos = toCentavos(balance);
      allowedAmountsCentavos.push(balanceCentavos);

      // Fetch recent 5 confirmed entries for this customer
      const { data: rawEntries } = await ctx.supabase
        .from("entries")
        .select("id, item, amount, entry_type, created_at")
        .eq("customer_id", matched.id)
        .eq("confirmed_by_user", true)
        .order("created_at", { ascending: false })
        .limit(5);

      const recentEntries = (rawEntries || []).map((e) => {
        const amt = Number(e.amount);
        allowedAmountsCentavos.push(toCentavos(amt));
        return {
          item: e.item,
          amount: `₱${amt.toFixed(2)}`,
          entry_type: e.entry_type,
          date: e.created_at,
        };
      });

      const cards: AskResultCards = {
        customer_balance: {
          id: matched.id,
          name: matched.name,
          balance: `₱${balance.toFixed(2)}`,
          balance_num: balance,
          total_credit: `₱${(fullCustomer?.total_credit ?? 0).toFixed(2)}`,
          total_payment: `₱${(fullCustomer?.total_payment ?? 0).toFixed(2)}`,
          last_activity_at: fullCustomer?.last_activity_at ?? null,
          recent_entries: recentEntries,
        },
      };

      return {
        toolName,
        result: {
          id: matched.id,
          name: matched.name,
          balance: `₱${balance.toFixed(2)}`,
          balance_centavos: balanceCentavos,
          total_credit: `₱${(fullCustomer?.total_credit ?? 0).toFixed(2)}`,
          total_payment: `₱${(fullCustomer?.total_payment ?? 0).toFixed(2)}`,
          last_activity_at: fullCustomer?.last_activity_at,
          recent_entries: recentEntries,
        },
        cards,
        allowedAmountsCentavos,
      };
    }

    case "check_page_discrepancies": {
      const limit = typeof rawArgs.limit === "number" ? rawArgs.limit : 5;
      const recentPages = await listRecentPages(ctx.supabase, limit * 2);

      const discrepancyPages = recentPages.filter(
        (p) => p.has_page_discrepancy || (p.written_total !== null && p.written_total !== p.computed_total)
      );

      const cardItems = discrepancyPages.slice(0, limit).map((p) => {
        const written = Number(p.written_total ?? 0);
        const computed = Number(p.computed_total ?? 0);
        const diff = Math.abs(written - computed);

        allowedAmountsCentavos.push(toCentavos(written));
        allowedAmountsCentavos.push(toCentavos(computed));
        allowedAmountsCentavos.push(toCentavos(diff));

        return {
          page_id: p.id,
          page_date: p.page_date,
          written_total: `₱${written.toFixed(2)}`,
          computed_total: `₱${computed.toFixed(2)}`,
          diff: `₱${diff.toFixed(2)}`,
        };
      });

      const cards: AskResultCards = {
        discrepancy_pages: cardItems,
      };

      return {
        toolName,
        result: {
          has_discrepancies: cardItems.length > 0,
          discrepancy_count: cardItems.length,
          pages: cardItems,
        },
        cards,
        allowedAmountsCentavos,
      };
    }

    case "get_store_summary": {
      const [customersRes, entriesRes] = await Promise.all([
        listCustomersWithBalances(ctx.supabase),
        ctx.supabase
          .from("entries")
          .select("id, amount, entry_type, confirmed_by_user, created_at")
          .eq("confirmed_by_user", true)
          .order("created_at", { ascending: false })
          .limit(300),
      ]);

      const liquidityEntries: LiquidityEntry[] = (entriesRes.data || []).map((e) => ({
        id: e.id,
        amount: Number(e.amount),
        entry_type: e.entry_type,
        confirmed_by_user: e.confirmed_by_user,
        created_at: e.created_at,
      }));

      const health = computeLiquidityHealth(liquidityEntries);

      allowedAmountsCentavos.push(toCentavos(health.totalCash));
      allowedAmountsCentavos.push(toCentavos(health.totalCredit));
      allowedAmountsCentavos.push(toCentavos(health.totalVolume));
      allowedAmountsCentavos.push(toCentavos(customersRes.totalStoreUtang));

      const cards: AskResultCards = {
        store_summary: {
          liquidity_status: health.status,
          cash_sales: `₱${health.totalCash.toFixed(2)}`,
          credit_sales: `₱${health.totalCredit.toFixed(2)}`,
          total_volume: `₱${health.totalVolume.toFixed(2)}`,
          debtor_count: customersRes.activeDebtorCount,
        },
      };

      return {
        toolName,
        result: {
          liquidity_status: health.status,
          cash_ratio_pct: health.cashRatioPercent,
          credit_ratio_pct: health.creditRatioPercent,
          cash_volume: `₱${health.totalCash.toFixed(2)}`,
          credit_volume: `₱${health.totalCredit.toFixed(2)}`,
          total_volume: `₱${health.totalVolume.toFixed(2)}`,
          total_customer_utang: `₱${customersRes.totalStoreUtang.toFixed(2)}`,
          active_debtors: customersRes.activeDebtorCount,
        },
        cards,
        allowedAmountsCentavos,
      };
    }

    default:
      return {
        toolName,
        result: { error: `Unknown tool: ${toolName}` },
        allowedAmountsCentavos: [],
      };
  }
}
