import { z } from "zod";

// Search form validation
export const searchFormSchema = z.object({
  query: z.string().min(3, "Search query must be at least 3 characters"),
  sources: z.array(z.string()).optional(),
  maxResults: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["price", "name", "rating", "lastScraped"]),
  sortOrder: z.enum(["asc", "desc"]),
  filters: z.object({
    minPrice: z.number().min(0).optional(),
    maxPrice: z.number().min(0).optional(),
    availability: z.enum(["in_stock", "out_of_stock", "limited", "unknown"]).optional(),
    minRating: z.number().min(0).max(5).optional(),
    category: z.string().optional(),
  }).optional(),
});

// Product comparison form validation
export const comparisonFormSchema = z.object({
  productIds: z
    .array(z.string().cuid("Invalid product ID"))
    .min(2, "Select at least 2 products to compare")
    .max(5, "Cannot compare more than 5 products"),
});

// Source management form validation (for admin interface)
export const sourceFormSchema = z.object({
  name: z.string().min(1, "Source name is required").max(100, "Name too long"),
  category: z.enum(["popular", "alternative"]),
  isActive: z.boolean().default(true),
  configuration: z.object({
    baseUrl: z.string().url("Invalid base URL"),
    searchPath: z.string().min(1, "Search path is required"),
    selectors: z.object({
      productContainer: z
        .string()
        .min(1, "Product container selector required"),
      productName: z.string().min(1, "Product name selector required"),
      price: z.string().min(1, "Price selector required"),
      availability: z.string().min(1, "Availability selector required"),
      url: z.string().min(1, "URL selector required"),
      image: z.string().min(1, "Image selector required"),
      rating: z.string().optional(),
      reviewCount: z.string().optional(),
    }),
    rateLimit: z.object({
      requestsPerMinute: z.number().int().positive(),
      concurrent: z.number().int().positive(),
    }),
  }),
});

// Refresh prices form validation
export const refreshPricesFormSchema = z.object({
  searchId: z.string().cuid("Invalid search ID"),
  selectedProducts: z
    .array(z.string().cuid("Invalid product ID"))
    .min(1, "Select at least one product to refresh")
    .max(20, "Cannot refresh more than 20 products at once"),
});

// Filter form validation for search results
export const filterFormSchema = z
  .object({
    minPrice: z.number().min(0, "Minimum price cannot be negative").optional(),
    maxPrice: z.number().min(0, "Maximum price cannot be negative").optional(),
    availability: z
      .array(z.enum(["in_stock", "out_of_stock", "limited", "unknown"]))
      .optional(),
    sources: z.array(z.string().cuid("Invalid source ID")).optional(),
    categories: z.array(z.enum(["popular", "alternative"])).optional(),
    minRating: z
      .number()
      .min(0, "Rating cannot be less than 0")
      .max(5, "Rating cannot be more than 5")
      .optional(),
  })
  .refine(
    (data) => {
      if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        return data.minPrice <= data.maxPrice;
      }
      return true;
    },
    {
      message: "Minimum price cannot be greater than maximum price",
      path: ["minPrice"],
    }
  );

// Sort form validation
export const sortFormSchema = z.object({
  sortBy: z.enum(["price", "name", "rating", "lastScraped"]),
  sortOrder: z.enum(["asc", "desc"]),
});

// Type exports for TypeScript
export type SearchFormData = z.infer<typeof searchFormSchema>;
export type ComparisonFormData = z.infer<typeof comparisonFormSchema>;
export type SourceFormData = z.infer<typeof sourceFormSchema>;
export type RefreshPricesFormData = z.infer<typeof refreshPricesFormSchema>;
export type FilterFormData = z.infer<typeof filterFormSchema>;
export type SortFormData = z.infer<typeof sortFormSchema>;
