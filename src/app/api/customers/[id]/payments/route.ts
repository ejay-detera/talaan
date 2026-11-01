import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import {
  recordDirectPayment,
  getCustomerBalanceDetail,
} from "@/services/customers";

const PaymentBodySchema = z.object({
  amount: z.number().positive().max(99999999.99),
  note: z.string().trim().max(100).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const { id } = await params;
  if (!id) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Customer ID is required" } },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Invalid JSON" } },
      { status: 400 }
    );
  }

  const parsed = PaymentBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message || "Invalid input" } },
      { status: 400 }
    );
  }

  try {
    const entry = await recordDirectPayment(supabase, {
      customerId: id,
      amount: parsed.data.amount,
      item: parsed.data.note || "Counter cash payment",
    });

    const detail = await getCustomerBalanceDetail(supabase, id);

    return NextResponse.json({
      success: true,
      entry,
      balance: detail?.balance ?? 0,
      detail,
    });
  } catch (err: unknown) {
    const message = (err as Error)?.message || "Failed to record payment";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 }
    );
  }
}

