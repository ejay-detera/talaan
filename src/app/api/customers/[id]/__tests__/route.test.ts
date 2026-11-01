import { describe, it, expect, vi, beforeEach } from "vitest";
import { PATCH } from "../route";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe("PATCH /api/customers/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = new Request("http://localhost/api/customers/c-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "09171234567" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "c-1" }) });
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 400 for invalid phone number", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const req = new Request("http://localhost/api/customers/c-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "12345" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "c-1" }) });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toContain("Invalid Philippine mobile number");
  });

  it("updates customer phone number successfully", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    // Mock customer query
    const maybeSingleMock = vi.fn().mockResolvedValueOnce({
      data: { id: "c-1", store_id: "s-1", name: "Mang Jose", phone_optional: null },
      error: null,
    });

    // Mock update query
    const singleMock = vi.fn().mockResolvedValueOnce({
      data: { id: "c-1", name: "Mang Jose", phone_optional: "09171234567" },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "customers") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: maybeSingleMock,
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: singleMock,
              }),
            }),
          }),
        };
      }
      return {};
    });

    const req = new Request("http://localhost/api/customers/c-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: "09171234567" }),
    });

    const res = await PATCH(req, { params: Promise.resolve({ id: "c-1" }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.customer.phone_optional).toBe("09171234567");
  });
});

