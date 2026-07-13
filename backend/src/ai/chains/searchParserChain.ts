import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { llm } from "../llm";

const SearchParamsSchema = z.object({
  destination: z.string().optional().describe("City or country name"),
  checkIn:     z.string().optional().describe("Check-in date as YYYY-MM-DD"),
  checkOut:    z.string().optional().describe("Check-out date as YYYY-MM-DD"),
  adultCount:  z.number().int().min(1).optional().describe("Number of adults"),
  childCount:  z.number().int().min(0).optional().describe("Number of children"),
  maxPrice:    z.number().optional().describe("Maximum price per night in GBP"),
  types:       z.array(z.string()).optional().describe("Hotel types e.g. Beach Resort, Luxury, Budget"),
  stars:       z.array(z.string()).optional().describe("Star ratings as strings e.g. ['4','5']"),
  facilities:  z.array(z.string()).optional().describe("Amenities e.g. Free WiFi, Pool, Spa"),
  sortOption:  z.string().optional().describe("One of: starRating, pricePerNightAsc, pricePerNightDesc"),
});

const prompt = ChatPromptTemplate.fromTemplate(`
You are a hotel search assistant. Extract structured search parameters from
the user's query. Only include fields that are explicitly or clearly implied.
Convert relative dates using today's date: {today}.

Available hotel types: Budget, Luxury, Boutique, Family, Romantic,
Hiking Resort, Cabin, Beach Resort, Golf Resort, Motel, All Inclusive,
Pet Friendly, Self Catering, Business, Hostel, Extended Stays.

Available facilities: Free WiFi, Parking, Airport Shuttle, Family Rooms,
Non-Smoking Rooms, Outdoor Pool, Spa, Fitness Center.

User query: {query}
`);

export const searchParserChain = prompt.pipe(
  llm.withStructuredOutput(SearchParamsSchema)
);
