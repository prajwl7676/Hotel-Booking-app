import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import * as apiClient from "../api-client";
import { useSearchContext } from "../contexts/SearchContext";
import BookingDetailsSummary from "../components/BookingDetailsSummary";
import BookingForm from "../components/BookingForm";

const Booking = () => {
  const { hotelId } = useParams();
  const search = useSearchContext();

  const numberOfNights = Math.max(
    1,
    Math.ceil(
      (search.checkOut.getTime() - search.checkIn.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  const { data: hotel, isLoading: hotelLoading } = useQuery(
    ["fetchHotelById", hotelId],
    () => apiClient.fetchHotelById(hotelId as string),
    { enabled: !!hotelId }
  );

  const { data: currentUser, isLoading: userLoading } = useQuery(
    "fetchCurrentUser",
    apiClient.fetchCurrentUser
  );

  if (hotelLoading || userLoading) {
    return <span>Loading...</span>;
  }

  if (!hotel || !currentUser) {
    return <></>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Complete Your Booking</h1>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 items-start">
        <BookingDetailsSummary
          hotel={hotel}
          checkIn={search.checkIn}
          checkOut={search.checkOut}
          adultCount={search.adultCount}
          childCount={search.childCount}
          numberOfNights={numberOfNights}
        />
        <BookingForm
          currentUser={currentUser}
          numberOfNights={numberOfNights}
          pricePerNight={hotel.pricePerNight}
        />
      </div>
    </div>
  );
};

export default Booking;
