import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

const mockGetUser = vi.fn();
const mockRecordDirectPayment = vi.fn();
const mockGetCustomerDetail = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

vi.mock("@/services/customers", () => ({
  recordDirectPayment: vi.fn((...args) => mockRecordDirectPayment(...args)),
  getCustomerBalanceDetail: vi.fn((...args) => mockGetCustomerDetail(...args)),
}));

describe("POST /api/customers/[id]/payments", () => {
  const customerId = "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f";
  const routeParams = Promise.resolve({ id: customerId });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ amount: 50 }),
    });

    const res = await POST(req, { params: routeParams });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid or non-positive amount", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-123" } }, error: null });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ amount: -10 }),
    });

    const res = await POST(req, { params: routeParams });
    expect(res.status).toBe(400);
  });

  it("records payment and returns updated customer balance", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: { id: "user-123" } }, error: null });
    mockRecordDirectPayment.mockResolvedValueOnce({
      id: "entry-payment-1",
      amount: 50,
      entry_type: "payment",
    });
    mockGetCustomerDetail.mockResolvedValueOnce({
      customer: { id: customerId, name: "Nanay Cora", phone_optional: null },
      balance: 0,
      total_credit: 50,
      total_payment: 50,
      entries: [],
      latest_reminder: null,
    });

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({ amount: 50, note: "Cash at counter" }),
    });

    const res = await POST(req, { params: routeParams });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.balance).toBe(0);
    expect(mockRecordDirectPayment).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        customerId,
        amount: 50,
        item: "Cash at counter",
      })
    );
  });
});

