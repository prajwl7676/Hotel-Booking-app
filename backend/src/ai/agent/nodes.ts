import { AIMessage, HumanMessage, BaseMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { llm } from "../llm";
import { searchHotels } from "../../mcp/tools";

// ── State shape ────────────────────────────────────────────────────────────────

export type AgentIntent = "search" | "book" | "clarify" | "chitchat";

export type AgentState = {
  messages:      BaseMessage[];
  intent:        AgentIntent | null;
  searchParams:  Record<string, unknown> | null;
  hotels:        unknown[];
  selectedHotel: unknown | null;
};

// ── Intent classifier ──────────────────────────────────────────────────────────

const IntentSchema = z.object({
  intent: z
    .enum(["search", "book", "clarify", "chitchat"])
    .describe("The user's primary intent"),
  destination:  z.string().optional(),
  adultCount:   z.number().int().optional(),
  childCount:   z.number().int().optional(),
  maxPrice:     z.number().optional(),
  types:        z.array(z.string()).optional(),
  stars:        z.array(z.string()).optional(),
  facilities:   z.array(z.string()).optional(),
  sortOption:   z.string().optional(),
});

const classifierPrompt = ChatPromptTemplate.fromTemplate(`
You are a hotel booking assistant. Classify the user's latest message and
extract any search parameters present.

Intents:
- search: user wants to find hotels
- book: user wants to book a specific hotel they have already seen
- clarify: the query is too vague to search (missing destination or dates)
- chitchat: general question unrelated to hotel search or booking

Conversation so far:
{history}

Latest message: {message}
`);

export async function intentClassifier(state: AgentState): Promise<Partial<AgentState>> {
  const lastMessage = state.messages[state.messages.length - 1];
  const history = state.messages
    .slice(0, -1)
    .map((m) => `${m._getType()}: ${m.content}`)
    .join("\n");

  const result = await classifierPrompt
    .pipe(llm.withStructuredOutput(IntentSchema))
    .invoke({ history, message: lastMessage.content });

  const { intent, ...searchParams } = result;
  const hasParams = Object.keys(searchParams).some(
    (k) => searchParams[k as keyof typeof searchParams] !== undefined
  );

  return {
    intent,
    searchParams: hasParams ? searchParams : state.searchParams,
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
    .map((m) => `${m._getType()}: ${m.content}`)
    .join("\n");

  const response = await clarifierPrompt.pipe(llm).invoke({ history });
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

  const response = await presenterPrompt.pipe(llm).invoke({
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
  const response = await bookingPrompt.pipe(llm).invoke({
    hotels: JSON.stringify(state.hotels.slice(0, 3)),
    message: lastMessage.content,
  });
  return { messages: [new AIMessage(String(response.content))] };
}

// ── Router (used by graph conditional edge) ───────────────────────────────────

export function routeByIntent(state: AgentState): AgentIntent {
  return state.intent ?? "clarify";
}
