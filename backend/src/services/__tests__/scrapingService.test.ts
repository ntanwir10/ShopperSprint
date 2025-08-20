import { ScrapingService } from "../ScrapingService";
import puppeteer from "puppeteer";

// Mock puppeteer
jest.mock("puppeteer");

describe("ScrapingService", () => {
  let scrapingService: ScrapingService;
  let mockBrowser: any;
  let mockPage: any;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create mock browser and page
    mockPage = {
      goto: jest.fn(),
      waitForSelector: jest.fn(),
      evaluate: jest.fn(),
      close: jest.fn(),
    };

    mockBrowser = {
      newPage: jest.fn().mockResolvedValue(mockPage),
      close: jest.fn(),
    };

    // Mock puppeteer.launch
    (
      puppeteer.launch as jest.MockedFunction<typeof puppeteer.launch>
    ).mockResolvedValue(mockBrowser);

    // Create ScrapingService instance
    scrapingService = new ScrapingService();
  });

  describe("initializeBrowser", () => {
    it("should initialize browser successfully", async () => {
      // Act
      await (scrapingService as any).initializeBrowser();

      // Assert
      expect(puppeteer.launch).toHaveBeenCalledWith(
        expect.objectContaining({
          headless: true,
          args: expect.arrayContaining([
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
          ]),
        })
      );
      expect((scrapingService as any).browser).toBe(mockBrowser);
    });

    it("should handle browser launch failure gracefully", async () => {
      // Arrange
      (
        puppeteer.launch as jest.MockedFunction<typeof puppeteer.launch>
      ).mockRejectedValue(new Error("Launch failed"));

      // Act
      await (scrapingService as any).initializeBrowser();

      // Assert
      expect((scrapingService as any).browser).toBeNull();
    });

    it("should try fallback launch options on failure", async () => {
      // Arrange
      (puppeteer.launch as jest.MockedFunction<typeof puppeteer.launch>)
        .mockRejectedValueOnce(new Error("First attempt failed"))
        .mockRejectedValueOnce(new Error("Second attempt failed"))
        .mockResolvedValue(mockBrowser);

      // Act
      await (scrapingService as any).initializeBrowser();

      // Assert
      expect(puppeteer.launch).toHaveBeenCalledTimes(3);
      expect((scrapingService as any).browser).toBe(mockBrowser);
    });
  });

  describe("scrapeSource", () => {
    beforeEach(async () => {
      await (scrapingService as any).initializeBrowser();
    });

    it("should scrape source successfully", async () => {
      // Arrange
      const sourceId = "test_source";
      const query = "smartphone";
      const mockProducts = [
        {
          id: "product1",
          name: "Test Smartphone",
          price: 29999,
          currency: "USD",
          availability: "in_stock",
          source: "Test Store",
          imageUrl: "https://example.com/image1.jpg",
          rating: 4.5,
          reviewCount: 100,
          url: "https://example.com/product1",
          lastScraped: new Date().toISOString(),
        },
      ];

      mockPage.evaluate.mockResolvedValue(mockProducts);

      // Act
      const result = await scrapingService.scrapeSource(sourceId, query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.products).toEqual(mockProducts);
      expect(result.sourceId).toBe(sourceId);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should handle scraping failure gracefully", async () => {
      // Arrange
      const sourceId = "test_source";
      const query = "smartphone";
      mockPage.goto.mockRejectedValue(new Error("Navigation failed"));

      // Act
      const result = await scrapingService.scrapeSource(sourceId, query);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.sourceId).toBe(sourceId);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should return mock data when browser is not available", async () => {
      // Arrange
      const sourceId = "test_source";
      const query = "smartphone";
      (scrapingService as any).browser = null;

      // Act
      const result = await scrapingService.scrapeSource(sourceId, query);

      // Assert
      expect(result.success).toBe(true);
      expect(result.products).toBeDefined();
      expect(result.products!.length).toBeGreaterThan(0);
      expect(result.sourceId).toBe(sourceId);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    it("should handle page evaluation errors", async () => {
      // Arrange
      const sourceId = "test_source";
      const query = "smartphone";
      mockPage.evaluate.mockRejectedValue(new Error("Evaluation failed"));

      // Act
      const result = await scrapingService.scrapeSource(sourceId, query);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.sourceId).toBe(sourceId);
    });
  });

  describe("generateMockScrapingResult", () => {
    it("should generate valid mock data structure", () => {
      // Arrange
      const sourceId = "test_source";
      const query = "smartphone";

      // Act
      const result = (scrapingService as any).generateMockScrapingResult(
        sourceId,
        query
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.products).toBeDefined();
      expect(result.products!.length).toBeGreaterThan(0);
      expect(result.sourceId).toBe(sourceId);
      expect(result.timestamp).toBeInstanceOf(Date);

      // Check product structure
      result.products!.forEach((product: any) => {
        expect(product).toHaveProperty("id");
        expect(product).toHaveProperty("name");
        expect(product).toHaveProperty("price");
        expect(product).toHaveProperty("currency");
        expect(product).toHaveProperty("availability");
        expect(product).toHaveProperty("source");
        expect(product).toHaveProperty("imageUrl");
        expect(product).toHaveProperty("rating");
        expect(product).toHaveProperty("reviewCount");
        expect(product).toHaveProperty("url");
        expect(product).toHaveProperty("lastScraped");

        // Check data types
        expect(typeof product.id).toBe("string");
        expect(typeof product.name).toBe("string");
        expect(typeof product.price).toBe("number");
        expect(typeof product.currency).toBe("string");
        expect(typeof product.availability).toBe("string");
        expect(typeof product.source).toBe("string");
        expect(typeof product.imageUrl).toBe("string");
        expect(typeof product.rating).toBe("number");
        expect(typeof product.reviewCount).toBe("number");
        expect(typeof product.url).toBe("string");
        expect(typeof product.lastScraped).toBe("string");
      });
    });

    it("should generate unique product IDs", () => {
      // Arrange
      const sourceId = "test_source";
      const query = "smartphone";

      // Act
      const result1 = (scrapingService as any).generateMockScrapingResult(
        sourceId,
        query
      );
      const result2 = (scrapingService as any).generateMockScrapingResult(
        sourceId,
        query
      );

      // Assert
      const ids1 = result1.products!.map((p: any) => p.id);
      const ids2 = result2.products!.map((p: any) => p.id);

      // All IDs should be unique within each result
      expect(new Set(ids1).size).toBe(ids1.length);
      expect(new Set(ids2).size).toBe(ids2.length);

      // IDs should be different between calls
      const allIds = [...ids1, ...ids2];
      expect(new Set(allIds).size).toBe(allIds.length);
    });

    it("should include query in product names", () => {
      // Arrange
      const sourceId = "test_source";
      const query = "laptop";

      // Act
      const result = (scrapingService as any).generateMockScrapingResult(
        sourceId,
        query
      );

      // Assert
      result.products!.forEach((product: any) => {
        expect(product.name.toLowerCase()).toContain(query.toLowerCase());
      });
    });
  });

  describe("getSourceConfiguration", () => {
    it("should return source configuration for valid source ID", () => {
      // Arrange
      const sourceId = "test_source";

      // Act
      const config = (scrapingService as any).getSourceConfiguration(sourceId);

      // Assert
      expect(config).toBeDefined();
      expect(config).toHaveProperty("baseUrl");
      expect(config).toHaveProperty("searchUrl");
      expect(config).toHaveProperty("selectors");
      expect(config.selectors).toHaveProperty("productContainer");
      expect(config.selectors).toHaveProperty("name");
      expect(config.selectors).toHaveProperty("price");
      expect(config.selectors).toHaveProperty("image");
      expect(config.selectors).toHaveProperty("rating");
      expect(config.selectors).toHaveProperty("reviewCount");
      expect(config.selectors).toHaveProperty("url");
    });

    it("should return consistent configuration for same source ID", () => {
      // Arrange
      const sourceId = "test_source";

      // Act
      const config1 = (scrapingService as any).getSourceConfiguration(sourceId);
      const config2 = (scrapingService as any).getSourceConfiguration(sourceId);

      // Assert
      expect(config1).toEqual(config2);
    });
  });

  describe("cleanup", () => {
    it("should close browser on cleanup", async () => {
      // Arrange
      await (scrapingService as any).initializeBrowser();

      // Act
      await scrapingService.close();

      // Assert
      expect(mockBrowser.close).toHaveBeenCalled();
      expect((scrapingService as any).browser).toBeNull();
    });

    it("should handle cleanup when browser is not initialized", async () => {
      // Arrange
      (scrapingService as any).browser = null;

      // Act & Assert - Should not throw
      await expect(scrapingService.close()).resolves.toBeUndefined();
    });
  });

  describe("error handling", () => {
    it("should handle navigation timeouts", async () => {
      // Arrange
      await (scrapingService as any).initializeBrowser();
      mockPage.goto.mockRejectedValue(new Error("Navigation timeout"));

      // Act
      const result = await scrapingService.scrapeSource(
        "test_source",
        "test_query"
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain("timeout");
    });

    it("should handle selector not found errors", async () => {
      // Arrange
      await (scrapingService as any).initializeBrowser();
      mockPage.waitForSelector.mockRejectedValue(
        new Error("Selector not found")
      );

      // Act
      const result = await scrapingService.scrapeSource(
        "test_source",
        "test_query"
      );

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
