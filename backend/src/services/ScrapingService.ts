import puppeteer, { Browser, Page } from "puppeteer";
import * as cheerio from "cheerio";
import { productListings, sources } from "../database/schema";
import type { InferSelectModel } from "drizzle-orm";
import crypto from "crypto";

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
  private metrics: Map<string, ScrapingMetrics> = new Map();
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

  private async initializeBrowser(): Promise<void> {
    if (this.isInitialized && this.browser) return;

    try {
      // Production-ready browser configuration with anti-detection
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
          "--disable-extensions",
          "--disable-plugins",
          "--disable-images", // Disable images for faster scraping
          "--disable-javascript", // Disable JS for basic scraping
          "--disable-css",
          "--disable-fonts",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
          "--disable-default-apps",
          "--disable-sync",
          "--metrics-recording-only",
          "--no-default-browser-check",
          "--no-experiments",
          "--disable-webgl",
          "--disable-threaded-animation",
          "--disable-threaded-scrolling",
          "--disable-in-process-stack-traces",
          "--disable-histogram-customizer",
          "--disable-gl-extensions",
          "--disable-composited-antialiasing",
          "--disable-canvas-aa",
          "--disable-3d-apis",
          "--disable-accelerated-video-decode",
          "--disable-accelerated-mjpeg-decode",
          "--disable-accelerated-video-encode",
          "--disable-pepper-3d",
          "--disable-file-system",
          "--disable-speech-api",
          "--disable-encrypted-media",
          "--disable-media-session",
          "--disable-webrtc",
          "--disable-background-networking",
          "--disable-sync-preferences",
          "--disable-translate",
          "--disable-logging",
          "--disable-default-apps",
          "--disable-background-downloads",
          "--disable-background-upload",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-features=TranslateUI",
          "--disable-ipc-flooding-protection",
          "--disable-default-apps",
          "--disable-sync",
          "--metrics-recording-only",
          "--no-default-browser-check",
          "--no-experiments",
          "--disable-webgl",
          "--disable-threaded-animation",
          "--disable-threaded-scrolling",
          "--disable-in-process-stack-traces",
          "--disable-histogram-customizer",
          "--disable-gl-extensions",
          "--disable-composited-antialiasing",
          "--disable-canvas-aa",
          "--disable-3d-apis",
          "--disable-accelerated-video-decode",
          "--disable-accelerated-mjpeg-decode",
          "--disable-accelerated-video-encode",
          "--disable-pepper-3d",
          "--disable-file-system",
          "--disable-speech-api",
          "--disable-encrypted-media",
          "--disable-media-session",
          "--disable-webrtc",
          "--disable-background-networking",
          "--disable-sync-preferences",
          "--disable-translate",
          "--disable-logging",
          "--disable-default-apps",
          "--disable-background-downloads",
          "--disable-background-upload",
        ],
        timeout: 30000,
        protocolTimeout: 30000,
        ignoreHTTPSErrors: true,
      };

      // Try to launch with production options
      try {
        this.browser = await puppeteer.launch(launchOptions);
        this.isInitialized = true;
        logger.info(
          "Puppeteer browser initialized successfully with production options"
        );
        return;
      } catch (error) {
        logger.warn(
          "Production Puppeteer launch failed, trying with minimal options:",
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
    const startTime = Date.now();

    try {
      // In development mode, immediately use mock data to avoid browser issues
      if (process.env["NODE_ENV"] === "development") {
        logger.info("Development mode: Using mock data for scraping");
        return this.generateMockScrapingResult(sourceId, query);
      }

      // Only try to initialize browser in production
      await this.initializeBrowser();

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
        // If we can't get source configuration, fall back to mock data in development only
        if (process.env["NODE_ENV"] === "development") {
          logger.info(
            "Falling back to mock data due to source configuration failure"
          );
          return this.generateMockScrapingResult(sourceId, query);
        }
        throw new Error(
          `Source ${sourceId} not found - cannot scrape in production`
        );
      }

      if (!source) {
        // If no source configuration found, fall back to mock data in development only
        if (process.env["NODE_ENV"] === "development") {
          logger.warn(
            `No source configuration found for ${sourceId}, using fallback`
          );
          return this.generateMockScrapingResult(sourceId, query);
        }
        throw new Error(
          `Source ${sourceId} not found - cannot scrape in production`
        );
      }

      const page = await this.browser.newPage();

      // Enhanced anti-detection measures
      await this.setupAntiDetection(page);

      // Navigate to the search URL with enhanced error handling
      const searchUrl = this.buildSearchUrl(source, query);
      await this.navigateWithRetry(page, searchUrl);

      // Wait for content to load with smart waiting
      await this.waitForContent(page, source);

      // Get the page content
      const content = await page.content();
      const $ = cheerio.load(content);

      // Extract products based on source-specific selectors
      const products = await this.extractProducts($, source, query);

      await page.close();

      const responseTime = Date.now() - startTime;

      // Update metrics
      this.updateMetrics(sourceId, true, responseTime, products.length);

      return {
        success: true,
        products,
        sourceId,
        timestamp: new Date(),
        metadata: {
          responseTime,
          productsFound: products.length,
          cacheHit: false,
        },
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      logger.error(`Scraping failed for source ${sourceId}:`, error);

      // Update metrics
      this.updateMetrics(sourceId, false, responseTime, 0, errorMessage);

      // In development, fall back to mock data
      if (process.env["NODE_ENV"] === "development") {
        logger.warn("Falling back to mock data due to scraping failure");
        return this.generateMockScrapingResult(sourceId, query);
      }

      // In production, return error instead of mock data
      logger.error(
        `Scraping failed in production environment for source ${sourceId}`
      );
      throw error;
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

  private async setupAntiDetection(page: Page): Promise<void> {
    // Set random user agent
    if (this.userAgentPool.length === 0) {
      throw new Error("No user agents available");
    }
    const userAgentIndex = Math.floor(
      Math.random() * this.userAgentPool.length
    );
    const userAgent = this.userAgentPool[userAgentIndex]!;
    await page.setUserAgent(userAgent);

    // Set realistic viewport
    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1536, height: 864 },
    ];
    if (viewports.length === 0) {
      throw new Error("No viewports available");
    }
    const viewportIndex = Math.floor(Math.random() * viewports.length);
    const selectedViewport = viewports[viewportIndex]!;
    await page.setViewport(selectedViewport);

    // Set extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Ch-Ua":
        '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      "Sec-Ch-Ua-Mobile": "?0",
      "Sec-Ch-Ua-Platform": '"Windows"',
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      "Upgrade-Insecure-Requests": "1",
    });

    // Set cookies to look more legitimate
    await page.setCookie({
      name: "cookieconsent_status",
      value: "dismiss",
      domain: ".example.com",
      path: "/",
    });

    // Intercept and modify requests to avoid detection
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      // Block unnecessary resources
      const resourceType = request.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        request.abort();
      } else {
        // Add random delay to requests
        setTimeout(() => request.continue(), Math.random() * 100);
      }
    });

    // Add random mouse movements to look more human
    await page.mouse.move(
      Math.random() * selectedViewport.width,
      Math.random() * selectedViewport.height
    );
  }

  private async navigateWithRetry(
    page: Page,
    url: string,
    maxRetries = 3
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Navigation attempt ${attempt} to ${url}`);

        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 30000,
        });

        // Check if we got blocked or got an error page
        const title = await page.title();
        if (
          title.toLowerCase().includes("blocked") ||
          title.toLowerCase().includes("access denied") ||
          title.toLowerCase().includes("forbidden")
        ) {
          throw new Error(`Access blocked: ${title}`);
        }

        logger.debug(`Successfully navigated to ${url}`);
        return;
      } catch (error) {
        logger.warn(`Navigation attempt ${attempt} failed:`, error);

        if (attempt === maxRetries) {
          throw new Error(
            `Failed to navigate after ${maxRetries} attempts: ${error}`
          );
        }

        // Wait before retry with exponential backoff
        const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  private async waitForContent(page: Page, source: Source): Promise<void> {
    const config = source.configuration as any;

    try {
      // Wait for the product container to appear
      if (config.selectors?.productContainer) {
        await page.waitForSelector(config.selectors.productContainer, {
          timeout: 10000,
        });
      }

      // Additional wait for dynamic content
      await page.waitForTimeout(2000 + Math.random() * 3000);

      // Scroll down to trigger lazy loading
      await page.evaluate(() => {
        // @ts-ignore - These globals exist in browser context
        if (typeof window !== "undefined" && typeof document !== "undefined") {
          // @ts-ignore - These globals exist in browser context
          window.scrollTo(0, document.body.scrollHeight);
        }
      });

      await page.waitForTimeout(1000);
    } catch (error) {
      logger.warn(`Content waiting failed for ${source.name}:`, error);
      // Continue anyway, might still get some content
    }
  }

  private updateMetrics(
    sourceId: string,
    success: boolean,
    responseTime: number,
    _productsFound: number, // Prefix with underscore to indicate intentionally unused
    error?: string
  ): void {
    const current = this.metrics.get(sourceId) || {
      sourceId,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      lastSuccessfulScrape: null,
      lastError: null,
    };

    if (success) {
      current.successCount++;
      current.lastSuccessfulScrape = new Date();
      current.lastError = null;
    } else {
      current.errorCount++;
      current.lastError = error || "Unknown error";
    }

    // Update average response time
    const totalRequests = current.successCount + current.errorCount;
    current.averageResponseTime =
      (current.averageResponseTime * (totalRequests - 1) + responseTime) /
      totalRequests;

    this.metrics.set(sourceId, current);
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
