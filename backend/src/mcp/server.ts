import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  searchHotels,
  getHotel,
  createPaymentIntentForMcp,
  getUserBookings,
} from "./tools";

export const mcpServer = new McpServer({
  name: "holidays-com",
  version: "1.0.0",
});

mcpServer.tool(
  "search_hotels",
  "Search hotels by destination, price, star rating, type, and facilities",
  {
    destination: z.string().optional().describe("City or country name"),
    adultCount:  z.number().int().min(1).optional(),
    childCount:  z.number().int().min(0).optional(),
    maxPrice:    z.number().optional().describe("Max price per night in GBP"),
    types:       z.array(z.string()).optional().describe("e.g. Beach Resort, Luxury"),
    stars:       z.array(z.string()).optional().describe("e.g. ['4','5']"),
    facilities:  z.array(z.string()).optional().describe("e.g. Free WiFi, Pool"),
    sortOption:  z.string().optional().describe("starRating | pricePerNightAsc | pricePerNightDesc"),
    page:        z.number().int().min(1).optional().default(1),
  },
  async (params) => {
    const result = await searchHotels(params);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

mcpServer.tool(
  "get_hotel",
  "Fetch full details for a specific hotel by its MongoDB ID",
  { hotelId: z.string().describe("MongoDB ObjectId of the hotel") },
  async ({ hotelId }) => {
    const hotel = await getHotel(hotelId);
    return { content: [{ type: "text", text: JSON.stringify(hotel) }] };
  }
);

mcpServer.tool(
  "create_payment_intent",
  "Create a Stripe PaymentIntent for a hotel booking and return the clientSecret",
  {
    hotelId:        z.string(),
    numberOfNights: z.number().int().min(1),
    userId:         z.string().describe("The authenticated user's ID"),
  },
  async (params) => {
    const result = await createPaymentIntentForMcp(params);
    return { content: [{ type: "text", text: JSON.stringify(result) }] };
  }
);

mcpServer.tool(
  "get_my_bookings",
  "List all bookings (with hotel details) for a given user ID",
  { userId: z.string() },
  async ({ userId }) => {
    const bookings = await getUserBookings(userId);
    return { content: [{ type: "text", text: JSON.stringify(bookings) }] };
  }
);

export async function startStdioMcp() {
  const { StdioServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/stdio.js"
  );
  await mcpServer.connect(new StdioServerTransport());
}
