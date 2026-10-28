import { z } from "zod";

export const ExtractedRowRawSchema = z.object({
  customer: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .default("Unknown"),
  item: z
    .string()
    .trim()
    .min(1, "Item description is required"),
  quantity: z
    .number()
    .positive("Quantity must be positive")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  unit_price: z
    .number()
    .nonnegative("Unit price cannot be negative")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  amount: z
    .number()
    .nonnegative("Amount cannot be negative"),
  entry_type: z
    .enum(["credit", "payment", "cash_sale"])
    .default("credit"),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .default(0.85),
});

export const PageExtractionSchema = z.object({
  page_date: z.string().optional(),
  written_total: z
    .number()
    .nonnegative()
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  rows: z.array(ExtractedRowRawSchema).default([]),
  notes: z.array(z.string()).default([]),
});

export const RetakeRequestSchema = z.object({
  is_unreadable: z.literal(true),
  region: z.string().optional(),
  reason: z.string().min(1, "Reason for retake is required"),
});

export const ConfirmEntryInputSchema = z.object({
  id: z.string().optional().nullable(),
  customer_id: z.string().optional().nullable(),
  new_customer_name: z.string().trim().optional().nullable(),
  item: z.string().trim().min(1, "Item is required"),
  quantity: z
    .number()
    .positive("Quantity must be positive")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  unit_price: z
    .number()
    .nonnegative("Unit price cannot be negative")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  amount: z
    .number()
    .nonnegative("Amount cannot be negative"),
  entry_type: z
    .enum(["credit", "payment", "cash_sale"]),
  accept_written: z.boolean().optional(),
});

export const ConfirmPageSchema = z.object({
  written_total: z
    .number()
    .nonnegative()
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  entries: z.array(ConfirmEntryInputSchema).min(1, "At least one entry is required"),
});

export type ExtractedRowRaw = z.infer<typeof ExtractedRowRawSchema>;
export type PageExtractionParsed = z.infer<typeof PageExtractionSchema>;
export type RetakeRequestParsed = z.infer<typeof RetakeRequestSchema>;
export type ConfirmEntryInputParsed = z.infer<typeof ConfirmEntryInputSchema>;
export type ConfirmPageParsed = z.infer<typeof ConfirmPageSchema>;
