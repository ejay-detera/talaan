import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";

const mockVerifyOtp = vi.fn();
const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      verifyOtp: mockVerifyOtp,
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe("GET /auth/confirm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to login with error when token_hash or type is missing", async () => {
    const req = new NextRequest("http://localhost:3000/auth/confirm");
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=");
  });

  it("redirects to login with error when verifyOtp fails", async () => {
    mockVerifyOtp.mockResolvedValueOnce({
      error: { message: "Token has expired" },
    });

    const req = new NextRequest(
      "http://localhost:3000/auth/confirm?token_hash=bad_hash&type=email"
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/login?error=");
  });

  it("redirects to /dashboard on successful signup confirmation", async () => {
    mockVerifyOtp.mockResolvedValueOnce({ error: null });
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
    });

    const maybeSingleMock = vi.fn().mockResolvedValueOnce({
      data: { id: "store-1" },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: maybeSingleMock,
        }),
      }),
    });

    const req = new NextRequest(
      "http://localhost:3000/auth/confirm?token_hash=valid_hash&type=signup&next=/dashboard"
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard");
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: "signup",
      token_hash: "valid_hash",
    });
  });

  it("redirects to /reset-password on successful recovery link confirmation", async () => {
    mockVerifyOtp.mockResolvedValueOnce({ error: null });

    const req = new NextRequest(
      "http://localhost:3000/auth/confirm?token_hash=valid_hash&type=recovery&next=/reset-password"
    );
    const res = await GET(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/reset-password");
    expect(mockVerifyOtp).toHaveBeenCalledWith({
      type: "recovery",
      token_hash: "valid_hash",
    });
  });
});

