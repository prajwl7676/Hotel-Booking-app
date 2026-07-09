import mongoose from "mongoose";
import { BookingType } from "../shared/types";

const bookingSchema = new mongoose.Schema<BookingType>({
  userId: { type: String, required: true },
  hotelId: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  adultCount: { type: Number, required: true },
  childCount: { type: Number, required: true },
  totalCost: { type: Number, required: true },
  paymentIntentId: { type: String, required: true },
});

const Booking = mongoose.model<BookingType>("Booking", bookingSchema);
export default Booking;
