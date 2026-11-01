import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { normalizePhilippinePhone, sendCustomerSMS } from "../sms";

describe("normalizePhilippinePhone", () => {
  it("normalizes 11-digit local mobile numbers", () => {
    expect(normalizePhilippinePhone("09171234567")).toBe("+639171234567");
    expect(normalizePhilippinePhone("0918-123-4567")).toBe("+639181234567");
    expect(normalizePhilippinePhone("0922 333 4444")).toBe("+639223334444");
  });

  it("normalizes numbers without plus sign", () => {
    expect(normalizePhilippinePhone("639171234567")).toBe("+639171234567");
  });

  it("keeps valid E.164 numbers unchanged", () => {
    expect(normalizePhilippinePhone("+639171234567")).toBe("+639171234567");
  });

  it("returns null for invalid numbers", () => {
    expect(normalizePhilippinePhone("12345")).toBeNull();
    expect(normalizePhilippinePhone("08171234567")).toBeNull(); // Not starting with 09
    expect(normalizePhilippinePhone("0917123456")).toBeNull(); // 10 digits
    expect(normalizePhilippinePhone("abcdefghijk")).toBeNull();
  });
});

describe("sendCustomerSMS", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    process.env.SMS_API_KEY = "test-sms-key-123";
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns error if SMS_API_KEY is missing", async () => {
    delete process.env.SMS_API_KEY;
    const res = await sendCustomerSMS({
      recipient: "09171234567",
      message: "Test reminder",
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain("SMS_API_KEY is not configured");
  });

  it("returns error if recipient phone is invalid", async () => {
    const res = await sendCustomerSMS({
      recipient: "00000",
      message: "Test reminder",
    });
    expect(res.success).toBe(false);
    expect(res.error).toContain("Invalid Philippine mobile number format");
  });

  it("dispatches SMS successfully when API returns 200", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, message: "Message sent successfully" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const res = await sendCustomerSMS({
      recipient: "09171234567",
      message: "Magandang araw po!",
    });

    expect(res.success).toBe(true);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://smsapiph.onrender.com/api/v1/send/sms",
      expect.objectContaining({
        method: "POST",
        headers: {
          "x-api-key": "test-sms-key-123",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: "+639171234567",
          message: "Magandang araw po!",
        }),
      })
    );
  });

  it("handles gateway error responses", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Invalid API key" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const res = await sendCustomerSMS({
      recipient: "09171234567",
      message: "Magandang araw po!",
    });

    expect(res.success).toBe(false);
    expect(res.error).toBe("Invalid API key");
  });
});
