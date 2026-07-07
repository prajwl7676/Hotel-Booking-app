import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "react-query";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AiFillStar } from "react-icons/ai";
import { BsMap } from "react-icons/bs";
import { BiHotel } from "react-icons/bi";
import * as apiClient from "../api-client";
import { useSearchContext } from "../contexts/SearchContext";
import { useAppContext } from "../contexts/AppContext";

const Detail = () => {
  const { hotelId } = useParams();
  const search = useSearchContext();
  const { isLoggedIn } = useAppContext();

  const [checkIn, setCheckIn] = useState<Date>(search.checkIn);
  const [checkOut, setCheckOut] = useState<Date>(search.checkOut);
  const [adultCount, setAdultCount] = useState<number>(search.adultCount);
  const [childCount, setChildCount] = useState<number>(search.childCount);

  const { data: hotel, isLoading } = useQuery(
    ["fetchHotelById", hotelId],
    () => apiClient.fetchHotelById(hotelId as string),
    { enabled: !!hotelId }
  );

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  const nights = Math.max(
    1,
    Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
  );

  const handleBookNow = () => {
    search.saveSearchValues(
      search.destination,
      checkIn,
      checkOut,
      adultCount,
      childCount,
      hotel?._id
    );
  };

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!hotel) {
    return <></>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="flex">
            {Array.from({ length: hotel.starRating }).map((_, i) => (
              <AiFillStar key={i} className="fill-yellow-400" />
            ))}
          </span>
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
            {hotel.type}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-slate-800">{hotel.name}</h1>
        <p className="flex items-center gap-1 text-slate-500 text-sm">
          <BsMap className="shrink-0" />
          {hotel.city}, {hotel.country}
        </p>
      </div>

      {/* Image grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {hotel.imageUrls.map((url, i) => (
          <div key={i} className="h-[280px]">
            <img
              src={url}
              alt={hotel.name}
              className="rounded-lg w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      {/* Facilities */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">
          Facilities
        </h2>
        <div className="flex flex-wrap gap-2">
          {hotel.facilities.map((facility) => (
            <span
              key={facility}
              className="bg-slate-100 border border-slate-200 text-slate-600 text-sm px-3 py-1 rounded-full"
            >
              {facility}
            </span>
          ))}
        </div>
      </div>

      {/* Description + Booking panel */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-3">
            About this property
          </h2>
          <p className="text-slate-600 leading-relaxed whitespace-pre-line">
            {hotel.description}
          </p>
          <div className="flex items-center gap-2 mt-4 text-slate-500 text-sm">
            <BiHotel />
            <span>
              Accommodates up to {hotel.adultCount} adults and{" "}
              {hotel.childCount} children
            </span>
          </div>
        </div>

        {/* Booking card */}
        <div className="sticky top-6 rounded-xl border border-slate-200 shadow-sm bg-white p-5 space-y-4">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-800">
              £{hotel.pricePerNight}
            </span>
            <span className="text-slate-500 text-sm">per night</span>
          </div>

          <hr className="border-slate-200" />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                Check-in
              </p>
              <DatePicker
                selected={checkIn}
                onChange={(date) => {
                  setCheckIn(date as Date);
                  if (date && date >= checkOut) {
                    const next = new Date(date);
                    next.setDate(next.getDate() + 1);
                    setCheckOut(next);
                  }
                }}
                selectsStart
                startDate={checkIn}
                endDate={checkOut}
                minDate={minDate}
                maxDate={maxDate}
                placeholderText="Check-in"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                wrapperClassName="w-full"
              />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
                Check-out
              </p>
              <DatePicker
                selected={checkOut}
                onChange={(date) => setCheckOut(date as Date)}
                selectsEnd
                startDate={checkIn}
                endDate={checkOut}
                minDate={new Date(checkIn.getTime() + 86400000)}
                maxDate={maxDate}
                placeholderText="Check-out"
                className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                wrapperClassName="w-full"
              />
            </div>
          </div>

          {/* Guests */}
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
              Guests
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-400">Adults</label>
                <input
                  type="number"
                  min={1}
                  max={hotel.adultCount}
                  value={adultCount}
                  onChange={(e) =>
                    setAdultCount(parseInt(e.target.value) || 1)
                  }
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">Children</label>
                <input
                  type="number"
                  min={0}
                  max={hotel.childCount}
                  value={childCount}
                  onChange={(e) =>
                    setChildCount(parseInt(e.target.value) || 0)
                  }
                  className="w-full border border-slate-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-blue-50 rounded-lg px-4 py-3 flex justify-between items-center">
            <span className="text-slate-600 text-sm">
              £{hotel.pricePerNight} × {nights} night{nights !== 1 ? "s" : ""}
            </span>
            <span className="font-bold text-slate-800">
              £{nights * hotel.pricePerNight}
            </span>
          </div>

          {isLoggedIn ? (
            <Link
              to={`/booking/${hotel._id}`}
              onClick={handleBookNow}
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-center rounded-lg transition-colors"
            >
              Book Now
            </Link>
          ) : (
            <Link
              to="/sign-in"
              className="block w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 text-center rounded-lg transition-colors"
            >
              Login to Book
            </Link>
          )}

          {!isLoggedIn && (
            <p className="text-xs text-slate-400 text-center">
              You need an account to complete your booking
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Detail;
