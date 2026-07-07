import { AiFillStar } from "react-icons/ai";
import { BsMap } from "react-icons/bs";
import { HotelType } from "../../../backend/src/shared/types";

type Props = {
  hotel: HotelType;
  checkIn: Date;
  checkOut: Date;
  adultCount: number;
  childCount: number;
  numberOfNights: number;
};

const BookingDetailsSummary = ({
  hotel,
  checkIn,
  checkOut,
  adultCount,
  childCount,
  numberOfNights,
}: Props) => {
  return (
    <div className="rounded-xl border border-slate-200 shadow-sm bg-white p-5 space-y-5 h-fit">
      <h2 className="text-xl font-bold text-slate-800">Your Booking</h2>

      {/* Hotel info */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="flex">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <AiFillStar key={i} className="fill-yellow-400 text-sm" />
            ))}
          </span>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
            {hotel.type}
          </span>
        </div>
        <h3 className="font-bold text-slate-800 text-lg">{hotel.name}</h3>
        <p className="flex items-center gap-1 text-slate-500 text-sm">
          <BsMap className="shrink-0" />
          {hotel.city}, {hotel.country}
        </p>
      </div>

      <hr className="border-slate-200" />

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Check-in
          </p>
          <p className="font-semibold text-slate-800">
            {checkIn.toDateString()}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
            Check-out
          </p>
          <p className="font-semibold text-slate-800">
            {checkOut.toDateString()}
          </p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
        {numberOfNights} night{numberOfNights !== 1 ? "s" : ""} total stay
      </div>

      <hr className="border-slate-200" />

      {/* Guests */}
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Guests
        </p>
        <p className="text-slate-700 text-sm">
          {adultCount} adult{adultCount !== 1 ? "s" : ""}
          {childCount > 0
            ? `, ${childCount} child${childCount !== 1 ? "ren" : ""}`
            : ""}
        </p>
      </div>

      <hr className="border-slate-200" />

      {/* Total */}
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Total Cost
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            £{hotel.pricePerNight} × {numberOfNights} night
            {numberOfNights !== 1 ? "s" : ""}
          </p>
        </div>
        <span className="text-2xl font-bold text-slate-800">
          £{hotel.pricePerNight * numberOfNights}
        </span>
      </div>
    </div>
  );
};

export default BookingDetailsSummary;
