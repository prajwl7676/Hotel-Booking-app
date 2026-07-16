import { StateGraph, MemorySaver, Annotation } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import {
  AgentState,
  intentClassifier,
  clarifier,
  hotelSearcher,
  presenter,
  bookingInitiator,
  routeByIntent,
} from "./nodes";

const AgentAnnotation = Annotation.Root({
  messages: Annotation<BaseMessage[]>({
    reducer:  (existing, incoming) => [...existing, ...incoming],
    default:  () => [],
  }),
  intent: Annotation<AgentState["intent"]>({
    reducer: (_, b) => b,
    default: () => null,
  }),
  searchParams: Annotation<AgentState["searchParams"]>({
    reducer: (_, b) => b,
    default: () => null,
  }),
  hotels: Annotation<AgentState["hotels"]>({
    reducer: (_, b) => b,
    default: () => [],
  }),
  selectedHotel: Annotation<AgentState["selectedHotel"]>({
    reducer: (_, b) => b,
    default: () => null,
  }),
});

const graph = new StateGraph(AgentAnnotation)
  .addNode("intent_classifier", intentClassifier)
  .addNode("clarifier",         clarifier)
  .addNode("hotel_searcher",    hotelSearcher)
  .addNode("presenter",         presenter)
  .addNode("booking_initiator", bookingInitiator)
  .addEdge("__start__",         "intent_classifier")
  .addConditionalEdges("intent_classifier", routeByIntent, {
    search:   "hotel_searcher",
    clarify:  "clarifier",
    book:     "booking_initiator",
    chitchat: "presenter",
  })
  .addEdge("hotel_searcher",    "presenter")
  .addEdge("clarifier",         "__end__")
  .addEdge("presenter",         "__end__")
  .addEdge("booking_initiator", "__end__");

export const concierge = graph.compile({ checkpointer: new MemorySaver() });
