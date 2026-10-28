import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

const mockGetUser = vi.fn();
const mockListConfirmedRows = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/services/customers", () => ({
  listConfirmedStoreLedgerRows: vi.fn((...args) => mockListConfirmedRows(...args)),
}));

describe("GET /api/ledger/export (US-08)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const res = await GET();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 200 with text/csv attachment containing confirmed ledger rows", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
      error: null,
    });

    mockListConfirmedRows.mockResolvedValueOnce([
      {
        id: "e1",
        page_id: "p1",
        page_date: "2026-10-27",
        customer_name: "Mang Jose",
        item: "Corned Beef",
        quantity: 2,
        unit_price: 38,
        amount: 76,
        entry_type: "credit",
        confirmed_by_user: true,
      },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("attachment; filename=\"talaan-ledger-");

    const text = await res.text();
    expect(text).toContain("Date,Customer,Item,Type,Quantity,Unit Price,Amount,Page ID");
    expect(text).toContain("2026-10-27,Mang Jose,Corned Beef,credit,2,38.00,76.00,p1");
  });
});

