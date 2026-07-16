import express, { Request, Response } from "express";
import { HumanMessage } from "@langchain/core/messages";
import verifyToken from "../middleware/auth";
import { descriptionChain } from "../ai/chains/descriptionChain";
import { searchParserChain } from "../ai/chains/searchParserChain";
import { emailChain } from "../ai/chains/emailChain";
import { concierge } from "../ai/agent/graph";
import Booking from "../models/booking";
import Hotel from "../models/hotel";

const router = express.Router();

// POST /api/ai/generate-description
// Authenticated hotel owners call this to get AI-generated marketing copy
router.post(
  "/generate-description",
  verifyToken,
  async (req: Request, res: Response) => {
    const { name, city, country, starRating, type, facilities, pricePerNight } =
      req.body;

    if (!name || !city || !country) {
      res.status(400).json({ message: "name, city, and country are required" });
      return;
    }

    try {
      const description = await descriptionChain.invoke({
        name,
        city,
        country,
        starRating: starRating ?? "",
        type: type ?? "",
        facilities: Array.isArray(facilities) ? facilities.join(", ") : "",
        pricePerNight: pricePerNight ?? "",
      });

      res.json({ description });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to generate description" });
    }
  }
);

// POST /api/ai/chat
// Streams the AI concierge's response token-by-token via SSE
router.post("/chat", verifyToken, async (req: Request, res: Response) => {
  const { message, threadId } = req.body;

  if (!message || typeof message !== "string") {
    res.status(400).json({ message: "message string is required" });
    return;
  }

  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");

  const thread = threadId ?? req.userId;
  const config = { configurable: { thread_id: thread }, version: "v2" as const };

  try {
    const stream = concierge.streamEvents(
      { messages: [new HumanMessage(message)] },
      config
    );

    for await (const event of stream) {
      if (
        event.event === "on_chat_model_stream" &&
        event.data?.chunk?.content
      ) {
        const token = event.data.chunk.content;
        res.write(`data: ${JSON.stringify({ type: "token", content: token })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
  } catch (error) {
    console.log(error);
    res.write(`data: ${JSON.stringify({ type: "error", content: "Something went wrong" })}\n\n`);
  } finally {
    res.end();
  }
});

// POST /api/ai/parse-search
// Public — no auth needed; converts a natural-language query into SearchParams
router.post("/parse-search", async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    res.status(400).json({ message: "query string is required" });
    return;
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const params = await searchParserChain.invoke({ query, today });
    res.json(params);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to parse search query" });
  }
});

// POST /api/ai/booking-email
// Returns an HTML confirmation email for one of the current user's bookings
router.post("/booking-email", verifyToken, async (req: Request, res: Response) => {
  const { bookingId } = req.body;

  if (!bookingId) {
    res.status(400).json({ message: "bookingId is required" });
    return;
  }

  try {
    const booking = await Booking.findOne({ _id: bookingId, userId: req.userId });
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }

    const html = await emailChain.invoke({
      bookingId:  booking._id.toString(),
      guestName:  req.userId,
      hotelName:  hotel.name,
      city:       hotel.city,
      country:    hotel.country,
      checkIn:    new Date(booking.checkIn).toDateString(),
      checkOut:   new Date(booking.checkOut).toDateString(),
      adultCount: booking.adultCount,
      childCount: booking.childCount,
      totalCost:  booking.totalCost,
    });

    res.json({ html });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to generate email" });
  }
});

export default router;
