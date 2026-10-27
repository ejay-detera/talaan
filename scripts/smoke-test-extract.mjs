import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Load environment variables
const apiKey = process.env.GEMINI_API_KEY;
const baseURL = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai";
const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

console.log("=== Talaan Smoke Test (Track A / Option B) ===");
console.log("Provider: Gemini API via Google AI Studio");
console.log("Base URL:", baseURL);
console.log("Model:", model);

if (!apiKey) {
  console.error("ERROR: GEMINI_API_KEY not found in environment.");
  process.exit(1);
}

// 2. Read test image and convert to base64
const imagePath = path.join(__dirname, "../public/sample-notebook-test.jpg");
if (!fs.existsSync(imagePath)) {
  console.error("ERROR: sample-notebook-test.jpg does not exist.");
  process.exit(1);
}

const imageBuffer = fs.readFileSync(imagePath);
const base64Data = imageBuffer.toString("base64");
const dataUrl = `data:image/jpeg;base64,${base64Data}`;

// 3. Define Tools and Prompts matching src/lib/prompts/extraction.ts
const EXTRACTION_SYSTEM_PROMPT = `You are Talaan, an expert AI notebook-to-ledger extraction agent for Philippine sari-sari stores.
Your job is to read handwritten utang (credit) notebooks, supplier receipts, and handwritten transaction lists from photos.

RULES:
1. Examine the image carefully. Transcribe handwritten customer names, item descriptions, quantities, unit prices, line totals, and any written total at the bottom of the page.
2. Entry Types:
   - "credit": Customer took items on credit / utang (unpaid). Default for typical utang notebook entries.
   - "payment": Customer made a payment / bayad (e.g. "Mang Jose - bayad 50").
   - "cash_sale": Customer paid cash immediately.
3. Quantities and Unit Prices:
   - If written explicitly (e.g., "3 Lucky Me @ 12 = 36"), extract quantity: 3, unit_price: 12.0, amount: 36.0.
   - If only the line amount is written, extract amount and null unit_price.
4. Confidence:
   - Assign a confidence score from 0.00 to 1.00 for each row reflecting legibility.
5. Written Total:
   - If a subtotal or total is written at the bottom of the page, extract it as written_total.
6. Failure Recovery:
   - If unreadable, call flag_unreadable. Otherwise call extract_rows.`;

const EXTRACTION_TOOLS = [
  {
    type: "function",
    function: {
      name: "extract_rows",
      description: "Extract structured rows and written totals from a notebook page or receipt.",
      parameters: {
        type: "object",
        properties: {
          page_date: { type: "string" },
          written_total: { type: "number" },
          rows: {
            type: "array",
            items: {
              type: "object",
              properties: {
                customer: { type: "string" },
                item: { type: "string" },
                quantity: { type: "number" },
                unit_price: { type: "number" },
                amount: { type: "number" },
                entry_type: { type: "string", enum: ["credit", "payment", "cash_sale"] },
                confidence: { type: "number" },
              },
              required: ["customer", "item", "amount", "entry_type", "confidence"],
            },
          },
        },
        required: ["rows"],
      },
    },
  },
];

async function run() {
  const client = new OpenAI({ baseURL, apiKey });
  const startTime = Date.now();

  console.log("\nSending image to model via OpenAI compatibility endpoint...");

  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Please extract all transaction rows, customer names, items, prices, and any written total from this page." },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    tools: EXTRACTION_TOOLS,
    tool_choice: "auto",
    temperature: 0.1,
  });

  const latency = Date.now() - startTime;
  console.log(`Inference completed in ${latency}ms`);

  const choice = response.choices[0];
  const toolCall = choice?.message?.tool_calls?.[0];

  if (toolCall && toolCall.type === "function") {
    console.log(`\nTool invoked: ${toolCall.function.name}`);
    const args = JSON.parse(toolCall.function.arguments);
    console.log("\nExtracted Data:");
    console.dir(args, { depth: null });

    // Run deterministic centavo arithmetic verification
    console.log("\n=== Two-Level Discrepancy Verification ===");
    let computedCentavos = 0;
    for (const row of args.rows || []) {
      const lineCentavos = Math.round(row.amount * 100);
      if (row.entry_type === "credit") {
        computedCentavos += lineCentavos;
      } else if (row.entry_type === "payment") {
        computedCentavos -= lineCentavos;
      }

      if (row.quantity && row.unit_price) {
        const expected = Math.round(row.quantity * row.unit_price * 100);
        const diff = expected !== lineCentavos;
        console.log(`Row: ${row.customer} | ${row.item} | qty: ${row.quantity} @ ₱${row.unit_price} = ₱${row.amount} [${diff ? "MISMATCH!" : "OK"}]`);
      } else {
        console.log(`Row: ${row.customer} | ${row.item} | ₱${row.amount} [OK]`);
      }
    }

    const computedTotal = computedCentavos / 100;
    const writtenTotal = args.written_total;
    console.log(`\nWritten Total on Page: ₱${writtenTotal ?? "N/A"}`);
    console.log(`Computed Net Total:    ₱${computedTotal}`);
    console.log(`Reconciliation Result: ${writtenTotal !== undefined && writtenTotal !== computedTotal ? "DISCREPANCY DETECTED (Flagged for Review)" : "MATCHED / VERIFIED"}`);
  } else if (choice?.message?.content) {
    console.log("\nModel returned text response:");
    console.log(choice.message.content);
  } else {
    console.log("No tool call or text returned:", choice);
  }
}

run().catch((err) => {
  console.error("\nSmoke Test Failed:", err);
  process.exit(1);
});
