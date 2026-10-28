import { describe, it, expect } from "vitest";
import {
  PageExtractionSchema,
  RetakeRequestSchema,
  DraftReminderRequestSchema,
  ReminderDraftSchema,
} from "../schemas";

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

describe("T-007: Reminder Schemas", () => {
  it("validates DraftReminderRequestSchema with valid tones", () => {
    const validFriendly = {
      customer_id: "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f",
      tone: "friendly",
    };
    const parsed = DraftReminderRequestSchema.parse(validFriendly);
    expect(parsed.customer_id).toBe("c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f");
    expect(parsed.tone).toBe("friendly");

    const validFirm = {
      customer_id: "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f",
      tone: "firm",
    };
    expect(DraftReminderRequestSchema.parse(validFirm).tone).toBe("firm");
  });

  it("defaults tone to friendly if omitted in DraftReminderRequestSchema", () => {
    const withoutTone = {
      customer_id: "c9d8e7f6-5a4b-4c3d-8e2f-1a0b9c8d7e6f",
    };
    const parsed = DraftReminderRequestSchema.parse(withoutTone);
    expect(parsed.tone).toBe("friendly");
  });

  it("rejects DraftReminderRequestSchema missing customer_id or having invalid tone", () => {
    expect(() => DraftReminderRequestSchema.parse({})).toThrow();
    expect(() =>
      DraftReminderRequestSchema.parse({
        customer_id: "c1",
        tone: "aggressive",
      })
    ).toThrow();
  });

  it("validates ReminderDraftSchema with tone and non-empty message", () => {
    const draft = {
      message: "Magandang araw po! Paalala lang sa listahan.",
      tone: "friendly",
    };
    const parsed = ReminderDraftSchema.parse(draft);
    expect(parsed.message).toContain("Magandang araw");
    expect(parsed.tone).toBe("friendly");
  });

  it("rejects ReminderDraftSchema with empty or whitespace message", () => {
    expect(() =>
      ReminderDraftSchema.parse({ message: "   ", tone: "friendly" })
    ).toThrow();
  });
});
