import type { EntryType } from "@/types/ledger";
import { toCentavos, toPesos } from "./math";

export interface CustomerCandidate {
  id: string;
  name: string;
}

export interface CustomerBalanceResult {
  total_credit: number;
  total_paid: number;
  net_balance: number;
}

/**
 * Normalizes customer names:
 * 1. Trims whitespace
 * 2. Lowercases
 * 3. Strips punctuation (. , -)
 * 4. Collapses multi-spaces
 */
export function normalizeCustomerName(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .toLowerCase()
    .replace(/[.,\-_/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Finds a matching customer from the store's customer list:
 * - Direct match after normalization
 * - Familiar nickname match without honorific (e.g., "Jun" matches "Kuya Jun")
 * - If ambiguous or not found, returns null
 */
export function findMatchingCustomer(
  candidateName: string,
  existingCustomers: CustomerCandidate[]
): CustomerCandidate | null {
  const normalizedCandidate = normalizeCustomerName(candidateName);
  if (!normalizedCandidate) {
    return null;
  }

  // 1. Direct normalized match
  for (const customer of existingCustomers) {
    if (normalizeCustomerName(customer.name) === normalizedCandidate) {
      return customer;
    }
  }

  // 2. Token / title match (e.g. Aling, Mang, Ate, Kuya, Nanay, Tatay)
  const honorifics = new Set(["aling", "mang", "ate", "kuya", "nanay", "tatay", "tiya", "tiyo"]);
  const candidateTokens = normalizedCandidate.split(" ").filter((t) => !honorifics.has(t));

  if (candidateTokens.length > 0) {
    const candidateCore = candidateTokens.join(" ");
    const matches: CustomerCandidate[] = [];

    for (const customer of existingCustomers) {
      const existingTokens = normalizeCustomerName(customer.name)
        .split(" ")
        .filter((t) => !honorifics.has(t));
      const existingCore = existingTokens.join(" ");

      if (existingCore === candidateCore || existingTokens.includes(candidateCore)) {
        matches.push(customer);
      }
    }

    if (matches.length === 1) {
      return matches[0];
    }
  }

  return null;
}

/**
 * Computes deterministic customer balances:
 * - Only confirmed entries (confirmed_by_user === true) are included.
 * - credit increases utang debt.
 * - payment decreases utang debt.
 * - cash_sale is immediate cash, does NOT affect utang balance.
 * - All math runs in exact integer centavos.
 */
export function calculateCustomerBalance(
  entries: Array<{
    amount: number;
    entry_type: EntryType;
    confirmed_by_user: boolean;
  }>
): CustomerBalanceResult {
  let creditCentavos = 0;
  let paidCentavos = 0;

  for (const entry of entries) {
    if (!entry.confirmed_by_user) {
      continue; // Strictly exclude unconfirmed staging entries
    }

    const centavos = toCentavos(entry.amount);

    if (entry.entry_type === "credit") {
      creditCentavos += centavos;
    } else if (entry.entry_type === "payment") {
      paidCentavos += centavos;
    }
    // cash_sale has 0 debt effect
  }

  const netCentavos = creditCentavos - paidCentavos;

  return {
    total_credit: toPesos(creditCentavos),
    total_paid: toPesos(paidCentavos),
    net_balance: toPesos(netCentavos),
  };
}
