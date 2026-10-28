/**
 * Talaan 30-Page Evaluation Harness (TAL-07 / US-07)
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/eval-glimmer.ts [--limit N] [--dir eval/pages-30]
 *
 * Provenance Rule (docs/modules/ai-component.md & AGENTS.md §7):
 *   Official evaluation results MUST run on Meta Muse Glimmer 30B (MODEL_PROVIDER=glimmer).
 *   Any run on MODEL_PROVIDER=gemini is strictly watermarked as a DRY RUN and written to
 *   eval/results/dry-run-latest.{json,md} so it can never be mistaken for Muse Glimmer metrics.
 */

import fs from "fs/promises";
import path from "path";
import { getModelClient } from "../src/lib/model";
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_TOOLS } from "../src/lib/prompts/extraction";
import { PageExtractionSchema } from "../src/lib/schemas";
import { normalizeNotebookImage } from "../src/lib/image";
import { checkRowDiscrepancy, computePageTotals } from "../src/lib/ledger/math";
import {
  scorePageExtraction,
  aggregateEvalReport,
  type EvalGroundTruthPage,
  type EvalCandidateExtraction,
  type PageScoreResult,
  type AggregateEvalReport,
} from "../src/lib/eval/score";

function parseArgs(argv: string[]): { limit: number | null; dir: string } {
  let limit: number | null = null;
  let dir = "eval/pages-30";

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--limit" && argv[i + 1]) {
      limit = parseInt(argv[i + 1], 10);
      i++;
    } else if (argv[i] === "--dir" && argv[i + 1]) {
      dir = argv[i + 1];
      i++;
    }
  }

  return { limit, dir };
}

function formatMarkdownReport(report: AggregateEvalReport): string {
  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

  return `# Talaan 30-Page Evaluation Report

> **Provenance Watermark:** \`${report.watermark}\`
> **Model:** \`${report.model}\` (\`MODEL_PROVIDER=${report.provider}\`)
> **Timestamp:** \`${report.timestamp}\`
> **Dataset Directory:** \`${report.datasetDir}\` (${report.totalPages} pages evaluated)

## Summary Metrics

| Metric | Result | Target (PRD §4) |
| --- | --- | --- |
| **Customer Name Accuracy** | **${pct(report.metrics.customerNameAccuracy)}** | >= 85% |
| **Item Description Accuracy** | **${pct(report.metrics.itemAccuracy)}** | >= 80% |
| **Peso Amount Accuracy (Centavo-Exact)** | **${pct(report.metrics.amountAccuracy)}** | >= 90% |
| **Exact Row Match Rate** | **${pct(report.metrics.exactRowMatchRate)}** | >= 80% |
| **Written Total Match Rate** | **${pct(report.metrics.writtenTotalAccuracy)}** | >= 85% |
| **Computed Total Match Rate** | **${pct(report.metrics.computedTotalAccuracy)}** | >= 90% |
| **Unreadable Page Detection** | **${pct(report.metrics.unreadableDetectionAccuracy)}** | 100% |
| **Discrepancy Recall (Deterministic Math)** | **${pct(report.metrics.discrepancyRecall)}** | **100%** |
| **Discrepancy Precision** | **${pct(report.metrics.discrepancyPrecision)}** | >= 95% |
| **Human Review Flag Rate** | **${pct(report.metrics.reviewFlagRate)}** | Reported |
| **Mean Latency** | **${report.latency.meanMs} ms** | <= 15,000 ms |
| **p50 Latency** | **${report.latency.p50Ms} ms** | <= 10,000 ms |
| **p95 Latency** | **${report.latency.p95Ms} ms** | <= 15,000 ms |

## Per-Page Breakdown

| Page ID | Category | Unreadable OK | Rows (Expected/Extracted) | Exact Row Matches | Discrepancy (TP/FP/FN) | Review Flags | Latency (ms) |
| --- | --- | --- | --- | --- | --- | --- | --- |
${report.pages
  .map(
    (p) =>
      `| \`${p.page_id}\` | ${p.category} | ${p.unreadableCorrect ? "✅" : "❌"} | ${p.expectedEntryCount}/${p.extractedEntryCount} | ${p.exactRowMatchCount}/${p.expectedEntryCount} | ${p.discrepancyConfusion.tp}/${p.discrepancyConfusion.fp}/${p.discrepancyConfusion.fn} | ${p.flaggedForReviewCount} | ${p.latencyMs} |`
  )
  .join("\n")}
