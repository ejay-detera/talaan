import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

describe("POST /api/pages/[id]/confirm (API-02 / T-005)", () => {
  const pageId = "11111111-2222-3333-4444-555555555555";
  const routeParams = Promise.resolve({ id: pageId });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if user is not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = new NextRequest(`http://localhost/api/pages/${pageId}/confirm`, {
      method: "POST",
      body: JSON.stringify({ entries: [] }),
    });

    const res = await POST(req, { params: routeParams });
    expect(res.status).toBe(401);
  });

  it("returns 404 if page does not exist or belongs to another store", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
        }),
      }),
    });

    const req = new NextRequest(`http://localhost/api/pages/${pageId}/confirm`, {
      method: "POST",
      body: JSON.stringify({
        written_total: 20,
        entries: [
          {
            item: "Item 1",
            amount: 20,
            entry_type: "cash_sale",
          },
        ],
      }),
    });

    const res = await POST(req, { params: routeParams });
    expect(res.status).toBe(404);
  });

  it("returns 409 ALREADY_CONFIRMED if page status is already confirmed", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: { id: pageId, status: "confirmed" },
            error: null,
          }),
        }),
      }),
    });

    const req = new NextRequest(`http://localhost/api/pages/${pageId}/confirm`, {
      method: "POST",
      body: JSON.stringify({
        written_total: 20,
        entries: [
          {
            item: "Item 1",
            amount: 20,
            entry_type: "cash_sale",
          },
        ],
      }),
    });

    const res = await POST(req, { params: routeParams });
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error.code).toBe("ALREADY_CONFIRMED");
  });

  it("returns 422 UNRESOLVED_MISMATCH if an entry has a math error that wasn't approved", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: { id: pageId, status: "needs_review" },
            error: null,
          }),
        }),
      }),
    });

    const req = new NextRequest(`http://localhost/api/pages/${pageId}/confirm`, {
      method: "POST",
      body: JSON.stringify({
        written_total: 46,
        entries: [
          {
            item: "Lucky Me",
            quantity: 3,
            unit_price: 12,
            amount: 46, // Mismatch: 3 * 12 = 36 != 46
            entry_type: "credit",
            customer_id: "c1111111-2222-3333-4444-555555555555",
            accept_written: false,
          },
        ],
      }),
    });

    const res = await POST(req, { params: routeParams });
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("UNRESOLVED_MISMATCH");
  });

  it("returns 200 and calls RPC on valid confirmation", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: { id: pageId, status: "needs_review", store_id: "store-1" },
            error: null,
          }),
        }),
      }),
    });

    mockRpc.mockResolvedValueOnce({
      data: {
        success: true,
        page_id: pageId,
        status: "confirmed",
        computed_total: 36,
        balances: [{ customer_id: "c-1", net_balance: 36 }],
      },
      error: null,
    });

    const req = new NextRequest(`http://localhost/api/pages/${pageId}/confirm`, {
      method: "POST",
      body: JSON.stringify({
        written_total: 36,
        entries: [
          {
            item: "Lucky Me",
            quantity: 3,
            unit_price: 12,
            amount: 36,
            entry_type: "credit",
            customer_id: "c1111111-2222-3333-4444-555555555555",
          },
        ],
      }),
    });

    const res = await POST(req, { params: routeParams });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe("confirmed");
    expect(mockRpc).toHaveBeenCalledWith(
      "confirm_page",
      expect.objectContaining({
        p_page_id: pageId,
      })
    );
  });
});
