import puppeteer, { Browser, Page } from "puppeteer";
import * as cheerio from "cheerio";
import {
  SourceRepository,
  ProductRepository,
  ProductListingRepository,
} from "../repositories/index.js";
import redisClient from "../config/redis.js";

export interface ScrapingJob {
  id: string;
  query: string;
  sourceId: string;
  searchId?: string;
  priority: "high" | "normal" | "low";
  status: "pending" | "in-progress" | "completed" | "failed";
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export interface ScrapingResult {
  productName: string;
  price: number;
  currency: string;
  availability: "in_stock" | "out_of_stock" | "limited" | "unknown";
  url: string;
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  sourceId: string;
}

export class ScrapingService {
  private browser: Browser | null = null;
  private activeJobs = new Map<string, ScrapingJob>();

  constructor(
    private sourceRepo: SourceRepository,
    private productRepo: ProductRepository,
    private listingRepo: ProductListingRepository
  ) {}

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
        ],
      });
      console.log("✅ Puppeteer browser initialized");
    } catch (error) {
      console.error("❌ Failed to initialize Puppeteer:", error);
      throw error;
    }
  }

  async scrapeSource(
    query: string,
    sourceId: string
  ): Promise<ScrapingResult[]> {
    const source = await this.sourceRepo.findById(sourceId);
    if (!source || !source.isActive) {
      throw new Error(`Source ${sourceId} not found or inactive`);
    }

    // Check rate limiting
    await this.checkRateLimit(sourceId);

    const startTime = Date.now();
    let page: Page | null = null;

    try {
      // Update source metrics
      await this.sourceRepo.updateLastSuccessfulScrape(sourceId);

      // Create or get page
      page = await this.createPage();

      // Configure page
      await this.configurePage(page, source.configuration);

      // Perform search
      const searchUrl = this.buildSearchUrl(query, source.configuration);
      await page.goto(searchUrl, { waitUntil: "networkidle2", timeout: 30000 });

      // Wait for content to load
      await this.waitForContent(page, source.configuration);

      // Extract data
      const html = await page.content();
      const results = await this.extractProductData(
        html,
        source.configuration,
        sourceId
      );

      // Update source response time
      const responseTime = Date.now() - startTime;
      await this.sourceRepo.updateAverageResponseTime(sourceId, responseTime);

      return results;
    } catch (error) {
      // Increment error count
      await this.sourceRepo.incrementErrorCount(sourceId);

      console.error(`Scraping failed for source ${sourceId}:`, error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  async processScrapingJob(job: ScrapingJob): Promise<void> {
    this.activeJobs.set(job.id, {
      ...job,
      status: "in-progress",
      startedAt: new Date(),
    });

    try {
      const results = await this.scrapeSource(job.query, job.sourceId);

      // Process and store results
      await this.processScrapingResults(results, job.query);

      this.activeJobs.set(job.id, {
        ...job,
        status: "completed",
        completedAt: new Date(),
      });
    } catch (error) {
      this.activeJobs.set(job.id, {
        ...job,
        status: "failed",
        completedAt: new Date(),
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async createPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error("Browser not initialized");
    }

    const page = await this.browser.newPage();

    // Set user agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });

    return page;
  }

  private async configurePage(page: Page, config: any): Promise<void> {
    // Set extra headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
      "Accept-Encoding": "gzip, deflate, br",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    });

    // Block unnecessary resources
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });
  }

  private buildSearchUrl(query: string, config: any): string {
    const baseUrl = config.baseUrl;
    const searchPath = config.searchPath;
    const encodedQuery = encodeURIComponent(query);
    return `${baseUrl}${searchPath}${encodedQuery}`;
  }

  private async waitForContent(page: Page, config: any): Promise<void> {
    const selectors = config.selectors;

    // Wait for at least one product to load
    if (selectors.productName) {
      try {
        await page.waitForSelector(selectors.productName, { timeout: 10000 });
      } catch (error) {
        console.warn("Product name selector not found, continuing anyway");
      }
    }

    // Wait for content to settle
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  private async extractProductData(
    html: string,
    config: any,
    sourceId: string
  ): Promise<ScrapingResult[]> {
    const $ = cheerio.load(html);
    const selectors = config.selectors;
    const results: ScrapingResult[] = [];

    // Find product containers
    const productContainers = $(selectors.productContainer || "body");

    productContainers.each((_, container) => {
      const $container = $(container);

      try {
        const productName = this.extractText($container, selectors.productName);
        const priceText = this.extractText($container, selectors.price);
        const availabilityText = this.extractText(
          $container,
          selectors.availability
        );
        const url = this.extractUrl($container, selectors.url, config.baseUrl);
        const imageUrl = this.extractUrl(
          $container,
          selectors.image,
          config.baseUrl
        );
        const ratingText = this.extractText($container, selectors.rating);
        const reviewCountText = this.extractText(
          $container,
          selectors.reviewCount
        );

        if (productName && priceText && url) {
          const price = this.parsePrice(priceText);
          const availability = this.parseAvailability(availabilityText);
          const rating = ratingText ? parseFloat(ratingText) : undefined;
          const reviewCount = reviewCountText
            ? parseInt(reviewCountText.replace(/\D/g, ""))
            : undefined;

          if (price > 0) {
            results.push({
              productName: productName.trim(),
              price,
              currency: this.extractCurrency(priceText) || "USD",
              availability,
              url,
              imageUrl,
              rating,
              reviewCount,
              sourceId,
            });
          }
        }
      } catch (error) {
        console.warn("Error extracting product data:", error);
      }
    });

    return results;
  }

  private extractText(
    $container: cheerio.Cheerio<any>,
    selector: string
  ): string {
    if (!selector) return "";
    const element = $container.find(selector);
    return element.text().trim();
  }

  private extractUrl(
    $container: cheerio.Cheerio<any>,
    selector: string,
    baseUrl: string
  ): string | undefined {
    if (!selector) return undefined;
    const element = $container.find(selector);
    const href = element.attr("href");
    if (!href) return undefined;

    if (href.startsWith("http")) {
      return href;
    }

    return href.startsWith("/") ? `${baseUrl}${href}` : `${baseUrl}/${href}`;
  }

  private parsePrice(priceText: string): number {
    const priceMatch = priceText.match(/[\d,]+\.?\d*/);
    if (!priceMatch) return 0;

    const price = priceMatch[0].replace(/,/g, "");
    return parseFloat(price) || 0;
  }

  private parseAvailability(
    availabilityText: string
  ): "in_stock" | "out_of_stock" | "limited" | "unknown" {
    const text = availabilityText.toLowerCase();

    if (text.includes("in stock") || text.includes("available")) {
      return "in_stock";
    }

    if (text.includes("out of stock") || text.includes("unavailable")) {
      return "out_of_stock";
    }

    if (text.includes("limited") || text.includes("few left")) {
      return "limited";
    }

    return "unknown";
  }

  private extractCurrency(priceText: string): string {
    const currencyMatch = priceText.match(/[\$€£¥₹]/);
    if (currencyMatch) {
      const currency = currencyMatch[0];
      const currencyMap: Record<string, string> = {
        $: "USD",
        "€": "EUR",
        "£": "GBP",
        "¥": "JPY",
        "₹": "INR",
      };
      return currencyMap[currency] || "USD";
    }
    return "USD";
  }

  private async checkRateLimit(sourceId: string): Promise<void> {
    const key = `rate_limit:${sourceId}`;
    const current = await redisClient.get(key);

    if (current && parseInt(current) >= 30) {
      // 30 requests per minute
      throw new Error(`Rate limit exceeded for source ${sourceId}`);
    }

    await redisClient.incr(key);
    await redisClient.expire(key, 60); // Reset after 1 minute
  }

  private async processScrapingResults(
    results: ScrapingResult[],
    query: string
  ): Promise<void> {
    for (const result of results) {
      try {
        // Find or create product
        let product = await this.productRepo.findByNormalizedName(
          result.productName.toLowerCase().replace(/[^a-z0-9]/g, " ")
        );

        if (!product) {
          product = await this.productRepo.create({
            name: result.productName,
            normalizedName: result.productName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, " "),
            category: this.inferCategory(result.productName),
            specifications: {},
          });
        }

        // Create or update product listing
        const existingListing = await this.listingRepo.findByProductAndSource(
          product.id,
          result.sourceId
        );

        if (existingListing) {
          // Update existing listing
          await this.listingRepo.update(existingListing.id, {
            price: result.price,
            currency: result.currency,
            availability: result.availability,
            imageUrl: result.imageUrl,
            rating: result.rating,
            reviewCount: result.reviewCount,
            isValid: true,
          });
        } else {
          // Create new listing
          await this.listingRepo.create({
            productId: product.id,
            sourceId: result.sourceId,
            url: result.url,
            price: result.price,
            currency: result.currency,
            availability: result.availability,
            imageUrl: result.imageUrl,
            rating: result.rating,
            reviewCount: result.reviewCount,
            isValid: true,
          });
        }
      } catch (error) {
        console.error("Error processing scraping result:", error);
      }
    }
  }

  private inferCategory(productName: string): string {
    const name = productName.toLowerCase();

    if (
      name.includes("phone") ||
      name.includes("iphone") ||
      name.includes("samsung")
    ) {
      return "Electronics";
    }

    if (
      name.includes("laptop") ||
      name.includes("computer") ||
      name.includes("macbook")
    ) {
      return "Computers";
    }

    if (
      name.includes("headphone") ||
      name.includes("speaker") ||
      name.includes("audio")
    ) {
      return "Audio";
    }

    if (name.includes("camera") || name.includes("photo")) {
      return "Photography";
    }

    return "General";
  }
}
