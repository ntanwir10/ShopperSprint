import { z } from 'zod';

// Search API schemas
export const searchRequestSchema = z.object({
  query: z.string().min(3, 'Search query must be at least 3 characters'),
  sources: z.array(z.string()).optional(),
  maxResults: z.number().min(1).max(100).optional().default(50),
});

export const searchResponseSchema = z.object({
  searchId: z.string().uuid(),
  results: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    price: z.number(),
    currency: z.string(),
    availability: z.enum(['in_stock', 'out_of_stock', 'limited', 'unknown']),
    source: z.string(),
    imageUrl: z.string().url().optional(),
    rating: z.number().min(0).max(5).optional(),
    reviewCount: z.number().min(0).optional(),
    url: z.string().url(),
    lastScraped: z.string().datetime(),
  })),
  metadata: z.object({
    totalSources: z.number(),
    successfulSources: z.number(),
    searchDuration: z.number(),
    cacheHit: z.boolean(),
  }),
});

// Refresh Prices API schemas
export const refreshPricesRequestSchema = z.object({
  searchId: z.string().uuid(),
  productIds: z.array(z.string().uuid()),
});

export const refreshPricesResponseSchema = z.object({
  jobId: z.string().uuid(),
  estimatedCompletion: z.string().datetime(),
});

// Advertisement API schemas
export const advertisementRequestSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  placement: z.enum(['banner', 'sponsored-listing']),
});

export const advertisementResponseSchema = z.object({
  ads: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string(),
    imageUrl: z.string().url(),
    targetUrl: z.string().url(),
    category: z.string(),
  })),
});

export const advertisementTrackRequestSchema = z.object({
  adId: z.string().uuid(),
  event: z.enum(['impression', 'click']),
  searchId: z.string().uuid().optional(),
});

// Product schemas
export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  normalizedName: z.string(),
  category: z.string().optional(),
  specifications: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const productListingSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sourceId: z.string().uuid(),
  url: z.string().url(),
  price: z.number(),
  currency: z.string(),
  availability: z.enum(['in_stock', 'out_of_stock', 'limited', 'unknown']),
  imageUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  lastScraped: z.string().datetime(),
  isValid: z.boolean(),
});

// Source schemas
export const sourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.enum(['popular', 'alternative']),
  isActive: z.boolean(),
  lastSuccessfulScrape: z.string().datetime().optional(),
  errorCount: z.number(),
  averageResponseTime: z.number().optional(),
  configuration: z.record(z.any()),
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  timestamp: z.string().datetime(),
});

// Success response schema
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});

// Type exports
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type RefreshPricesRequest = z.infer<typeof refreshPricesRequestSchema>;
export type RefreshPricesResponse = z.infer<typeof refreshPricesResponseSchema>;
export type AdvertisementRequest = z.infer<typeof advertisementRequestSchema>;
export type AdvertisementResponse = z.infer<typeof advertisementResponseSchema>;
export type AdvertisementTrackRequest = z.infer<typeof advertisementTrackRequestSchema>;
export type Product = z.infer<typeof productSchema>;
export type ProductListing = z.infer<typeof productListingSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;
