import type { OpenAI } from "openai";

export const EXTRACTION_SYSTEM_PROMPT = `You are Talaan, an expert AI notebook-to-ledger extraction agent for Philippine sari-sari stores.
Your job is to read handwritten utang (credit) notebooks, supplier receipts, and handwritten transaction lists from photos.

RULES:
1. Examine the image carefully. Transcribe handwritten customer names, item descriptions, quantities, unit prices, line totals, and any written total at the bottom of the page.
2. Entry Types:
   - "credit": Customer took items on credit / utang (unpaid). Default for typical utang notebook entries.
   - "payment": Customer made a payment / bayad (e.g. "Aling Nena - bayad 100").
   - "cash_sale": Customer paid cash immediately or marked cash/paid on the slip.
3. Quantities and Unit Prices:
   - If written explicitly (e.g., "3 Lucky Me @ 12 = 36"), extract quantity: 3, unit_price: 12.0, amount: 36.0.
   - If only the line amount is written (e.g., "3 Lucky Me - 36"), extract quantity: 3, unit_price: null, amount: 36.0.
4. Confidence:
   - Assign a confidence score from 0.00 to 1.00 for each row reflecting handwriting legibility.
5. Written Total:
   - If a subtotal or total sum is written at the bottom of the page, extract it as written_total. Do not calculate or invent a total if not written.
6. Failure Recovery:
   - If the image is completely illegible, too blurry, dark, or not a store record, invoke the flag_unreadable tool with a clear reason explaining what to re-photograph.
   - Otherwise, invoke extract_rows.`;

export const EXTRACTION_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "extract_rows",
      description: "Extract structured rows and written totals from a readable notebook page or receipt image.",
      parameters: {
        type: "object",
        properties: {
          page_date: {
            type: "string",
            description: "Date written on the page in YYYY-MM-DD or as written (e.g., 'Oct 27, 2026').",
          },
          written_total: {
            type: "number",
            description: "Total or subtotal written at the bottom of the page, if present.",
          },
          rows: {
            type: "array",
            description: "List of extracted transaction rows.",
            items: {
              type: "object",
              properties: {
                customer: {
                  type: "string",
                  description: "Customer name as written on the row or page heading (e.g., 'Aling Nena', 'Ate Nena').",
                },
                item: {
                  type: "string",
                  description: "Item description, sachet brand, or 'Bayad' for payments.",
                },
                quantity: {
                  type: "number",
                  description: "Quantity of items purchased, if indicated.",
                },
                unit_price: {
                  type: "number",
                  description: "Unit price per item in Pesos, if indicated.",
                },
                amount: {
                  type: "number",
                  description: "Total amount for this line item in Philippine Pesos.",
                },
                entry_type: {
                  type: "string",
                  enum: ["credit", "payment", "cash_sale"],
                  description: "Whether this row is credit/utang, a debt payment/bayad, or a cash sale.",
                },
                confidence: {
                  type: "number",
                  description: "Confidence in reading handwriting (0.00 to 1.00).",
                },
              },
              required: ["customer", "item", "amount", "entry_type", "confidence"],
            },
          },
          notes: {
            type: "array",
            items: { type: "string" },
            description: "Any extra notes written on margins or top of the page.",
          },
        },
        required: ["rows"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "flag_unreadable",
      description: "Flag that the image or region is illegible, too blurry, or dark and request a retake.",
      parameters: {
        type: "object",
        properties: {
          is_unreadable: {
            type: "boolean",
            enum: [true],
            description: "Always true when page cannot be accurately read.",
          },
          region: {
            type: "string",
            description: "Which part is unreadable (e.g. 'bottom total', 'entire page', 'left column').",
          },
          reason: {
            type: "string",
            description: "Plain language instruction to the store owner on what to re-photograph.",
          },
        },
        required: ["is_unreadable", "reason"],
      },
    },
  },
];
