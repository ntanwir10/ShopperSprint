import { Router, Request, Response } from "express";
import { SearchService } from "../services/searchService";
import { SourceRepository } from "../repositories/sourceRepository";
import { getRedis, getDb } from "../database/connection";
import { searchRequestSchema } from "../validation/schemas";
import { sources, products } from "../database/schema";

// Import types
import type { SearchFilters } from "../services/searchService";

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

    // Filter out undefined values for type compatibility
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    ) as SearchFilters;

    const sortParam =
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
      sort: sortParam,
      maxResults: validatedData.maxResults,
    });

    // Check cache first (include filters and sorting in cache key)
    const cacheKey = `search:${validatedData.query}:${
      validatedData.sources?.join(",") || "all"
    }:${JSON.stringify(filters)}:${JSON.stringify(sortParam)}`;

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
    const requestPayload: any = { ...validatedData };
    if (Object.keys(cleanFilters).length > 0)
      requestPayload.filters = cleanFilters;
    if (sortParam) requestPayload.sort = sortParam;
    const searchResult = await searchService.search(requestPayload);

    const endTime = Date.now();
    const searchDuration = endTime - startTime;

    console.log("✅ Search completed in", searchDuration, "ms");
    console.log("📊 Results count:", searchResult.results?.length || 0);

    // Cache the result
    const resultToCache = {
      ...searchResult,
      metadata: {
        ...searchResult.metadata,
        searchDuration,
        cachedAt: new Date().toISOString(),
      },
    };

    await redis.setEx(cacheKey, 300, JSON.stringify(resultToCache)); // Cache for 5 minutes

    return res.json(resultToCache);
  } catch (error) {
    console.error("❌ Search error:", error);
    return res.status(500).json({
      error: "Search failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/search - Support for query parameters
router.get("/", async (req: Request, res: Response) => {
  try {
    const query = req.query["q"] as string;
    const limit = req.query["limit"]
      ? parseInt(req.query["limit"] as string)
      : 20;
    const page = req.query["page"] ? parseInt(req.query["page"] as string) : 1;
    const offset = (page - 1) * limit;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Query parameter 'q' is required",
      });
    }

    console.log("🔍 GET Search request received:", {
      query,
      limit,
      page,
      offset,
      url: req.url,
      ip: req.ip,
    });

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

    // Filter out undefined values for type compatibility
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    ) as SearchFilters;

    const sortParam =
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

    // Check cache first
    const cacheKey = `search:${query}:${
      filters.sources?.join(",") || "all"
    }:${JSON.stringify(filters)}:${JSON.stringify(sortParam)}:${page}:${limit}`;

    const redis = getRedis();
    const cachedResult = await redis.get(cacheKey);

    if (cachedResult) {
      const parsed = JSON.parse(cachedResult);
      console.log("✅ Cache hit for GET search query:", query);
      return res.json({
        ...parsed,
        metadata: {
          ...parsed.metadata,
          cacheHit: true,
        },
      });
    }

    console.log("🔄 Cache miss, performing fresh GET search...");

    // Perform search with filters, sorting, and pagination
    const startTime = Date.now();
    const requestPayloadGet: any = {
      query,
      maxResults: limit,
      sources: filters.sources,
    };
    if (Object.keys(cleanFilters).length > 0)
      requestPayloadGet.filters = cleanFilters;
    if (sortParam) requestPayloadGet.sort = sortParam;
    const searchResult = await searchService.search(requestPayloadGet);

    const endTime = Date.now();
    const searchDuration = endTime - startTime;

    console.log("✅ GET Search completed in", searchDuration, "ms");
    console.log("📊 Results count:", searchResult.results?.length || 0);

    // Calculate pagination metadata
    const totalResults = searchResult.metadata?.totalSources || 0;
    const totalPages = Math.ceil(totalResults / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Cache the result
    const resultToCache = {
      ...searchResult,
      metadata: {
        ...searchResult.metadata,
        searchDuration,
        cachedAt: new Date().toISOString(),
        pagination: {
          page,
          limit,
          totalResults,
          totalPages,
          hasNextPage,
          hasPrevPage,
          offset,
        },
      },
    };

    await redis.setEx(cacheKey, 300, JSON.stringify(resultToCache)); // Cache for 5 minutes

    return res.json(resultToCache);
  } catch (error) {
    console.error("❌ GET Search error:", error);
    return res.status(500).json({
      error: "Search failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/search/suggestions - Get search suggestions
router.get("/suggestions", async (req: Request, res: Response) => {
  try {
    const query = req.query["q"] as string;
    const limit = req.query["limit"]
      ? parseInt(req.query["limit"] as string)
      : 10;

    if (!query || query.trim().length < 2) {
      return res.json({
        suggestions: [],
        query,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("💡 Search suggestions request:", { query, limit });

    // Check cache for suggestions
    const cacheKey = `suggestions:${query}:${limit}`;
    const redis = getRedis();
    const cachedSuggestions = await redis.get(cacheKey);

    if (cachedSuggestions) {
      const parsed = JSON.parse(cachedSuggestions);
      console.log("✅ Cache hit for suggestions:", query);
      return res.json({
        ...parsed,
        metadata: { cacheHit: true },
      });
    }

    // Generate suggestions based on query
    const suggestions = await searchService.getSearchSuggestions(query, limit);

    const result = {
      suggestions,
      query,
      timestamp: new Date().toISOString(),
      metadata: {
        cacheHit: false,
        suggestionsCount: suggestions.length,
      },
    };

    // Cache suggestions for 10 minutes
    await redis.setEx(cacheKey, 600, JSON.stringify(result));

    return res.json(result);
  } catch (error) {
    console.error("❌ Search suggestions error:", error);
    return res.status(500).json({
      error: "Failed to get suggestions",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// GET /api/search/popular - Get popular search terms
router.get("/popular", async (req: Request, res: Response) => {
  try {
    const limit = req.query["limit"]
      ? parseInt(req.query["limit"] as string)
      : 20;
    const timeRange = (req.query["timeRange"] as string) || "7d"; // 7d, 30d, 90d

    console.log("🔥 Popular searches request:", { limit, timeRange });

    // Check cache for popular searches
    const cacheKey = `popular_searches:${timeRange}:${limit}`;
    const redis = getRedis();
    const cachedPopular = await redis.get(cacheKey);

    if (cachedPopular) {
      const parsed = JSON.parse(cachedPopular);
      console.log("✅ Cache hit for popular searches");
      return res.json({
        ...parsed,
        metadata: { cacheHit: true },
      });
    }

    // Get popular searches from the service
    const popularSearches = await searchService.getPopularSearches(
      timeRange,
      limit
    );

    const result = {
      searches: popularSearches,
      timeRange,
      timestamp: new Date().toISOString(),
      metadata: {
        cacheHit: false,
        searchesCount: popularSearches.length,
      },
    };

    // Cache popular searches for 1 hour
    await redis.setEx(cacheKey, 3600, JSON.stringify(result));

    return res.json(result);
  } catch (error) {
    console.error("❌ Popular searches error:", error);
    return res.status(500).json({
      error: "Failed to get popular searches",
      message: error instanceof Error ? error.message : "Unknown error",
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
