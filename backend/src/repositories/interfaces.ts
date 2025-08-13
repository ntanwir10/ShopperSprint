import { Product, ProductListing, Search, Source } from "../types/index.js";

// Base repository interface with common CRUD operations
export interface BaseRepository<T, CreateT, UpdateT> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: CreateT): Promise<T>;
  update(id: string, data: UpdateT): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

// Product repository interface
export interface ProductRepository
  extends BaseRepository<
    Product,
    Omit<Product, "id" | "createdAt" | "updatedAt">,
    Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>
  > {
  findByNormalizedName(normalizedName: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  search(query: string): Promise<Product[]>;
}

// ProductListing repository interface
export interface ProductListingRepository
  extends BaseRepository<
    ProductListing,
    Omit<ProductListing, "id" | "lastScraped">,
    Partial<Omit<ProductListing, "id" | "lastScraped">>
  > {
  findByProductId(productId: string): Promise<ProductListing[]>;
  findBySourceId(sourceId: string): Promise<ProductListing[]>;
  findByProductAndSource(
    productId: string,
    sourceId: string
  ): Promise<ProductListing | null>;
  findValidListings(): Promise<ProductListing[]>;
  findByAvailability(availability: string): Promise<ProductListing[]>;
  updateLastScraped(id: string): Promise<ProductListing | null>;
}

// Search repository interface
export interface SearchRepository
  extends BaseRepository<
    Search,
    Omit<Search, "id" | "createdAt">,
    Partial<Omit<Search, "id" | "createdAt">>
  > {
  findByQuery(query: string): Promise<Search[]>;
  findByUserId(userId: string): Promise<Search[]>;
  findRecent(limit?: number): Promise<Search[]>;
}

// Source repository interface
export interface SourceRepository
  extends BaseRepository<
    Source,
    Omit<Source, "id" | "createdAt" | "updatedAt">,
    Partial<Omit<Source, "id" | "createdAt" | "updatedAt">>
  > {
  findByCategory(category: string): Promise<Source[]>;
  findActive(): Promise<Source[]>;
  findByName(name: string): Promise<Source | null>;
  updateLastSuccessfulScrape(id: string): Promise<Source | null>;
  incrementErrorCount(id: string): Promise<Source | null>;
  resetErrorCount(id: string): Promise<Source | null>;
  updateAverageResponseTime(
    id: string,
    responseTime: number
  ): Promise<Source | null>;
}

// Advertisement repository interface
export interface AdvertisementRepository
  extends BaseRepository<
    any,
    Omit<any, "id" | "createdAt">,
    Partial<Omit<any, "id" | "createdAt">>
  > {
  findByActive(isActive: boolean): Promise<any[]>;
  findByCategory(category: string): Promise<any[]>;
  incrementImpressions(id: string): Promise<any | null>;
  incrementClicks(id: string): Promise<any | null>;
  findByKeywords(keywords: string[]): Promise<any[]>;
}
