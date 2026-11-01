import { describe, it, expect, vi, beforeEach } from "vitest";
import { runAskAgent, type AskStreamEvent } from "../agent";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const mockCreate = vi.fn();

vi.mock("@/lib/model", () => ({
  getModelClient: () => ({
    client: {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    },
    model: "meta/muse-glimmer-30b",
    provider: "glimmer",
  }),
}));

vi.mock("../tools", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../tools")>();
  return {
    ...actual,
    executeAskTool: vi.fn(async (toolName: string) => {
      if (toolName === "list_overdue_customers") {
        return {
          toolName: "list_overdue_customers",
          result: {
            count: 1,
            total_overdue: "₱45.00",
            overdue_customers: [
              {
                id: "c-1",
                name: "Nanay Cora",
                balance: 45,
                balance_formatted: "₱45.00",
                days_inactive: 8,
                reason: "inactive_7_days",
              },
            ],
          },
          cards: {
            overdue_customers: [
              {
                id: "c-1",
                name: "Nanay Cora",
                balance: "₱45.00",
                balance_num: 45,
                days_inactive: 8,
                reason: "inactive_7_days",
              },
            ],
          },
          allowedAmountsCentavos: [4500],
        };
      }
      return {
        toolName,
        result: {},
        allowedAmountsCentavos: [],
      };
    }),
  };
});

describe("runAskAgent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSupabase = {} as unknown as SupabaseClient<Database>;

  it("handles full tool-calling flow with valid synthesis", async () => {
    // Call 1: tool selection
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_123",
                type: "function",
                function: {
                  name: "list_overdue_customers",
                  arguments: JSON.stringify({ min_days: 7 }),
                },
              },
            ],
          },
        },
      ],
    });

    // Call 2: synthesis
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            role: "assistant",
            content: "Si Nanay Cora ang may overdue na ₱45.00.",
          },
        },
      ],
    });

    const events: AskStreamEvent[] = [];
    for await (const evt of runAskAgent({
      question: "Sino dapat singilin?",
      supabase: mockSupabase,
    })) {
      events.push(evt);
    }

    const types = events.map((e) => e.type);
    expect(types).toContain("status");
    expect(types).toContain("tool");
    expect(types).toContain("cards");
    expect(types).toContain("answer");
    expect(types).toContain("done");

    const answerEvt = events.find((e) => e.type === "answer");
    expect(answerEvt).toEqual({
      type: "answer",
      text: "Si Nanay Cora ang may overdue na ₱45.00.",
      guard_passed: true,
      fallback: false,
    });
  });

  it("falls back to deterministic text when guard detects hallucination", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            role: "assistant",
            content: null,
            tool_calls: [
              {
                id: "call_123",
                type: "function",
                function: {
                  name: "list_overdue_customers",
                  arguments: "{}",
                },
              },
            ],
          },
        },
      ],
    });

    // Call 2 returns hallucinated amount ₱999.00
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            role: "assistant",
            content: "Si Nanay Cora ay may ₱999.00 na utang.",
          },
        },
      ],
    });

    const events: AskStreamEvent[] = [];
    for await (const evt of runAskAgent({
      question: "Sino dapat singilin?",
      supabase: mockSupabase,
    })) {
      events.push(evt);
    }

    const answerEvt = events.find(
      (e): e is Extract<AskStreamEvent, { type: "answer" }> => e.type === "answer"
    );
    expect(answerEvt?.guard_passed).toBe(false);
    expect(answerEvt?.fallback).toBe(true);
    expect(answerEvt?.text).toContain("Nanay Cora");
    expect(answerEvt?.text).toContain("₱45.00");
    expect(answerEvt?.text).not.toContain("₱999.00");
  });

  it("handles direct response when model decides no tools are needed", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            role: "assistant",
            content: "Kamusta po! Ano po ang maitutulong ko sa inyong tindahan?",
          },
        },
      ],
    });

    const events: AskStreamEvent[] = [];
    for await (const evt of runAskAgent({
      question: "Kumusta?",
      supabase: mockSupabase,
    })) {
      events.push(evt);
    }

    const answerEvt = events.find((e) => e.type === "answer");
    expect(answerEvt).toEqual({
      type: "answer",
      text: "Kamusta po! Ano po ang maitutulong ko sa inyong tindahan?",
    });
  });
});
