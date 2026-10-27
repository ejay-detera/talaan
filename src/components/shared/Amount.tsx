import React from "react";

interface AmountProps {
  /** Amount in integer centavos (e.g. 3600 for ₱36.00). Preferred for centavo-exact math. */
  cents?: number;
  /** Floating-point amount (e.g. 36.00). Converted safely to centavos. */
  amount?: number;
  /** Ledger entry type context for formatting and coloring */
  type?: "credit" | "payment" | "cash_sale" | "neutral";
  /** Optional size variant */
  size?: "sm" | "base" | "lg";
  /** Additional custom class names */
  className?: string;
}

/**
 * Ledger column amount formatter.
 * Enforces Atkinson Hyperlegible Next tabular numerals (tabular-nums),
 * right alignment, and exact peso (₱) presentation.
 */
export function Amount({
  cents,
  amount,
  type = "neutral",
  size = "base",
  className = "",
}: AmountProps) {
  // Resolve integer centavos safely
  const resolvedCents =
    cents !== undefined
      ? Math.round(cents)
      : amount !== undefined
        ? Math.round(amount * 100)
        : 0;

  const isNegative = resolvedCents < 0 || type === "payment";
  const absCents = Math.abs(resolvedCents);
  const pesos = Math.floor(absCents / 100);
  const remainderCentavos = absCents % 100;

  // Format with thousands separator
  const formattedPesos = pesos.toLocaleString("en-PH");
  const formattedCentavos = remainderCentavos.toString().padStart(2, "0");

  const sizeClasses = {
    sm: "text-sm",
    base: "text-[1.25rem] leading-none", // 20px
    lg: "text-2xl font-extrabold",
  }[size];

  const colorClasses = {
    credit: "text-pencil",
    payment: "text-paid", // accounting stamp green
    cash_sale: "text-pencil",
    neutral: "text-pencil",
  }[type];

  return (
    <span
      className={`inline-flex items-baseline justify-end font-sans font-bold tabular-nums text-right ${sizeClasses} ${colorClasses} ${className}`}
      style={{ fontFeatureSettings: '"tnum" 1, "zero" 1' }}
    >
      {isNegative && <span className="mr-0.5 select-none">-</span>}
      <span className="font-semibold select-none mr-0.5">₱</span>
      <span>{formattedPesos}</span>
      <span className="text-[0.85em]">.{formattedCentavos}</span>
    </span>
  );
}
