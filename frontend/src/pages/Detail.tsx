import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { AiFillStar } from "react-icons/ai";
import { Link } from "react-router-dom";
import * as apiClient from "../api-client";
import { useSearchContext } from "../contexts/SearchContext";

const Detail = () => {
  const { hotelId } = useParams();
  const search = useSearchContext();

  const { data: hotel, isLoading } = useQuery(
    ["fetchHotelById", hotelId],
    () => apiClient.fetchHotelById(hotelId as string),
    { enabled: !!hotelId }
  );

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!hotel) {
    return <></>;
  }

  return (
    <div className="space-y-6">
      <div>
        <span className="flex">
          {Array.from({ length: hotel.starRating }).map((_, i) => (
            <AiFillStar key={i} className="fill-yellow-400" />
          ))}
        </span>
        <h1 className="text-3xl font-bold">{hotel.name}</h1>
        <p className="text-slate-500">
          {hotel.city}, {hotel.country}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {hotel.imageUrls.map((url, i) => (
          <div key={i} className="h-[300px]">
            <img
              src={url}
              alt={hotel.name}
              className="rounded-md w-full h-full object-cover object-center"
            />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
        {hotel.facilities.map((facility) => (
          <div
            key={facility}
            className="border border-slate-300 rounded-sm p-3 text-sm"
          >
            {facility}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        <div className="whitespace-pre-line">{hotel.description}</div>
        <div className="h-fit">
          <div className="grid gap-4 rounded border border-slate-300 p-4">
            <h3 className="text-xl font-bold">£{hotel.pricePerNight} per night</h3>
            <Link
              to={`/booking/${hotel._id}`}
              onClick={() =>
                search.saveSearchValues(
                  search.destination,
                  search.checkIn,
                  search.checkOut,
                  search.adultCount,
                  search.childCount,
                  hotel._id
                )
              }
              className="bg-blue-600 text-white p-2 font-bold text-xl text-center hover:bg-blue-500"
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Detail;
