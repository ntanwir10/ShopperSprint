import request from "supertest";
import express from "express";
import searchRouter from "../search";
import { SearchService } from "../../services/SearchService";

// Mock SearchService
jest.mock("../../services/SearchService");

describe("Search Routes", () => {
  let app: express.Application;
  let mockSearchService: jest.Mocked<SearchService>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock SearchService
    mockSearchService = {
      search: jest.fn(),
    } as any;

    // Create Express app
    app = express();
    app.use(express.json());
    app.use("/api/search", searchRouter);

    // Mock the SearchService in the router
    (searchRouter as any).searchService = mockSearchService;
  });

  describe("POST /api/search", () => {
    it("should perform search successfully", async () => {
      // Arrange
      const searchRequest = {
        query: "smartphone",
        maxResults: 5,
        filters: {
          minPrice: 20000,
          maxPrice: 40000,
        },
        sort: {
          field: "price",
          direction: "asc",
        },
      };

      const mockSearchResponse = {
        searchId: "search_123",
        results: [
          {
            id: "product1",
            name: "Smartphone 1",
            price: 25000,
            currency: "USD",
            availability: "in_stock",
            source: "Test Store",
            imageUrl: "https://example.com/image1.jpg",
            rating: 4.5,
            reviewCount: 100,
            url: "https://example.com/product1",
            lastScraped: new Date().toISOString(),
          },
        ],
        metadata: {
          totalSources: 2,
          successfulSources: 1,
          searchDuration: 1500,
          cacheHit: false,
        },
      };

      mockSearchService.search.mockResolvedValue(mockSearchResponse);

      // Act
      const response = await request(app)
        .post("/api/search")
        .send(searchRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockSearchResponse);
      expect(mockSearchService.search).toHaveBeenCalledWith(searchRequest);
    });

    it("should handle search service errors", async () => {
      // Arrange
      const searchRequest = {
        query: "smartphone",
        maxResults: 5,
      };

      mockSearchService.search.mockRejectedValue(new Error("Search failed"));

      // Act & Assert
      await request(app).post("/api/search").send(searchRequest).expect(500);

      expect(mockSearchService.search).toHaveBeenCalledWith(searchRequest);
    });

    it("should validate required fields", async () => {
      // Arrange
      const invalidRequest = {
        maxResults: 5,
        // Missing query field
      };

      // Act & Assert
      await request(app).post("/api/search").send(invalidRequest).expect(400);
    });

    it("should handle empty query", async () => {
      // Arrange
      const searchRequest = {
        query: "",
        maxResults: 5,
      };

      // Act & Assert
      await request(app).post("/api/search").send(searchRequest).expect(400);
    });

    it("should handle invalid maxResults", async () => {
      // Arrange
      const searchRequest = {
        query: "smartphone",
        maxResults: -1, // Invalid negative value
      };

      // Act & Assert
      await request(app).post("/api/search").send(searchRequest).expect(400);
    });

    it("should handle large maxResults gracefully", async () => {
      // Arrange
      const searchRequest = {
        query: "smartphone",
        maxResults: 1000, // Very large value
      };

      const mockSearchResponse = {
        searchId: "search_123",
        results: [],
        metadata: {
          totalSources: 2,
          successfulSources: 0,
          searchDuration: 100,
          cacheHit: false,
        },
      };

      mockSearchService.search.mockResolvedValue(mockSearchResponse);

      // Act
      const response = await request(app)
        .post("/api/search")
        .send(searchRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockSearchResponse);
      expect(mockSearchService.search).toHaveBeenCalledWith(searchRequest);
    });

    it("should handle complex filters", async () => {
      // Arrange
      const searchRequest = {
        query: "laptop",
        maxResults: 10,
        filters: {
          minPrice: 50000,
          maxPrice: 150000,
          availability: "in_stock",
          minRating: 4.0,
          sources: ["source1", "source2"],
          category: "electronics",
        },
        sort: {
          field: "rating",
          direction: "desc",
        },
      };

      const mockSearchResponse = {
        searchId: "search_456",
        results: [],
        metadata: {
          totalSources: 2,
          successfulSources: 0,
          searchDuration: 800,
          cacheHit: false,
        },
      };

      mockSearchService.search.mockResolvedValue(mockSearchResponse);

      // Act
      const response = await request(app)
        .post("/api/search")
        .send(searchRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockSearchResponse);
      expect(mockSearchService.search).toHaveBeenCalledWith(searchRequest);
    });

    it("should handle missing optional fields", async () => {
      // Arrange
      const searchRequest = {
        query: "smartphone",
        // No maxResults, filters, or sort
      };

      const mockSearchResponse = {
        searchId: "search_789",
        results: [],
        metadata: {
          totalSources: 2,
          successfulSources: 0,
          searchDuration: 500,
          cacheHit: false,
        },
      };

      mockSearchService.search.mockResolvedValue(mockSearchResponse);

      // Act
      const response = await request(app)
        .post("/api/search")
        .send(searchRequest)
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockSearchResponse);
      expect(mockSearchService.search).toHaveBeenCalledWith(searchRequest);
    });
  });

  describe("GET /api/search", () => {
    it("should handle GET requests with query parameters", async () => {
      // Arrange
      const query = "smartphone";
      const maxResults = 5;

      const mockSearchResponse = {
        searchId: "search_get_123",
        results: [],
        metadata: {
          totalSources: 2,
          successfulSources: 0,
          searchDuration: 300,
          cacheHit: false,
        },
      };

      mockSearchService.search.mockResolvedValue(mockSearchResponse);

      // Act
      const response = await request(app)
        .get("/api/search")
        .query({ query, maxResults })
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockSearchResponse);
      expect(mockSearchService.search).toHaveBeenCalledWith({
        query,
        maxResults: maxResults,
      });
    });

    it("should handle GET requests with filters", async () => {
      // Arrange
      const query = "laptop";
      const minPrice = 50000;
      const maxPrice = 100000;
      const sort = "price";
      const direction = "asc";

      const mockSearchResponse = {
        searchId: "search_get_456",
        results: [],
        metadata: {
          totalSources: 2,
          successfulSources: 0,
          searchDuration: 400,
          cacheHit: false,
        },
      };

      mockSearchService.search.mockResolvedValue(mockSearchResponse);

      // Act
      const response = await request(app)
        .get("/api/search")
        .query({
          query,
          minPrice,
          maxPrice,
          sort,
          direction,
        })
        .expect(200);

      // Assert
      expect(response.body).toEqual(mockSearchResponse);
      expect(mockSearchService.search).toHaveBeenCalledWith({
        query,
        filters: {
          minPrice,
          maxPrice,
        },
        sort: {
          field: sort,
          direction,
        },
      });
    });

    it("should validate GET query parameters", async () => {
      // Arrange
      // Missing required query parameter

      // Act & Assert
      await request(app)
        .get("/api/search")
        .query({ maxResults: 5 })
        .expect(400);
    });
  });

  describe("Error handling", () => {
    it("should handle malformed JSON", async () => {
      // Act & Assert
      await request(app)
        .post("/api/search")
        .set("Content-Type", "application/json")
        .send('{"query": "smartphone", "maxResults": 5') // Malformed JSON
        .expect(400);
    });

    it("should handle unsupported content type", async () => {
      // Act & Assert
      await request(app)
        .post("/api/search")
        .set("Content-Type", "text/plain")
        .send("query=smartphone&maxResults=5")
        .expect(400);
    });

    it("should handle very long queries", async () => {
      // Arrange
      const longQuery = "a".repeat(1000); // Very long query
      const searchRequest = {
        query: longQuery,
        maxResults: 5,
      };

      // Act & Assert
      await request(app).post("/api/search").send(searchRequest).expect(400);
    });
  });
});
