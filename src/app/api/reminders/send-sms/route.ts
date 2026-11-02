import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { sendCustomerSMS } from "@/lib/sms";

const sendSmsSchema = z.object({
  customer_id: z.string().min(1, "Customer ID is required."),
  message: z
    .string()
    .trim()
    .min(1, "Message content is required.")
    .max(160, "Message exceeds maximum length of 160 characters."),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required." } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = sendSmsSchema.safeParse(body);

    if (!parsed.success) {
      const firstErrorMessage =
        parsed.error.issues?.[0]?.message || "Invalid request payload.";
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: firstErrorMessage,
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const { customer_id, message } = parsed.data;

    // Fetch customer and verify existence
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("id, name, phone_optional, store_id")
      .eq("id", customer_id)
      .maybeSingle();

    if (fetchError || !customer) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customer not found." } },
        { status: 404 }
      );
    }

    if (!customer.phone_optional) {
      return NextResponse.json(
        {
          error: {
            code: "PHONE_MISSING",
            message: `No mobile phone recorded for ${customer.name}.`,
          },
        },
        { status: 400 }
      );
    }

    // Dispatch SMS via SMS API PH
    const result = await sendCustomerSMS({
      recipient: customer.phone_optional,
      message,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            code: "SMS_GATEWAY_ERROR",
            message: result.error || "Failed to dispatch SMS through gateway.",
          },
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message || "SMS reminder sent successfully.",
      recipient: customer.phone_optional,
      customer_name: customer.name,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error during SMS send.";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}
