import { InferSelectModel } from "drizzle-orm";
import { productListings } from "../database/schema";

type ProductListing = InferSelectModel<typeof productListings>;

export interface PriceHistoryEntry {
  id: string;
  productId: string;
  sourceId: string;
  price: number;
  currency: string;
  timestamp: Date;
  sourceName: string;
}

export interface PriceComparison {
  productId: string;
  productName: string;
  currentPrices: Array<{
    sourceId: string;
    sourceName: string;
    price: number;
    currency: string;
    lastUpdated: Date;
  }>;
  priceHistory: PriceHistoryEntry[];
  averagePrice: number;
  bestPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export interface PriceAlert {
  shouldAlert: boolean;
  currentBestPrice: number;
  savingsPercent: number;
  message: string;
}

export class PriceHistoryService {
  constructor(private productRepository: any) {} // Assuming ProductRepository is now part of productRepository

  async trackPriceChange(listing: ProductListing): Promise<void> {
    // This would typically save to a price history table
    // For now, we'll just log the change
    console.log(
      `Price change tracked: ${listing.productId} at ${listing.sourceId} - $${listing.price}`
    );
  }

  async getPriceComparison(productId: string): Promise<PriceComparison | null> {
    try {
      // Get current listings for the product
      const listings =
        await this.productRepository.getProductListingsByProductId(productId);

      if (!listings || listings.length === 0) {
        return null;
      }

      // Calculate price statistics
      const prices = listings.map((l: any) => l.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const averagePrice = Math.round(
        prices.reduce((sum: number, price: number) => sum + price, 0) /
          prices.length
      );

      // Find the best price listing
      const bestPriceListing = listings.find((l: any) => l.price === minPrice);

      // Get product name from the first listing
      const productName = bestPriceListing?.productName || "Unknown Product";

      // Build current prices array
      const currentPrices = await Promise.all(
        listings.map(async (listing: any) => {
          // Get source name (this would typically come from a sources table)
          const sourceName = `Source ${listing.sourceId}`;

          return {
            sourceId: listing.sourceId,
            sourceName,
            price: listing.price,
            currency: listing.currency,
            lastUpdated: listing.lastScraped,
          };
        })
      );

      // Build price history (simplified - would typically come from a separate table)
      const priceHistory: PriceHistoryEntry[] = listings.map(
        (listing: any) => ({
          id: listing.id,
          productId: listing.productId,
          sourceId: listing.sourceId,
          price: listing.price,
          currency: listing.currency,
          timestamp: listing.lastScraped,
          sourceName: `Source ${listing.sourceId}`,
        })
      );

      return {
        productId,
        productName,
        currentPrices,
        priceHistory,
        averagePrice,
        bestPrice: minPrice,
        priceRange: {
          min: minPrice,
          max: maxPrice,
        },
      };
    } catch (error) {
      console.error("Error getting price comparison:", error);
      return null;
    }
  }

  async getPriceAlerts(
    productId: string,
    targetPrice: number
  ): Promise<PriceAlert> {
    try {
      const comparison = await this.getPriceComparison(productId);

      if (!comparison) {
        return {
          shouldAlert: false,
          currentBestPrice: 0,
          savingsPercent: 0,
          message: "Product not found or no price data available",
        };
      }

      const currentBestPrice = comparison.bestPrice;
      const savingsPercent =
        ((targetPrice - currentBestPrice) / targetPrice) * 100;
      const shouldAlert = currentBestPrice <= targetPrice;

      return {
        shouldAlert,
        currentBestPrice,
        savingsPercent,
        message: shouldAlert
          ? `Price alert! Current best price is $${(
              currentBestPrice / 100
            ).toFixed(2)} (${savingsPercent.toFixed(1)}% below target)`
          : `No alert needed. Current best price is $${(
              currentBestPrice / 100
            ).toFixed(2)}`,
      };
    } catch (error) {
      console.error("Error getting price alerts:", error);
      return {
        shouldAlert: false,
        currentBestPrice: 0,
        savingsPercent: 0,
        message: "Error occurred while checking price alerts",
      };
    }
  }

  async getPriceHistory(
    productId: string,
    sourceId?: string,
    days: number = 30
  ): Promise<PriceHistoryEntry[]> {
    try {
      const listings =
        await this.productRepository.getProductListingsByProductId(productId);

      if (!listings || listings.length === 0) {
        return [];
      }

      // Filter by source and date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const filteredListings = sourceId
        ? listings.filter((l: any) => l.sourceId === sourceId)
        : listings;

      // Convert to price history entries
      const priceHistory: PriceHistoryEntry[] = [];
      filteredListings.forEach((listing: any) => {
        if (listing.lastScraped >= cutoffDate) {
          priceHistory.push({
            id: listing.id,
            productId: listing.productId,
            sourceId: listing.sourceId,
            price: listing.price,
            currency: listing.currency,
            timestamp: listing.lastScraped,
            sourceName: `Source ${listing.sourceId}`,
          });
        }
      });

      // Sort by timestamp (newest first)
      return priceHistory.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    } catch (error) {
      console.error("Error getting price history:", error);
      return [];
    }
  }

  async getPriceHistoryBySource(
    productId: string,
    sourceId: string,
    days: number = 30
  ): Promise<PriceHistoryEntry[]> {
    try {
      const listings =
        await this.productRepository.getProductListingsByProductId(productId);

      if (!listings || listings.length === 0) {
        return [];
      }

      // Filter by source and date range
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const filteredListings = sourceId
        ? listings.filter((l: any) => l.sourceId === sourceId)
        : listings;

      // Convert to price history entries
      const priceHistory: PriceHistoryEntry[] = [];
      filteredListings.forEach((listing: any) => {
        if (listing.lastScraped >= cutoffDate) {
          priceHistory.push({
            id: listing.id,
            productId: listing.productId,
            sourceId: listing.sourceId,
            price: listing.price,
            currency: listing.currency,
            timestamp: listing.lastScraped,
            sourceName: `Source ${listing.sourceId}`,
          });
        }
      });

      // Sort by timestamp (newest first)
      return priceHistory.sort(
        (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
      );
    } catch (error) {
      console.error("Error getting price history by source:", error);
      return [];
    }
  }
}
