/**
 * Talaan Model Client
 *
 * Exclusively powered by Meta Muse Glimmer 30B (Open Weights via NVIDIA NIM or Kaggle 2x T4).
 * Zero proprietary cloud dependencies. Zero LLM arithmetic.
 */
import OpenAI from "openai";

export type ModelProvider = "glimmer";

export function getActiveProvider(): ModelProvider {
  return "glimmer";
}

export function getActiveModelName(): string {
  return process.env.GLIMMER_MODEL || "meta/muse-glimmer-30b";
}

export const activeProvider: ModelProvider = "glimmer";
export const activeModelName: string = process.env.GLIMMER_MODEL || "meta/muse-glimmer-30b";

export function getModelClient(): { client: OpenAI; model: string; provider: ModelProvider } {
  const model = getActiveModelName();
  const baseURL = process.env.GLIMMER_BASE_URL;
  const apiKey = process.env.GLIMMER_API_KEY;

  if (!baseURL || !apiKey) {
    throw new Error("The Model is currently unavailable, please try again later.");
  }

  const client = new OpenAI({
    baseURL,
    apiKey,
  });

  return { client, model, provider: "glimmer" };
}
