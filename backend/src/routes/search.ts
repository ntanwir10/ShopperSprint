import { Router, Request, Response } from "express";
import { SearchService } from "../services/searchService";
import { SourceRepository } from "../repositories/sourceRepository";
import { getRedis } from "../database/connection";
import {
  searchRequestSchema,
  searchResponseSchema,
} from "../validation/schemas";

const router = Router();
const sourceRepository = new SourceRepository();
const searchService = new SearchService(sourceRepository);

// POST /api/search
router.post("/", async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = searchRequestSchema.parse(req.body);

    // Extract filters and sorting from query parameters
    const filters = {
      minPrice: req.query["minPrice"]
        ? parseInt(req.query["minPrice"] as string)
        : undefined,
      maxPrice: req.query["maxPrice"]
        ? parseInt(req.query["maxPrice"] as string)
        : undefined,
      availability: req.query["availability"] as
        | "in_stock"
        | "out_of_stock"
        | "limited"
        | "unknown"
        | undefined,
      minRating: req.query["minRating"]
        ? parseFloat(req.query["minRating"] as string)
        : undefined,
      sources: req.query["sources"]
        ? (req.query["sources"] as string).split(",")
        : undefined,
      category: req.query["category"] as string | undefined,
    };

    const sort =
      req.query["sort"] && req.query["direction"]
        ? {
            field: req.query["sort"] as
              | "price"
              | "rating"
              | "reviewCount"
              | "lastScraped",
            direction: req.query["direction"] as "asc" | "desc",
          }
        : undefined;

    // Check cache first (include filters and sorting in cache key)
    const cacheKey = `search:${validatedData.query}:${
      validatedData.sources?.join(",") || "all"
    }:${JSON.stringify(filters)}:${JSON.stringify(sort)}`;

    const redis = getRedis();
    const cachedResult = await redis.get(cacheKey);

    if (cachedResult) {
      const parsed = JSON.parse(cachedResult);
      console.log("Cache hit for search query:", validatedData.query);
      return res.json({
        ...parsed,
        metadata: {
          ...parsed.metadata,
          cacheHit: true,
        },
      });
    }

    // Perform search with filters and sorting
    const startTime = Date.now();
    const searchResult = await searchService.search({
      ...validatedData,
      filters: filters as any,
      ...(sort && { sort }),
    });
    const searchDuration = Date.now() - startTime;

    // Prepare response
    const response = {
      searchId: searchResult.searchId,
      results: searchResult.results,
      metadata: {
        totalSources: searchResult.metadata.totalSources,
        successfulSources: searchResult.metadata.successfulSources,
        searchDuration,
        cacheHit: false,
      },
    };

    // Cache the result for 15 minutes
    if (redis) {
      await redis.setEx(cacheKey, 900, JSON.stringify(response));
    }

    // Validate response
    const validatedResponse = searchResponseSchema.parse(response);

    return res.json(validatedResponse);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      error: "SearchError",
      message: "Failed to perform search",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// GET /api/search/filters
router.get("/filters", async (_req: Request, res: Response) => {
  try {
    // Return available filter options
    const filters = {
      availability: ["in_stock", "out_of_stock", "limited", "unknown"],
      sortFields: ["price", "rating", "reviewCount", "lastScraped"],
      sortDirections: ["asc", "desc"],
    };

    return res.json(filters);
  } catch (error) {
    console.error("Filters error:", error);
    return res.status(500).json({
      error: "FiltersError",
      message: "Failed to get filter options",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/refresh-prices
router.post("/refresh-prices", async (_req: Request, res: Response) => {
  try {
    // This endpoint will be implemented in Phase 3
    return res.status(501).json({
      error: "NotImplemented",
      message: "Refresh prices functionality will be available in Phase 3",
      statusCode: 501,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Refresh prices error:", error);
    return res.status(500).json({
      error: "RefreshPricesError",
      message: "Failed to refresh prices",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as searchRouter };
