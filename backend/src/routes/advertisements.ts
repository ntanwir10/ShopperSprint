import express, { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware";
import { getAdsSchema, trackAdSchema } from "../types/validation.js";

const router = express.Router();

// This will be injected by the route setup
let advertisementService: any;

// Middleware to inject advertisement service
export const injectAdvertisementService = (service: any) => {
  advertisementService = service;
};

// GET /api/ads - Get advertisements
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate query parameters
    const validationResult = getAdsSchema.safeParse(req.query);
    if (!validationResult.success) {
      return res.status(400).json({
        error: {
          message: "Invalid query parameters",
          details: validationResult.error.issues,
        },
      });
    }

    const { query, category, placement } = validationResult.data;

    try {
      if (!advertisementService) {
        throw new Error("Advertisement service not initialized");
      }

      const ads = await advertisementService.getAdvertisements({
        query,
        category,
        placement: placement || "banner",
      });

      return res.status(200).json({ ads });
    } catch (error) {
      console.error("Advertisement retrieval error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("service not initialized")) {
          return res.status(503).json({
            error: {
              message: "Advertisement service temporarily unavailable",
              code: "SERVICE_UNAVAILABLE",
            },
          });
        }
      }

      return res.status(500).json({
        error: {
          message: "Internal server error retrieving advertisements",
          code: "INTERNAL_ERROR",
        },
      });
    }
  })
);

// POST /api/ads/track - Track advertisement events
router.post(
  "/track",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validationResult = trackAdSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: {
          message: "Invalid request data",
          details: validationResult.error.issues,
        },
      });
    }

    const { adId, event, searchId } = validationResult.data;

    try {
      if (!advertisementService) {
        throw new Error("Advertisement service not initialized");
      }

      await advertisementService.trackEvent({
        adId,
        event,
        searchId,
        timestamp: new Date(),
      });

      return res.status(200).json({
        message: "Tracking event recorded successfully",
        adId,
        event,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Advertisement tracking error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("service not initialized")) {
          return res.status(503).json({
            error: {
              message: "Advertisement service temporarily unavailable",
              code: "SERVICE_UNAVAILABLE",
            },
          });
        }
      }

      return res.status(500).json({
        error: {
          message: "Internal server error tracking advertisement event",
          code: "INTERNAL_ERROR",
        },
      });
    }
  })
);

// GET /api/ads/stats/:adId - Get advertisement statistics
router.get(
  "/stats/:adId",
  asyncHandler(async (req: Request, res: Response) => {
    const { adId } = req.params;

    try {
      if (!advertisementService) {
        throw new Error("Advertisement service not initialized");
      }

      const stats = await advertisementService.getAdvertisementStats(adId);

      return res.status(200).json(stats);
    } catch (error) {
      console.error("Advertisement stats retrieval error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("Advertisement not found")) {
          return res.status(404).json({
            error: {
              message: "Advertisement not found",
              code: "NOT_FOUND",
            },
          });
        }
        
        if (error.message.includes("service not initialized")) {
          return res.status(503).json({
            error: {
              message: "Advertisement service temporarily unavailable",
              code: "SERVICE_UNAVAILABLE",
            },
          });
        }
      }

      return res.status(500).json({
        error: {
          message: "Internal server error retrieving advertisement statistics",
          code: "INTERNAL_ERROR",
        },
      });
    }
  })
);

// GET /api/ads/stats - Get overall advertisement statistics
router.get(
  "/stats",
  asyncHandler(async (req: Request, res: Response) => {
    try {
      if (!advertisementService) {
        throw new Error("Advertisement service not initialized");
      }

      const stats = await advertisementService.getOverallStats();

      return res.status(200).json(stats);
    } catch (error) {
      console.error("Overall advertisement stats retrieval error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("service not initialized")) {
          return res.status(503).json({
            error: {
              message: "Advertisement service temporarily unavailable",
              code: "SERVICE_UNAVAILABLE",
            },
          });
        }
      }

      return res.status(500).json({
        error: {
          message: "Internal server error retrieving overall advertisement statistics",
          code: "INTERNAL_ERROR",
        },
      });
    }
  })
);

export default router;
