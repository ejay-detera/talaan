import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";

const mockGetUser = vi.fn();
const mockGetCustomerDetail = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/services/customers", () => ({
  getCustomerBalanceDetail: vi.fn((...args) => mockGetCustomerDetail(...args)),
}));

describe("GET /api/customers/[id]/balance (API-03 / T-006)", () => {
  const customerId = "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f";
  const routeParams = Promise.resolve({ id: customerId });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const res = await GET(new Request("http://localhost"), { params: routeParams });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 404 if customer does not exist", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
      error: null,
    });
    mockGetCustomerDetail.mockResolvedValueOnce(null);

    const res = await GET(new Request("http://localhost"), { params: routeParams });
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("returns 200 with customer balance, itemized entries, and latest reminder", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockDetail = {
      customer: {
        id: customerId,
        name: "Aling Nena",
        phone_optional: "09171234567",
      },
      balance: 36.0,
      total_credit: 36.0,
      total_payment: 0,
      entries: [
        {
          id: "e1",
          page_id: "p1",
          page_date: "2026-10-27",
          item: "3 Lucky Me",
          quantity: 3,
          unit_price: 12.0,
          amount: 36.0,
          entry_type: "credit",
          created_at: "2026-10-27T08:00:00Z",
        },
      ],
      latest_reminder: null,
    };
    mockGetCustomerDetail.mockResolvedValueOnce(mockDetail);

    const res = await GET(new Request("http://localhost"), { params: routeParams });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.customer.name).toBe("Aling Nena");
    expect(body.balance).toBe(36.0);
    expect(body.entries.length).toBe(1);
    expect(body.entries[0].item).toBe("3 Lucky Me");
  });
});

