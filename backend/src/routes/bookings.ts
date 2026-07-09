import express, { Request, Response } from "express";
import Stripe from "stripe";
import verifyToken from "../middleware/auth";
import Hotel from "../models/hotel";
import Booking from "../models/booking";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

// POST /api/bookings/payment-intent
router.post("/payment-intent", verifyToken, async (req: Request, res: Response) => {
  try {
    const { numberOfNights, hotelId } = req.body;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      res.status(400).json({ message: "Hotel not found" });
      return;
    }

    const totalCost = hotel.pricePerNight * Number(numberOfNights);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCost * 100,
      currency: "gbp",
      metadata: { hotelId, userId: req.userId },
    });

    if (!paymentIntent.client_secret) {
      res.status(500).json({ message: "Error creating payment intent" });
      return;
    }

    res.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      totalCost,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// POST /api/bookings
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, hotelId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (!paymentIntent) {
      res.status(400).json({ message: "Payment intent not found" });
      return;
    }

    if (
      paymentIntent.metadata.hotelId !== hotelId ||
      paymentIntent.metadata.userId !== req.userId
    ) {
      res.status(400).json({ message: "Payment intent mismatch" });
      return;
    }

    if (paymentIntent.status !== "succeeded") {
      res.status(400).json({
        message: `Payment not successful: ${paymentIntent.status}`,
      });
      return;
    }

    const booking = new Booking({
      ...req.body,
      userId: req.userId,
    });

    await booking.save();
    res.status(201).json(booking);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

// GET /api/bookings
router.get("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find({ userId: req.userId }).sort({
      checkIn: -1,
    });

    const hotelIds = [...new Set(bookings.map((b) => b.hotelId))];
    const hotels = await Hotel.find({ _id: { $in: hotelIds } });
    const hotelMap = Object.fromEntries(hotels.map((h) => [h._id.toString(), h]));

    const result = bookings.map((b) => ({
      ...b.toObject(),
      hotel: hotelMap[b.hotelId] || null,
    }));

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
