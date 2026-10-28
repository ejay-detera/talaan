import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

const mockGetUser = vi.fn();
const mockSignInAnonymously = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
      signInAnonymously: mockSignInAnonymously,
    },
    from: mockFrom,
  })),
}));

describe("POST /api/auth/demo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key-123";
  });

  it("signs in anonymously and seeds store + 4 customers for new visitor", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    mockSignInAnonymously.mockResolvedValueOnce({
      data: { user: { id: "anon-user-1", is_anonymous: true } },
      error: null,
    });

    // Check store exists -> null
    const selectSingleMock = vi.fn().mockResolvedValueOnce({ data: null, error: null });

    // Insert store -> returns store
    const storeInsertSingle = vi.fn().mockResolvedValueOnce({
      data: { id: "store-1", name: "Aling Nena's Sari-Sari Store" },
      error: null,
    });
    const storeInsertSelect = vi.fn().mockReturnValue({ single: storeInsertSingle });
    const storeInsert = vi.fn().mockReturnValue({ select: storeInsertSelect });

    // Insert customers -> success
    const customerInsert = vi.fn().mockResolvedValueOnce({ data: null, error: null });

    mockFrom.mockImplementation((table: string) => {
      if (table === "stores") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: selectSingleMock,
            }),
          }),
          insert: storeInsert,
        };
      }
      if (table === "customers") {
        return {
          insert: customerInsert,
        };
      }
      return {};
    });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSignInAnonymously).toHaveBeenCalled();
    expect(customerInsert).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Mang Jose", normalized_name: "mang jose" }),
        expect.objectContaining({ name: "Kuya Jun", normalized_name: "kuya jun" }),
        expect.objectContaining({ name: "Nanay Cora", normalized_name: "nanay cora" }),
        expect.objectContaining({ name: "Ate Baby", normalized_name: "ate baby" }),
      ])
    );
  });

  it("reuses existing session and does not re-sign-in if user is already authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "existing-user-1" } },
      error: null,
    });

    // Check store exists -> found
    const selectSingleMock = vi.fn().mockResolvedValueOnce({
      data: { id: "store-existing", name: "Aling Nena's Sari-Sari Store" },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "stores") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: selectSingleMock,
            }),
          }),
        };
      }
      return {};
    });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockSignInAnonymously).not.toHaveBeenCalled();
  });

  it("returns 500 when signInAnonymously returns an error", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    mockSignInAnonymously.mockResolvedValueOnce({
      data: { user: null },
      error: { message: "Anonymous sign-ins are disabled" },
    });

    const res = await POST();
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toContain("Anonymous sign-ins are disabled");
  });
});
