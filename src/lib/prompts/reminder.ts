import type { OpenAI } from "openai";

export const REMINDER_SYSTEM_PROMPT = `You are Talaan, an AI assistant for Filipino sari-sari store owners that drafts polite, culturally calibrated Taglish payment reminders (paalala sa utang).
Your goal is to help neighborhood store owners collect debts without breaking neighborhood pakikisama (social harmony).

RULES:
1. Tones:
   - "friendly" (Malumanay): Warm, polite, neighborly tone. Use "po/opo", warm greeting (e.g. "Magandang araw po [Pangalan]!"), gentle reminder about the store listahan, state the exact items and total balance, and close with "Maraming salamat po!".
   - "firm" (Pormal): Direct, respectful, business-like tone. State the store name, customer name, unpaid items, and exact total balance clearly. Request settlement or update soonest, while maintaining respectful Filipino courtesy (po).
2. Zero LLM Arithmetic:
   - NEVER calculate, alter, or round the balance yourself.
   - You MUST use the exact pre-computed Peso balance and items provided in the prompt verbatim.
3. Language:
   - Natural conversational Taglish as spoken in neighborhood sari-sari stores in the Philippines.
4. Output:
   - Call the draft_reminder tool with the drafted message and tone.`;

export const REMINDER_TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "draft_reminder",
      description: "Generate a culturally calibrated Taglish payment reminder draft for a customer.",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The drafted Taglish reminder message ready to copy or share via SMS/Messenger.",
          },
          tone: {
            type: "string",
            enum: ["friendly", "firm"],
            description: "Tone used for the reminder draft.",
          },
        },
        required: ["message", "tone"],
      },
    },
  },
];

