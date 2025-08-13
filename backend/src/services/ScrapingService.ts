import puppeteer, { Browser } from "puppeteer";
import * as cheerio from "cheerio";
import { productListings, sources } from "../database/schema";
import type { InferSelectModel } from "drizzle-orm";
import crypto from "crypto";

// Define types based on the schema
type ProductListing = InferSelectModel<typeof productListings>;
type Source = InferSelectModel<typeof sources>;

// Simple logger utility
const logger = {
  info: (message: string, ...args: any[]) =>
    console.log(`[INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[WARN] ${message}`, ...args),
};

export interface ScrapingResult {
  success: boolean;
  products?: ProductListing[];
  error?: string;
  sourceId: string;
  timestamp: Date;
}

export class ScrapingService {
  private browser: Browser | null = null;
  private isInitialized = false;

  constructor() {
    // Browser will be initialized lazily when first needed
  }

  private async initializeBrowser(): Promise<void> {
    if (this.isInitialized && this.browser) return;

    try {
      // Try to launch with different configurations
      const launchOptions = {
        headless: "new" as const,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security",
          "--disable-features=VizDisplayCompositor",
          "--single-process",
          "--no-zygote",
          "--disable-extensions",
        ],
        timeout: 30000,
        protocolTimeout: 30000,
      };

      // First try with default options
      try {
        this.browser = await puppeteer.launch(launchOptions);
        this.isInitialized = true;
        logger.info(
          "Puppeteer browser initialized successfully with default options"
        );
        return;
      } catch (error) {
        logger.warn(
          "Default Puppeteer launch failed, trying with minimal options:",
          error
        );
      }

      // Fallback: try with minimal options
      try {
        this.browser = await puppeteer.launch({
          headless: "new" as const,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
          timeout: 30000,
        });
        this.isInitialized = true;
        logger.info(
          "Puppeteer browser initialized successfully with minimal options"
        );
        return;
      } catch (error) {
        logger.warn(
          "Minimal Puppeteer launch failed, trying with no-sandbox only:",
          error
        );
      }

      // Final fallback: try with just no-sandbox
      this.browser = await puppeteer.launch({
        headless: "new" as const,
        args: ["--no-sandbox"],
        timeout: 30000,
      });
      this.isInitialized = true;
      logger.info(
        "Puppeteer browser initialized successfully with no-sandbox only"
      );
    } catch (error) {
      logger.error("All Puppeteer launch attempts failed:", error);

      // For development, we can fall back to mock data
      if (process.env["NODE_ENV"] === "development") {
        logger.warn("Falling back to mock data mode for development");
        this.isInitialized = true;
        this.browser = null; // Explicitly set to null to indicate fallback mode
        return;
      }

      throw new Error("Failed to initialize web scraping browser");
    }
  }

  async scrapeSource(sourceId: string, query: string): Promise<ScrapingResult> {
    try {
      await this.initializeBrowser();

      // If we're in fallback mode (no browser), return mock data immediately
      if (!this.browser && process.env["NODE_ENV"] === "development") {
        logger.info("Using fallback mock data mode");
        return this.generateMockScrapingResult(sourceId, query);
      }

      if (!this.browser) {
        throw new Error("Browser not initialized");
      }

      // Try to get source configuration for real scraping
      let source: Source | null = null;
      try {
        source = await this.getSourceConfiguration(sourceId);
      } catch (error) {
        logger.warn(
          `Failed to get source configuration for ${sourceId}, using fallback:`,
          error
        );
        // If we can't get source configuration, fall back to mock data
        if (process.env["NODE_ENV"] === "development") {
          return this.generateMockScrapingResult(sourceId, query);
        }
        throw new Error(`Source ${sourceId} not found`);
      }

      if (!source) {
        // If no source configuration found, fall back to mock data in development
        if (process.env["NODE_ENV"] === "development") {
          logger.warn(
            `No source configuration found for ${sourceId}, using fallback`
          );
          return this.generateMockScrapingResult(sourceId, query);
        }
        throw new Error(`Source ${sourceId} not found`);
      }

      const page = await this.browser.newPage();

      // Set user agent to avoid detection
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Set viewport
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to the search URL
      const searchUrl = this.buildSearchUrl(source, query);
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for content to load
      await page.waitForTimeout(2000);

      // Get the page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract products based on source-specific selectors
      const products = await this.extractProducts($, source, query);

      await page.close();

      return {
        success: true,
        products,
        sourceId,
        timestamp: new Date(),
      };
    } catch (error) {
      logger.error(`Scraping failed for source ${sourceId}:`, error);

      // In development, fall back to mock data
      if (process.env["NODE_ENV"] === "development") {
        logger.warn("Falling back to mock data due to scraping failure");
        return this.generateMockScrapingResult(sourceId, query);
      }

      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown scraping error",
        sourceId,
        timestamp: new Date(),
      };
    }
  }

  async validateSource(sourceId: string): Promise<boolean> {
    try {
      await this.initializeBrowser();

      if (!this.browser) {
        return false;
      }

      const page = await this.browser.newPage();
      const source = await this.getSourceConfiguration(sourceId);

      if (!source) {
        return false;
      }

      // Try to access the base URL
      const config = source.configuration as any;
      if (!config.baseUrl) {
        return false;
      }

      await page.goto(config.baseUrl, {
        waitUntil: "networkidle2",
        timeout: 10000,
      });
      await page.close();

      return true;
    } catch (error) {
      logger.error(`Source validation failed for ${sourceId}:`, error);
      return false;
    }
  }

  private async getSourceConfiguration(
    sourceId: string
  ): Promise<Source | null> {
    // This would typically come from the database
    // For now, we'll use a generic configuration for any source ID
    const genericSource: Source = {
      id: sourceId,
      name: "Generic Source",
      category: "alternative",
      isActive: true,
      lastSuccessfulScrape: null,
      errorCount: 0,
      averageResponseTime: null,
      configuration: {
        baseUrl: "https://example.com",
        searchUrl: "https://example.com/search?q={query}",
        selectors: {
          productContainer: ".product",
          productName: ".product-name",
          productPrice: ".product-price",
          productImage: ".product-image",
          productUrl: ".product-link",
          productRating: ".product-rating",
          productReviews: ".product-reviews",
        },
        rateLimit: 1000, // 1 second between requests
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return genericSource;
  }

  private generateMockScrapingResult(
    sourceId: string,
    query: string
  ): ScrapingResult {
    // For fallback mode, we'll generate generic mock data based on the query
    // since we don't know the exact source configuration

    // Generate realistic mock data that matches the ProductListing schema
    const mockProducts: ProductListing[] = [
      {
        id: crypto.randomUUID(),
        productId: crypto.randomUUID(),
        sourceId: sourceId,
        url: `https://example.com/product1?q=${encodeURIComponent(query)}`,
        price: 29999, // $299.99
        currency: "USD",
        availability: "in_stock",
        imageUrl: "https://via.placeholder.com/150x150?text=Product",
        rating: 4.5,
        reviewCount: 127,
        lastScraped: new Date(),
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        productId: crypto.randomUUID(),
        sourceId: sourceId,
        url: `https://example.com/product2?q=${encodeURIComponent(query)}`,
        price: 19999, // $199.99
        currency: "USD",
        availability: "in_stock",
        imageUrl: "https://via.placeholder.com/150x150?text=Product",
        rating: 4.2,
        reviewCount: 89,
        lastScraped: new Date(),
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        productId: crypto.randomUUID(),
        sourceId: sourceId,
        url: `https://example.com/product3?q=${encodeURIComponent(query)}`,
        price: 39999, // $399.99
        currency: "USD",
        availability: "in_stock",
        imageUrl: "https://via.placeholder.com/150x150?text=Product",
        rating: 4.7,
        reviewCount: 203,
        lastScraped: new Date(),
        isValid: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    return {
      success: true,
      products: mockProducts,
      sourceId,
      timestamp: new Date(),
    };
  }

  private buildSearchUrl(source: Source, query: string): string {
    const config = source.configuration as any;
    if (!config.searchUrl) {
      throw new Error(
        `Invalid source configuration: missing searchUrl for ${source.name}`
      );
    }
    return config.searchUrl.replace("{query}", encodeURIComponent(query));
  }

  private async extractProducts(
    $: cheerio.CheerioAPI,
    source: Source,
    _query: string
  ): Promise<ProductListing[]> {
    const products: ProductListing[] = [];

    try {
      const config = source.configuration as any;
      if (!config.selectors) {
        throw new Error(
          `Invalid source configuration: missing selectors for ${source.name}`
        );
      }

      const productElements = $(config.selectors.productContainer);

      productElements.each((index, element) => {
        if (index >= 10) return; // Limit to 10 products per source

        try {
          const $el = $(element);

          const name = $el
            .find(config.selectors.productName)
            .first()
            .text()
            .trim();
          const priceText = $el
            .find(config.selectors.productPrice)
            .first()
            .text()
            .trim();
          const imageUrl = $el
            .find(config.selectors.productImage)
            .first()
            .attr("src");
          const productUrl = $el
            .find(config.selectors.productUrl)
            .first()
            .attr("href");
          const ratingText = $el
            .find(config.selectors.productRating)
            .first()
            .text()
            .trim();
          const reviewsText = $el
            .find(config.selectors.productReviews)
            .first()
            .text()
            .trim();

          if (!name || !priceText) return; // Skip products without essential info

          const price = this.parsePrice(priceText);
          const rating = this.parseRating(ratingText);
          const reviewCount = this.parseReviewCount(reviewsText);

          const product: ProductListing = {
            id: `temp_${Date.now()}_${index}`,
            productId: `temp_product_${Date.now()}_${index}`,
            sourceId: source.id,
            url: this.buildFullUrl(config.baseUrl || "", productUrl || ""),
            price,
            currency: "USD",
            availability: "in_stock",
            imageUrl: imageUrl || null,
            rating: rating || null,
            reviewCount: reviewCount || null,
            lastScraped: new Date(),
            isValid: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          products.push(product);
        } catch (error) {
          logger.warn(
            `Failed to extract product ${index} from ${source.name}:`,
            error
          );
        }
      });
    } catch (error) {
      logger.error(`Failed to extract products from ${source.name}:`, error);
    }

    return products;
  }

  private parsePrice(priceText: string): number {
    // Remove currency symbols and convert to cents
    const cleanPrice = priceText.replace(/[^\d.,]/g, "");
    const price = parseFloat(cleanPrice.replace(",", ""));
    return Math.round(price * 100); // Convert to cents
  }

  private parseRating(ratingText: string): number | null {
    // Extract rating from text like "4.5 out of 5 stars"
    const match = ratingText.match(/(\d+\.?\d*)/);
    return match && match[1] ? parseFloat(match[1]) : null;
  }

  private parseReviewCount(reviewsText: string): number | null {
    // Extract review count from text like "1,234 reviews"
    const match = reviewsText.match(/(\d+(?:,\d+)*)/);
    if (match && match[1]) {
      return parseInt(match[1].replace(",", ""), 10);
    }
    return null;
  }

  private buildFullUrl(baseUrl: string, relativeUrl: string): string {
    if (relativeUrl.startsWith("http")) {
      return relativeUrl;
    }
    if (relativeUrl.startsWith("/")) {
      return `${baseUrl}${relativeUrl}`;
    }
    return `${baseUrl}/${relativeUrl}`;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      logger.info("Puppeteer browser closed");
    }
  }
}
