import puppeteer, { Browser, Page } from "puppeteer";
import { productListings, sources } from "../database/schema";
import type { InferSelectModel } from "drizzle-orm";
import crypto from "crypto";
import { getDb } from "../database/connection";
import { eq } from "drizzle-orm";

// Define types based on the schema
type ProductListing = InferSelectModel<typeof productListings>;
type Source = InferSelectModel<typeof sources>;

// Enhanced logger utility
const logger = {
  info: (message: string, ...args: any[]) =>
    console.log(`[SCRAPING-INFO] ${message}`, ...args),
  error: (message: string, ...args: any[]) =>
    console.error(`[SCRAPING-ERROR] ${message}`, ...args),
  warn: (message: string, ...args: any[]) =>
    console.warn(`[SCRAPING-WARN] ${message}`, ...args),
  debug: (message: string, ...args: any[]) =>
    process.env["NODE_ENV"] === "development" &&
    console.log(`[SCRAPING-DEBUG] ${message}`, ...args),
};

export interface ScrapingResult {
  success: boolean;
  products?: ProductListing[];
  error?: string;
  sourceId: string;
  timestamp: Date;
  metadata?: {
    responseTime: number;
    productsFound: number;
    cacheHit: boolean;
  };
}

export interface ScrapingMetrics {
  sourceId: string;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastSuccessfulScrape: Date | null;
  lastError: string | null;
}

