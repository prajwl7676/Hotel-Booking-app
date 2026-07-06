import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";
import * as apiClient from "../api-client";

const Home = () => {
  const { data } = useQuery("fetchLatestHotels", () =>
    apiClient.searchHotels({})
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Latest Destinations</h2>
        <p className="text-slate-500">
          Most recent properties added to our platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.data.map((hotel) => (
          <Link
            key={hotel._id}
            to={`/detail/${hotel._id}`}
            className="relative cursor-pointer overflow-hidden rounded-md"
          >
            <div className="h-[300px]">
              <img
                src={hotel.imageUrls[0]}
                alt={hotel.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="absolute bottom-0 p-4 bg-black bg-opacity-50 w-full rounded-b-md">
              <span className="text-white font-bold tracking-tight text-2xl">
                {hotel.name}
              </span>
              <div className="flex items-center justify-between mt-1">
                <span className="flex text-yellow-400">
                  {Array.from({ length: hotel.starRating }).map((_, i) => (
                    <AiFillStar key={i} />
                  ))}
                </span>
                <span className="text-white font-bold text-sm">
                  £{hotel.pricePerNight} per night
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {data?.data.length === 0 && (
        <p className="text-slate-500 text-center py-10">
          No hotels listed yet. Be the first to{" "}
          <Link to="/add-hotel" className="text-blue-600 underline">
            add one
          </Link>
          .
        </p>
      )}
    </div>
  );
};

export default Home;
