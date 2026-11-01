import { toCentavos, toPesos } from "./math";

export type LiquidityPeriod = "7d" | "today";

export type LiquidityRiskStatus = "healthy" | "moderate" | "high_risk";

export interface LiquidityEntry {
  id: string;
  amount: number;
  entry_type: "credit" | "payment" | "cash_sale" | "cash";
  confirmed_by_user?: boolean;
  created_at?: string;
  page_date?: string | null;
}

export interface LiquidityHealthResult {
  period: LiquidityPeriod;
  totalCash: number;
  totalCredit: number;
  totalVolume: number;
  cashRatioPercent: number;
  creditRatioPercent: number;
  status: LiquidityRiskStatus;
  statusMessage: string;
}

function isWithinLiquidityPeriod(
  dateStr: string | null | undefined,
  period: LiquidityPeriod,
  refDate: Date
): boolean {
  if (!dateStr) return true;
  const parsed = new Date(dateStr);
  if (isNaN(parsed.getTime())) return true;

  if (period === "today") {
    const toManilaDate = (d: Date) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(d);
    return toManilaDate(parsed) === toManilaDate(refDate);
  }

  // 7-day rolling window
  const cutoffMs = refDate.getTime() - 7 * 24 * 60 * 60 * 1000;
  return parsed.getTime() >= cutoffMs;
}

export function computeLiquidityHealth(
  entries: LiquidityEntry[],
  period: LiquidityPeriod = "7d",
  referenceDate: Date = new Date()
): LiquidityHealthResult {
  let cashCentavos = 0;
  let creditCentavos = 0;
  let paymentCentavos = 0;

  for (const entry of entries) {
    if (entry.confirmed_by_user === false) continue;
    const effectiveDate = entry.created_at ?? entry.page_date ?? null;
    if (!isWithinLiquidityPeriod(effectiveDate, period, referenceDate)) continue;

    const amtCentavos = toCentavos(entry.amount);
    if (entry.entry_type === "cash_sale" || entry.entry_type === "cash") {
      cashCentavos += amtCentavos;
    } else if (entry.entry_type === "credit") {
      creditCentavos += amtCentavos;
    } else if (entry.entry_type === "payment") {
      paymentCentavos += amtCentavos;
    }
  }

  const totalCashCentavos = cashCentavos + paymentCentavos;
  const netCreditCentavos = Math.max(0, creditCentavos - paymentCentavos);
  const totalVolumeCentavos = totalCashCentavos + netCreditCentavos;

  const totalCash = toPesos(totalCashCentavos);
  const totalCredit = toPesos(netCreditCentavos);
  const totalVolume = toPesos(totalVolumeCentavos);

  const cashRatioPercent =
    totalVolumeCentavos > 0
      ? Math.round((totalCashCentavos / totalVolumeCentavos) * 100)
      : 100;
  const creditRatioPercent = Math.max(0, 100 - cashRatioPercent);

  let status: LiquidityRiskStatus = "healthy";
  let statusMessage = "Low Credit Risk &bull; Healthy Cash Flow";

  if (cashRatioPercent < 40) {
    status = "high_risk";
    statusMessage = "High Credit Risk &bull; Collect payments before restocking";
  } else if (cashRatioPercent < 60) {
    status = "moderate";
    statusMessage = "Moderate Exposure &bull; Watch customer balances";
  }

  return {
    period,
    totalCash,
    totalCredit,
    totalVolume,
    cashRatioPercent,
    creditRatioPercent,
    status,
    statusMessage,
  };
}

