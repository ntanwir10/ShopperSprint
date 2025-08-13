import { v4 as uuidv4 } from "uuid";
import {
  searchRequestSchema,
  searchResponseSchema,
} from "../validation/schemas";
import type { z } from "zod";
import { SourceRepository } from "../repositories/sourceRepository";
import { ScrapingService } from "./scrapingService";

// Define types from schemas
type SearchRequest = z.infer<typeof searchRequestSchema>;
type SearchResponse = z.infer<typeof searchResponseSchema>;

export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  availability?: "in_stock" | "out_of_stock" | "limited" | "unknown";
  minRating?: number;
  sources?: string[];
  category?: string;
}

export interface SearchSortOptions {
  field: "price" | "rating" | "reviewCount" | "lastScraped";
  direction: "asc" | "desc";
}

export class SearchService {
  constructor(
    private sourceRepository: SourceRepository
  ) {}

  async search(
    request: SearchRequest & {
      filters?: SearchFilters;
      sort?: SearchSortOptions;
    }
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const searchId = uuidv4();

    try {
      // Get all active sources
      const sources = await this.sourceRepository.getActiveSources();
      const totalSources = sources.length;

      // Filter sources if specified
      const targetSources = request.sources
        ? sources.filter((s: any) => request.sources!.includes(s.id))
        : sources;

      // For Phase 3, we'll use real scraping instead of mock data
      const scrapingService = new ScrapingService();
      const scrapingResults: any[] = [];

      // Scrape each source in parallel with rate limiting
      const scrapingPromises = targetSources.map(
        async (source: any, index: number) => {
          // Add delay between requests to respect rate limits
          if (index > 0) {
            const config = source.configuration as any;
            const rateLimit = config?.rateLimit || 1000;
            await new Promise((resolve) => setTimeout(resolve, rateLimit));
          }

          try {
            const result = await scrapingService.scrapeSource(
              source.id,
              request.query
            );
            if (result.success && result.products) {
              scrapingResults.push(...result.products);
            }
          } catch (error) {
            console.error(`Failed to scrape source ${source.name}:`, error);
          }
        }
      );

      await Promise.all(scrapingPromises);
      await scrapingService.close();

      // Apply filters
      let filteredResults = this.applyFilters(scrapingResults, request.filters);

      // Apply sorting
      if (request.sort) {
        filteredResults = this.sortResults(filteredResults, request.sort);
      }

      // Limit results
      const maxResults = request.maxResults || 50;
      const limitedResults = filteredResults.slice(0, maxResults);

      const searchDuration = Date.now() - startTime;

      return {
        searchId,
        results: limitedResults,
        metadata: {
          totalSources,
          successfulSources:
            scrapingResults.length > 0 ? targetSources.length : 0,
          searchDuration,
          cacheHit: false,
        },
      };
    } catch (error) {
      console.error("Search service error:", error);
      throw new Error("Failed to perform search");
    }
  }

  private applyFilters(results: any[], filters?: SearchFilters): any[] {
    if (!filters) return results;

    return results.filter((product) => {
      // Price filters
      if (filters.minPrice !== undefined && product.price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
        return false;
      }

      // Availability filter
      if (
        filters.availability &&
        product.availability !== filters.availability
      ) {
        return false;
      }

      // Rating filter
      if (
        filters.minRating !== undefined &&
        (product.rating || 0) < filters.minRating
      ) {
        return false;
      }

      // Source filter
      if (filters.sources && filters.sources.length > 0) {
        if (!filters.sources.includes(product.sourceId)) {
          return false;
        }
      }

      return true;
    });
  }

  private sortResults(results: any[], sort: SearchSortOptions): any[] {
    return [...results].sort((a, b) => {
      let aValue = a[sort.field];
      let bValue = b[sort.field];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined)
        aValue = sort.direction === "asc" ? Infinity : -Infinity;
      if (bValue === null || bValue === undefined)
        bValue = sort.direction === "asc" ? Infinity : -Infinity;

      // Handle string values (like lastScraped)
      if (typeof aValue === "string") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sort.direction === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }
}
