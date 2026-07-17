import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";

export type LlmProvider = "groq" | "gemini";

export const DEFAULT_PROVIDER: LlmProvider = "groq";

const groq = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0.4,
});

const gemini = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  temperature: 0.4,
});

export function getLlm(provider?: LlmProvider | null) {
  return provider === "gemini" ? gemini : groq;
}

// Default model, used by the standalone chains
export const llm = getLlm(DEFAULT_PROVIDER);
