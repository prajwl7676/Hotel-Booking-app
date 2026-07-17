import { AIMessage, BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { getLlm, LlmProvider } from "../llm";
import { searchHotels } from "../../mcp/tools";

// ── State shape ────────────────────────────────────────────────────────────────

export type AgentIntent = "search" | "book" | "clarify" | "chitchat";

export type AgentState = {
  messages:      BaseMessage[];
  intent:        AgentIntent | null;
  searchParams:  Record<string, unknown> | null;
  hotels:        unknown[];
  selectedHotel: unknown | null;
  provider:      LlmProvider | null;
};

// ── Intent classifier ──────────────────────────────────────────────────────────

const IntentSchema = z.object({
  intent: z
    .enum(["search", "book", "clarify", "chitchat"])
    .describe("The user's primary intent"),
  destination:  z.string().nullish(),
  adultCount:   z.number().int().nullish(),
  childCount:   z.number().int().nullish(),
  maxPrice:     z.number().nullish(),
  types:        z.array(z.string()).nullish(),
  stars:        z.array(z.string()).nullish(),
  facilities:   z.array(z.string()).nullish(),
  sortOption:   z.string().nullish(),
});

const classifierPrompt = ChatPromptTemplate.fromTemplate(`
You are a hotel booking assistant. Classify the user's latest message and
extract any search parameters present.

Intents:
- search: user wants to find hotels
- book: user wants to book a specific hotel they have already seen
- clarify: the query is too vague to search (missing destination or dates)
- chitchat: general question unrelated to hotel search or booking

Rule: if the user wants a hotel but no destination is known from the
conversation, the intent MUST be "clarify", not "search".

Conversation so far:
{history}

Latest message: {message}
`);

export async function intentClassifier(state: AgentState): Promise<Partial<AgentState>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const history = state.messages
    .slice(0, -1)
    .map((m) => `${m.getType()}: ${m.content}`)
    .join("\n");

  const result = await classifierPrompt
    .pipe(getLlm(state.provider).withStructuredOutput(IntentSchema))
    .invoke({ history, message: lastMessage.content });

  // Llama (via Groq) fills unknown fields with null instead of omitting them
  const { intent, ...rest } = result;
  const searchParams = Object.fromEntries(
    Object.entries(rest).filter(([, v]) => v !== undefined && v !== null)
  );

  return {
    intent,
    searchParams:
      Object.keys(searchParams).length > 0 ? searchParams : state.searchParams,
  };
}

// ── Clarifier ──────────────────────────────────────────────────────────────────

const clarifierPrompt = ChatPromptTemplate.fromTemplate(`
You are a friendly hotel booking assistant. The user's request is too vague
to search — ask one short, specific follow-up question to get the missing
detail (destination is the most important).

Conversation so far:
{history}
`);

export async function clarifier(state: AgentState): Promise<Partial<AgentState>> {
  const history = state.messages
    .map((m) => `${m.getType()}: ${m.content}`)
    .join("\n");

  const response = await clarifierPrompt.pipe(getLlm(state.provider)).invoke({ history });
  return { messages: [new AIMessage(String(response.content))] };
}

// ── Chitchatter ────────────────────────────────────────────────────────────────

const chitchatPrompt = ChatPromptTemplate.fromTemplate(`
You are a friendly AI concierge for a hotel booking website. Reply briefly and
warmly to the user's message, and remind them you can help find or book hotels.

Conversation so far:
{history}
`);

export async function chitchatter(state: AgentState): Promise<Partial<AgentState>> {
  const history = state.messages
    .map((m) => `${m.getType()}: ${m.content}`)
    .join("\n");

  const response = await chitchatPrompt.pipe(getLlm(state.provider)).invoke({ history });
  return { messages: [new AIMessage(String(response.content))] };
}

// ── Hotel searcher ─────────────────────────────────────────────────────────────

export async function hotelSearcher(state: AgentState): Promise<Partial<AgentState>> {
  const params = (state.searchParams as Parameters<typeof searchHotels>[0]) ?? {};
  const result = await searchHotels(params);
  return { hotels: result.data };
}

// ── Presenter ─────────────────────────────────────────────────────────────────

const presenterPrompt = ChatPromptTemplate.fromTemplate(`
You are a hotel booking assistant. Present these hotels to the user in a
friendly, concise way. List up to 3 options with name, location, star rating,
and price per night. End by asking if they'd like to book one or refine the search.

Hotels (JSON): {hotels}
`);

export async function presenter(state: AgentState): Promise<Partial<AgentState>> {
  if (state.hotels.length === 0) {
    return {
      messages: [
        new AIMessage(
          "I couldn't find any hotels matching your criteria. Would you like to broaden the search?"
        ),
      ],
    };
  }

  const response = await presenterPrompt.pipe(getLlm(state.provider)).invoke({
    hotels: JSON.stringify(state.hotels.slice(0, 3)),
  });
  return { messages: [new AIMessage(String(response.content))] };
}

// ── Booking initiator ──────────────────────────────────────────────────────────

const bookingPrompt = ChatPromptTemplate.fromTemplate(`
The user wants to book a hotel. Based on the conversation, identify which
hotel they are referring to and respond with:
1. A brief confirmation of what they want to book
2. Tell them to use the "Book Now" button on the hotel detail page

Hotels they have seen: {hotels}
User message: {message}
`);

export async function bookingInitiator(state: AgentState): Promise<Partial<AgentState>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const response = await bookingPrompt.pipe(getLlm(state.provider)).invoke({
    hotels: JSON.stringify(state.hotels.slice(0, 3)),
    message: lastMessage.content,
  });
  return { messages: [new AIMessage(String(response.content))] };
}

// ── Router (used by graph conditional edge) ───────────────────────────────────

export function routeByIntent(state: AgentState): AgentIntent {
  return state.intent ?? "clarify";
}
