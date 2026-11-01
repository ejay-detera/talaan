import type { OverdueCustomerItem } from "@/lib/ledger/overdue";

/**
 * Deterministic fallback generator.
 * Produces an accurate Taglish synthesis directly from tool output
 * with zero LLM calls and zero possibility of math hallucination.
 */
export function generateFallbackAnswer(
  toolName: string,
  result: Record<string, unknown>
): string {
  switch (toolName) {
    case "list_overdue_customers": {
      const count = Number(result.count ?? 0);
      const totalOverdue = String(result.total_overdue ?? "₱0.00");
      const customers = (result.overdue_customers || []) as OverdueCustomerItem[];

      if (count === 0 || customers.length === 0) {
        return "Wala pong overdue na customer sa talaan sa kasalukuyan.";
      }

      const summaries = customers.map((c) => {
        const reasonDesc =
          c.reason === "credit_limit_exceeded"
            ? `lumagpas sa credit limit`
            : c.reason === "inactive_7_days"
            ? `${c.days_inactive} araw nang walang transaksyon`
            : `${c.days_inactive} araw inactive at lampas sa credit limit`;
        return `${c.name} (${c.balance_formatted}, ${reasonDesc})`;
      });

      return `May ${count} suki na dapat nang singilin: ${summaries.join(
        "; "
      )}. Kabuuang overdue: ${totalOverdue}.`;
    }

    case "get_customer_balance": {
      if (result.ambiguous) {
        const candidates = (result.candidates as { name: string }[]) || [];
        const names = candidates.map((c) => c.name).join(", ");
        return `May ilang suki na tumutugma sa pangalan: ${names}. Paki-klaro po kung sino sa kanila.`;
      }

      if (result.not_found) {
        return `Hindi po nahanap si "${result.searched_name}" sa talaan ng mga customer.`;
      }

      const name = String(result.name ?? "Customer");
      const balance = String(result.balance ?? "₱0.00");
      const totalCredit = String(result.total_credit ?? "₱0.00");
      const totalPayment = String(result.total_payment ?? "₱0.00");

      if (balance === "₱0.00") {
        return `Walang utang si ${name} sa kasalukuyan (₱0.00). Lahat ng kinuha ay bayad na.`;
      }

      return `Ang kasalukuyang balanse o utang ni ${name} ay ${balance}. (Kabuuang kinuha: ${totalCredit}, kabuuang naibayad: ${totalPayment}).`;
    }

    case "check_page_discrepancies": {
      const count = Number(result.discrepancy_count ?? 0);
      const pages = (result.pages as { page_date: string; written_total: string; computed_total: string; diff: string }[]) || [];

      if (!result.has_discrepancies || count === 0) {
        return "Maayos ang mga sinuring pahina. Walang nakitang discrepancy sa pagitan ng nakasulat at kinalkulang total.";
      }

      const pageDetails = pages.map(
        (p) =>
          `Pahina (${p.page_date}): Nakasulat ay ${p.written_total}, pero ang kinalkula ay ${p.computed_total} (may agwat na ${p.diff})`
      );

      return `May ${count} pahina na may discrepancy sa talaan:\n${pageDetails.join("\n")}`;
    }

    case "get_store_summary": {
      const status = String(result.liquidity_status ?? "unknown");
      const statusDesc =
        status === "healthy"
          ? "Maganda ang daloy ng pera (Cash-Heavy)"
          : status === "warning"
          ? "Medyo mataas ang porsyento ng utang (Balanced/Warning)"
          : "Nasa kritikal na antas ang utang kumpara sa cash (Credit-Heavy)";

      const cashVol = String(result.cash_volume ?? "₱0.00");
      const creditVol = String(result.credit_volume ?? "₱0.00");
      const totalVol = String(result.total_volume ?? "₱0.00");
      const totalUtang = String(result.total_customer_utang ?? "₱0.00");
      const debtors = Number(result.active_debtors ?? 0);

      return `Lagom ng Tindahan: ${statusDesc}. Cash benta: ${cashVol}, Utang: ${creditVol}, Kabuuang benta: ${totalVol}. May ${debtors} aktibong may utang na may kabuuang ${totalUtang}.`;
    }

    default:
      return "Natanggap ang impormasyon mula sa talaan.";
  }
}

