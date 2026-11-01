import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../route";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSendCustomerSMS = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

vi.mock("@/lib/sms", () => ({
  sendCustomerSMS: vi.fn((...args) => mockSendCustomerSMS(...args)),
}));

describe("POST /api/reminders/send-sms", () => {
  const validCustomerId = "11111111-1111-1111-1111-111111111111";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 if unauthenticated", async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });

    const req = new Request("http://localhost/api/reminders/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: validCustomerId,
        message: "Paalala sa utang",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 if customer has no phone number", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const maybeSingleMock = vi.fn().mockResolvedValueOnce({
      data: { id: validCustomerId, name: "Nanay Cora", phone_optional: null },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: maybeSingleMock,
        }),
      }),
    });

    const req = new Request("http://localhost/api/reminders/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: validCustomerId,
        message: "Paalala sa utang",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("PHONE_MISSING");
  });

  it("successfully sends SMS when customer has phone number", async () => {
    mockGetUser.mockResolvedValueOnce({
      data: { user: { id: "user-1" } },
      error: null,
    });

    const maybeSingleMock = vi.fn().mockResolvedValueOnce({
      data: { id: validCustomerId, name: "Mang Jose", phone_optional: "09171234567" },
      error: null,
    });

    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          maybeSingle: maybeSingleMock,
        }),
      }),
    });

    mockSendCustomerSMS.mockResolvedValueOnce({
      success: true,
      message: "Message sent successfully",
    });

    const req = new Request("http://localhost/api/reminders/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_id: validCustomerId,
        message: "Paalala sa utang: ₱50.00",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.recipient).toBe("09171234567");
    expect(mockSendCustomerSMS).toHaveBeenCalledWith({
      recipient: "09171234567",
      message: "Paalala sa utang: ₱50.00",
    });
  });
});

