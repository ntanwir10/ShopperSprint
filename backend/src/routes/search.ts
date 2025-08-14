import { Router, Request, Response } from "express";
import { SearchService } from "../services/searchService";
import { SourceRepository } from "../repositories/sourceRepository";
import { getRedis, getDb } from "../database/connection";
import {
  searchRequestSchema,
  searchResponseSchema,
} from "../validation/schemas";
import { sources, products } from "../database/schema";

const router = Router();
const sourceRepository = new SourceRepository();
const searchService = new SearchService(sourceRepository);

// POST /api/search
router.post("/", async (req: Request, res: Response) => {
  try {
    console.log("🔍 Search request received:", {
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

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

    console.log("🔧 Search parameters:", {
      query: validatedData.query,
      filters,
      sort,
      maxResults: validatedData.maxResults,
    });

    // Check cache first (include filters and sorting in cache key)
    const cacheKey = `search:${validatedData.query}:${
      validatedData.sources?.join(",") || "all"
    }:${JSON.stringify(filters)}:${JSON.stringify(sort)}`;

    const redis = getRedis();
    const cachedResult = await redis.get(cacheKey);

    if (cachedResult) {
      const parsed = JSON.parse(cachedResult);
      console.log("✅ Cache hit for search query:", validatedData.query);
      console.log("📊 Cached results count:", parsed.results?.length || 0);

      return res.json({
        ...parsed,
        metadata: {
          ...parsed.metadata,
          cacheHit: true,
        },
      });
    }

    console.log("🔄 Cache miss, performing fresh search...");

    // Perform search with filters and sorting
    const startTime = Date.now();
    const searchResult = await searchService.search({
      ...validatedData,
      filters: filters as any,
      ...(sort && { sort }),
    });
    const searchDuration = Date.now() - startTime;

    console.log("📈 Search completed:", {
      duration: searchDuration,
      resultsCount: searchResult.results.length,
      totalSources: searchResult.metadata.totalSources,
      successfulSources: searchResult.metadata.successfulSources,
    });

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
      console.log("💾 Search results cached for 15 minutes");
    }

    // Validate response
    const validatedResponse = searchResponseSchema.parse(response);

    console.log("✅ Search response sent successfully");
    return res.json(validatedResponse);
  } catch (error) {
    console.error("❌ Search error:", error);
    return res.status(500).json({
      error: "SearchError",
      message: "Failed to perform search",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }
});

// POST /api/seed - Development only endpoint to seed the database
router.post("/seed", async (_req: Request, res: Response) => {
  try {
    // Only allow seeding in development
    if (process.env["NODE_ENV"] === "production") {
      return res.status(403).json({
        error: "Forbidden",
        message: "Seeding is not allowed in production",
        statusCode: 403,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("🌱 Starting database seeding...");
    const db = getDb();

    // Check if sources already exist
    const existingSources = await db.select().from(sources);
    if (existingSources.length > 0) {
      console.log("📡 Sources already exist, skipping creation");
    } else {
      // Create sources
      console.log("📡 Creating sources...");
      await db.insert(sources).values([
        {
          name: "Amazon",
          category: "popular",
          isActive: true,
          configuration: {
            baseUrl: "https://www.amazon.com",
            searchUrl: "https://www.amazon.com/s?k={query}",
            selectors: {
              productContainer: "[data-component-type='s-search-result']",
              title: "h2 a span",
              price: ".a-price-whole",
              image: "img.s-image",
              rating: "[data-testid='rating']",
              reviewCount: "[data-testid='review-count']",
              availability: "[data-testid='availability']",
            },
            rateLimit: 1000,
          },
        },
        {
          name: "Walmart",
          category: "popular",
          isActive: true,
          configuration: {
            baseUrl: "https://www.walmart.com",
            searchUrl: "https://www.walmart.com/search?q={query}",
            selectors: {
              productContainer: "[data-item-id]",
              title: "[data-testid='product-title']",
              price: "[data-testid='price-wrap']",
              image: "img[data-testid='product-image']",
              rating: "[data-testid='rating']",
              reviewCount: "[data-testid='review-count']",
              availability: "[data-testid='availability']",
            },
            rateLimit: 1000,
          },
        },
        {
          name: "Best Buy",
          category: "alternative",
          isActive: true,
          configuration: {
            baseUrl: "https://www.bestbuy.com",
            searchUrl: "https://www.bestbuy.com/site/searchpage.jsp?st={query}",
            selectors: {
              productContainer: ".list-item",
              title: "h4 a",
              price: ".priceView-customer-price span",
              image: "img.product-image",
              rating: ".rating",
              reviewCount: ".review-count",
              availability: ".availability",
            },
            rateLimit: 1000,
          },
        },
      ]);
      console.log("✅ Sources created successfully");
    }

    // Check if products already exist
    const existingProducts = await db.select().from(products);
    if (existingProducts.length > 0) {
      console.log("📦 Products already exist, skipping creation");
    } else {
      // Create sample products
      console.log("📦 Creating sample products...");
      await db.insert(products).values([
        {
          name: "Sony WH-1000XM6 Wireless Headphones",
          normalizedName: "sony wh-1000xm6 wireless headphones",
          category: "Electronics",
          specifications: {
            brand: "Sony",
            model: "WH-1000XM6",
            type: "Over-ear",
            connectivity: "Bluetooth 5.2",
            noiseCancellation: "Yes",
            batteryLife: "30 hours",
          },
        },
        {
          name: "Bose QuietComfort 45 Wireless Headphones",
          normalizedName: "bose quietcomfort 45 wireless headphones",
          category: "Electronics",
          specifications: {
            brand: "Bose",
            model: "QuietComfort 45",
            type: "Over-ear",
            connectivity: "Bluetooth 5.1",
            noiseCancellation: "Yes",
            batteryLife: "24 hours",
          },
        },
        {
          name: "Apple AirPods Max",
          normalizedName: "apple airpods max",
          category: "Electronics",
          specifications: {
            brand: "Apple",
            model: "AirPods Max",
            type: "Over-ear",
            connectivity: "Bluetooth 5.0",
            noiseCancellation: "Yes",
            batteryLife: "20 hours",
          },
        },
      ]);
      console.log("✅ Sample products created successfully");
    }

    console.log("🎉 Database seeding completed successfully");

    return res.json({
      message: "Database seeded successfully",
      sourcesCreated: existingSources.length === 0 ? 3 : 0,
      productsCreated: existingProducts.length === 0 ? 3 : 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Seeding error:", error);
    return res.status(500).json({
      error: "SeedingError",
      message: "Failed to seed database",
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
