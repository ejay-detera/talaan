/**
 * SMS API PH Client Helper
 *
 * Dispatches outgoing SMS notifications via https://smsapiph.onrender.com/api/v1/send/sms
 * using the configured SMS_API_KEY.
 */

export function normalizePhilippinePhone(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, "");

  // Format: 09171234567 -> +639171234567
  if (/^09\d{9}$/.test(cleaned)) {
    return `+63${cleaned.slice(1)}`;
  }

  // Format: 639171234567 -> +639171234567
  if (/^639\d{9}$/.test(cleaned)) {
    return `+${cleaned}`;
  }

  // Format: +639171234567
  if (/^\+639\d{9}$/.test(cleaned)) {
    return cleaned;
  }

  return null;
}

export interface SendSmsParams {
  recipient: string;
  message: string;
}

export interface SendSmsResult {
  success: boolean;
  message?: string;
  error?: string;
}

export async function sendCustomerSMS({
  recipient,
  message,
}: SendSmsParams): Promise<SendSmsResult> {
  const apiKey = process.env.SMS_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "SMS_API_KEY is not configured on the server.",
    };
  }

  const normalizedPhone = normalizePhilippinePhone(recipient);
  if (!normalizedPhone) {
    return {
      success: false,
      error: "Invalid Philippine mobile number format (e.g. 09171234567).",
    };
  }

  const trimmedMessage = message.trim();
  if (!trimmedMessage) {
    return {
      success: false,
      error: "SMS message content cannot be empty.",
    };
  }

  const apiUrl =
    process.env.SMS_API_URL || "https://smsapiph.onrender.com/api/v1/send/sms";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: normalizedPhone,
        message: trimmedMessage,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg =
        data?.message || data?.error || `SMS gateway error: HTTP ${response.status}`;
      return {
        success: false,
        error: errorMsg,
      };
    }

    return {
      success: true,
      message: data?.message || "Message sent successfully",
    };
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      return {
        success: false,
        error: "SMS gateway request timed out. Please retry.",
      };
    }
    const message = err instanceof Error ? err.message : "Failed to connect to SMS gateway";
    return {
      success: false,
      error: message,
    };
  }
}

