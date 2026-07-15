import { isValidObjectId } from "mongoose";
import Stripe from "stripe";
import Hotel from "../models/hotel";
import Booking from "../models/booking";
import { HotelSearchResponse } from "../shared/types";

const stripe = new Stripe(process.env.STRIPE_API_KEY as string);

export type SearchHotelsParams = {
  destination?: string;
  adultCount?: number;
  childCount?: number;
  maxPrice?: number;
  types?: string[];
  stars?: string[];
  facilities?: string[];
  sortOption?: string;
  page?: number;
};

export async function searchHotels(
  params: SearchHotelsParams
): Promise<HotelSearchResponse> {
  const query: Record<string, unknown> = {};

  if (params.destination?.trim()) {
    const escaped = params.destination.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    query.$or = [
      { city: new RegExp(escaped, "i") },
      { country: new RegExp(escaped, "i") },
    ];
  }

  if (params.adultCount) query.adultCount = { $gte: params.adultCount };
  if (params.childCount) query.childCount = { $gte: params.childCount };
  if (params.maxPrice)   query.pricePerNight = { $lte: params.maxPrice };

  if (params.facilities?.length)
    query.facilities = { $all: params.facilities };

  if (params.types?.length)
    query.type = { $in: params.types };

  if (params.stars?.length) {
    const starRatings = params.stars.map(Number).filter((n) => !isNaN(n));
    if (starRatings.length) query.starRating = { $in: starRatings };
  }

  let sortOptions: Record<string, 1 | -1> = {};
  switch (params.sortOption) {
    case "starRating":        sortOptions = { starRating: -1 };    break;
    case "pricePerNightAsc":  sortOptions = { pricePerNight: 1 };  break;
    case "pricePerNightDesc": sortOptions = { pricePerNight: -1 }; break;
  }

  const pageSize   = 5;
  const pageNumber = params.page ?? 1;
  const skip       = (pageNumber - 1) * pageSize;

  const [hotels, total] = await Promise.all([
    Hotel.find(query).sort(sortOptions).skip(skip).limit(pageSize).lean(),
    Hotel.countDocuments(query),
  ]);

  return {
    data: hotels as any,
    pagination: { total, page: pageNumber, pages: Math.ceil(total / pageSize) },
  };
}

export async function getHotel(hotelId: string) {
  if (!isValidObjectId(hotelId)) throw new Error("Invalid hotel ID");
  const hotel = await Hotel.findById(hotelId).lean();
  if (!hotel) throw new Error("Hotel not found");
  return hotel;
}

export type CreatePaymentIntentParams = {
  hotelId: string;
  numberOfNights: number;
  userId: string;
};

export async function createPaymentIntentForMcp(
  params: CreatePaymentIntentParams
) {
  const hotel = await Hotel.findById(params.hotelId);
  if (!hotel) throw new Error("Hotel not found");

  const totalCost = hotel.pricePerNight * params.numberOfNights;

  const paymentIntent = await stripe.paymentIntents.create({
    amount:   totalCost * 100,
    currency: "gbp",
    metadata: { hotelId: params.hotelId, userId: params.userId },
  });

  if (!paymentIntent.client_secret) throw new Error("Stripe did not return a client secret");

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret:    paymentIntent.client_secret,
    totalCost,
  };
}

export async function getUserBookings(userId: string) {
  const bookings = await Booking.find({ userId }).sort({ checkIn: -1 }).lean();

  const hotelIds = [...new Set(bookings.map((b) => b.hotelId))];
  const hotels   = await Hotel.find({ _id: { $in: hotelIds } }).lean();
  const hotelMap = Object.fromEntries(hotels.map((h) => [h._id.toString(), h]));

  return bookings.map((b) => ({ ...b, hotel: hotelMap[b.hotelId] ?? null }));
}