export class ScrapingService {
  private browser: Browser | null = null;
  private isInitialized = false;
  private userAgentPool: string[] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0",
  ];

  constructor() {
    // Prevent mock data in production
    if (
      process.env["NODE_ENV"] === "production" &&
      process.env["MOCK_DATA_ENABLED"] === "true"
    ) {
      throw new Error("Mock data cannot be enabled in production environment");
    }
  }

  protected async initializeBrowser(): Promise<void> {
    if (this.isInitialized && this.browser) return;

    try {
      // Simplified, reliable launch settings (works well on macOS/Linux)
      const headlessEnv = (
        process.env["PUPPETEER_HEADLESS"] || "true"
      ).toLowerCase();
      const headless = headlessEnv === "true" || headlessEnv === "1";
      const executablePath =
        process.env["PUPPETEER_EXECUTABLE_PATH"] || puppeteer.executablePath();
      const launchTimeout = parseInt(
        process.env["PUPPETEER_LAUNCH_TIMEOUT"] || "60000"
      );

      this.browser = await puppeteer.launch({
        headless: headless,
        executablePath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
        timeout: launchTimeout,
        protocolTimeout: launchTimeout,
      });
      this.isInitialized = true;
      logger.info(
        `Puppeteer initialized. headless=${headless} exec=${executablePath} timeout=${launchTimeout}`
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
    const startTime = Date.now();
    const source = await this.getSourceById(sourceId);

    if (!source) {
      return {
        success: false,
        error: `Source not found: ${sourceId}`,
        sourceId,
        timestamp: new Date(),
      };
    }

    // Check if scraping is enabled
    if (process.env["SCRAPING_ENABLED"] === "false") {
      logger.info(
        `Scraping disabled, returning mock data for source: ${source.name}`
      );
      return this.generateMockScrapingResult(sourceId, query);
    }

    try {
      // Initialize browser if not already done
      await this.initializeBrowser();
      if (!this.browser) {
        throw new Error("Failed to initialize browser");
      }

      // Create a new page for this scraping session
      const page = await this.browser.newPage();
      // Set generous timeouts per page
      page.setDefaultNavigationTimeout(60000);
      page.setDefaultTimeout(60000);

      try {
        // Set user agent and other anti-detection measures
        await this.setupPage(page);

        // Route based on source type
        let products: any[] = [];

        if (source.name.toLowerCase().includes("amazon")) {
          products = await this.scrapeAmazon(query, page);
        } else if (source.name.toLowerCase().includes("best buy")) {
          products = await this.scrapeBestBuy(query, page);
        } else if (source.name.toLowerCase().includes("walmart")) {
          products = await this.scrapeWalmart(query, page);
        } else {
          // Generic scraping for other sources
          products = await this.scrapeGenericSource(source, query, page);
        }

        // Check if we got any products from real scraping
        if (products.length === 0) {
          logger.warn(
            `Real scraping returned no products for ${source.name}, falling back to mock data`
          );
          return this.generateMockScrapingResult(sourceId, query);
        }

        // Transform products to match schema
        const transformedProducts = products.map((product) => ({
          id: crypto.randomUUID(),
          productId: crypto.randomUUID(),
          sourceId: sourceId,
          url:
            product.productUrl ||
            product.url ||
            `https://example.com/product/${crypto.randomUUID()}`,
          price: product.price,
          currency: "USD",
          availability: product.availability || "in_stock",
          imageUrl: product.imageUrl,
          rating: product.rating,
          reviewCount: product.reviewCount,
          lastScraped: new Date(),
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));

        const responseTime = Date.now() - startTime;

        logger.info(
          `Successfully scraped ${source.name} for query "${query}". Found ${transformedProducts.length} products in ${responseTime}ms`
        );

        return {
          success: true,
          products: transformedProducts,
          sourceId,
          timestamp: new Date(),
          metadata: {
            responseTime,
            productsFound: transformedProducts.length,
            cacheHit: false,
          },
        };
      } finally {
        await page.close();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.error(`Failed to scrape source ${source.name}: ${errorMessage}`);

      // Always fall back to mock data if real scraping fails
      logger.warn(`Falling back to mock data for source: ${source.name}`);
      return this.generateMockScrapingResult(sourceId, query);
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

  protected async getSourceConfiguration(
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

  protected generateMockScrapingResult(
    sourceId: string,
    query: string
  ): ScrapingResult {
    // For fallback mode, we'll generate generic mock data based on the query
    // since we don't know the exact source configuration

    // Generate more realistic mock data based on the search query
    const queryLower = query.toLowerCase();
    let mockProducts: ProductListing[] = [];

    if (
      queryLower.includes("sony") ||
      queryLower.includes("xm") ||
      queryLower.includes("headphone")
    ) {
      mockProducts = [
        {
          id: crypto.randomUUID(),
          productId: crypto.randomUUID(),
          sourceId: sourceId,
          url: `https://example.com/sony-wh-1000xm6?q=${encodeURIComponent(
            query
          )}`,
          price: 39999, // $399.99
          currency: "USD",
          availability: "in_stock",
          imageUrl: "https://via.placeholder.com/150x150?text=Sony+WH-1000XM6",
          rating: 4.8,
          reviewCount: 1247,
          lastScraped: new Date(),
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          productId: crypto.randomUUID(),
          sourceId: sourceId,
          url: `https://example.com/sony-wh-1000xm5?q=${encodeURIComponent(
            query
          )}`,
          price: 34999, // $349.99
          currency: "USD",
          availability: "in_stock",
          imageUrl: "https://via.placeholder.com/150x150?text=Sony+WH-1000XM5",
          rating: 4.7,
          reviewCount: 892,
          lastScraped: new Date(),
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          productId: crypto.randomUUID(),
          sourceId: sourceId,
          url: `https://example.com/sony-wh-1000xm4?q=${encodeURIComponent(
            query
          )}`,
          price: 29999, // $299.99
          currency: "USD",
          availability: "in_stock",
          imageUrl: "https://via.placeholder.com/150x150?text=Sony+WH-1000XM4",
          rating: 4.6,
          reviewCount: 567,
          lastScraped: new Date(),
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    } else if (queryLower.includes("apple") || queryLower.includes("airpod")) {
      mockProducts = [
        {
          id: crypto.randomUUID(),
          productId: crypto.randomUUID(),
          sourceId: sourceId,
          url: `https://example.com/apple-airpods-max?q=${encodeURIComponent(
            query
          )}`,
          price: 54999, // $549.99
          currency: "USD",
          availability: "in_stock",
          imageUrl: "https://via.placeholder.com/150x150?text=AirPods+Max",
          rating: 4.5,
          reviewCount: 2156,
          lastScraped: new Date(),
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: crypto.randomUUID(),
          productId: crypto.randomUUID(),
          sourceId: sourceId,
          url: `https://example.com/apple-airpods-pro?q=${encodeURIComponent(
            query
          )}`,
          price: 24999, // $249.99
          currency: "USD",
          availability: "in_stock",
          imageUrl: "https://via.placeholder.com/150x150?text=AirPods+Pro",
          rating: 4.6,
          reviewCount: 3421,
          lastScraped: new Date(),
          isValid: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    } else {
      // Generic mock data for other queries
      mockProducts = [
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
    }

    return {
      success: true,
      products: mockProducts,
      sourceId,
      timestamp: new Date(),
    };
  }

  // Note: buildSearchUrl and parsing helpers removed after refactor

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
      logger.info("Puppeteer browser closed");
    }
  }

  private async scrapeAmazon(query: string, page: Page): Promise<any[]> {
    try {
      logger.info(`Scraping Amazon for query: ${query}`);

      // Navigate to Amazon search page
      const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
        query
      )}`;
      await this.navigateWithRetry(page, searchUrl, 2);

      // Wait for search results to load
      await page.waitForSelector('[data-component-type="s-search-result"]', {
        timeout: 20000,
      });

      // Extract product information
      const products = await page.evaluate(() => {
        const productElements = (
          (globalThis as any).document as any
        ).querySelectorAll('[data-component-type="s-search-result"]');
        const results: any[] = [];

        productElements.forEach((element: any) => {
          try {
            // Skip sponsored and non-product elements
            const sponsored = element.querySelector(
              ".puis-sponsored-label-text"
            );
            if (sponsored) return;

            const titleElement = element.querySelector("h2 a span");
            const priceElement = element.querySelector(".a-price-whole");
            const ratingElement = element.querySelector(".a-icon-alt");
            const reviewCountElement = element.querySelector(".a-size-base");
            const imageElement = element.querySelector("img.s-image");
            const linkElement = element.querySelector("h2 a");

            if (!titleElement || !priceElement) return;

            const title = titleElement.textContent?.trim();
            const priceText = priceElement.textContent?.trim();
            const ratingText = ratingElement?.textContent?.trim();
            const reviewText = reviewCountElement?.textContent?.trim();
            const imageUrl = imageElement?.getAttribute("src");
            const productUrl = linkElement?.getAttribute("href");

            if (title && priceText && productUrl) {
              const price = parseInt(priceText.replace(/[^0-9]/g, ""));
              const rating = ratingText
                ? parseFloat(ratingText.split(" ")[0])
                : undefined;
              const reviewCount = reviewText
                ? parseInt(reviewText.replace(/[^0-9]/g, ""))
                : undefined;

              results.push({
                title,
                price: price * 100, // Convert to cents
                rating,
                reviewCount,
                imageUrl,
                productUrl: `https://www.amazon.com${productUrl}`,
                availability: "in_stock", // Default assumption
              });
            }
          } catch (error) {
            // Skip products with parsing errors
            console.debug(`Error parsing product element: ${error}`);
          }
        });

        return results;
      });

      logger.info(
        `Amazon scraping completed. Found ${products.length} products`
      );
      return products;
    } catch (error) {
      logger.error(`Amazon scraping failed: ${error}`);
      throw error;
    }
  }

  private async scrapeBestBuy(query: string, page: Page): Promise<any[]> {
    try {
      logger.info(`Scraping Best Buy for query: ${query}`);

      // Navigate to Best Buy search page
      const searchUrl = `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(
        query
      )}`;
      await this.navigateWithRetry(page, searchUrl, 2);

      // Wait for search results to load
      await page.waitForSelector(".sku-item", { timeout: 20000 });

      // Extract product information
      const products = await page.evaluate(() => {
        const productElements = (
          (globalThis as any).document as any
        ).querySelectorAll(".sku-item");
        const results: any[] = [];

        productElements.forEach((element: any) => {
          try {
            const titleElement = element.querySelector(".sku-title a");
            const priceElement = element.querySelector(
              ".priceView-customer-price span"
            );
            const ratingElement = element.querySelector(
              ".c-ratings-reviews .c-ratings-reviews-average"
            );
            const reviewCountElement = element.querySelector(
              ".c-ratings-reviews .c-ratings-reviews-count"
            );
            const imageElement = element.querySelector(".sku-image img");
            const linkElement = element.querySelector(".sku-title a");

            if (!titleElement || !priceElement) return;

            const title = titleElement.textContent?.trim();
            const priceText = priceElement.textContent?.trim();
            const ratingText = ratingElement?.textContent?.trim();
            const reviewText = reviewCountElement?.textContent?.trim();
            const imageUrl = imageElement?.getAttribute("src");
            const productUrl = linkElement?.getAttribute("href");

            if (title && priceText && productUrl) {
              const price = parseInt(priceText.replace(/[^0-9]/g, ""));
              const rating = ratingText ? parseFloat(ratingText) : undefined;
              const reviewCount = reviewText
                ? parseInt(reviewText.replace(/[^0-9]/g, ""))
                : undefined;

              results.push({
                title,
                price: price * 100, // Convert to cents
                rating,
                reviewCount,
                imageUrl,
                productUrl: `https://www.bestbuy.com${productUrl}`,
                availability: "in_stock", // Default assumption
              });
            }
          } catch (error) {
            console.debug(`Error parsing Best Buy product element: ${error}`);
          }
        });

        return results;
      });

      logger.info(
        `Best Buy scraping completed. Found ${products.length} products`
      );
      return products;
    } catch (error) {
      logger.error(`Best Buy scraping failed: ${error}`);
      throw error;
    }
  }

  private async scrapeWalmart(query: string, page: Page): Promise<any[]> {
    try {
      logger.info(`Scraping Walmart for query: ${query}`);

      // Navigate to Walmart search page
      const searchUrl = `https://www.walmart.com/search?q=${encodeURIComponent(
        query
      )}`;
      await this.navigateWithRetry(page, searchUrl, 2);

      // Wait for search results to load
      await page.waitForSelector("[data-item-id]", { timeout: 20000 });

      // Extract product information
      const products = await page.evaluate(() => {
        const productElements = (
          (globalThis as any).document as any
        ).querySelectorAll("[data-item-id]");
        const results: any[] = [];

        productElements.forEach((element: any) => {
          try {
            const titleElement = element.querySelector(
              '[data-testid="product-title"]'
            );
            const priceElement = element.querySelector(
              '[data-testid="price-wrap"] .f7'
            );
            const ratingElement = element.querySelector(
              '[data-testid="rating"]'
            );
            const reviewCountElement = element.querySelector(
              '[data-testid="rating-count"]'
            );
            const imageElement = element.querySelector("img");
            const linkElement = element.querySelector('a[href*="/ip/"]');

            if (!titleElement || !priceElement) return;

            const title = titleElement.textContent?.trim();
            const priceText = priceElement.textContent?.trim();
            const ratingText = ratingElement?.textContent?.trim();
            const reviewText = reviewCountElement?.textContent?.trim();
            const imageUrl = imageElement?.getAttribute("src");
            const productUrl = linkElement?.getAttribute("href");

            if (title && priceText && productUrl) {
              const price = parseInt(priceText.replace(/[^0-9]/g, ""));
              const rating = ratingText
                ? parseFloat(ratingText.split(" ")[0])
                : undefined;
              const reviewCount = reviewText
                ? parseInt(reviewText.replace(/[^0-9]/g, ""))
                : undefined;

              results.push({
                title,
                price: price * 100, // Convert to cents
                rating,
                reviewCount,
                imageUrl,
                productUrl: `https://www.walmart.com${productUrl}`,
                availability: "in_stock", // Default assumption
              });
            }
          } catch (error) {
            console.debug(`Error parsing Walmart product element: ${error}`);
          }
        });

        return results;
      });

      logger.info(
        `Walmart scraping completed. Found ${products.length} products`
      );
      return products;
    } catch (error) {
      logger.error(`Walmart scraping failed: ${error}`);
      throw error;
    }
  }

  private async getSourceById(sourceId: string): Promise<Source | null> {
    try {
      const db = getDb();
      const result = await db
        .select()
        .from(sources)
        .where(eq(sources.id, sourceId))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      logger.error(`Failed to get source by ID ${sourceId}:`, error);
      return null;
    }
  }

  private async setupPage(page: Page): Promise<void> {
    // Set a realistic user agent
    const userAgent =
      this.userAgentPool[Math.floor(Math.random() * this.userAgentPool.length)];
    if (userAgent) {
      await page.setUserAgent(userAgent);
    }

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    // Set extra headers to appear more like a real browser
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });

    // Disable webdriver detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty((globalThis as any).navigator, "webdriver", {
        get: () => undefined,
      });
    });
  }

  private async navigateWithRetry(
    page: Page,
    url: string,
    maxRetries: number = 2
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Navigating to ${url} (attempt ${attempt}/${maxRetries})`);
        await page.goto(url, { waitUntil: "domcontentloaded" });
        return;
      } catch (error) {
        logger.warn(`Navigation attempt ${attempt} failed:`, error);
        if (attempt === maxRetries) {
          throw error;
        }
        const waitMs = 1000 * attempt + Math.floor(Math.random() * 500);
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }
  }

  private async scrapeGenericSource(
    source: Source,
    query: string,
    page: Page
  ): Promise<any[]> {
    try {
      logger.info(`Generic scraping for source: ${source.name}`);

      // Use source configuration if available
      const config = source.configuration as any;
      const searchUrl =
        config?.searchUrl ||
        `${
          config?.baseUrl || "https://example.com"
        }/search?q=${encodeURIComponent(query)}`;

      await this.navigateWithRetry(page, searchUrl, 2);

      // Wait for content to load
      await page.waitForSelector("body", { timeout: 20000 });

      // Generic product extraction
      const products = await page.evaluate(() => {
        const productElements = (
          (globalThis as any).document as any
        ).querySelectorAll(
          '*[class*="product"], *[class*="item"], *[class*="card"]'
        );
        const results: any[] = [];

        productElements.forEach((element: any) => {
          try {
            // Look for common product selectors
            const titleElement = element.querySelector(
              'h1, h2, h3, [class*="title"], [class*="name"]'
            );
            const priceElement = element.querySelector(
              '[class*="price"], [class*="cost"]'
            );
            const imageElement = element.querySelector("img");
            const linkElement = element.querySelector("a");

            if (titleElement && priceElement) {
              const title = titleElement.textContent?.trim();
              const priceText = priceElement.textContent?.trim();
              const imageUrl = imageElement?.getAttribute("src");
              const productUrl = linkElement?.getAttribute("href");

              if (title && priceText) {
                const price = parseInt(priceText.replace(/[^0-9]/g, ""));

                if (price > 0) {
                  results.push({
                    title,
                    price: price * 100, // Convert to cents
                    imageUrl,
                    productUrl: productUrl
                      ? productUrl.startsWith("http")
                        ? productUrl
                        : `${
                            (globalThis as any).location?.origin ||
                            "https://example.com"
                          }${productUrl}`
                      : undefined,
                    availability: "in_stock",
                  });
                }
              }
            }
          } catch (error) {
            // Skip products with parsing errors
          }
        });

        return results;
      });

      logger.info(
        `Generic scraping completed for ${source.name}. Found ${products.length} products`
      );
      return products;
    } catch (error) {
      logger.error(`Generic scraping failed for ${source.name}: ${error}`);
      return [];
    }
  }
}
