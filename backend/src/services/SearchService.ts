import {
  ProductRepository,
  ProductListingRepository,
  SearchRepository,
  SourceRepository,
} from "../repositories/index.js";
import { SearchRequest, SearchResponse, ProductResult } from "../types/api.js";
import redisClient from "../config/redis.js";

export class SearchService {
  constructor(
    private productRepo: ProductRepository,
    private listingRepo: ProductListingRepository,
    private searchRepo: SearchRepository,
    private sourceRepo: SourceRepository
  ) {}

  async searchProducts(request: SearchRequest): Promise<SearchResponse> {
    const startTime = Date.now();

    // Check cache first
    const cacheKey = `search:${request.query}:${
      request.sources?.join(",") || "all"
    }:${request.maxResults}`;
    const cachedResult = await this.getFromCache(cacheKey);

    if (cachedResult) {
      return {
        ...cachedResult,
        metadata: {
          ...cachedResult.metadata,
          cacheHit: true,
          searchDuration: Date.now() - startTime,
        },
      };
    }

    // Get active sources
    const sources = await this.getActiveSources(request.sources);

    // Search existing products in database
    const existingProducts = await this.productRepo.search(request.query);

    // Get existing listings for found products
    const existingListings = await this.getExistingListings(
      existingProducts,
      sources
    );

    // Create search record
    const search = await this.searchRepo.create({
      query: request.query,
      metadata: {
        totalSources: sources.length,
        successfulSources: 0, // Will be updated when scraping completes
        searchDuration: Date.now() - startTime,
        cacheHit: false,
      },
    });

    // Format results
    const results = await this.formatSearchResults(existingListings, search.id);

    const response: SearchResponse = {
      searchId: search.id,
      results,
      metadata: {
        totalSources: sources.length,
        successfulSources: 0, // Will be updated when scraping completes
        searchDuration: Date.now() - startTime,
        cacheHit: false,
        timestamp: new Date().toISOString(),
      },
    };

    // Cache the results
    await this.cacheResults(cacheKey, response);

    return response;
  }

  async getSearchResults(searchId: string): Promise<SearchResponse> {
    const search = await this.searchRepo.findById(searchId);
    if (!search) {
      throw new Error("Search not found");
    }

    // For now, return empty results since we don't have a way to get product IDs
    // This will need to be implemented when the search-results relationship is established
    const results: ProductResult[] = [];

    return {
      searchId: search.id,
      results,
      metadata: {
        totalSources: 0, // Will be updated when scraping completes
        successfulSources: 0,
        searchDuration: 0,
        cacheHit: false,
        timestamp: new Date().toISOString(),
      },
    };
  }

  async refreshPrices(searchId: string): Promise<string> {
    const search = await this.searchRepo.findById(searchId);
    if (!search) {
      throw new Error("Search not found");
    }

    // Get active sources
    const sources = await this.sourceRepo.findActive();

    // Queue refresh jobs
    const refreshJobs = await Promise.resolve({ id: "temp-job-id" }); // Placeholder

    return refreshJobs.id;
  }

  private async getFromCache(key: string): Promise<SearchResponse | null> {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (15 minutes)
        if (
          Date.now() - new Date(parsed.metadata.timestamp).getTime() <
          15 * 60 * 1000
        ) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Cache retrieval failed:", error);
    }
    return null;
  }

  private async cacheResults(
    key: string,
    results: SearchResponse
  ): Promise<void> {
    try {
      const dataToCache = {
        ...results,
        metadata: {
          ...results.metadata,
          timestamp: new Date().toISOString(),
        },
      };
      await redisClient.setEx(key, 900, JSON.stringify(dataToCache)); // 15 minutes
    } catch (error) {
      console.warn("Caching failed:", error);
    }
  }

  private async getActiveSources(sourceIds?: string[]): Promise<any[]> {
    if (sourceIds && sourceIds.length > 0) {
      return Promise.all(sourceIds.map((id) => this.sourceRepo.findById(id)));
    }
    return this.sourceRepo.findActive();
  }

  private async getExistingListings(
    products: any[],
    sources: any[]
  ): Promise<any[]> {
    const listings: any[] = [];

    for (const product of products) {
      for (const source of sources) {
        const listing = await this.listingRepo.findByProductAndSource(
          product.id,
          source.id
        );
        if (listing && listing.isValid) {
          listings.push(listing);
        }
      }
    }

    return listings;
  }

  private async queueScrapingJobs(
    query: string,
    sources: any[],
    existingProducts: any[]
  ): Promise<any[]> {
    // This method is no longer used and its dependencies are removed.
    // Keeping it for now as it might be re-introduced or refactored later.
    // The original code had a QueueService dependency, which is removed.
    // This method will likely need to be re-evaluated or removed if not used.
    // For now, returning an empty array as QueueService is gone.
    return [];
  }

  private async formatSearchResults(
    listings: any[],
    searchId: string
  ): Promise<ProductResult[]> {
    const results: ProductResult[] = [];

    for (const listing of listings) {
      const product = await this.productRepo.findById(listing.productId);
      const source = await this.sourceRepo.findById(listing.sourceId);

      if (product && source) {
        results.push({
          id: listing.id,
          productId: listing.productId,
          name: product.name,
          price: listing.price,
          currency: listing.currency,
          availability: listing.availability,
          source: {
            id: source.id,
            name: source.name,
            category: source.category,
          },
          url: listing.url,
          imageUrl: listing.imageUrl,
          rating: listing.rating,
          reviewCount: listing.reviewCount,
          lastScraped: listing.lastScraped.toISOString(),
        });
      }
    }

    return results;
  }
}
