import { toCentavos, toPesos } from "./math";

export interface OverdueCustomerCandidate {
  id: string;
  name: string;
  balance: number;
  credit_limit?: number | null;
  last_activity_at?: string | null;
}

export interface OverdueCustomerItem {
  id: string;
  name: string;
  balance: number;
  balance_formatted: string;
  balance_centavos: number;
  days_inactive: number;
  credit_limit: number;
  reason: string;
}

export interface OverdueSummary {
  overdue_customers: OverdueCustomerItem[];
  total_overdue: number;
  total_overdue_formatted: string;
  total_overdue_centavos: number;
  overdue_count: number;
}

export interface FindOverdueOptions {
  minDays?: number;
  limit?: number;
  referenceDate?: Date;
}

/**
 * Deterministically filters and ranks overdue customers based on:
 * 1. balance > 0
 * 2. days_inactive >= minDays (default 7) OR balance > credit_limit (default 500)
 */
export function findOverdueCustomers(
  candidates: OverdueCustomerCandidate[],
  options: FindOverdueOptions = {}
): OverdueSummary {
  const minDays = options.minDays ?? 7;
  const limit = options.limit ?? 5;
  const now = options.referenceDate ?? new Date();

  const overdueList: OverdueCustomerItem[] = [];
  let totalCentavos = 0;

  for (const c of candidates) {
    if (c.balance <= 0) continue;

    const limitVal = c.credit_limit ?? 500;
    let daysInactive = 0;
    if (c.last_activity_at) {
      const lastAct = new Date(c.last_activity_at).getTime();
      const diffMs = now.getTime() - lastAct;
      daysInactive = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    const isInactive = daysInactive >= minDays;
    const isOverLimit = c.balance > limitVal;

    if (isInactive || isOverLimit) {
      const centavos = toCentavos(c.balance);
      totalCentavos += centavos;

      const reasons: string[] = [];
      if (isOverLimit) {
        reasons.push(`Lumagpas sa ₱${limitVal.toFixed(2)} credit limit`);
      }
      if (isInactive) {
        reasons.push(`Nakalipas na ${daysInactive} araw mula huling transaksyon (inactive)`);
      }

      overdueList.push({
        id: c.id,
        name: c.name,
        balance: c.balance,
        balance_formatted: `₱${c.balance.toFixed(2)}`,
        balance_centavos: centavos,
        days_inactive: daysInactive,
        credit_limit: limitVal,
        reason: reasons.join(" at "),
      });
    }
  }

  // Sort descending by balance
  overdueList.sort((a, b) => b.balance - a.balance);

  const sliced = overdueList.slice(0, limit);
  const totalPesos = toPesos(totalCentavos);

  return {
    overdue_customers: sliced,
    total_overdue: totalPesos,
    total_overdue_formatted: `₱${totalPesos.toFixed(2)}`,
    total_overdue_centavos: totalCentavos,
    overdue_count: overdueList.length,
  };
}

