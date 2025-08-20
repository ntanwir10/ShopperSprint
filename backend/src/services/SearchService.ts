import { v4 as uuidv4 } from "uuid";
import {
  searchRequestSchema,
  searchResponseSchema,
} from "../validation/schemas";
import type { z } from "zod";
import { SourceRepository } from "../repositories/sourceRepository";
import { ScrapingService } from "./scrapingService";
import { cachingService } from "./cachingService";
import { monitoringService } from "./monitoringService";

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
  constructor(private sourceRepository: SourceRepository) {}

  async search(
    request: SearchRequest & {
      filters?: SearchFilters;
      sort?: SearchSortOptions;
    }
  ): Promise<SearchResponse> {
    const startTime = Date.now();
    const searchId = uuidv4();

    try {
      // Check cache first
      const cachedResult = await cachingService.get<SearchResponse>(
        request.query,
        request.filters,
        request.sort,
        request.sources
      );

      if (
        cachedResult &&
        cachedResult.results &&
        Array.isArray(cachedResult.results)
      ) {
        console.log("✅ Cache hit for search query:", request.query);
        return {
          ...cachedResult,
          searchId,
          metadata: {
            ...cachedResult.metadata,
            cacheHit: true,
            searchDuration: Date.now() - startTime,
          },
        };
      }

      console.log("🔄 Cache miss, performing fresh search for:", request.query);

      // Get all active sources
      const sources = await this.sourceRepository.getActiveSources();
      const totalSources = sources.length;

      if (totalSources === 0) {
        console.warn("No active sources found for scraping");
        return {
          searchId,
          results: [],
          metadata: {
            totalSources: 0,
            successfulSources: 0,
            searchDuration: Date.now() - startTime,
            cacheHit: false,
          },
        };
      }

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
            // Update monitoring metrics for this source
            try {
              monitoringService.updateMetrics(source.id, {
                sourceName: source.name,
                totalRequests: 1,
              });
            } catch (monitoringError) {
              console.warn(
                `Failed to update monitoring metrics for source ${source.id}:`,
                monitoringError
              );
            }

            const result = await scrapingService.scrapeSource(
              source.id,
              request.query
            );

            if (result.success && result.products) {
              scrapingResults.push(...result.products);

              // Update success metrics
              try {
                monitoringService.updateMetrics(source.id, {
                  lastSuccessfulScrape: new Date(),
                  totalRequests: 1,
                });
              } catch (monitoringError) {
                console.warn(
                  `Failed to update success metrics for source ${source.id}:`,
                  monitoringError
                );
              }
            }
          } catch (error) {
            console.error(`Failed to scrape source ${source.name}:`, error);

            // Update error metrics
            try {
              monitoringService.updateMetrics(source.id, {
                lastError:
                  error instanceof Error ? error.message : "Unknown error",
                totalRequests: 1,
                errorCount: 1,
              });
            } catch (monitoringError) {
              console.warn(
                `Failed to update error metrics for source ${source.id}:`,
                monitoringError
              );
            }
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

      // Transform results to match the expected Zod schema
      const transformedResults = limitedResults.map((product) => ({
        id: product.id,
        name: product.name,
        price: product.price,
        currency: product.currency,
        availability: product.availability,
        source: product.source,
        imageUrl: product.imageUrl,
        rating: product.rating,
        reviewCount: product.reviewCount,
        url: product.url,
        lastScraped: product.lastScraped.toISOString(),
      }));

      const searchDuration = Date.now() - startTime;

      const response = {
        searchId,
        results: transformedResults,
        metadata: {
          totalSources,
          successfulSources:
            scrapingResults.length > 0 ? targetSources.length : 0,
          searchDuration,
          cacheHit: false,
        },
      };

      // Cache the results
      try {
        await cachingService.set(
          request.query,
          response,
          900, // 15 minutes TTL
          request.filters,
          request.sort,
          request.sources
        );
      } catch (cacheError) {
        console.warn("Failed to cache search results:", cacheError);
        // Continue without caching - this is not critical
      }

      return response;
    } catch (error) {
      console.error("Search service error:", error);
      throw new Error("Failed to perform search");
    }
  }

  // Get search suggestions based on query
  async getSearchSuggestions(
    query: string,
    limit: number = 10
  ): Promise<string[]> {
    try {
      // For now, generate mock suggestions based on the query
      // In a real implementation, this would query a search history database
      const mockSuggestions = [
        `${query} best price`,
        `${query} on sale`,
        `${query} reviews`,
        `${query} comparison`,
        `${query} deals`,
        `${query} amazon`,
        `${query} walmart`,
        `${query} best buy`,
        `${query} newegg`,
        `${query} online`,
      ];

      // Filter and limit suggestions
      const suggestions = mockSuggestions
        .filter((suggestion) =>
          suggestion.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, limit);

      // Add some generic suggestions if we don't have enough
      if (suggestions.length < limit) {
        const genericSuggestions = [
          "electronics",
          "gaming",
          "home & garden",
          "clothing",
          "books",
          "sports",
          "automotive",
          "health & beauty",
        ];

        genericSuggestions.forEach((suggestion) => {
          if (suggestions.length < limit && !suggestions.includes(suggestion)) {
            suggestions.push(suggestion);
          }
        });
      }

      return suggestions;
    } catch (error) {
      console.error("Error generating search suggestions:", error);
      return [];
    }
  }

  // Get popular search terms
  async getPopularSearches(
    timeRange: string = "7d",
    limit: number = 20
  ): Promise<Array<{ term: string; count: number }>> {
    try {
      // For now, return mock popular searches
      // In a real implementation, this would query search analytics
      const mockPopularSearches = [
        { term: "laptop", count: 1250 },
        { term: "smartphone", count: 980 },
        { term: "headphones", count: 750 },
        { term: "gaming console", count: 620 },
        { term: "tablet", count: 580 },
        { term: "smartwatch", count: 520 },
        { term: "camera", count: 480 },
        { term: "speaker", count: 420 },
        { term: "keyboard", count: 380 },
        { term: "mouse", count: 350 },
        { term: "monitor", count: 320 },
        { term: "printer", count: 290 },
        { term: "router", count: 260 },
        { term: "external hard drive", count: 240 },
        { term: "webcam", count: 220 },
        { term: "microphone", count: 200 },
        { term: "gaming chair", count: 180 },
        { term: "desk", count: 160 },
        { term: "lamp", count: 140 },
        { term: "plant", count: 120 },
      ];

      // Filter by time range (mock implementation)
      let filteredSearches = mockPopularSearches;
      if (timeRange === "30d") {
        filteredSearches = mockPopularSearches.map((s) => ({
          ...s,
          count: Math.floor(s.count * 0.7),
        }));
      } else if (timeRange === "90d") {
        filteredSearches = mockPopularSearches.map((s) => ({
          ...s,
          count: Math.floor(s.count * 0.5),
        }));
      }

      return filteredSearches.slice(0, limit);
    } catch (error) {
      console.error("Error getting popular searches:", error);
      return [];
    }
  }

  // Get search analytics
  async getSearchAnalytics(timeRange: string = "7d"): Promise<any> {
    try {
      // Mock analytics data
      const analytics = {
        totalSearches: 0,
        uniqueUsers: 0,
        averageResultsPerSearch: 0,
        topCategories: [],
        topSources: [],
        searchTrends: [],
        timeRange,
        timestamp: new Date().toISOString(),
      };

      // In a real implementation, this would aggregate data from search history
      return analytics;
    } catch (error) {
      console.error("Error getting search analytics:", error);
      return null;
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
