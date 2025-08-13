import { AdvertisementRepository } from "../repositories/index.js";
import redisClient from "../config/redis.js";

export interface AdvertisementQuery {
  query?: string;
  category?: string;
  placement: "banner" | "sponsored-listing";
}

export interface AdvertisementEvent {
  adId: string;
  event: "impression" | "click";
  searchId?: string;
  userId?: string;
  timestamp: Date;
}

export class AdvertisementService {
  constructor(private adRepo: AdvertisementRepository) {}

  async getAdvertisements(query: AdvertisementQuery): Promise<any[]> {
    const cacheKey = `ads:${query.placement}:${query.category || "all"}:${
      query.query || "general"
    }`;

    // Check cache first
    const cached = await this.getFromCache(cacheKey);
    if (cached) {
      return cached;
    }

    // Get active advertisements
    let ads = await this.adRepo.findByActive(true);

    // Filter by category if specified
    if (query.category) {
      ads = ads.filter((ad) => ad.category === query.category);
    }

    // Score and rank advertisements by relevance
    const scoredAds = await this.scoreAdvertisements(ads, query.query);

    // Sort by relevance score and select top results
    const topAds = scoredAds
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, this.getMaxAdsForPlacement(query.placement))
      .map((ad) => ({
        id: ad.id,
        title: ad.title,
        description: ad.description,
        imageUrl: ad.imageUrl,
        targetUrl: ad.targetUrl,
        category: ad.category,
        keywords: ad.keywords,
        isActive: ad.isActive,
        relevanceScore: ad.relevanceScore,
      }));

    // Cache the results
    await this.cacheResults(cacheKey, topAds);

    return topAds;
  }

  async trackEvent(event: AdvertisementEvent): Promise<void> {
    try {
      // Update impression/click count in database
      if (event.event === "impression") {
        await this.adRepo.incrementImpressions(event.adId);
      } else if (event.event === "click") {
        await this.adRepo.incrementClicks(event.adId);
      }

      // Store event for analytics
      await this.storeEvent(event);

      console.log(`Tracked ${event.event} for ad ${event.adId}`);
    } catch (error) {
      console.error("Failed to track advertisement event:", error);
      // Don't throw error to avoid breaking user experience
    }
  }

  async getAdvertisementStats(adId: string): Promise<any> {
    const ad = await this.adRepo.findById(adId);
    if (!ad) {
      throw new Error("Advertisement not found");
    }

    const ctr = ad.impressions > 0 ? (ad.clicks / ad.impressions) * 100 : 0;

    return {
      id: ad.id,
      title: ad.title,
      impressions: ad.impressions,
      clicks: ad.clicks,
      clickThroughRate: ctr.toFixed(2),
      createdAt: ad.createdAt,
      expiresAt: ad.expiresAt,
    };
  }

  async getOverallStats(): Promise<any> {
    const ads = await this.adRepo.findAll();

    const totalImpressions = ads.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = ads.reduce((sum, ad) => sum + ad.clicks, 0);
    const overallCTR =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    const activeAds = ads.filter((ad) => ad.isActive).length;
    const expiredAds = ads.filter(
      (ad) => ad.expiresAt && ad.expiresAt < new Date()
    ).length;

    return {
      totalAdvertisements: ads.length,
      activeAdvertisements: activeAds,
      expiredAdvertisements: expiredAds,
      totalImpressions,
      totalClicks,
      overallClickThroughRate: overallCTR.toFixed(2),
    };
  }

  private async scoreAdvertisements(
    ads: any[],
    query?: string
  ): Promise<any[]> {
    const scoredAds = ads.map((ad) => {
      let relevanceScore = 0;

      // Base score for active ads
      if (ad.isActive) {
        relevanceScore += 10;
      }

      // Boost for non-expired ads
      if (!ad.expiresAt || ad.expiresAt > new Date()) {
        relevanceScore += 5;
      }

      // Query relevance scoring
      if (query) {
        const queryLower = query.toLowerCase();
        const titleLower = ad.title.toLowerCase();
        const descriptionLower = ad.description.toLowerCase();
        const keywordsLower = ad.keywords.map((k: string) => k.toLowerCase());

        // Title match (highest weight)
        if (titleLower.includes(queryLower)) {
          relevanceScore += 20;
        }

        // Description match
        if (descriptionLower.includes(queryLower)) {
          relevanceScore += 10;
        }

        // Keyword matches
        const keywordMatches = keywordsLower.filter(
          (keyword: string) =>
            keyword.includes(queryLower) || queryLower.includes(keyword)
        );
        relevanceScore += keywordMatches.length * 5;

        // Exact phrase match bonus
        if (titleLower === queryLower) {
          relevanceScore += 15;
        }
      }

      // Performance-based scoring
      if (ad.impressions > 0) {
        const ctr = ad.clicks / ad.impressions;
        if (ctr > 0.05) {
          // 5% CTR threshold
          relevanceScore += 8;
        } else if (ctr > 0.02) {
          // 2% CTR threshold
          relevanceScore += 4;
        }
      }

      // Recency bonus
      const daysSinceCreation =
        (Date.now() - new Date(ad.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) {
        relevanceScore += 3; // New ad bonus
      }

      return {
        ...ad,
        relevanceScore,
      };
    });

    return scoredAds;
  }

  private getMaxAdsForPlacement(placement: string): number {
    switch (placement) {
      case "banner":
        return 3; // Show up to 3 banner ads
      case "sponsored-listing":
        return 5; // Show up to 5 sponsored listings
      default:
        return 3;
    }
  }

  private async getFromCache(key: string): Promise<any[] | null> {
    try {
      const cached = await redisClient.get(key);
      if (cached) {
        const parsed = JSON.parse(cached);
        // Check if cache is still valid (5 minutes for ads)
        if (Date.now() - new Date(parsed.timestamp).getTime() < 5 * 60 * 1000) {
          return parsed.data;
        }
      }
    } catch (error) {
      console.warn("Ad cache retrieval failed:", error);
    }
    return null;
  }

  private async cacheResults(key: string, data: any[]): Promise<void> {
    try {
      const dataToCache = {
        data,
        timestamp: new Date().toISOString(),
      };
      await redisClient.setEx(key, 300, JSON.stringify(dataToCache)); // 5 minutes
    } catch (error) {
      console.warn("Ad caching failed:", error);
    }
  }

  private async storeEvent(event: AdvertisementEvent): Promise<void> {
    try {
      const eventKey = `ad_event:${event.adId}:${event.event}:${Date.now()}`;
      const eventData = {
        ...event,
        timestamp: event.timestamp.toISOString(),
      };

      // Store event in Redis for analytics (24 hour TTL)
      await redisClient.setEx(eventKey, 86400, JSON.stringify(eventData));

      // Also store in a sorted set for time-based queries
      const score = event.timestamp.getTime();
      await redisClient.zAdd(`ad_events:${event.adId}`, {
        score,
        value: JSON.stringify(eventData),
      });

      // Keep only last 1000 events per ad
      await redisClient.zRemRangeByRank(`ad_events:${event.adId}`, 0, -1001);
    } catch (error) {
      console.warn("Failed to store ad event:", error);
    }
  }
}
