import { PrismaClient } from "@prisma/client";
import { beforeEach, afterAll } from "vitest";

// Create a test database instance with SQLite for testing
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:./test.db",
    },
  },
});

// Clean up database before each test
beforeEach(async () => {
  // Clean up in reverse order of dependencies
  await testPrisma.productListing.deleteMany();
  await testPrisma.search.deleteMany();
  await testPrisma.product.deleteMany();
  await testPrisma.source.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
  await testPrisma.$disconnect();
});

// Helper function to create test data
export const createTestSource = async (overrides = {}) => {
  return await testPrisma.source.create({
    data: {
      name: "Test Source",
      category: "popular",
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
        rateLimit: {
          requestsPerMinute: 30,
          concurrent: 2,
        },
      },
      ...overrides,
    },
  });
};

export const createTestProduct = async (overrides = {}) => {
  return await testPrisma.product.create({
    data: {
      name: "Test Product",
      normalizedName: "test product",
      category: "Electronics",
      specifications: {
        brand: "Test Brand",
        model: "Test Model",
      },
      ...overrides,
    },
  });
};

export const createTestProductListing = async (
  productId: string,
  sourceId: string,
  overrides = {}
) => {
  return await testPrisma.productListing.create({
    data: {
      productId,
      sourceId,
      url: "https://test.com/product/123",
      price: 99.99,
      currency: "USD",
      availability: "in_stock",
      isValid: true,
      ...overrides,
    },
  });
};

export const createTestSearch = async (overrides = {}) => {
  return await testPrisma.search.create({
    data: {
      query: "test query",
      metadata: {
        totalSources: 1,
        successfulSources: 1,
        searchDuration: 1.0,
        cacheHit: false,
      },
      ...overrides,
    },
  });
};
