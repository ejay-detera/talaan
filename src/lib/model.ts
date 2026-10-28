/**
 * Unified Model Client
 *
 * CANONICAL PRIMARY: Meta Muse Glimmer 30B (served via llama.cpp llama-server on Kaggle 2x T4).
 * AUXILIARY DEV BACKUP ONLY: Gemini API (used solely when offline or without active GPU compute).
 * All evaluations, Day 3 handwriting gates, and demo submissions run strictly on Muse Glimmer.
 */
import OpenAI from "openai";

export type ModelProvider = "glimmer" | "gemini";

export function getActiveProvider(): ModelProvider {
  return (process.env.MODEL_PROVIDER as ModelProvider) ?? "glimmer";
}

export function getActiveModelName(): string {
  const provider = getActiveProvider();
  return provider === "gemini"
    ? process.env.GEMINI_MODEL || "gemini-2.0-flash"
    : "muse-glimmer";
}

export const activeProvider: ModelProvider = (process.env.MODEL_PROVIDER as ModelProvider) ?? "glimmer";
export const activeModelName: string =
  activeProvider === "gemini"
    ? process.env.GEMINI_MODEL || "gemini-2.0-flash"
    : "muse-glimmer";

export function getModelClient(): { client: OpenAI; model: string; provider: ModelProvider } {
  const provider = getActiveProvider();
  const model = getActiveModelName();
  const isGemini = provider === "gemini";

  const baseURL = isGemini
    ? process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai"
    : process.env.GLIMMER_BASE_URL;

  const apiKey = isGemini
    ? process.env.GEMINI_API_KEY
    : process.env.GLIMMER_API_KEY ?? "none";

  if (!baseURL) {
    throw new Error(
      isGemini
        ? "GEMINI_BASE_URL is not configured"
        : "GLIMMER_BASE_URL is not configured. Set the Kaggle tunnel URL in .env.local"
    );
  }

  if (isGemini && !apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in .env.local");
  }

  const client = new OpenAI({
    baseURL,
    apiKey: apiKey || "dummy-key",
  });

  return { client, model, provider };
}
