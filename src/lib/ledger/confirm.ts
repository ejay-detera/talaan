import type { ConfirmEntryInput } from "@/types/ledger";
import { checkRowDiscrepancy, computePageTotals, type PageTotalComputation } from "./math";

export interface PreparedConfirmEntry extends ConfirmEntryInput {
  line_discrepancy: boolean;
}

export interface PreparedConfirmationResult extends PageTotalComputation {
  computed_total: number;
  has_page_discrepancy: boolean;
  discrepancy_diff: number;
  entries: PreparedConfirmEntry[];
}

/**
 * Validates entries and recomputes all ledger arithmetic deterministically in integer centavos.
 * Throws specific error codes for bad inputs or unconfirmed math mismatches.
 */
export function prepareConfirmation(
  entries: ConfirmEntryInput[],
  writtenTotal?: number | null
): PreparedConfirmationResult {
  if (!entries || entries.length === 0) {
    throw new Error("At least one entry is required to confirm a page.");
  }

  const preparedEntries: PreparedConfirmEntry[] = [];

  for (const entry of entries) {
    if (isNaN(entry.amount) || entry.amount < 0) {
      throw new Error("Entry amount must be a valid non-negative number.");
    }

    // Trust boundary: credit and payment rows strictly require a customer
    if (entry.entry_type === "credit" || entry.entry_type === "payment") {
      const hasExistingCustomer = Boolean(entry.customer_id);
      const hasNewCustomer = Boolean(entry.new_customer_name && entry.new_customer_name.trim().length > 0);

      if (!hasExistingCustomer && !hasNewCustomer) {
        throw new Error(
          `CUSTOMER_REQUIRED: Entry '${entry.item}' (${entry.entry_type}) requires an existing customer or new customer name.`
        );
      }
    }

    // Arithmetic verification: quantity * unit_price === amount
    const qty = entry.quantity ?? undefined;
    const price = entry.unit_price ?? undefined;
    const hasRowDiscrepancy = checkRowDiscrepancy(qty, price, entry.amount);

    if (hasRowDiscrepancy && !entry.accept_written) {
      throw new Error(
        `UNRESOLVED_MISMATCH: Entry '${entry.item}' has an arithmetic mismatch (${qty} * ${price} !== ${entry.amount}). Choose 'Use computed' or 'Keep written'.`
      );
    }

    preparedEntries.push({
      ...entry,
      line_discrepancy: hasRowDiscrepancy,
    });
  }

  const totals = computePageTotals(
    preparedEntries,
    writtenTotal === null ? undefined : writtenTotal
  );

  return {
    computed_total: totals.computedTotal,
    has_page_discrepancy: totals.hasPageDiscrepancy,
    discrepancy_diff: totals.discrepancyDiff,
    computedTotal: totals.computedTotal,
    hasPageDiscrepancy: totals.hasPageDiscrepancy,
    discrepancyDiff: totals.discrepancyDiff,
    entries: preparedEntries,
  };
}
