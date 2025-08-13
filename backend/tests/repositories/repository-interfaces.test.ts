import { describe, it, expect } from "vitest";
import {
  PrismaProductRepository,
  PrismaProductListingRepository,
  PrismaSearchRepository,
  PrismaSourceRepository,
  RepositoryFactory,
} from "../../src/repositories/index.js";

// Mock PrismaClient for testing
const mockPrismaClient = {
  product: {},
  productListing: {},
  search: {},
  source: {},
} as any;

describe("Repository Interfaces", () => {
  describe("Repository Classes", () => {
    it("should create ProductRepository instance", () => {
      const repository = new PrismaProductRepository(mockPrismaClient);
      expect(repository).toBeDefined();
      expect(typeof repository.findById).toBe("function");
      expect(typeof repository.findAll).toBe("function");
      expect(typeof repository.create).toBe("function");
      expect(typeof repository.update).toBe("function");
      expect(typeof repository.delete).toBe("function");
      expect(typeof repository.findByNormalizedName).toBe("function");
      expect(typeof repository.findByCategory).toBe("function");
      expect(typeof repository.search).toBe("function");
    });

    it("should create ProductListingRepository instance", () => {
      const repository = new PrismaProductListingRepository(mockPrismaClient);
      expect(repository).toBeDefined();
      expect(typeof repository.findById).toBe("function");
      expect(typeof repository.findAll).toBe("function");
      expect(typeof repository.create).toBe("function");
      expect(typeof repository.update).toBe("function");
      expect(typeof repository.delete).toBe("function");
      expect(typeof repository.findByProductId).toBe("function");
      expect(typeof repository.findBySourceId).toBe("function");
      expect(typeof repository.findByProductAndSource).toBe("function");
      expect(typeof repository.findValidListings).toBe("function");
      expect(typeof repository.findByAvailability).toBe("function");
      expect(typeof repository.updateLastScraped).toBe("function");
    });

    it("should create SearchRepository instance", () => {
      const repository = new PrismaSearchRepository(mockPrismaClient);
      expect(repository).toBeDefined();
      expect(typeof repository.findById).toBe("function");
      expect(typeof repository.findAll).toBe("function");
      expect(typeof repository.create).toBe("function");
      expect(typeof repository.update).toBe("function");
      expect(typeof repository.delete).toBe("function");
      expect(typeof repository.findByQuery).toBe("function");
      expect(typeof repository.findByUserId).toBe("function");
      expect(typeof repository.findRecent).toBe("function");
    });

    it("should create SourceRepository instance", () => {
      const repository = new PrismaSourceRepository(mockPrismaClient);
      expect(repository).toBeDefined();
      expect(typeof repository.findById).toBe("function");
      expect(typeof repository.findAll).toBe("function");
      expect(typeof repository.create).toBe("function");
      expect(typeof repository.update).toBe("function");
      expect(typeof repository.delete).toBe("function");
      expect(typeof repository.findByCategory).toBe("function");
      expect(typeof repository.findActive).toBe("function");
      expect(typeof repository.findByName).toBe("function");
      expect(typeof repository.updateLastSuccessfulScrape).toBe("function");
      expect(typeof repository.incrementErrorCount).toBe("function");
      expect(typeof repository.resetErrorCount).toBe("function");
      expect(typeof repository.updateAverageResponseTime).toBe("function");
    });
  });

  describe("RepositoryFactory", () => {
    it("should create repository factory instance", () => {
      const factory = new RepositoryFactory(mockPrismaClient);
      expect(factory).toBeDefined();
    });

    it("should create all repository types through factory", () => {
      const factory = new RepositoryFactory(mockPrismaClient);

      const productRepo = factory.createProductRepository();
      const listingRepo = factory.createProductListingRepository();
      const searchRepo = factory.createSearchRepository();
      const sourceRepo = factory.createSourceRepository();

      expect(productRepo).toBeInstanceOf(PrismaProductRepository);
      expect(listingRepo).toBeInstanceOf(PrismaProductListingRepository);
      expect(searchRepo).toBeInstanceOf(PrismaSearchRepository);
      expect(sourceRepo).toBeInstanceOf(PrismaSourceRepository);
    });
  });
});
