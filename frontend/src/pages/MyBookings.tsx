import { useQuery } from "react-query";
import { AiFillStar } from "react-icons/ai";
import { BsMap } from "react-icons/bs";
import * as apiClient from "../api-client";

const MyBookings = () => {
  const { data: bookings, isLoading } = useQuery(
    "fetchMyBookings",
    apiClient.fetchMyBookings
  );

  if (isLoading) return <span>Loading...</span>;

  if (!bookings || bookings.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-3xl font-bold text-slate-800">My Bookings</h1>
        <p className="text-slate-500">You have no bookings yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold text-slate-800">My Bookings</h1>

      <div className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="flex flex-col md:flex-row gap-4 rounded-xl border border-slate-200 shadow-sm bg-white overflow-hidden"
          >
            {/* Hotel image */}
            {booking.hotel?.imageUrls?.[0] && (
              <img
                src={booking.hotel.imageUrls[0]}
                alt={booking.hotel.name}
                className="w-full md:w-48 h-40 md:h-auto object-cover shrink-0"
              />
            )}

            {/* Booking details */}
            <div className="flex flex-col justify-between p-4 flex-1 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="flex">
                    {Array.from({ length: booking.hotel?.starRating || 0 }).map(
                      (_, i) => (
                        <AiFillStar key={i} className="fill-yellow-400 text-sm" />
                      )
                    )}
                  </span>
                  {booking.hotel?.type && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                      {booking.hotel.type}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-lg">
                  {booking.hotel?.name || "Hotel"}
                </h3>
                <p className="flex items-center gap-1 text-slate-500 text-sm mt-0.5">
                  <BsMap className="shrink-0" />
                  {booking.hotel?.city}, {booking.hotel?.country}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                    Check-in
                  </p>
                  <p className="font-semibold text-slate-800">
                    {new Date(booking.checkIn).toDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">
                    Check-out
                  </p>
                  <p className="font-semibold text-slate-800">
                    {new Date(booking.checkOut).toDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-slate-600 text-sm">
                  {booking.adultCount} adult
                  {booking.adultCount !== 1 ? "s" : ""}
                  {booking.childCount > 0
                    ? `, ${booking.childCount} child${booking.childCount !== 1 ? "ren" : ""}`
                    : ""}
                </p>
                <span className="text-xl font-bold text-slate-800">
                  £{booking.totalCost}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBookings;
