import { ChatAnthropic } from "@langchain/anthropic";

export const llm = new ChatAnthropic({
  model: "claude-opus-4-8",
  temperature: 0.4,
});
