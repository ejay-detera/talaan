import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCustomerBalanceDetail } from "@/services/customers";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest | Request, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Customer ID is required" } },
      { status: 400 }
    );
  }

  try {
    const supabase = await createClient();

    // 1. Authenticate store owner
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 }
      );
    }

    // 2. Fetch customer balance detail and itemized confirmed entries
    const detail = await getCustomerBalanceDetail(supabase, id);

    if (!detail) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Customer not found" } },
        { status: 404 }
      );
    }

    return NextResponse.json(detail, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to get customer balance";
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: msg } },
      { status: 500 }
    );
  }
}

