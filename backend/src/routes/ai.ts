import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import { descriptionChain } from "../ai/chains/descriptionChain";
import { searchParserChain } from "../ai/chains/searchParserChain";
import { emailChain } from "../ai/chains/emailChain";
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
