import { Request, Response } from "express";
import { z } from "zod";
import { validateRequest } from "../utils/validation.js";
import {
  searchRequestSchema,
  refreshPricesRequestSchema,
} from "../types/api.js";
import {
  createProductSchema,
  createSourceSchema,
} from "../types/validation.js";

// Example controller showing how to use validation middleware
export class ExampleValidationController {
  // Search endpoint with validation
  static searchProducts = [
    validateRequest(searchRequestSchema, "body"),
    async (req: Request, res: Response) => {
      try {
        // Access validated data
        const { query, sources, maxResults } = (req as any).validated;

        // Your business logic here
        console.log("Searching for:", query);
        console.log("Max results:", maxResults);
        console.log("Sources:", sources);

        res.json({
          success: true,
          data: {
            searchId: "cls1234567890abcdef",
            results: [],
            metadata: {
              totalSources: 5,
              successfulSources: 4,
              searchDuration: 1500,
              cacheHit: false,
              timestamp: new Date().toISOString(),
            },
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An error occurred while processing your request",
            timestamp: new Date().toISOString(),
          },
        });
      }
    },
  ];

  // Refresh prices endpoint with validation
  static refreshPrices = [
    validateRequest(refreshPricesRequestSchema, "body"),
    async (req: Request, res: Response) => {
      try {
        const { searchId, productIds } = (req as any).validated;

        // Your business logic here
        console.log("Refreshing prices for search:", searchId);
        console.log("Product IDs:", productIds);

        res.json({
          success: true,
          data: {
            jobId: "clj1234567890abcdef",
            estimatedCompletion: new Date(Date.now() + 30000).toISOString(),
            productsToRefresh: productIds.length,
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An error occurred while processing your request",
            timestamp: new Date().toISOString(),
          },
        });
      }
    },
  ];

  // Create product endpoint with validation
  static createProduct = [
    validateRequest(createProductSchema, "body"),
    async (req: Request, res: Response) => {
      try {
        const productData = (req as any).validated;

        // Your business logic here - save to database
        console.log("Creating product:", productData);

        const newProduct = {
          id: "clp1234567890abcdef",
          ...productData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        res.status(201).json({
          success: true,
          data: newProduct,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An error occurred while creating the product",
            timestamp: new Date().toISOString(),
          },
        });
      }
    },
  ];

  // Create source endpoint with validation
  static createSource = [
    validateRequest(createSourceSchema, "body"),
    async (req: Request, res: Response) => {
      try {
        const sourceData = (req as any).validated;

        // Your business logic here - save to database
        console.log("Creating source:", sourceData);

        const newSource = {
          id: "cls1234567890abcdef",
          ...sourceData,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        res.status(201).json({
          success: true,
          data: newSource,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An error occurred while creating the source",
            timestamp: new Date().toISOString(),
          },
        });
      }
    },
  ];

  // Example of query parameter validation
  static getProducts = [
    validateRequest(
      searchRequestSchema.pick({ query: true }).extend({
        page: z
          .number()
          .int()
          .min(1)
          .default(1),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .default(20),
      }),
      "query"
    ),
    async (req: Request, res: Response) => {
      try {
        const { query, page, limit } = (req as any).validated;

        // Your business logic here
        console.log("Getting products:", { query, page, limit });

        res.json({
          success: true,
          data: {
            products: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: {
            code: "INTERNAL_ERROR",
            message: "An error occurred while fetching products",
            timestamp: new Date().toISOString(),
          },
        });
      }
    },
  ];
}
