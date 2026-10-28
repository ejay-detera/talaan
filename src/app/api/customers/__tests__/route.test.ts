import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

const mockGetUser = vi.fn();
const mockListCustomers = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/services/customers", () => ({
  listCustomersWithBalances: vi.fn((...args) => mockListCustomers(...args)),
}));

describe("GET /api/customers (API-03 / T-006)", () => {
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

  it("returns 200 with customer balances, total utang, and active debtor count", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockResult = {
      customers: [
        {
          id: "c1",
          store_id: "s1",
          name: "Aling Nena",
          phone_optional: "09171234567",
          balance: 36.0,
          total_credit: 36.0,
          total_payment: 0,
          last_activity_at: "2026-10-27T00:00:00Z",
        },
        {
          id: "c2",
          store_id: "s1",
          name: "Mang Jose",
          phone_optional: null,
          balance: 0,
          total_credit: 50.0,
          total_payment: 50.0,
          last_activity_at: "2026-10-27T01:00:00Z",
        },
      ],
      totalStoreUtang: 36.0,
      activeDebtorCount: 1,
    };

    mockListCustomers.mockResolvedValueOnce(mockResult);

    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.customers.length).toBe(2);
    expect(body.total_store_utang).toBe(36.0);
    expect(body.active_debtor_count).toBe(1);
    expect(body.customers[0].name).toBe("Aling Nena");
  });
});

