import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import { descriptionChain } from "../ai/chains/descriptionChain";
import { searchParserChain } from "../ai/chains/searchParserChain";

const router = express.Router();

// POST /api/ai/generate-description
// Authenticated hotel owners call this to get AI-generated marketing copy
router.post(
  "/generate-description",
  verifyToken,
  async (req: Request, res: Response) => {
    const { name, city, country, starRating, type, facilities, pricePerNight } =
      req.body;

    if (!name || !city || !country) {
      res.status(400).json({ message: "name, city, and country are required" });
      return;
    }

    try {
      const description = await descriptionChain.invoke({
        name,
        city,
        country,
        starRating: starRating ?? "",
        type: type ?? "",
        facilities: Array.isArray(facilities) ? facilities.join(", ") : "",
        pricePerNight: pricePerNight ?? "",
      });

      res.json({ description });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to generate description" });
    }
  }
);

// POST /api/ai/parse-search
// Public — no auth needed; converts a natural-language query into SearchParams
router.post("/parse-search", async (req: Request, res: Response) => {
  const { query } = req.body;

  if (!query || typeof query !== "string") {
    res.status(400).json({ message: "query string is required" });
    return;
  }

  try {
    const today = new Date().toISOString().slice(0, 10);
    const params = await searchParserChain.invoke({ query, today });
    res.json(params);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to parse search query" });
  }
});

export default router;
