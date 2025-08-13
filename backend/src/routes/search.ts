import express, { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware";
import { searchRequestSchema, refreshPricesRequestSchema } from "../types/api.js";

const router = express.Router();

// This will be injected by the route setup
let searchService: any;

// Middleware to inject search service
export const injectSearchService = (service: any) => {
  searchService = service;
};

// POST /api/search - Search for products across sources
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validationResult = searchRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: {
          message: "Invalid request data",
          details: validationResult.error.issues,
        },
      });
    }

    const { query, sources, maxResults } = validationResult.data;

    try {
      if (!searchService) {
        throw new Error("Search service not initialized");
      }

      const results = await searchService.searchProducts({
        query,
        sources,
        maxResults,
      });

      return res.status(200).json(results);
    } catch (error) {
      console.error("Search error:", error);
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes("rate limit")) {
          return res.status(429).json({
            error: {
              message: "Rate limit exceeded. Please try again later.",
              code: "RATE_LIMIT_EXCEEDED",
            },
          });
        }
        
        if (error.message.includes("service not initialized")) {
          return res.status(503).json({
            error: {
              message: "Search service temporarily unavailable",
              code: "SERVICE_UNAVAILABLE",
            },
          });
        }
      }

      return res.status(500).json({
        error: {
          message: "Internal server error during search",
          code: "INTERNAL_ERROR",
        },
      });
    }
  })
);

// GET /api/search/:id - Get search results by ID
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      if (!searchService) {
        throw new Error("Search service not initialized");
      }

      const results = await searchService.getSearchResults(id);
      
      if (!results) {
        return res.status(404).json({
          error: {
            message: "Search results not found",
            code: "NOT_FOUND",
          },
        });
      }

      return res.status(200).json(results);
    } catch (error) {
      console.error("Search retrieval error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("service not initialized")) {
          return res.status(503).json({
            error: {
              message: "Search service temporarily unavailable",
              code: "SERVICE_UNAVAILABLE",
            },
          });
        }
      }

      return res.status(500).json({
        error: {
          message: "Internal server error retrieving search results",
          code: "INTERNAL_ERROR",
        },
      });
    }
  })
);

// POST /api/search/refresh-prices - Refresh prices for specific products
router.post(
  "/refresh-prices",
  asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validationResult = refreshPricesRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        error: {
          message: "Invalid request data",
          details: validationResult.error.issues,
        },
      });
    }

    const { searchId, productIds } = validationResult.data;

    try {
      if (!searchService) {
        throw new Error("Search service not initialized");
      }

      const jobId = await searchService.refreshPrices(searchId, productIds);

      return res.status(200).json({
        jobId,
        estimatedCompletion: new Date(Date.now() + 30000).toISOString(), // 30 seconds estimate
        productsToRefresh: productIds.length,
      });
    } catch (error) {
      console.error("Price refresh error:", error);
      
      if (error instanceof Error) {
        if (error.message.includes("Search not found")) {
          return res.status(404).json({
            error: {
              message: "Search not found",
              code: "NOT_FOUND",
            },
          });
        }
        
        if (error.message.includes("service not initialized")) {
          return res.status(503).json({
            error: {
              message: "Search service temporarily unavailable",
              code: "SERVICE_UNAVAILABLE",
            },
          });
        }
      }

      return res.status(500).json({
        error: {
          message: "Internal server error during price refresh",
          code: "INTERNAL_ERROR",
        },
      });
    }
  })
);

// GET /api/search/status/:jobId - Get job status
router.get(
  "/status/:jobId",
  asyncHandler(async (req: Request, res: Response) => {
    const { jobId } = req.params;
    const { type = "scraping" } = req.query;

    try {
      if (!searchService) {
        throw new Error("Search service not initialized");
      }

      const queueService = (searchService as any).queueService;
      if (!queueService) {
        throw new Error("Queue service not available");
      }

      const status = await queueService.getJobStatus(
        jobId,
        type as "scraping" | "price-refresh"
      );

      if (!status) {
        return res.status(404).json({
          error: {
            message: "Job not found",
            code: "NOT_FOUND",
          },
        });
      }

      return res.status(200).json(status);
    } catch (error) {
      console.error("Job status retrieval error:", error);
      
      return res.status(500).json({
        error: {
          message: "Internal server error retrieving job status",
          code: "INTERNAL_ERROR",
        },
      });
    }
  })
);

export default router;
