import { describe, it, expect } from "vitest";
import {
  productSchema,
  createProductSchema,
  productListingSchema,
  createProductListingSchema,
  searchSchema,
  createSearchSchema,
  sourceSchema,
  createSourceSchema,
  availabilitySchema,
  sourceCategorySchema,
  currencySchema,
} from "../../src/types/validation.js";
import {
  searchRequestSchema,
  refreshPricesRequestSchema,
  productResultSchema,
  priceUpdateEventSchema,
} from "../../src/types/api.js";
import {
  searchFormSchema,
  comparisonFormSchema,
  sourceFormSchema,
  filterFormSchema,
} from "../../src/types/forms.js";
import {
  validateData,
  safeValidate,
  formatZodErrors,
  validatePrice,
  validateProductName,
  validateUrl,
  validateAvailability,
  validateRating,
  validateCurrency,
  ValidationError,
} from "../../src/utils/validation.js";

describe("Base Validation Schemas", () => {
  describe("availabilitySchema", () => {
    it("should accept valid availability values", () => {
      expect(availabilitySchema.parse("in_stock")).toBe("in_stock");
      expect(availabilitySchema.parse("out_of_stock")).toBe("out_of_stock");
      expect(availabilitySchema.parse("limited")).toBe("limited");
      expect(availabilitySchema.parse("unknown")).toBe("unknown");
    });

    it("should reject invalid availability values", () => {
      expect(() => availabilitySchema.parse("invalid")).toThrow();
      expect(() => availabilitySchema.parse("")).toThrow();
      expect(() => availabilitySchema.parse(null)).toThrow();
    });
  });

  describe("sourceCategorySchema", () => {
    it("should accept valid category values", () => {
      expect(sourceCategorySchema.parse("popular")).toBe("popular");
      expect(sourceCategorySchema.parse("alternative")).toBe("alternative");
    });

    it("should reject invalid category values", () => {
      expect(() => sourceCategorySchema.parse("invalid")).toThrow();
      expect(() => sourceCategorySchema.parse("")).toThrow();
    });
  });

  describe("currencySchema", () => {
    it("should accept valid currency codes", () => {
      expect(currencySchema.parse("USD")).toBe("USD");
      expect(currencySchema.parse("EUR")).toBe("EUR");
      expect(currencySchema.parse("GBP")).toBe("GBP");
    });

    it("should reject invalid currency codes", () => {
      expect(() => currencySchema.parse("usd")).toThrow();
      expect(() => currencySchema.parse("US")).toThrow();
      expect(() => currencySchema.parse("USDD")).toThrow();
      expect(() => currencySchema.parse("123")).toThrow();
    });
  });
});

