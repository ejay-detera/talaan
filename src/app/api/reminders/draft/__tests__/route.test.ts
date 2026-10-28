import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";
import { NextRequest } from "next/server";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockGetModelClient = vi.fn();
const mockCreateChatCompletion = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/model", () => ({
  getModelClient: vi.fn(() => mockGetModelClient()),
}));

describe("POST /api/reminders/draft (API-04 / T-007)", () => {
  const customerId = "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f";

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetModelClient.mockReturnValue({
      client: {
        chat: {
          completions: {
            create: mockCreateChatCompletion,
          },
        },
      },
      model: "muse-glimmer",
      provider: "glimmer",
    });
  });

  it("returns 401 if user is not authenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = new NextRequest("http://localhost/api/reminders/draft", {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId, tone: "friendly" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 422 if payload is invalid", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const req = new NextRequest("http://localhost/api/reminders/draft", {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId, tone: "aggressive" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("returns 404 if customer is not found", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "customers") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValueOnce({ data: null, error: null }),
            }),
          }),
        };
      }
      return {};
    });

    const req = new NextRequest("http://localhost/api/reminders/draft", {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId, tone: "friendly" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);
  });

  it("returns 422 if customer has no outstanding balance (balance <= 0)", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
      error: null,
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "customers") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: customerId, store_id: "s1", name: "Mang Jose" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "entries") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValueOnce({
                  data: [
                    { amount: 50.0, entry_type: "credit", confirmed_by_user: true },
                    { amount: 50.0, entry_type: "payment", confirmed_by_user: true },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const req = new NextRequest("http://localhost/api/reminders/draft", {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId, tone: "friendly" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe("NO_OUTSTANDING_BALANCE");
  });

  it("calls model and saves draft to reminders table on successful tool call", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-123" } },
      error: null,
    });

    const mockInsert = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValueOnce({
          data: {
            id: "rem-1",
            customer_id: customerId,
            tone: "friendly",
            message: "Magandang araw po Aling Nena! Paalala po sa utang na ₱36.00.",
            model: "muse-glimmer",
            created_at: "2026-10-28T12:00:00Z",
          },
          error: null,
        }),
      }),
    });

    mockFrom.mockImplementation((table: string) => {
      if (table === "customers") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValueOnce({
                data: { id: customerId, store_id: "s1", name: "Aling Nena" },
                error: null,
              }),
            }),
          }),
        };
      }
      if (table === "entries") {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValueOnce({
                  data: [
                    { item: "3 Lucky Me", amount: 36.0, entry_type: "credit", confirmed_by_user: true },
                  ],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      if (table === "reminders") {
        return {
          insert: mockInsert,
        };
      }
      return {};
    });

    mockCreateChatCompletion.mockResolvedValueOnce({
      choices: [
        {
          message: {
            tool_calls: [
              {
                id: "tc-1",
                type: "function",
                function: {
                  name: "draft_reminder",
                  arguments: JSON.stringify({
                    message: "Magandang araw po Aling Nena! Paalala po sa utang na ₱36.00.",
                    tone: "friendly",
                  }),
                },
              },
            ],
          },
        },
      ],
    });

    const req = new NextRequest("http://localhost/api/reminders/draft", {
      method: "POST",
      body: JSON.stringify({ customer_id: customerId, tone: "friendly" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reminder.customer_name).toBe("Aling Nena");
    expect(body.reminder.balance).toBe(36.0);
    expect(body.reminder.message).toContain("₱36.00");
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        store_id: "s1",
        customer_id: customerId,
        tone: "friendly",
        model: "muse-glimmer",
      })
    );
  });
});

