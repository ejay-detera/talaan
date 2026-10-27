import { describe, it, expect } from "vitest";
import { PageExtractionSchema, RetakeRequestSchema } from "../schemas";

describe("T-002: Zod Schema Contract Validation", () => {
  it("validates well-formed page extraction with credit, payment, and cash_sale", () => {
    const raw = {
      page_date: "2026-10-27",
      written_total: 71.0,
      rows: [
        {
          customer: "Aling Nena",
          item: "Lucky Me",
          quantity: 3,
          unit_price: 12.0,
          amount: 36.0,
          entry_type: "credit",
          confidence: 0.95,
        },
        {
          customer: "Mang Jose",
          item: "Bayad utang",
          amount: 50.0,
          entry_type: "payment",
          confidence: 0.9,
        },
        {
          customer: "Walk-in",
          item: "Ice candy",
          amount: 10.0,
          entry_type: "cash_sale",
          confidence: 0.85,
        },
      ],
    };

    const parsed = PageExtractionSchema.parse(raw);
    expect(parsed.rows.length).toBe(3);
    expect(parsed.written_total).toBe(71.0);
    expect(parsed.rows[0].customer).toBe("Aling Nena");
  });

  it("rejects rows with negative amounts", () => {
    const raw = {
      rows: [
        {
          customer: "Aling Nena",
          item: "Lucky Me",
          amount: -36.0,
          entry_type: "credit",
        },
      ],
    };

    expect(() => PageExtractionSchema.parse(raw)).toThrow();
  });

  it("rejects rows with empty item description", () => {
    const raw = {
      rows: [
        {
          customer: "Aling Nena",
          item: "   ",
          amount: 36.0,
        },
      ],
    };

    expect(() => PageExtractionSchema.parse(raw)).toThrow();
  });

  it("validates retake request schema for unreadable pages", () => {
    const retake = {
      is_unreadable: true,
      region: "bottom_left",
      reason: "Lighting glare covers line totals",
    };

    const parsed = RetakeRequestSchema.parse(retake);
    expect(parsed.is_unreadable).toBe(true);
    expect(parsed.region).toBe("bottom_left");
    expect(parsed.reason).toContain("glare");
  });

  it("rejects retake request missing a reason", () => {
    const invalid = {
      is_unreadable: true,
      reason: "",
    };

    expect(() => RetakeRequestSchema.parse(invalid)).toThrow();
  });
});