describe("Product Validation Schemas", () => {
  describe("createProductSchema", () => {
    const validProduct = {
      name: "iPhone 15 Pro",
      normalizedName: "iphone-15-pro",
      category: "Electronics",
      specifications: { color: "Space Black", storage: "256GB" },
    };

    it("should accept valid product data", () => {
      const result = createProductSchema.parse(validProduct);
      expect(result).toEqual(validProduct);
    });

    it("should accept product without optional fields", () => {
      const minimalProduct = {
        name: "iPhone 15 Pro",
        normalizedName: "iphone-15-pro",
      };
      const result = createProductSchema.parse(minimalProduct);
      expect(result.name).toBe("iPhone 15 Pro");
      expect(result.normalizedName).toBe("iphone-15-pro");
    });

    it("should reject invalid product data", () => {
      expect(() =>
        createProductSchema.parse({ name: "", normalizedName: "test" })
      ).toThrow();
      expect(() =>
        createProductSchema.parse({ name: "test", normalizedName: "" })
      ).toThrow();
      expect(() =>
        createProductSchema.parse({
          name: "a".repeat(256),
          normalizedName: "test",
        })
      ).toThrow();
    });
  });

  describe("productSchema", () => {
    it("should accept complete product with ID and timestamps", () => {
      const completeProduct = {
        id: "clp1234567890abcdef",
        name: "iPhone 15 Pro",
        normalizedName: "iphone-15-pro",
        category: "Electronics",
        specifications: { color: "Space Black" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = productSchema.parse(completeProduct);
      expect(result.id).toBe(completeProduct.id);
      expect(result.name).toBe(completeProduct.name);
    });

    it("should reject invalid CUID format", () => {
      const invalidProduct = {
        id: "invalid-id",
        name: "iPhone 15 Pro",
        normalizedName: "iphone-15-pro",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => productSchema.parse(invalidProduct)).toThrow();
    });
  });
});

describe("ProductListing Validation Schemas", () => {
  describe("createProductListingSchema", () => {
    const validListing = {
      productId: "clp1234567890abcdef",
      sourceId: "cls1234567890abcdef",
      url: "https://example.com/product/123",
      price: 999.99,
      currency: "USD",
      availability: "in_stock" as const,
      imageUrl: "https://example.com/image.jpg",
      rating: 4.5,
      reviewCount: 100,
      isValid: true,
    };

    it("should accept valid listing data", () => {
      const result = createProductListingSchema.parse(validListing);
      expect(result).toEqual(validListing);
    });

    it("should reject negative prices", () => {
      expect(() =>
        createProductListingSchema.parse({
          ...validListing,
          price: -10,
        })
      ).toThrow();
    });

    it("should reject invalid URLs", () => {
      expect(() =>
        createProductListingSchema.parse({
          ...validListing,
          url: "not-a-url",
        })
      ).toThrow();
    });

    it("should reject invalid rating range", () => {
      expect(() =>
        createProductListingSchema.parse({
          ...validListing,
          rating: 6,
        })
      ).toThrow();

      expect(() =>
        createProductListingSchema.parse({
          ...validListing,
          rating: -1,
        })
      ).toThrow();
    });
  });
});

describe("Search Validation Schemas", () => {
  describe("createSearchSchema", () => {
    const validSearch = {
      query: "iPhone 15 Pro",
      userId: "user123",
      metadata: {
        totalSources: 5,
        successfulSources: 4,
        searchDuration: 2500,
        cacheHit: false,
      },
    };

    it("should accept valid search data", () => {
      const result = createSearchSchema.parse(validSearch);
      expect(result).toEqual(validSearch);
    });

    it("should reject short queries", () => {
      expect(() =>
        createSearchSchema.parse({
          ...validSearch,
          query: "ab",
        })
      ).toThrow();
    });

    it("should reject long queries", () => {
      expect(() =>
        createSearchSchema.parse({
          ...validSearch,
          query: "a".repeat(256),
        })
      ).toThrow();
    });
  });
});

describe("Source Validation Schemas", () => {
  describe("createSourceSchema", () => {
    const validSource = {
      name: "Amazon",
      category: "popular" as const,
      isActive: true,
      errorCount: 0,
      configuration: {
        baseUrl: "https://amazon.com",
        searchPath: "/s",
        selectors: {
          productName: ".product-title",
          price: ".price",
          availability: ".availability",
          image: ".product-image",
          rating: ".rating",
        },
        rateLimit: {
          requestsPerMinute: 60,
          concurrent: 3,
        },
      },
    };

    it("should accept valid source data", () => {
      const result = createSourceSchema.parse(validSource);
      expect(result.name).toBe("Amazon");
      expect(result.category).toBe("popular");
    });

    it("should reject invalid configuration", () => {
      expect(() =>
        createSourceSchema.parse({
          ...validSource,
          configuration: {
            ...validSource.configuration,
            baseUrl: "not-a-url",
          },
        })
      ).toThrow();
    });

    it("should reject invalid rate limits", () => {
      expect(() =>
        createSourceSchema.parse({
          ...validSource,
          configuration: {
            ...validSource.configuration,
            rateLimit: {
              requestsPerMinute: 0,
              concurrent: 3,
            },
          },
        })
      ).toThrow();
    });
  });
});

describe("API Validation Schemas", () => {
  describe("searchRequestSchema", () => {
    it("should accept valid search request", () => {
      const validRequest = {
        query: "iPhone 15 Pro",
        sources: ["cls1234567890abcdef"],
        maxResults: 25,
      };

      const result = searchRequestSchema.parse(validRequest);
      expect(result.query).toBe("iPhone 15 Pro");
      expect(result.maxResults).toBe(25);
    });

    it("should apply default maxResults", () => {
      const request = { query: "iPhone 15 Pro" };
      const result = searchRequestSchema.parse(request);
      expect(result.maxResults).toBe(50);
    });

    it("should trim query whitespace", () => {
      const request = { query: "  iPhone 15 Pro  " };
      const result = searchRequestSchema.parse(request);
      expect(result.query).toBe("iPhone 15 Pro");
    });
  });

  describe("refreshPricesRequestSchema", () => {
    it("should accept valid refresh request", () => {
      const validRequest = {
        searchId: "cls1234567890abcdef",
        productIds: ["clp1234567890abcdef", "clp0987654321fedcba"],
      };

      const result = refreshPricesRequestSchema.parse(validRequest);
      expect(result.productIds).toHaveLength(2);
    });

    it("should reject empty product IDs array", () => {
      expect(() =>
        refreshPricesRequestSchema.parse({
          searchId: "cls1234567890abcdef",
          productIds: [],
        })
      ).toThrow();
    });
  });
});

describe("Form Validation Schemas", () => {
  describe("searchFormSchema", () => {
    it("should accept valid search form data", () => {
      const validForm = {
        query: "iPhone 15 Pro",
        sources: ["cls1234567890abcdef"],
        maxResults: 25,
      };

      const result = searchFormSchema.parse(validForm);
      expect(result.query).toBe("iPhone 15 Pro");
    });

    it("should reject whitespace-only queries", () => {
      expect(() =>
        searchFormSchema.parse({
          query: "   ",
        })
      ).toThrow();
    });

    it("should limit source selection", () => {
      const tooManySources = Array(11).fill("cls1234567890abcdef");
      expect(() =>
        searchFormSchema.parse({
          query: "iPhone 15 Pro",
          sources: tooManySources,
        })
      ).toThrow();
    });
  });

  describe("comparisonFormSchema", () => {
    it("should accept valid comparison data", () => {
      const validComparison = {
        productIds: ["clp1234567890abcdef", "clp0987654321fedcba"],
      };

      const result = comparisonFormSchema.parse(validComparison);
      expect(result.productIds).toHaveLength(2);
    });

    it("should require at least 2 products", () => {
      expect(() =>
        comparisonFormSchema.parse({
          productIds: ["clp1234567890abcdef"],
        })
      ).toThrow();
    });

    it("should limit to 5 products", () => {
      const tooManyProducts = Array(6).fill("clp1234567890abcdef");
      expect(() =>
        comparisonFormSchema.parse({
          productIds: tooManyProducts,
        })
      ).toThrow();
    });
  });

  describe("filterFormSchema", () => {
    it("should accept valid filter data", () => {
      const validFilter = {
        minPrice: 100,
        maxPrice: 1000,
        availability: ["in_stock", "limited"],
        minRating: 4.0,
      };

      const result = filterFormSchema.parse(validFilter);
      expect(result.minPrice).toBe(100);
      expect(result.maxPrice).toBe(1000);
    });

    it("should reject invalid price range", () => {
      expect(() =>
        filterFormSchema.parse({
          minPrice: 1000,
          maxPrice: 100,
        })
      ).toThrow();
    });
  });
});

describe("Validation Utilities", () => {
  describe("validateData", () => {
    it("should return success for valid data", () => {
      const result = validateData(currencySchema, "USD");
      expect(result.success).toBe(true);
      expect(result.data).toBe("USD");
      expect(result.errors).toBeUndefined();
    });

    it("should return errors for invalid data", () => {
      const result = validateData(currencySchema, "invalid");
      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
    });
  });

  describe("safeValidate", () => {
    it("should return parsed data for valid input", () => {
      const result = safeValidate(currencySchema, "USD");
      expect(result).toBe("USD");
    });

    it("should return null for invalid input", () => {
      const result = safeValidate(currencySchema, "invalid");
      expect(result).toBeNull();
    });
  });

  describe("validatePrice", () => {
    it("should parse valid price strings", () => {
      expect(validatePrice("$99.99")).toBe(99.99);
      expect(validatePrice("€1,234.56")).toBe(1234.56);
      expect(validatePrice("£ 50.00")).toBe(50.0);
    });

    it("should accept valid numbers", () => {
      expect(validatePrice(99.99)).toBe(99.99);
      expect(validatePrice(0.01)).toBe(0.01);
    });

    it("should reject invalid prices", () => {
      expect(validatePrice("invalid")).toBeNull();
      expect(validatePrice(-10)).toBeNull();
      expect(validatePrice(0)).toBeNull();
    });
  });

  describe("validateProductName", () => {
    it("should accept valid product names", () => {
      expect(validateProductName("iPhone 15 Pro")).toBe("iPhone 15 Pro");
      expect(validateProductName("  Samsung Galaxy S24  ")).toBe(
        "Samsung Galaxy S24"
      );
    });

    it("should reject invalid names", () => {
      expect(validateProductName("")).toBeNull();
      expect(validateProductName("   ")).toBeNull();
      expect(validateProductName("a".repeat(256))).toBeNull();
      expect(validateProductName(123)).toBeNull();
    });
  });

  describe("validateUrl", () => {
    it("should accept valid HTTPS URLs", () => {
      expect(validateUrl("https://example.com")).toBe("https://example.com");
      expect(validateUrl("https://example.com/path?query=1")).toBe(
        "https://example.com/path?query=1"
      );
    });

    it("should reject invalid URLs", () => {
      expect(validateUrl("http://example.com")).toBeNull();
      expect(validateUrl("not-a-url")).toBeNull();
      expect(validateUrl("")).toBeNull();
      expect(validateUrl(null)).toBeNull();
    });
  });

  describe("validateRating", () => {
    it("should accept valid ratings", () => {
      expect(validateRating(4.5)).toBe(4.5);
      expect(validateRating("3.2")).toBe(3.2);
      expect(validateRating(0)).toBe(0);
      expect(validateRating(5)).toBe(5);
    });

    it("should reject invalid ratings", () => {
      expect(validateRating(-1)).toBeNull();
      expect(validateRating(6)).toBeNull();
      expect(validateRating("invalid")).toBeNull();
    });
  });

  describe("ValidationError", () => {
    it("should create error with custom properties", () => {
      const error = new ValidationError("Test error", "TEST_CODE", {
        field: "test",
      });
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("TEST_CODE");
      expect(error.details).toEqual({ field: "test" });
      expect(error.name).toBe("ValidationError");
    });
  });
});
