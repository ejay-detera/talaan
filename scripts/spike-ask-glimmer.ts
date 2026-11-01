/**
 * Phase 0 Spike: Tanungin si Talaan on Meta Muse Glimmer 30B
 *
 * Tests native text tool calling, response structure, and round-trip latency.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/spike-ask-glimmer.ts
 */

import { getModelClient } from "../src/lib/model";
import type { ChatCompletionTool, ChatCompletionMessageParam } from "openai/resources/chat/completions";

async function runSpike() {
  console.log("=================================================");
  console.log("  Tanungin si Talaan — Glimmer Tool Spike Test   ");
  console.log("=================================================\n");

  const { client, model } = getModelClient();
  console.log("Model Target:", model);
  console.log("Base URL:    ", client.baseURL);

  const tools: ChatCompletionTool[] = [
    {
      type: "function",
      function: {
        name: "list_overdue_customers",
        description: "List customers with unpaid balances who have not transacted in >= 7 days or exceed their credit limit.",
        parameters: {
          type: "object",
          properties: {
            min_days: { type: "number", description: "Minimum days inactive, default 7" },
            limit: { type: "number", description: "Max customers to return, default 5" },
          },
          required: [],
        },
      },
    },
    {
      type: "function",
      function: {
        name: "check_page_discrepancies",
        description: "Check recent notebook pages where written total does not match computed total.",
        parameters: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Max pages to check" },
          },
          required: [],
        },
      },
    },
  ];

  const userQuestion = "Sino ang dapat kong singilin ngayon?";
  console.log(`\n[Question]: "${userQuestion}"`);

  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "Ikaw si Talaan, isang mapagkakatiwalaang katuwang sa sari-sari store bookkeeping. Gumamit ng tools para alamin ang datos sa ledger. Sagutin ang tindera sa maikling Taglish (max 2 pangungusap). Huwag kailanman mag-imbento ng halaga o numero.",
    },
    {
      role: "user",
      content: userQuestion,
    },
  ];

  console.log("\n>>> Dispatching Call #1 (Tool Selection)...");
  const t0 = Date.now();
  const res1 = await client.chat.completions.create({
    model,
    messages,
    tools,
    tool_choice: "auto",
    max_tokens: 512,
  });
  const ms1 = Date.now() - t0;
  console.log(`<<< Call #1 Finished in ${ms1}ms`);

  const msg1 = res1.choices[0]?.message;
  console.log("Finish Reason:", res1.choices[0]?.finish_reason);
  console.log("Tool Calls:", JSON.stringify(msg1?.tool_calls, null, 2));

  if (!msg1?.tool_calls || msg1.tool_calls.length === 0) {
    console.log("NOTE: Model answered directly without tool calls:");
    console.log(msg1?.content);
    return;
  }

  // Append assistant message with tool calls
  messages.push(msg1);

  // Provide mock tool execution results
  for (const call of msg1.tool_calls) {
    if (!("function" in call)) continue;
    console.log(`\nMocking execution for tool: ${call.function.name}`);
    if (call.function.name === "list_overdue_customers") {
      const mockResult = {
        overdue_customers: [
          {
            name: "Nanay Cora",
            balance: "₱45.00",
            balance_centavos: 4500,
            days_inactive: 8,
            reason: "Nakalipas na 8 araw mula huling bayad",
          },
          {
            name: "Kuya Jun",
            balance: "₱520.00",
            balance_centavos: 52000,
            days_inactive: 2,
            reason: "Lumagpas sa ₱500 credit limit",
          },
        ],
        total_overdue: "₱565.00",
        total_overdue_centavos: 56500,
      };

      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify(mockResult),
      });
    } else {
      messages.push({
        role: "tool",
        tool_call_id: call.id,
        content: JSON.stringify({ result: "no_data" }),
      });
    }
  }

  console.log("\n>>> Dispatching Call #2 (Taglish Synthesis)...");
  const t1 = Date.now();
  const res2 = await client.chat.completions.create({
    model,
    messages,
    max_tokens: 512,
  });
  const ms2 = Date.now() - t1;
  console.log(`<<< Call #2 Finished in ${ms2}ms`);

  const finalAnswer = res2.choices[0]?.message?.content;
  console.log("\n=================================================");
  console.log("  Final Taglish Response:");
  console.log("=================================================");
  console.log(finalAnswer);
  console.log("-------------------------------------------------");
  console.log(`Total Latency: ${ms1 + ms2}ms (Call 1: ${ms1}ms, Call 2: ${ms2}ms)`);
  console.log("Spike completed successfully!");
}

runSpike().catch((err) => {
  console.error("Spike failed with error:", err);
  process.exit(1);
});

