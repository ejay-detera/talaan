import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listConfirmedStoreLedgerRows } from "@/services/customers";
import { formatLedgerCsv } from "@/lib/ledger/summary";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error: {
            code: "UNAUTHORIZED",
            message: "Kailangan mag-sign in para i-export ang ledger.",
          },
        },
        { status: 401 }
      );
    }

    const rows = await listConfirmedStoreLedgerRows(supabase);
    const csvContent = formatLedgerCsv(rows);
    const todayStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="talaan-ledger-${todayStr}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Hindi ma-export ang ledger sa ngayon.";
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: msg,
        },
      },
      { status: 500 }
    );
  }
}

