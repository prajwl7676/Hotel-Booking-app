import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import { descriptionChain } from "../ai/chains/descriptionChain";

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

export default router;
