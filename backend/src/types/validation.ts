import { z } from "zod";

// Base validation schemas
export const availabilitySchema = z.enum([
  "in_stock",
  "out_of_stock",
  "limited",
  "unknown",
]);
export const sourceCategorySchema = z.enum(["popular", "alternative"]);
export const currencySchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, "Currency must be a 3-letter uppercase code");

// Product validation schemas
export const productSpecificationsSchema = z
  .record(z.string(), z.unknown())
  .optional();

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(255, "Product name too long"),
  normalizedName: z
    .string()
    .min(1, "Normalized name is required")
    .max(255, "Normalized name too long"),
  category: z.string().max(100, "Category too long").optional(),
  specifications: productSpecificationsSchema,
});

export const updateProductSchema = createProductSchema.partial();

export const productSchema = createProductSchema.extend({
  id: z.string().cuid("Invalid product ID format"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ProductListing validation schemas
export const createProductListingSchema = z.object({
  productId: z.string().cuid("Invalid product ID format"),
  sourceId: z.string().cuid("Invalid source ID format"),
  url: z.string().url("Invalid URL format"),
  price: z.number().positive("Price must be positive"),
  currency: currencySchema,
  availability: availabilitySchema,
  imageUrl: z.string().url("Invalid image URL format").optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  isValid: z.boolean().default(true),
});

export const updateProductListingSchema = createProductListingSchema.partial();

export const productListingSchema = createProductListingSchema.extend({
  id: z.string().cuid("Invalid listing ID format"),
  lastScraped: z.date(),
});

// Search validation schemas
export const searchMetadataSchema = z
  .object({
    totalSources: z.number().int().min(0),
    successfulSources: z.number().int().min(0),
    searchDuration: z.number().min(0),
    cacheHit: z.boolean(),
  })
  .optional();

export const createSearchSchema = z.object({
  query: z
    .string()
    .min(3, "Search query must be at least 3 characters")
    .max(255, "Search query too long"),
  userId: z.string().optional(),
  metadata: searchMetadataSchema,
});

export const searchSchema = createSearchSchema.extend({
  id: z.string().cuid("Invalid search ID format"),
  createdAt: z.date(),
});

// Source validation schemas
export const scrapingSourceConfigSchema = z.object({
  baseUrl: z.string().url("Invalid base URL"),
  searchPath: z.string().min(1, "Search path is required"),
  selectors: z.object({
    productName: z.string().min(1, "Product name selector is required"),
    price: z.string().min(1, "Price selector is required"),
    availability: z.string().min(1, "Availability selector is required"),
    image: z.string().min(1, "Image selector is required"),
    rating: z.string().optional(),
  }),
  rateLimit: z.object({
    requestsPerMinute: z
      .number()
      .int()
      .positive("Requests per minute must be positive"),
    concurrent: z
      .number()
      .int()
      .positive("Concurrent requests must be positive"),
  }),
});

export const createSourceSchema = z.object({
  name: z
    .string()
    .min(1, "Source name is required")
    .max(100, "Source name too long"),
  category: sourceCategorySchema,
  isActive: z.boolean().default(true),
  lastSuccessfulScrape: z.date().optional(),
  errorCount: z.number().int().min(0).default(0),
  averageResponseTime: z.number().min(0).optional(),
  configuration: scrapingSourceConfigSchema,
});

export const updateSourceSchema = createSourceSchema.partial();

export const sourceSchema = createSourceSchema.extend({
  id: z.string().cuid("Invalid source ID format"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Advertisement validation schemas
export const createAdvertisementSchema = z.object({
  title: z
    .string()
    .min(1, "Advertisement title is required")
    .max(255, "Title too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description too long"),
  imageUrl: z.string().url("Invalid image URL format"),
  targetUrl: z.string().url("Invalid target URL format"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category too long"),
  keywords: z
    .array(z.string().min(1, "Keyword cannot be empty"))
    .min(1, "At least one keyword is required"),
  isActive: z.boolean().default(true),
  expiresAt: z.date().optional(),
});

export const updateAdvertisementSchema = createAdvertisementSchema.partial();

export const advertisementSchema = createAdvertisementSchema.extend({
  id: z.string().cuid("Invalid advertisement ID format"),
  impressions: z.number().int().min(0).default(0),
  clicks: z.number().int().min(0).default(0),
  createdAt: z.date(),
});

// Advertisement API validation schemas
export const getAdsSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  placement: z.enum(["banner", "sponsored-listing"]).optional(),
});

export const trackAdSchema = z.object({
  adId: z.string().min(1, "Advertisement ID is required"),
  event: z
    .enum(["impression", "click"])
    .refine((val) => val === "impression" || val === "click", {
      message: "Event type is required",
    }),
  searchId: z.string().optional(),
});
