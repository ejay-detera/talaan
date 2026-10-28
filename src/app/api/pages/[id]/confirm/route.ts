import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ConfirmPageSchema } from "@/lib/schemas";
import { prepareConfirmation } from "@/lib/ledger/confirm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: { code: "BAD_REQUEST", message: "Page ID is required" } },
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

    // 2. Fetch page row under Postgres RLS
    const { data: page, error: pageError } = await supabase
      .from("pages")
      .select("id, status, store_id")
      .eq("id", id)
      .maybeSingle();

    if (pageError || !page) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Notebook page not found" } },
        { status: 404 }
      );
    }

    // 3. Idempotency guard: reject duplicate confirmation
    if (page.status === "confirmed") {
      return NextResponse.json(
        { error: { code: "ALREADY_CONFIRMED", message: "Page has already been confirmed into the ledger." } },
        { status: 409 }
      );
    }

    // 4. Parse request body and schema validation
    const rawBody = await request.json();
    const parseResult = ConfirmPageSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid confirmation payload",
            details: parseResult.error.flatten(),
          },
        },
        { status: 422 }
      );
    }

    const { written_total, entries } = parseResult.data;

    // 5. Deterministic centavo re-verification in TypeScript
    let prepared;
    try {
      prepared = prepareConfirmation(entries, written_total);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ledger validation failed";
      const code = msg.startsWith("UNRESOLVED_MISMATCH")
        ? "UNRESOLVED_MISMATCH"
        : msg.startsWith("CUSTOMER_REQUIRED")
        ? "CUSTOMER_REQUIRED"
        : "VALIDATION_ERROR";

      return NextResponse.json({ error: { code, message: msg } }, { status: 422 });
    }

    // 6. Execute atomic commit via Postgres RPC
    const { data: rpcResult, error: rpcError } = await supabase.rpc("confirm_page", {
      p_page_id: id,
      p_payload: {
        written_total: written_total ?? null,
        computed_total: prepared.computed_total,
        has_page_discrepancy: prepared.has_page_discrepancy,
        discrepancy_diff: prepared.discrepancy_diff,
        entries: prepared.entries,
      },
    });

    if (rpcError) {
      if (rpcError.message.includes("ALREADY_CONFIRMED")) {
        return NextResponse.json(
          { error: { code: "ALREADY_CONFIRMED", message: "Page has already been confirmed." } },
          { status: 409 }
        );
      }

      return NextResponse.json(
        { error: { code: "SERVER_ERROR", message: rpcError.message } },
        { status: 500 }
      );
    }

    return NextResponse.json(rpcResult, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Confirmation failed";
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message: msg } },
      { status: 500 }
    );
  }
}