`;
}

async function runSinglePage(
  jpgPath: string,
  truth: EvalGroundTruthPage
): Promise<PageScoreResult> {
  const { client, model } = getModelClient();
  const rawBuffer = await fs.readFile(jpgPath);
  const normalized = await normalizeNotebookImage(rawBuffer);
  const dataUrl = `data:${normalized.mimeType};base64,${normalized.buffer.toString("base64")}`;

  const startMs = Date.now();
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: EXTRACTION_SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please extract all transaction rows, customer names, items, prices, and any written total from this handwritten notebook or receipt page. Call extract_rows or flag_unreadable.",
          },
          {
            type: "image_url",
            image_url: { url: dataUrl },
          },
        ],
      },
    ],
    tools: EXTRACTION_TOOLS,
    tool_choice: "auto",
    temperature: 0.1,
  });
  const latencyMs = Date.now() - startMs;

  const message = response.choices[0]?.message;
  const toolCall = message?.tool_calls?.[0];

  let candidate: EvalCandidateExtraction = {
    unreadable: true,
    written_total: null,
    computed_total: 0,
    has_page_discrepancy: false,
    entries: [],
  };

  if (toolCall && toolCall.type === "function") {
    const toolName = toolCall.function.name;
    const rawArgs = JSON.parse(toolCall.function.arguments || "{}");

    if (toolName === "flag_unreadable") {
      candidate = {
        unreadable: true,
        written_total: null,
        computed_total: 0,
        has_page_discrepancy: false,
        entries: [],
      };
    } else if (toolName === "extract_rows") {
      const parsed = PageExtractionSchema.parse(rawArgs);
      const entries = parsed.rows.map((row) => {
        const line_discrepancy = checkRowDiscrepancy(row.quantity, row.unit_price, row.amount);
        const needs_review = row.confidence < 0.8 || line_discrepancy;
        return {
          customer_name: row.customer,
          item: row.item,
          quantity: row.quantity ?? null,
          unit_price: row.unit_price ?? null,
          amount: row.amount,
          entry_type: (row.entry_type === "cash_sale" ? "cash" : row.entry_type) as
            | "credit"
            | "payment"
            | "cash",
          confidence: row.confidence,
          line_discrepancy,
          needs_review,
        };
      });

      const totals = computePageTotals(parsed.rows, parsed.written_total);

      candidate = {
        unreadable: false,
        written_total: parsed.written_total ?? null,
        computed_total: totals.computedTotal,
        has_page_discrepancy: totals.hasPageDiscrepancy,
        entries,
      };
    }
  }

  return scorePageExtraction(truth, candidate, latencyMs);
}

async function main() {
  const { limit, dir } = parseArgs(process.argv.slice(2));
  const { model, provider } = getModelClient();
  const isOfficialMuseGlimmer = provider === "glimmer" && model === "muse-glimmer";

  console.log("==============================================================");
  if (isOfficialMuseGlimmer) {
    console.log("  OFFICIAL META MUSE GLIMMER 30B EVALUATION HARNESS");
  } else {
    console.log("  [WARNING] DRY RUN — AUXILIARY DEV BACKUP (NOT MUSE GLIMMER)");
    console.log(`  Active provider=${provider}, model=${model}`);
    console.log("  Results will be watermarked as DRY RUN per docs/grounding.md");
  }
  console.log("==============================================================");

  const datasetDir = path.resolve(process.cwd(), dir);
  const files = await fs.readdir(datasetDir);
  const jsonFiles = files.filter((f) => f.endsWith(".json")).sort();
  const selectedJsonFiles = limit ? jsonFiles.slice(0, limit) : jsonFiles;

  const pageScores: PageScoreResult[] = [];

  for (const jsonFile of selectedJsonFiles) {
    const jsonPath = path.join(datasetDir, jsonFile);
    const truthRaw = await fs.readFile(jsonPath, "utf8");
    const truth = JSON.parse(truthRaw) as EvalGroundTruthPage;
    const jpgPath = path.join(datasetDir, `${truth.page_id}.jpg`);

    process.stdout.write(`Evaluating ${truth.page_id} (${truth.category})... `);
    const score = await runSinglePage(jpgPath, truth);
    pageScores.push(score);
    console.log(
      `done in ${score.latencyMs}ms | rows=${score.exactRowMatchCount}/${score.expectedEntryCount} | tp=${score.discrepancyConfusion.tp}`
    );
  }

  const report = aggregateEvalReport(pageScores, {
    model,
    provider,
    isOfficialMuseGlimmer,
    datasetDir: dir,
  });

  const resultsDir = path.resolve(process.cwd(), "eval/results");
  await fs.mkdir(resultsDir, { recursive: true });

  const filePrefix = isOfficialMuseGlimmer ? "glimmer-official-latest" : "dry-run-latest";
  const outJsonPath = path.join(resultsDir, `${filePrefix}.json`);
  const outMdPath = path.join(resultsDir, `${filePrefix}.md`);

  await fs.writeFile(outJsonPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  await fs.writeFile(outMdPath, formatMarkdownReport(report), "utf8");

  console.log("\nEvaluation complete!");
  console.log(`Watermark: ${report.watermark}`);
  console.log(`JSON saved: ${outJsonPath}`);
  console.log(`Markdown saved: ${outMdPath}`);
}

main().catch((err) => {
  console.error("Evaluation harness failed:", err);
  process.exit(1);
});

