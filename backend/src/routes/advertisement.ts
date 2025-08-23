import { Router, Request, Response } from "express";
import {
  advertisementRequestSchema,
  advertisementTrackRequestSchema,
} from "../validation/schemas";
import { AdvertisementService } from "../services/AdvertisementService";

const router = Router();
const advertisementService = new AdvertisementService();

// GET /api/ads
router.get("/", async (req: Request, res: Response) => {
  try {
    // Validate query parameters
    const validatedData = advertisementRequestSchema.parse({
      query: req.query["query"] as string,
      category: req.query["category"] as string,
      placement: req.query["placement"] as "banner" | "sponsored-listing",
    });

    // Get advertisements
    const ads = await advertisementService.getAdvertisements(validatedData);

    return res.json({ ads });
  } catch (error) {
    console.error("Get advertisements error:", error);
    return res.status(500).json({
      error: "GetAdvertisementsError",
      message: "Failed to get advertisements",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/ads/track
router.post("/track", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = advertisementTrackRequestSchema.parse(req.body);

    // Track advertisement event
    await advertisementService.trackEvent(validatedData);

    return res.json({
      success: true,
      message: "Advertisement event tracked successfully",
    });
  } catch (error) {
    console.error("Track advertisement error:", error);
    return res.status(500).json({
      error: "TrackAdvertisementError",
      message: "Failed to track advertisement event",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as advertisementRouter };
