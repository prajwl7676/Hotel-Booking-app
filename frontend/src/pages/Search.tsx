import { useState } from "react";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { AiFillStar } from "react-icons/ai";
import { useSearchContext } from "../contexts/SearchContext";
import * as apiClient from "../api-client";
import { hotelFacilities, hotelType } from "../config/hotel-options-config";

const Search = () => {
  const search = useSearchContext();
  const [page, setPage] = useState<number>(1);
  const [selectedStars, setSelectedStars] = useState<string[]>([]);
  const [selectedHotelTypes, setSelectedHotelTypes] = useState<string[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [selectedPrice, setSelectedPrice] = useState<number | undefined>();
  const [sortOption, setSortOption] = useState<string>("");

  const searchParams = {
    destination: search.destination,
    checkIn: search.checkIn.toISOString(),
    checkOut: search.checkOut.toISOString(),
    adultCount: search.adultCount.toString(),
    childCount: search.childCount.toString(),
    page: page.toString(),
    stars: selectedStars,
    types: selectedHotelTypes,
    facilities: selectedFacilities,
    maxPrice: selectedPrice?.toString(),
    sortOption,
  };

  const { data: hotelData } = useQuery(["searchHotels", searchParams], () =>
    apiClient.searchHotels(searchParams)
  );

  const handleStarsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedStars((prev) =>
      checked ? [...prev, value] : prev.filter((s) => s !== value)
    );
    setPage(1);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedHotelTypes((prev) =>
      checked ? [...prev, value] : prev.filter((t) => t !== value)
    );
    setPage(1);
  };

  const handleFacilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedFacilities((prev) =>
      checked ? [...prev, value] : prev.filter((f) => f !== value)
    );
    setPage(1);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-5">
      <div className="rounded-lg border border-slate-300 p-5 h-fit sticky top-10">
        <div className="space-y-5">
          <h3 className="text-lg font-semibold border-b border-slate-300 pb-5">
            Filter by:
          </h3>

          <div className="border-b border-slate-300 pb-5">
            <h4 className="text-md font-semibold mb-2">Property Rating</h4>
            {["5", "4", "3", "2", "1"].map((star) => (
              <label key={star} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  value={star}
                  checked={selectedStars.includes(star)}
                  onChange={handleStarsChange}
                />
                <span className="flex">
                  {Array.from({ length: parseInt(star) }).map((_, i) => (
                    <AiFillStar key={i} className="fill-yellow-400" />
                  ))}
                </span>
              </label>
            ))}
          </div>

          <div className="border-b border-slate-300 pb-5">
            <h4 className="text-md font-semibold mb-2">Hotel Type</h4>
            {hotelType.map((type) => (
              <label key={type} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  value={type}
                  checked={selectedHotelTypes.includes(type)}
                  onChange={handleTypeChange}
                />
                <span>{type}</span>
              </label>
            ))}
          </div>

          <div className="border-b border-slate-300 pb-5">
            <h4 className="text-md font-semibold mb-2">Facilities</h4>
            {hotelFacilities.map((facility) => (
              <label key={facility} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded"
                  value={facility}
                  checked={selectedFacilities.includes(facility)}
                  onChange={handleFacilityChange}
                />
                <span>{facility}</span>
              </label>
            ))}
          </div>

          <div>
            <h4 className="text-md font-semibold mb-2">Max Price Per Night</h4>
            <select
              className="p-2 border rounded-md w-full"
              value={selectedPrice ?? ""}
              onChange={(e) => {
                setSelectedPrice(
                  e.target.value ? parseInt(e.target.value) : undefined
                );
                setPage(1);
              }}
            >
              <option value="">Any</option>
              {[50, 100, 200, 300, 500].map((price) => (
                <option key={price} value={price}>
                  Up to £{price}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold">
            {hotelData?.pagination.total ?? 0} Hotels found
            {search.destination ? ` in ${search.destination}` : ""}
          </span>
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            className="p-2 border rounded-md"
          >
            <option value="">Sort By</option>
            <option value="starRating">Star Rating</option>
            <option value="pricePerNightAsc">Price (Low to High)</option>
            <option value="pricePerNightDesc">Price (High to Low)</option>
          </select>
        </div>

        {hotelData?.data.map((hotel) => (
          <div
            key={hotel._id}
            className="grid grid-cols-1 xl:grid-cols-[2fr_3fr] border border-slate-300 rounded-lg p-8 gap-8"
          >
            <div className="w-full h-[300px]">
              <img
                src={hotel.imageUrls[0]}
                alt={hotel.name}
                className="w-full h-full object-cover object-center"
              />
            </div>
            <div className="grid grid-rows-[auto_1fr_auto] gap-2">
              <div>
                <div className="flex items-center gap-1">
                  <span className="flex">
                    {Array.from({ length: hotel.starRating }).map((_, i) => (
                      <AiFillStar key={i} className="fill-yellow-400" />
                    ))}
                  </span>
                  <span className="text-sm text-slate-500">{hotel.type}</span>
                </div>
                <Link
                  to={`/detail/${hotel._id}`}
                  className="text-2xl font-bold cursor-pointer hover:underline"
                >
                  {hotel.name}
                </Link>
              </div>

              <div className="line-clamp-4 text-sm">{hotel.description}</div>

              <div className="flex items-end justify-between flex-wrap gap-2">
                <div className="flex gap-1 items-center flex-wrap">
                  {hotel.facilities.slice(0, 3).map((facility) => (
                    <span
                      key={facility}
                      className="bg-slate-300 p-2 rounded-lg text-xs font-bold whitespace-nowrap"
                    >
                      {facility}
                    </span>
                  ))}
                  {hotel.facilities.length > 3 && (
                    <span className="text-xs text-slate-500">
                      +{hotel.facilities.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-bold">£{hotel.pricePerNight} per night</span>
                  <Link
                    to={`/detail/${hotel._id}`}
                    className="bg-blue-600 text-white p-2 font-bold text-xl hover:bg-blue-500"
                  >
                    View More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {hotelData && hotelData.pagination.pages > 1 && (
          <div className="flex justify-center">
            <ul className="flex border border-slate-300">
              {Array.from(
                { length: hotelData.pagination.pages },
                (_, i) => i + 1
              ).map((num) => (
                <li
                  key={num}
                  onClick={() => setPage(num)}
                  className={`px-2 py-1 cursor-pointer ${
                    page === num ? "bg-blue-600 text-white" : ""
                  }`}
                >
                  {num}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
