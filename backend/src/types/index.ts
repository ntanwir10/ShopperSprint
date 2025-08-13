// Re-export all validation schemas and types
export * from "./validation";
export * from "./api";
export * from "./forms";

// Re-export validation utilities
export * from "../utils/validation";

// Type definitions for Prisma models (inferred from validation schemas)
import { z } from "zod";
import {
  productSchema,
  productListingSchema,
  searchSchema,
  sourceSchema,
  advertisementSchema,
} from "./validation";

export type Product = z.infer<typeof productSchema>;
export type ProductListing = z.infer<typeof productListingSchema>;
export type Search = z.infer<typeof searchSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Advertisement = z.infer<typeof advertisementSchema>;

// Create types for database operations
export type CreateProduct = z.infer<typeof productSchema> & {
  id?: never;
  createdAt?: never;
  updatedAt?: never;
};

export type CreateProductListing = z.infer<typeof productListingSchema> & {
  id?: never;
  lastScraped?: never;
};

export type CreateSearch = z.infer<typeof searchSchema> & {
  id?: never;
  createdAt?: never;
};

export type CreateSource = z.infer<typeof sourceSchema> & {
  id?: never;
  createdAt?: never;
  updatedAt?: never;
};

export type CreateAdvertisement = z.infer<typeof advertisementSchema> & {
  id?: never;
  impressions?: never;
  clicks?: never;
  createdAt?: never;
};
