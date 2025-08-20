import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { SearchService } from "../services/SearchService";
import { SourceRepository } from "../repositories/sourceRepository";
import { getDb } from "../database/connection";
import { products, productListings } from "../database/schema";
import { eq, and } from "drizzle-orm";

const router = express.Router();
const sourceRepository = new SourceRepository();
const searchService = new SearchService(sourceRepository);

// Validation schemas
const searchValidation = [
  body("query")
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage("Search query must be between 1 and 500 characters"),
  body("maxResults")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Max results must be between 1 and 100"),
  body("filters")
    .optional()
    .isObject()
    .withMessage("Filters must be an object"),
  body("sort").optional().isObject().withMessage("Sort must be an object"),
];

// POST /api/search - Search for products
router.post("/", searchValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        message: "Invalid request data",
        details: errors.array(),
        statusCode: 400,
      });
    }

    const searchRequest = req.body;
    const results = await searchService.search(searchRequest);

    return res.status(200).json({
      message: "Search completed successfully",
      statusCode: 200,
      data: results,
    });
  } catch (error: any) {
    console.error("Search error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to perform search",
      statusCode: 500,
    });
  }
});

// GET /api/search/products/:productId - Get product details
router.get("/products/:productId", async (req: Request, res: Response) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Product ID is required",
        statusCode: 400,
      });
    }

    // Get product details
    const product = await getDb().query.products.findFirst({
      where: eq(products.id, productId),
    });

    if (!product) {
      return res.status(404).json({
        error: "Not Found",
        message: "Product not found",
        statusCode: 404,
      });
    }

    // Get current listings for this product
    const listings = await getDb().query.productListings.findMany({
      where: and(
        eq(productListings.productId, productId),
        eq(productListings.isValid, true)
      ),
      with: { source: true },
      orderBy: (productListings, { asc }) => [asc(productListings.price)],
    });

    // Get the lowest current price
    const currentPrice =
      Array.isArray(listings) && listings.length > 0
        ? listings[0]!.price
        : null;

    return res.status(200).json({
      message: "Product details retrieved successfully",
      statusCode: 200,
      data: {
        id: product.id,
        name: product.name,
        category: product.category,
        specifications: product.specifications,
        currentPrice: currentPrice,
        listings: listings.map((listing) => ({
          id: listing.id,
          price: listing.price,
          currency: listing.currency,
          availability: listing.availability,
          source: listing.source?.name || "Unknown",
          url: listing.url,
          imageUrl: listing.imageUrl,
          rating: listing.rating,
          reviewCount: listing.reviewCount,
          lastScraped: listing.lastScraped,
        })),
      },
    });
  } catch (error: any) {
    console.error("Product details error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve product details",
      statusCode: 500,
    });
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get("/suggestions", async (req: Request, res: Response) => {
  try {
    const { query, limit = 10 } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        error: "Bad Request",
        message: "Query parameter is required",
        statusCode: 400,
      });
    }

    const suggestions = await searchService.getSearchSuggestions(
      query,
      Number(limit)
    );

    return res.status(200).json({
      message: "Search suggestions retrieved successfully",
      statusCode: 200,
      data: suggestions,
    });
  } catch (error: any) {
    console.error("Search suggestions error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve search suggestions",
      statusCode: 500,
    });
  }
});

// GET /api/search/popular - Get popular searches
router.get("/popular", async (req: Request, res: Response) => {
  try {
    const { timeRange = "7d", limit = 20 } = req.query;

    const popularSearches = await searchService.getPopularSearches(
      timeRange as string,
      Number(limit)
    );

    return res.status(200).json({
      message: "Popular searches retrieved successfully",
      statusCode: 200,
      data: popularSearches,
    });
  } catch (error: any) {
    console.error("Popular searches error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve popular searches",
      statusCode: 500,
    });
  }
});

// GET /api/search/analytics - Get search analytics
router.get("/analytics", async (req: Request, res: Response) => {
  try {
    const { timeRange = "7d" } = req.query;

    const analytics = await searchService.getSearchAnalytics(
      timeRange as string
    );

    return res.status(200).json({
      message: "Search analytics retrieved successfully",
      statusCode: 200,
      data: analytics,
    });
  } catch (error: any) {
    console.error("Search analytics error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve search analytics",
      statusCode: 500,
    });
  }
});

export default router;
