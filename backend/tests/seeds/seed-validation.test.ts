import { describe, it, expect } from "vitest";
import {
  productSchema,
  sourceSchema,
  createProductSchema,
  createSourceSchema,
} from "../../src/types/validation.js";

describe("Seed Data Validation", () => {
  describe("Sample Product Data", () => {
    const sampleProduct = {
      name: "Apple iPhone 15 Pro 128GB",
      normalizedName: "apple iphone 15 pro 128gb",
      category: "Electronics",
      specifications: {
        brand: "Apple",
        model: "iPhone 15 Pro",
        storage: "128GB",
        color: "Natural Titanium",
        screen_size: "6.1 inches",
        operating_system: "iOS 17",
      },
    };

    it("should validate sample product data", () => {
      const result = createProductSchema.safeParse(sampleProduct);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe(sampleProduct.name);
        expect(result.data.normalizedName).toBe(sampleProduct.normalizedName);
        expect(result.data.category).toBe(sampleProduct.category);
        expect(result.data.specifications).toEqual(
          sampleProduct.specifications
        );
      }
    });

    it("should validate product with minimal data", () => {
      const minimalProduct = {
        name: "Basic Product",
        normalizedName: "basic product",
      };

      const result = createProductSchema.safeParse(minimalProduct);
      expect(result.success).toBe(true);
    });
  });

  describe("Sample Source Data", () => {
    const sampleSource = {
      name: "Amazon",
      category: "popular" as const,
      isActive: true,
      configuration: {
        baseUrl: "https://www.amazon.com",
        searchPath: "/s?k=",
        selectors: {
          productName: "[data-component-type='s-search-result'] h2 a span",
          price: ".a-price-whole",
          availability: ".a-size-base-plus",
          image: "[data-component-type='s-search-result'] img",
          rating: ".a-icon-alt",
        },
        rateLimit: {
          requestsPerMinute: 30,
          concurrent: 2,
        },
      },
    };

    it("should validate sample source data", () => {
      const result = createSourceSchema.safeParse(sampleSource);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.name).toBe(sampleSource.name);
        expect(result.data.category).toBe(sampleSource.category);
        expect(result.data.isActive).toBe(sampleSource.isActive);
        expect(result.data.configuration).toEqual(sampleSource.configuration);
      }
    });

    it("should validate alternative source category", () => {
      const alternativeSource = {
        ...sampleSource,
        name: "Newegg",
        category: "alternative" as const,
      };

      const result = createSourceSchema.safeParse(alternativeSource);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.category).toBe("alternative");
      }
    });
  });

  describe("Configuration Validation", () => {
    it("should validate rate limit configuration", () => {
      const rateLimit = {
        requestsPerMinute: 30,
        concurrent: 2,
      };

      // This is tested as part of the source schema
      const sourceWithRateLimit = {
        name: "Test Source",
        category: "popular" as const,
        isActive: true,
        configuration: {
          baseUrl: "https://test.com",
          searchPath: "/search?q=",
          selectors: {
            productName: ".product-name",
            price: ".price",
            availability: ".availability",
            image: ".image",
          },
          rateLimit,
        },
      };

      const result = createSourceSchema.safeParse(sourceWithRateLimit);
      expect(result.success).toBe(true);
    });

    it("should reject invalid rate limit values", () => {
      const invalidRateLimit = {
        requestsPerMinute: -1, // Invalid: must be positive
        concurrent: 0, // Invalid: must be positive
      };

      const sourceWithInvalidRateLimit = {
        name: "Test Source",
        category: "popular" as const,
        isActive: true,
        configuration: {
          baseUrl: "https://test.com",
          searchPath: "/search?q=",
          selectors: {
            productName: ".product-name",
            price: ".price",
            availability: ".availability",
            image: ".image",
          },
          rateLimit: invalidRateLimit,
        },
      };

      const result = createSourceSchema.safeParse(sourceWithInvalidRateLimit);
      expect(result.success).toBe(false);
    });
  });

  describe("URL Validation", () => {
    it("should validate proper URLs", () => {
      const validUrls = [
        "https://www.amazon.com",
        "https://www.bestbuy.com",
        "https://www.newegg.com",
        "https://www.bhphotovideo.com",
      ];

      validUrls.forEach((url) => {
        const source = {
          name: "Test Source",
          category: "popular" as const,
          isActive: true,
          configuration: {
            baseUrl: url,
            searchPath: "/search?q=",
            selectors: {
              productName: ".product-name",
              price: ".price",
              availability: ".availability",
              image: ".image",
            },
            rateLimit: {
              requestsPerMinute: 30,
              concurrent: 2,
            },
          },
        };

        const result = createSourceSchema.safeParse(source);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid URLs", () => {
      const invalidUrl = "not-a-valid-url";

      const source = {
        name: "Test Source",
        category: "popular" as const,
        isActive: true,
        configuration: {
          baseUrl: invalidUrl,
          searchPath: "/search?q=",
          selectors: {
            productName: ".product-name",
            price: ".price",
            availability: ".availability",
            image: ".image",
          },
          rateLimit: {
            requestsPerMinute: 30,
            concurrent: 2,
          },
        },
      };

      const result = createSourceSchema.safeParse(source);
      expect(result.success).toBe(false);
    });
  });
});
