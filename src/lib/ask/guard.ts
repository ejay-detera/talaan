import { toCentavos } from "@/lib/ledger/math";

export interface GuardValidationResult {
  ok: boolean;
  extractedAmounts: {
    raw: string;
    centavos: number;
  }[];
  violations: {
    raw: string;
    centavos: number;
    reason: string;
  }[];
}

/**
 * Currency patterns in Philippine Peso contexts:
 * 1. ₱ or P or PHP followed by number: ₱45.00, ₱45, P520, PHP 1,250.50
 * 2. Number followed by pesos/piso/centavos/sentimos: 45 pesos, 50 centavos
 */
const CURRENCY_PREFIX_REGEX =
  /(?:₱|P|PHP)\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;

const CURRENCY_SUFFIX_REGEX =
  /([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)\s*(?:pesos?|piso|centavos?|sentimos?)/gi;

function parseNumericStringToCentavos(str: string, isCentavos = false): number {
  const clean = str.replace(/,/g, "").trim();
  const num = parseFloat(clean);
  if (isNaN(num)) return 0;
  if (isCentavos) {
    return Math.round(num);
  }
  return toCentavos(num);
}

/**
 * Extracts all currency amounts stated in the prose response.
 * Excludes plain counting numbers like "3 suki", "7 araw", or dates like "2026-10-27".
 */
export function extractCurrencyAmounts(text: string): { raw: string; centavos: number }[] {
  const results: { raw: string; centavos: number }[] = [];
  const seenIndices = new Set<number>();

  // 1. Prefix matches (₱45.00, P500, etc.)
  let match: RegExpExecArray | null;
  while ((match = CURRENCY_PREFIX_REGEX.exec(text)) !== null) {
    const rawMatch = match[0];
    const numPart = match[1];
    seenIndices.add(match.index);
    results.push({
      raw: rawMatch,
      centavos: parseNumericStringToCentavos(numPart, false),
    });
  }

  // 2. Suffix matches (45 pesos, 50 centavos, etc.)
  while ((match = CURRENCY_SUFFIX_REGEX.exec(text)) !== null) {
    // Check if this overlaps with an already-captured prefix match (e.g. "₱50 pesos")
    if (!seenIndices.has(match.index)) {
      const rawMatch = match[0];
      const numPart = match[1];
      const isCentavos = /centavos?|sentimos?/i.test(rawMatch);
      results.push({
        raw: rawMatch,
        centavos: parseNumericStringToCentavos(numPart, isCentavos),
      });
    }
  }

  return results;
}

/**
 * Strict Number Guard:
 * Asserts every currency figure in the prose is explicitly present in allowedAmountsCentavos.
 * If the prose mentions ANY unverified currency figure, validation fails.
 */
export function validateAnswerWithGuard(
  answerText: string,
  allowedAmountsCentavos: number[]
): GuardValidationResult {
  const extracted = extractCurrencyAmounts(answerText);
  const allowedSet = new Set(allowedAmountsCentavos);

  const violations: GuardValidationResult["violations"] = [];

  for (const item of extracted) {
    if (!allowedSet.has(item.centavos)) {
      violations.push({
        raw: item.raw,
        centavos: item.centavos,
        reason: `Amount ${item.raw} (${item.centavos} centavos) is not found in deterministic tool results.`,
      });
    }
  }

  return {
    ok: violations.length === 0,
    extractedAmounts: extracted,
    violations,
  };
}

