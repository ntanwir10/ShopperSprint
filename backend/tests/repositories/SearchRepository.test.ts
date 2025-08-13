import { describe, it, expect, beforeEach } from "vitest";
import { PrismaSearchRepository } from "../../src/repositories/SearchRepository.js";
import {
  testPrisma,
  createTestSearch,
  createTestProduct,
  createTestSource,
  createTestProductListing,
} from "./setup.js";

describe("SearchRepository", () => {
  let repository: PrismaSearchRepository;

  beforeEach(() => {
    repository = new PrismaSearchRepository(testPrisma);
  });

  describe("create", () => {
    it("should create a new search", async () => {
      const searchData = {
        query: "iPhone 15 Pro",
        userId: "user123",
        metadata: {
          totalSources: 4,
          successfulSources: 3,
          searchDuration: 2.5,
          cacheHit: false,
        },
      };

      const search = await repository.create(searchData);

      expect(search).toBeDefined();
      expect(search.id).toBeDefined();
      expect(search.query).toBe(searchData.query);
      expect(search.userId).toBe(searchData.userId);
      expect(search.metadata).toEqual(searchData.metadata);
      expect(search.createdAt).toBeInstanceOf(Date);
      expect(search.results).toEqual([]);
    });

    it("should create a search with results", async () => {
      // Create test data
      const product = await createTestProduct();
      const source = await createTestSource();
      const listing = await createTestProductListing(product.id, source.id);

      const searchData = {
        query: "test search",
        results: [listing],
        metadata: {
          totalSources: 1,
          successfulSources: 1,
          searchDuration: 1.0,
          cacheHit: false,
        },
      };

      const search = await repository.create(searchData);

      expect(search).toBeDefined();
      expect(search.results).toHaveLength(1);
      expect(search.results[0].id).toBe(listing.id);
    });
  });

  describe("findById", () => {
    it("should find a search by id with results", async () => {
      const createdSearch = await createTestSearch();

      const foundSearch = await repository.findById(createdSearch.id);

      expect(foundSearch).toBeDefined();
      expect(foundSearch?.id).toBe(createdSearch.id);
      expect(foundSearch?.query).toBe(createdSearch.query);
      expect(foundSearch?.results).toBeDefined();
    });

    it("should return null for non-existent id", async () => {
      const foundSearch = await repository.findById("non-existent-id");
      expect(foundSearch).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all searches with results", async () => {
      await createTestSearch({ query: "Search 1" });
      await createTestSearch({ query: "Search 2" });

      const searches = await repository.findAll();

      expect(searches).toHaveLength(2);
      expect(searches[0].query).toBe("Search 2"); // Should be ordered by createdAt desc
      expect(searches[1].query).toBe("Search 1");
      expect(searches[0].results).toBeDefined();
      expect(searches[1].results).toBeDefined();
    });
  });

  describe("findByQuery", () => {
    it("should find searches by query", async () => {
      await createTestSearch({ query: "iPhone search" });
      await createTestSearch({ query: "iPhone 15 Pro search" });
      await createTestSearch({ query: "Samsung Galaxy" });

      const iPhoneSearches = await repository.findByQuery("iPhone");

      expect(iPhoneSearches).toHaveLength(2);
      expect(
        iPhoneSearches.every((search) => search.query.includes("iPhone"))
      ).toBe(true);
    });

    it("should be case insensitive", async () => {
      await createTestSearch({ query: "iPhone search" });

      const searches = await repository.findByQuery("iphone");

      expect(searches).toHaveLength(1);
      expect(searches[0].query).toBe("iPhone search");
    });
  });

  describe("findByUserId", () => {
    it("should find searches by user id", async () => {
      await createTestSearch({ userId: "user123" });
      await createTestSearch({ userId: "user123" });
      await createTestSearch({ userId: "user456" });

      const user123Searches = await repository.findByUserId("user123");
      const user456Searches = await repository.findByUserId("user456");

      expect(user123Searches).toHaveLength(2);
      expect(user456Searches).toHaveLength(1);
    });

    it("should return empty array for non-existent user", async () => {
      const searches = await repository.findByUserId("non-existent-user");
      expect(searches).toHaveLength(0);
    });
  });

  describe("findRecent", () => {
    it("should find recent searches with default limit", async () => {
      // Create more than 10 searches
      for (let i = 0; i < 15; i++) {
        await createTestSearch({ query: `Search ${i}` });
      }

      const recentSearches = await repository.findRecent();

      expect(recentSearches).toHaveLength(10); // Default limit
      expect(recentSearches[0].query).toBe("Search 14"); // Most recent first
    });

    it("should respect custom limit", async () => {
      for (let i = 0; i < 10; i++) {
        await createTestSearch({ query: `Search ${i}` });
      }

      const recentSearches = await repository.findRecent(5);

      expect(recentSearches).toHaveLength(5);
    });
  });

  describe("update", () => {
    it("should update a search", async () => {
      const createdSearch = await createTestSearch();
      const updateData = {
        query: "Updated search query",
        metadata: {
          totalSources: 5,
          successfulSources: 4,
          searchDuration: 3.0,
          cacheHit: true,
        },
      };

      const updatedSearch = await repository.update(
        createdSearch.id,
        updateData
      );

      expect(updatedSearch).toBeDefined();
      expect(updatedSearch?.query).toBe(updateData.query);
      expect(updatedSearch?.metadata).toEqual(updateData.metadata);
    });

    it("should update search results", async () => {
      const createdSearch = await createTestSearch();

      // Create test data for results
      const product = await createTestProduct();
      const source = await createTestSource();
      const listing = await createTestProductListing(product.id, source.id);

      const updateData = {
        results: [listing],
      };

      const updatedSearch = await repository.update(
        createdSearch.id,
        updateData
      );

      expect(updatedSearch).toBeDefined();
      expect(updatedSearch?.results).toHaveLength(1);
      expect(updatedSearch?.results[0].id).toBe(listing.id);
    });

    it("should return null for non-existent id", async () => {
      const updatedSearch = await repository.update("non-existent-id", {
        query: "Updated",
      });
      expect(updatedSearch).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a search", async () => {
      const createdSearch = await createTestSearch();

      const result = await repository.delete(createdSearch.id);
      expect(result).toBe(true);

      const foundSearch = await repository.findById(createdSearch.id);
      expect(foundSearch).toBeNull();
    });

    it("should return false for non-existent id", async () => {
      const result = await repository.delete("non-existent-id");
      expect(result).toBe(false);
    });
  });
});
