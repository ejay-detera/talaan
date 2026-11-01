import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { getModelClient } from "@/lib/model";
import { ASK_TOOLS, executeAskTool, type ToolExecutionOutput } from "./tools";
import { validateAnswerWithGuard } from "./guard";
import { generateFallbackAnswer } from "./fallback";
import type { AskResultCards } from "./schemas";

export type AskStreamEvent =
  | { type: "status"; message: string }
  | { type: "tool"; tool: string; input: Record<string, unknown> }
  | { type: "cards"; cards: AskResultCards }
  | { type: "answer"; text: string; fallback?: boolean; guard_passed?: boolean }
  | { type: "error"; error: string }
  | { type: "done" };

export interface RunAskAgentOptions {
  question: string;
  supabase: SupabaseClient<Database>;
  signal?: AbortSignal;
}

/**
 * Runs the Tanungin si Talaan conversational loop using Meta Muse Glimmer 30B.
 * Yields streaming events in real-time:
 * 1. Status ("Sinusuri...")
 * 2. Tool identification & Execution
 * 3. Result cards (emitted BEFORE prose)
 * 4. Taglish synthesis validated by strict Number Guard
 * 5. Deterministic fallback if guard fails or error occurs
 */
export async function* runAskAgent({
  question,
  supabase,
  signal,
}: RunAskAgentOptions): AsyncGenerator<AskStreamEvent, void, unknown> {
  yield { type: "status", message: "Sinusuri ang tanong sa talaan..." };

  let modelClient;
  try {
    modelClient = getModelClient();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "The Model is currently unavailable, please try again later.";
    yield { type: "error", error: message };
    yield { type: "done" };
    return;
  }

  const { client, model } = modelClient;

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "Ikaw si Talaan, isang mapagkakatiwalaang katuwang sa sari-sari store bookkeeping. Gumamit ng tools para alamin ang datos sa ledger. Sagutin ang tindera sa maikling Taglish (1-2 pangungusap). Huwag kailanman mag-imbento o magbago ng halaga o numero mula sa tool results.",
    },
    {
      role: "user",
      content: question,
    },
  ];

  let res1;
  try {
    res1 = await client.chat.completions.create(
      {
        model,
        messages,
        tools: ASK_TOOLS,
        tool_choice: "auto",
        max_tokens: 512,
      },
      { signal }
    );
  } catch (err: unknown) {
    console.error("[Ask Talaan] Call #1 failed:", err);
    yield {
      type: "error",
      error: "Hindi maabot ang modelo sa ngayon. Subukan muli maya-maya.",
    };
    yield { type: "done" };
    return;
  }

  const msg1 = res1.choices[0]?.message;

  if (!msg1?.tool_calls || msg1.tool_calls.length === 0) {
    // Answered directly without tool calls
    yield {
      type: "answer",
      text: msg1?.content || "Natanggap ang tanong ngunit walang nakitang kaugnay na tala.",
    };
    yield { type: "done" };
    return;
  }

  messages.push(msg1);

  const allowedCentavos: number[] = [];
  const combinedCards: AskResultCards = {};
  let primaryToolName = "";
  let primaryToolResult: Record<string, unknown> = {};

  // Execute tool calls
  for (const call of msg1.tool_calls) {
    if (!("function" in call)) continue;
    const toolName = call.function.name;
    let parsedArgs: Record<string, unknown> = {};

    try {
      parsedArgs = JSON.parse(call.function.arguments || "{}");
    } catch {
      parsedArgs = {};
    }

    yield {
      type: "tool",
      tool: toolName,
      input: parsedArgs,
    };

    yield {
      type: "status",
      message: `Kinukuha ang impormasyon (${toolName})...`,
    };

    let toolOutput: ToolExecutionOutput;
    try {
      toolOutput = await executeAskTool(toolName, parsedArgs, { supabase });
    } catch (err: unknown) {
      console.error(`[Ask Talaan] Tool execution failed for ${toolName}:`, err);
      toolOutput = {
        toolName,
        result: { error: "Failed to execute tool" },
        allowedAmountsCentavos: [],
      };
    }

    allowedCentavos.push(...toolOutput.allowedAmountsCentavos);

    if (toolOutput.cards) {
      Object.assign(combinedCards, toolOutput.cards);
    }

    if (!primaryToolName) {
      primaryToolName = toolName;
      primaryToolResult = toolOutput.result;
    }

    messages.push({
      role: "tool",
      tool_call_id: call.id,
      content: JSON.stringify(toolOutput.result),
    });
  }

  // Emit cards BEFORE prose synthesis
  if (Object.keys(combinedCards).length > 0) {
    yield {
      type: "cards",
      cards: combinedCards,
    };
  }

  yield {
    type: "status",
    message: "Ipinapaliwanag ang resulta sa Taglish...",
  };

  // Call #2: Synthesis
  let synthesisText = "";
  let synthesisFailed = false;

  try {
    const res2 = await client.chat.completions.create(
      {
        model,
        messages,
        max_tokens: 512,
      },
      { signal }
    );
    synthesisText = (res2.choices[0]?.message?.content || "").trim();
  } catch (err: unknown) {
    console.error("[Ask Talaan] Call #2 synthesis failed:", err);
    synthesisFailed = true;
  }

  if (synthesisFailed || !synthesisText) {
    const fallbackText = generateFallbackAnswer(primaryToolName, primaryToolResult);
    yield {
      type: "answer",
      text: fallbackText,
      fallback: true,
      guard_passed: false,
    };
    yield { type: "done" };
    return;
  }

  // Strict Number Guard Validation
  const guard = validateAnswerWithGuard(synthesisText, allowedCentavos);

  if (guard.ok) {
    yield {
      type: "answer",
      text: synthesisText,
      guard_passed: true,
      fallback: false,
    };
  } else {
    console.warn(
      "[Ask Talaan Guard] Hallucination rejected. Switching to deterministic fallback:",
      guard.violations
    );
    const fallbackText = generateFallbackAnswer(primaryToolName, primaryToolResult);
    yield {
      type: "answer",
      text: fallbackText,
      fallback: true,
      guard_passed: false,
    };
  }

  yield { type: "done" };
}

