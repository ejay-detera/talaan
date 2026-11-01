import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getModelClient } from "../src/lib/model.ts";
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_TOOLS } from "../src/lib/prompts/extraction.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { client, model } = getModelClient();

console.log("=== Talaan Vision Extraction Smoke Test ===");
console.log("Engine: Meta Muse Glimmer 30B");
console.log("Model:", model);
console.log("Base URL:", client.baseURL);

const imagePath = path.join(__dirname, "../public/sample-notebook-test.jpg");
if (!fs.existsSync(imagePath)) {
  console.error("ERROR: sample-notebook-test.jpg does not exist.");
  process.exit(1);
}

const imageBuffer = fs.readFileSync(imagePath);
const base64Data = imageBuffer.toString("base64");
const dataUrl = `data:image/jpeg;base64,${base64Data}`;

async function run() {
  const startTime = Date.now();
  console.log("\nSending image to Meta Muse Glimmer 30B via OpenAI client...");

  try {
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
      }
      const computedTotal = computedCentavos / 100;
      console.log(`Computed Net Total: ₱${computedTotal.toFixed(2)}`);
      if (args.written_total !== undefined) {
        console.log(`Written Total on Page: ₱${args.written_total.toFixed(2)}`);
        const diff = Math.abs(computedTotal - args.written_total);
        if (diff < 0.001) {
          console.log("MATCH: Computed total matches written total perfectly.");
        } else {
          console.log(`DISCREPANCY: Difference of ₱${diff.toFixed(2)} detected by deterministic engine.`);
        }
      }
    } else {
      console.log("Response text:", choice?.message?.content);
    }
  } catch (err) {
    console.error("Extraction failed:", err);
    process.exit(1);
  }
}

run();
