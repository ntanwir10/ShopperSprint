import { z } from "zod";
import { availabilitySchema, sourceCategorySchema } from "./validation.js";

// Search API schemas
export const searchRequestSchema = z.object({
  query: z
    .string()
    .min(3, "Search query must be at least 3 characters")
    .max(255, "Search query too long")
    .trim(),
  sources: z.array(z.string().cuid()).optional(),
  maxResults: z.number().int().min(1).max(100).default(50),
});

export const productResultSchema = z.object({
  id: z.string().cuid(),
  productId: z.string().cuid(),
  name: z.string(),
  price: z.number().positive(),
  currency: z.string().length(3),
  availability: availabilitySchema,
  source: z.object({
    id: z.string().cuid(),
    name: z.string(),
    category: sourceCategorySchema,
  }),
  url: z.string().url(),
  imageUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  lastScraped: z.string().datetime(),
});

export const searchMetadataResponseSchema = z.object({
  totalSources: z.number().int().min(0),
  successfulSources: z.number().int().min(0),
  searchDuration: z.number().min(0),
  cacheHit: z.boolean(),
  timestamp: z.string().datetime(),
});

export const searchResponseSchema = z.object({
  searchId: z.string().cuid(),
  results: z.array(productResultSchema),
  metadata: searchMetadataResponseSchema,
});

// Refresh prices API schemas
export const refreshPricesRequestSchema = z.object({
  searchId: z.string().cuid("Invalid search ID format"),
  productIds: z
    .array(z.string().cuid("Invalid product ID format"))
    .min(1, "At least one product ID is required"),
});

export const refreshPricesResponseSchema = z.object({
  jobId: z.string().cuid(),
  estimatedCompletion: z.string().datetime(),
  productsToRefresh: z.number().int().min(1),
});

// Price update WebSocket event schema
export const priceUpdateEventSchema = z.object({
  searchId: z.string().cuid(),
  productId: z.string().cuid(),
  listingId: z.string().cuid(),
  newPrice: z.number().positive(),
  oldPrice: z.number().positive(),
  source: z.string(),
  timestamp: z.string().datetime(),
  priceChange: z.object({
    amount: z.number(),
    percentage: z.number(),
    direction: z.enum(["up", "down", "same"]),
  }),
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
    timestamp: z.string().datetime(),
  }),
});

// Pagination schemas
export const paginationRequestSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
});

export const paginationResponseSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
});

// Generic API response wrapper
export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: errorResponseSchema.shape.error.optional(),
    pagination: paginationResponseSchema.optional(),
  });

// Type exports for TypeScript
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type ProductResult = z.infer<typeof productResultSchema>;
export type RefreshPricesRequest = z.infer<typeof refreshPricesRequestSchema>;
export type RefreshPricesResponse = z.infer<typeof refreshPricesResponseSchema>;
export type PriceUpdateEvent = z.infer<typeof priceUpdateEventSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type PaginationRequest = z.infer<typeof paginationRequestSchema>;
export type PaginationResponse = z.infer<typeof paginationResponseSchema>;
