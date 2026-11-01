import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { normalizePhilippinePhone } from "@/lib/sms";

const updateCustomerSchema = z.object({
  phone: z.string().trim().nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "Customer ID is required." } },
        { status: 400 }
      );
    }

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
    const parsed = updateCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "BAD_REQUEST",
            message: "Invalid request payload.",
            details: parsed.error.format(),
          },
        },
        { status: 400 }
      );
    }

    const { phone } = parsed.data;
    let formattedPhone: string | null = null;

    if (phone) {
      const normalized = normalizePhilippinePhone(phone);
      if (!normalized) {
        return NextResponse.json(
          {
            error: {
              code: "BAD_REQUEST",
              message:
                "Invalid Philippine mobile number. Use 09XXXXXXXXX or +639XXXXXXXXX.",
            },
          },
          { status: 400 }
        );
      }
      // Store standard 11-digit local mobile or E.164
      formattedPhone = normalized.startsWith("+63")
        ? `0${normalized.slice(3)}`
        : normalized;
    }

    // Verify customer belongs to authenticated user's store
    const { data: customer, error: fetchError } = await supabase
      .from("customers")
      .select("id, store_id, name, phone_optional")
      .eq("id", id)
      .maybeSingle();

    if (fetchError || !customer) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customer not found." } },
        { status: 404 }
      );
    }

    // Update customer phone
    const { data: updatedCustomer, error: updateError } = await supabase
      .from("customers")
      .update({ phone_optional: formattedPhone })
      .eq("id", id)
      .select("id, name, phone_optional")
      .single();

    if (updateError || !updatedCustomer) {
      return NextResponse.json(
        {
          error: {
            code: "UPDATE_FAILED",
            message: updateError?.message || "Failed to update customer phone.",
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: updatedCustomer,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error occurred.";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

