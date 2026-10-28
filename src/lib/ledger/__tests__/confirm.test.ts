import { describe, it, expect } from "vitest";
import { prepareConfirmation } from "../confirm";
import type { ConfirmEntryInput } from "@/types/ledger";

describe("prepareConfirmation (T-005)", () => {
  it("rejects credit or payment entries lacking customer_id and new_customer_name", () => {
    const entries: ConfirmEntryInput[] = [
      {
        item: "Lucky Me Pancit Canton",
        quantity: 2,
        unit_price: 12,
        amount: 24,
        entry_type: "credit",
        customer_id: null,
        new_customer_name: null,
      },
    ];

    expect(() => prepareConfirmation(entries, 24)).toThrowError(
      /customer/i
    );
  });

  it("allows cash_sale entries without any customer", () => {
    const entries: ConfirmEntryInput[] = [
      {
        item: "Marlboro Red stick",
        quantity: 2,
        unit_price: 10,
        amount: 20,
        entry_type: "cash_sale",
        customer_id: null,
        new_customer_name: null,
      },
    ];

    const result = prepareConfirmation(entries, 20);
    expect(result.computed_total).toBe(20);
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].line_discrepancy).toBe(false);
  });

  it("rejects unresolved row multiplication mismatch without accept_written", () => {
    const entries: ConfirmEntryInput[] = [
      {
        item: "Lucky Me",
        quantity: 3,
        unit_price: 12,
        amount: 46, // 3 * 12 is 36, mismatch!
        entry_type: "credit",
        customer_id: "c-1",
        accept_written: false,
      },
    ];

    expect(() => prepareConfirmation(entries, 46)).toThrowError(
      /UNRESOLVED_MISMATCH/i
    );
  });

  it("accepts row multiplication mismatch when explicitly approved with accept_written=true", () => {
    const entries: ConfirmEntryInput[] = [
      {
        item: "Lucky Me",
        quantity: 3,
        unit_price: 12,
        amount: 46,
        entry_type: "credit",
        customer_id: "c-1",
        accept_written: true,
      },
    ];

    const result = prepareConfirmation(entries, 46);
    expect(result.entries[0].line_discrepancy).toBe(true);
    expect(result.entries[0].amount).toBe(46);
    expect(result.computed_total).toBe(46);
  });

  it("recomputes centavo math exactly and flags page discrepancy without blocking confirmation", () => {
    const entries: ConfirmEntryInput[] = [
      {
        item: "Item 1",
        quantity: 3,
        unit_price: 12.1,
        amount: 36.3,
        entry_type: "credit",
        customer_id: "c-1",
      },
      {
        item: "Item 2",
        quantity: 1,
        unit_price: 10,
        amount: 10,
        entry_type: "credit",
        customer_id: "c-2",
      },
    ];

    // Written total is 50.00, but 36.30 + 10.00 = 46.30 (mismatch: diff -3.70)
    const result = prepareConfirmation(entries, 50);

    expect(result.computed_total).toBe(46.3);
    expect(result.has_page_discrepancy).toBe(true);
    expect(result.discrepancy_diff).toBe(-3.7);
  });

  it("rejects empty entries list", () => {
    expect(() => prepareConfirmation([], 0)).toThrowError(/at least one/i);
  });

  it("rejects negative or NaN amounts", () => {
    const entries: ConfirmEntryInput[] = [
      {
        item: "Item",
        amount: -5,
        entry_type: "credit",
        customer_id: "c-1",
      },
    ];

    expect(() => prepareConfirmation(entries, 0)).toThrowError();
  });
});
