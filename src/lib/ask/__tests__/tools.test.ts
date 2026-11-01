import { describe, it, expect, vi } from "vitest";
import { executeAskTool, type ToolExecutionContext } from "../tools";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

describe("executeAskTool", () => {
  function createMockSupabase(): SupabaseClient<Database> {
    const mockCustomers = [
      {
        id: "c-1",
        store_id: "s-1",
        name: "Nanay Cora",
        phone_optional: "09171234567",
        created_at: "2026-10-20T00:00:00Z",
      },
      {
        id: "c-2",
        store_id: "s-1",
        name: "Kuya Jun",
        phone_optional: null,
        created_at: "2026-10-20T00:00:00Z",
      },
    ];

    const mockEntries = [
      {
        id: "e-1",
        customer_id: "c-1",
        extracted_customer_name: "Nanay Cora",
        item: "Lucky Me",
        amount: 45.0,
        entry_type: "credit",
        confirmed_by_user: true,
        created_at: "2026-10-21T00:00:00Z", // Inactive >= 7 days
      },
      {
        id: "e-2",
        customer_id: "c-2",
        extracted_customer_name: "Kuya Jun",
        item: "Coke Mismo",
        amount: 600.0,
        entry_type: "credit",
        confirmed_by_user: true,
        created_at: "2026-11-01T00:00:00Z", // Over 500 limit
      },
    ];

    const mockPages = [
      {
        id: "p-1",
        page_date: "2026-10-27",
        written_total: 71.0,
        computed_total: 121.0,
        has_page_discrepancy: true,
        status: "confirmed",
        retake_reason: null,
        model: "meta/muse-glimmer-30b",
        created_at: "2026-10-27T10:00:00Z",
      },
      {
        id: "p-2",
        page_date: "2026-10-28",
        written_total: 50.0,
        computed_total: 50.0,
        has_page_discrepancy: false,
        status: "confirmed",
        retake_reason: null,
        model: "meta/muse-glimmer-30b",
        created_at: "2026-10-28T10:00:00Z",
      },
    ];

    function createQueryBuilder(data: unknown) {
      const builder: Record<string, unknown> = {
        data,
        error: null,
      };
      builder.select = vi.fn().mockReturnValue(builder);
      builder.eq = vi.fn().mockReturnValue(builder);
      builder.order = vi.fn().mockReturnValue(builder);
      builder.limit = vi.fn().mockReturnValue(builder);
      builder.then = (resolve: (val: unknown) => unknown, reject?: (err: unknown) => unknown) =>
        Promise.resolve({ data, error: null }).then(resolve, reject);
      return builder;
    }

    const client = {
      from: vi.fn((table: string) => {
        if (table === "customers") return createQueryBuilder(mockCustomers);
        if (table === "entries") return createQueryBuilder(mockEntries);
        if (table === "pages") return createQueryBuilder(mockPages);
        return createQueryBuilder([]);
      }),
    } as unknown as SupabaseClient<Database>;

    return client;
  }

  it("executes list_overdue_customers and populates cards + allowed centavos", async () => {
    const supabase = createMockSupabase();
    const ctx: ToolExecutionContext = { supabase };

    const out = await executeAskTool("list_overdue_customers", { min_days: 7 }, ctx);
    expect(out.toolName).toBe("list_overdue_customers");
    expect(out.cards?.overdue_customers?.length).toBe(2);
    // Kuya Jun (600) and Nanay Cora (45)
    expect(out.cards?.overdue_customers?.[0].name).toBe("Kuya Jun");
    expect(out.allowedAmountsCentavos).toContain(60000);
    expect(out.allowedAmountsCentavos).toContain(4500);
    expect(out.allowedAmountsCentavos).toContain(64500); // Total overdue
  });

  it("executes get_customer_balance with exact customer matching", async () => {
    const supabase = createMockSupabase();
    const ctx: ToolExecutionContext = { supabase };

    const out = await executeAskTool("get_customer_balance", { name: "Cora" }, ctx);
    expect(out.toolName).toBe("get_customer_balance");
    expect(out.cards?.customer_balance?.name).toBe("Nanay Cora");
    expect(out.cards?.customer_balance?.balance).toBe("₱45.00");
    expect(out.allowedAmountsCentavos).toContain(4500);
  });

  it("executes check_page_discrepancies and filters matching pages", async () => {
    const supabase = createMockSupabase();
    const ctx: ToolExecutionContext = { supabase };

    const out = await executeAskTool("check_page_discrepancies", { limit: 5 }, ctx);
    expect(out.toolName).toBe("check_page_discrepancies");
    expect(out.cards?.discrepancy_pages?.length).toBe(1);
    expect(out.cards?.discrepancy_pages?.[0].written_total).toBe("₱71.00");
    expect(out.cards?.discrepancy_pages?.[0].computed_total).toBe("₱121.00");
    expect(out.cards?.discrepancy_pages?.[0].diff).toBe("₱50.00");
    expect(out.allowedAmountsCentavos).toContain(7100);
    expect(out.allowedAmountsCentavos).toContain(12100);
    expect(out.allowedAmountsCentavos).toContain(5000);
  });

  it("executes get_store_summary and calculates liquidity", async () => {
    const supabase = createMockSupabase();
    const ctx: ToolExecutionContext = { supabase };

    const out = await executeAskTool("get_store_summary", { period: "week" }, ctx);
    expect(out.toolName).toBe("get_store_summary");
    expect(out.cards?.store_summary?.debtor_count).toBe(2);
    expect(out.allowedAmountsCentavos.length).toBeGreaterThan(0);
  });
});
