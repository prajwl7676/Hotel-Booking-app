import express, { Request, Response } from "express";
import { isValidObjectId } from "mongoose";
import Hotel from "../models/hotel";
import { HotelSearchResponse } from "../shared/types";

const router = express.Router();

router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = constructSearchQuery(req.query);

    let sortOptions = {};
    switch (req.query.sortOption) {
      case "starRating":
        sortOptions = { starRating: -1 };
        break;
      case "pricePerNightAsc":
        sortOptions = { pricePerNight: 1 };
        break;
      case "pricePerNightDesc":
        sortOptions = { pricePerNight: -1 };
        break;
    }

    const pageSize = 5;
    const pageNumber = parseInt(
      req.query.page ? req.query.page.toString() : "1"
    );
    const skip = (pageNumber - 1) * pageSize;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    const total = await Hotel.countDocuments(query);

    const response: HotelSearchResponse = {
      data: hotels,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
      },
    };

    res.json(response);
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (!isValidObjectId(id)) {
      res.status(400).json({ message: "Invalid hotel ID" });
      return;
    }
    const hotel = await Hotel.findById(id);
    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }
    res.json(hotel);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

const toStringArray = (value: unknown): string[] => {
  const arr = Array.isArray(value) ? value : [value];
  return arr.filter((v): v is string => typeof v === "string");
};

const constructSearchQuery = (queryParams: Request["query"]) => {
  const constructedQuery: Record<string, unknown> = {};

  if (
    typeof queryParams.destination === "string" &&
    queryParams.destination.trim()
  ) {
    const escaped = queryParams.destination
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    constructedQuery.$or = [
      { city: new RegExp(escaped, "i") },
      { country: new RegExp(escaped, "i") },
    ];
  }

  if (typeof queryParams.adultCount === "string") {
    const adultCount = parseInt(queryParams.adultCount);
    if (!isNaN(adultCount)) {
      constructedQuery.adultCount = { $gte: adultCount };
    }
  }

  if (typeof queryParams.childCount === "string") {
    const childCount = parseInt(queryParams.childCount);
    if (!isNaN(childCount)) {
      constructedQuery.childCount = { $gte: childCount };
    }
  }

  if (queryParams.facilities) {
    const facilities = toStringArray(queryParams.facilities);
    if (facilities.length) {
      constructedQuery.facilities = { $all: facilities };
    }
  }

  if (queryParams.types) {
    const types = toStringArray(queryParams.types);
    if (types.length) {
      constructedQuery.type = { $in: types };
    }
  }

  if (queryParams.stars) {
    const starRatings = toStringArray(queryParams.stars)
      .map((star) => parseInt(star))
      .filter((star) => !isNaN(star));
    if (starRatings.length) {
      constructedQuery.starRating = { $in: starRatings };
    }
  }

  if (typeof queryParams.maxPrice === "string") {
    const maxPrice = parseInt(queryParams.maxPrice);
    if (!isNaN(maxPrice)) {
      constructedQuery.pricePerNight = { $lte: maxPrice };
    }
  }

  return constructedQuery;
};

export default router;