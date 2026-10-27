import { NextRequest, NextResponse } from "next/server";
import { getModelClient } from "@/lib/model";
import { normalizeNotebookImage } from "@/lib/image";
import { PageExtractionSchema, RetakeRequestSchema } from "@/lib/schemas";
import { EXTRACTION_SYSTEM_PROMPT, EXTRACTION_TOOLS } from "@/lib/prompts/extraction";
import { checkRowDiscrepancy, computePageTotals } from "@/lib/ledger/math";
import type { ExtractedRow, ExtractionResponse } from "@/types/ledger";

export const maxDuration = 60; // Allow sufficient time for vision inference

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: { code: "BAD_REQUEST", message: "No image file provided in 'file' field" } },
        { status: 400 }
      );
    }

    // 1. Pre-process image with sharp
    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const normalized = await normalizeNotebookImage(inputBuffer);
    const base64Data = normalized.buffer.toString("base64");
    const dataUrl = `data:${normalized.mimeType};base64,${base64Data}`;

    // 2. Obtain model client
    const { client, model } = getModelClient();

    // 3. Invoke multimodal vision tool completion
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

    const latency_ms = Date.now() - startTime;
    const choice = response.choices[0];
    const message = choice?.message;

    // Check if model called flag_unreadable or extract_rows
    const toolCall = message?.tool_calls?.[0];
    if (toolCall && toolCall.type === "function") {
      const toolName = toolCall.function.name;
      const rawArgs = JSON.parse(toolCall.function.arguments || "{}");

      if (toolName === "flag_unreadable") {
        const retakeData = RetakeRequestSchema.parse(rawArgs);
        const result: ExtractionResponse = {
          status: "retake_requested",
          region: retakeData.region,
          reason: retakeData.reason,
          model,
          latency_ms,
        };
        return NextResponse.json(result);
      }

      if (toolName === "extract_rows") {
        const parsed = PageExtractionSchema.parse(rawArgs);

        // 4. Run deterministic ledger arithmetic in TypeScript
        const processedRows: ExtractedRow[] = parsed.rows.map((row) => {
          const line_discrepancy = checkRowDiscrepancy(row.quantity, row.unit_price, row.amount);
          const needs_review = row.confidence < 0.8 || line_discrepancy;

          return {
            customer: row.customer,
            item: row.item,
            quantity: row.quantity,
            unit_price: row.unit_price,
            amount: row.amount,
            entry_type: row.entry_type,
            confidence: row.confidence,
            needs_review,
            line_discrepancy,
          };
        });

        const totals = computePageTotals(processedRows, parsed.written_total);

        const result: ExtractionResponse = {
          status: "needs_review",
          page_date: parsed.page_date,
          written_total: parsed.written_total,
          computed_total: totals.computedTotal,
          has_page_discrepancy: totals.hasPageDiscrepancy,
          discrepancy_diff: totals.discrepancyDiff,
          rows: processedRows,
          model,
          latency_ms,
        };

        return NextResponse.json(result);
      }
    }

    // Fallback: If model responded in text without explicit tool call, attempt JSON parse
    if (message?.content) {
      try {
        const jsonMatch = message.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = PageExtractionSchema.parse(JSON.parse(jsonMatch[0]));
          const processedRows: ExtractedRow[] = parsed.rows.map((row) => ({
            customer: row.customer,
            item: row.item,
            quantity: row.quantity,
            unit_price: row.unit_price,
            amount: row.amount,
            entry_type: row.entry_type,
            confidence: row.confidence,
            needs_review: row.confidence < 0.8 || checkRowDiscrepancy(row.quantity, row.unit_price, row.amount),
            line_discrepancy: checkRowDiscrepancy(row.quantity, row.unit_price, row.amount),
          }));

          const totals = computePageTotals(processedRows, parsed.written_total);

          return NextResponse.json({
            status: "needs_review",
            page_date: parsed.page_date,
            written_total: parsed.written_total,
            computed_total: totals.computedTotal,
            has_page_discrepancy: totals.hasPageDiscrepancy,
            discrepancy_diff: totals.discrepancyDiff,
            rows: processedRows,
            model,
            latency_ms,
          });
        }
      } catch {
        // Fall through to error
      }
    }

    return NextResponse.json(
      {
        error: {
          code: "EXTRACTION_FAILED",
          message: "Model did not return structured rows. Please try retaking the photo.",
        },
      },
      { status: 500 }
    );
  } catch (err: unknown) {
    const latency_ms = Date.now() - startTime;
    const errorMessage = err instanceof Error ? err.message : "Unknown extraction error";

    return NextResponse.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: errorMessage,
          latency_ms,
        },
      },
      { status: 500 }
    );
  }
}
