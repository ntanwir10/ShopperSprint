import { getRedis } from "../database/connection";
import crypto from "crypto";

export interface CacheConfig {
  defaultTTL: number; // Default time to live in seconds
  maxCacheSize: number; // Maximum number of cached items
  cleanupInterval: number; // How often to clean up expired items (in milliseconds)
}

export interface CacheItem<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number; // Approximate size in bytes
}

export interface CacheStats {
  totalItems: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictions: number;
  oldestItem: number | null;
  newestItem: number | null;
}

export class CachingService {
  private redis: any;
  private config: CacheConfig;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  } = { hits: 0, misses: 0, evictions: 0 };
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 900, // 15 minutes default
      maxCacheSize: 1000, // Maximum 1000 cached items
      cleanupInterval: 5 * 60 * 1000, // Clean up every 5 minutes
      ...config,
    };

    this.redis = getRedis();
    this.startCleanup();
  }

  /**
   * Generate a cache key from search parameters
   */
  private generateCacheKey(
    query: string,
    filters?: any,
    sort?: any,
    sources?: string[]
  ): string {
    const keyData = {
      query: query.toLowerCase().trim(),
      filters: filters ? JSON.stringify(filters) : "",
      sort: sort ? JSON.stringify(sort) : "",
      sources: sources ? sources.sort().join(",") : "",
    };

    const keyString = JSON.stringify(keyData);
    return `search:${crypto.createHash("md5").update(keyString).digest("hex")}`;
  }

  /**
   * Get cached search results
   */
  async get<T>(
    query: string,
    filters?: any,
    sort?: any,
    sources?: string[]
  ): Promise<T | null> {
    try {
      if (!this.redis) return null;

      const cacheKey = this.generateCacheKey(query, filters, sort, sources);
      const cachedData = await this.redis.get(cacheKey);

      if (cachedData) {
        const item: CacheItem<T> = JSON.parse(cachedData);

        // Check if item is expired
        if (Date.now() - item.timestamp > item.ttl * 1000) {
          await this.redis.del(cacheKey);
          this.stats.misses++;
          return null;
        }

        // Update access statistics
        item.accessCount++;
        item.lastAccessed = Date.now();
        await this.redis.setEx(cacheKey, item.ttl, JSON.stringify(item));

        this.stats.hits++;
        return item.data;
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error("Cache get error:", error);
      this.stats.misses++;
      return null;
    }
  }

  /**
   * Set cached search results
   */
  async set<T>(
    query: string,
    data: T,
    ttl?: number,
    filters?: any,
    sort?: any,
    sources?: string[]
  ): Promise<boolean> {
    try {
      if (!this.redis) return false;

      const cacheKey = this.generateCacheKey(query, filters, sort, sources);
      const ttlSeconds = ttl || this.config.defaultTTL;

      // Estimate data size
      const dataSize = JSON.stringify(data).length;

      const cacheItem: CacheItem<T> = {
        key: cacheKey,
        data,
        timestamp: Date.now(),
        ttl: ttlSeconds,
        accessCount: 1,
        lastAccessed: Date.now(),
        size: dataSize,
      };

      // Check cache size limit
      await this.enforceCacheSizeLimit();

      // Store in Redis
      await this.redis.setEx(cacheKey, ttlSeconds, JSON.stringify(cacheItem));

      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  /**
   * Invalidate cache for a specific query
   */
  async invalidate(
    query: string,
    filters?: any,
    sort?: any,
    sources?: string[]
  ): Promise<boolean> {
    try {
      if (!this.redis) return false;

      const cacheKey = this.generateCacheKey(query, filters, sort, sources);
      await this.redis.del(cacheKey);
      return true;
    } catch (error) {
      console.error("Cache invalidation error:", error);
      return false;
    }
  }

  /**
   * Invalidate all cache entries
   */
  async clearAll(): Promise<boolean> {
    try {
      if (!this.redis) return false;

      const keys = await this.redis.keys("search:*");
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      return true;
    } catch (error) {
      console.error("Cache clear error:", error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate =
      totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0;
    const missRate = 100 - hitRate;

    return {
      totalItems: 0, // Would need to scan Redis to get actual count
      totalSize: 0, // Would need to scan Redis to get actual size
      hitRate,
      missRate,
      evictions: this.stats.evictions,
      oldestItem: null,
      newestItem: null,
    };
  }

  /**
   * Enforce cache size limit by removing least recently used items
   */
  private async enforceCacheSizeLimit(): Promise<void> {
    try {
      if (!this.redis) return;

      const keys = await this.redis.keys("search:*");

      if (keys.length >= this.config.maxCacheSize) {
        // Get all cache items with their metadata
        const items: Array<{ key: string; item: CacheItem }> = [];

        for (const key of keys) {
          const data = await this.redis.get(key);
          if (data) {
            try {
              const item: CacheItem = JSON.parse(data);
              items.push({ key, item });
            } catch {
              // Invalid data, remove it
              await this.redis.del(key);
            }
          }
        }

        // Sort by last accessed time (LRU)
        items.sort((a, b) => a.item.lastAccessed - b.item.lastAccessed);

        // Remove oldest items to make room
        const itemsToRemove = items.length - this.config.maxCacheSize + 100; // Remove extra to make room
        const keysToRemove = items
          .slice(0, itemsToRemove)
          .map((item) => item.key);

        if (keysToRemove.length > 0) {
          await this.redis.del(...keysToRemove);
          this.stats.evictions += keysToRemove.length;
          console.log(
            `Evicted ${keysToRemove.length} cache items to maintain size limit`
          );
        }
      }
    } catch (error) {
      console.error("Cache size limit enforcement error:", error);
    }
  }

  /**
   * Start periodic cleanup of expired items
   */
  private startCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(async () => {
      await this.cleanupExpiredItems();
    }, this.config.cleanupInterval);
  }

  /**
   * Clean up expired cache items
   */
  private async cleanupExpiredItems(): Promise<void> {
    try {
      if (!this.redis) return;

      const keys = await this.redis.keys("search:*");
      let cleanedCount = 0;

      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          try {
            const item: CacheItem = JSON.parse(data);
            if (Date.now() - item.timestamp > item.ttl * 1000) {
              await this.redis.del(key);
              cleanedCount++;
            }
          } catch {
            // Invalid data, remove it
            await this.redis.del(key);
            cleanedCount++;
          }
        }
      }

      if (cleanedCount > 0) {
        console.log(`Cleaned up ${cleanedCount} expired cache items`);
      }
    } catch (error) {
      console.error("Cache cleanup error:", error);
    }
  }

  /**
   * Get cache keys matching a pattern
   */
  async getKeys(pattern: string = "search:*"): Promise<string[]> {
    try {
      if (!this.redis) return [];
      return await this.redis.keys(pattern);
    } catch (error) {
      console.error("Cache keys error:", error);
      return [];
    }
  }

  /**
   * Get detailed information about a cache item
   */
  async getItemInfo(key: string): Promise<CacheItem | null> {
    try {
      if (!this.redis) return null;

      const data = await this.redis.get(key);
      if (data) {
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error("Cache item info error:", error);
      return null;
    }
  }

  /**
   * Update TTL for a cache item
   */
  async updateTTL(key: string, newTTL: number): Promise<boolean> {
    try {
      if (!this.redis) return false;

      const data = await this.redis.get(key);
      if (data) {
        const item: CacheItem = JSON.parse(data);
        item.ttl = newTTL;
        await this.redis.setEx(key, newTTL, JSON.stringify(item));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Cache TTL update error:", error);
      return false;
    }
  }

  /**
   * Stop cleanup and cleanup resources
   */
  stop(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export singleton instance
export const cachingService = new CachingService();
