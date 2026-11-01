import { describe, it, expect } from "vitest";
import { extractCurrencyAmounts, validateAnswerWithGuard } from "../guard";

describe("Number Guard", () => {
  it("extracts prefix currency amounts correctly", () => {
    const text = "Si Nanay Cora ay may ₱45.00 na utang at si Kuya Jun ay may P520.00.";
    const amounts = extractCurrencyAmounts(text);

    expect(amounts).toEqual([
      { raw: "₱45.00", centavos: 4500 },
      { raw: "P520.00", centavos: 52000 },
    ]);
  });

  it("extracts suffix currency amounts correctly", () => {
    const text = "May 500 pesos na credit limit at barya na 50 centavos.";
    const amounts = extractCurrencyAmounts(text);

    expect(amounts).toEqual([
      { raw: "500 pesos", centavos: 50000 },
      { raw: "50 centavos", centavos: 50 },
    ]);
  });

  it("ignores non-currency counters and dates", () => {
    const text =
      "Noong 2026-10-27, may 3 suki na lumagpas sa 7 araw. May 2 entries sa page 1.";
    const amounts = extractCurrencyAmounts(text);

    expect(amounts).toHaveLength(0);
  });

  it("passes validation when all amounts match allowed centavos", () => {
    const answer =
      "Si Nanay Cora na may ₱45.00 na overdue ng 8 araw at si Kuya Jun na may ₱520.00 dahil lumagpas sa ₱500.00 credit limit ang dapat mong singilin ngayon. Total overdue nila ay ₱565.00.";
    const allowed = [4500, 52000, 50000, 56500];

    const result = validateAnswerWithGuard(answer, allowed);
    expect(result.ok).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it("fails validation and records violation when hallucinated currency appears", () => {
    const answer =
      "Si Nanay Cora ay may ₱45.00 na utang, pero sabi sa ledger ay ₱999.00.";
    const allowed = [4500];

    const result = validateAnswerWithGuard(answer, allowed);
    expect(result.ok).toBe(false);
    expect(result.violations).toHaveLength(1);
    expect(result.violations[0].centavos).toBe(99900);
    expect(result.violations[0].raw).toBe("₱999.00");
  });

  it("handles amounts with commas properly", () => {
    const text = "Ang kabuuang benta ay ₱1,250.75 ngayong linggo.";
    const amounts = extractCurrencyAmounts(text);

    expect(amounts).toEqual([{ raw: "₱1,250.75", centavos: 125075 }]);
  });
});

