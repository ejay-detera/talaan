import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "../route";
import { NextRequest } from "next/server";

const mockListUsers = vi.fn();
const mockDeleteUser = vi.fn();
const mockFrom = vi.fn();
const mockStorageFrom = vi.fn();

vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: vi.fn(() => ({
    auth: {
      admin: {
        listUsers: mockListUsers,
        deleteUser: mockDeleteUser,
      },
    },
    from: mockFrom,
    storage: {
      from: mockStorageFrom,
    },
  })),
}));

describe("GET /api/cron/cleanup-demo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "super-secret-cron-token";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key-valid";
  });

  it("returns 401 if Authorization header is missing or incorrect", async () => {
    const reqWithoutAuth = new NextRequest("http://localhost/api/cron/cleanup-demo");
    const resWithoutAuth = await GET(reqWithoutAuth);
    expect(resWithoutAuth.status).toBe(401);

    const reqWrongAuth = new NextRequest("http://localhost/api/cron/cleanup-demo", {
      headers: { Authorization: "Bearer wrong-token" },
    });
    const resWrongAuth = await GET(reqWrongAuth);
    expect(resWrongAuth.status).toBe(401);
  });

  it("returns 500 if CRON_SECRET or SUPABASE_SERVICE_ROLE_KEY is not configured", async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    const req = new NextRequest("http://localhost/api/cron/cleanup-demo", {
      headers: { Authorization: "Bearer super-secret-cron-token" },
    });
    const res = await GET(req);
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toContain("Missing required server keys");
  });

  it("successfully cleans up storage and deletes expired anonymous users", async () => {
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    mockListUsers.mockResolvedValueOnce({
      data: {
        users: [
          { id: "anon-1", is_anonymous: true, created_at: eightDaysAgo },
          { id: "regular-user", is_anonymous: false, created_at: eightDaysAgo, email: "demo@talaan.ph" },
        ],
      },
      error: null,
    });

    // Mock store lookup
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValueOnce({
          data: [{ id: "store-anon-1" }],
          error: null,
        }),
      }),
    });

    // Mock storage operations
    const mockList = vi.fn().mockResolvedValueOnce({
      data: [{ name: "page1.jpg" }],
      error: null,
    });
    const mockRemove = vi.fn().mockResolvedValueOnce({
      data: null,
      error: null,
    });
    mockStorageFrom.mockReturnValue({
      list: mockList,
      remove: mockRemove,
    });

    mockDeleteUser.mockResolvedValueOnce({ data: {}, error: null });

    const req = new NextRequest("http://localhost/api/cron/cleanup-demo", {
      headers: { Authorization: "Bearer super-secret-cron-token" },
    });
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.deleted_users).toBe(1);
    expect(mockRemove).toHaveBeenCalledWith(["store-anon-1/page1.jpg"]);
    expect(mockDeleteUser).toHaveBeenCalledWith("anon-1");
  });
});
