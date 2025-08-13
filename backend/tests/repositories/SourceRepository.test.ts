import { describe, it, expect, beforeEach } from "vitest";
import { PrismaSourceRepository } from "../../src/repositories/SourceRepository.js";
import { testPrisma, createTestSource } from "./setup.js";

describe("SourceRepository", () => {
  let repository: PrismaSourceRepository;

  beforeEach(() => {
    repository = new PrismaSourceRepository(testPrisma);
  });

  describe("create", () => {
    it("should create a new source", async () => {
      const sourceData = {
        name: "Amazon",
        category: "popular" as const,
        isActive: true,
        configuration: {
          baseUrl: "https://amazon.com",
          searchPath: "/s?k=",
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

      const source = await repository.create(sourceData);

      expect(source).toBeDefined();
      expect(source.id).toBeDefined();
      expect(source.name).toBe(sourceData.name);
      expect(source.category).toBe(sourceData.category);
      expect(source.isActive).toBe(sourceData.isActive);
      expect(source.configuration).toEqual(sourceData.configuration);
      expect(source.errorCount).toBe(0);
      expect(source.createdAt).toBeInstanceOf(Date);
      expect(source.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe("findById", () => {
    it("should find a source by id", async () => {
      const createdSource = await createTestSource();

      const foundSource = await repository.findById(createdSource.id);

      expect(foundSource).toBeDefined();
      expect(foundSource?.id).toBe(createdSource.id);
      expect(foundSource?.name).toBe(createdSource.name);
    });

    it("should return null for non-existent id", async () => {
      const foundSource = await repository.findById("non-existent-id");
      expect(foundSource).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all sources ordered by name", async () => {
      await createTestSource({ name: "Zebra Source" });
      await createTestSource({ name: "Alpha Source" });

      const sources = await repository.findAll();

      expect(sources).toHaveLength(2);
      expect(sources[0].name).toBe("Alpha Source");
      expect(sources[1].name).toBe("Zebra Source");
    });
  });

  describe("findByCategory", () => {
    it("should find sources by category", async () => {
      await createTestSource({ category: "popular" });
      await createTestSource({ category: "alternative" });
      await createTestSource({ category: "popular" });

      const popularSources = await repository.findByCategory("popular");
      const alternativeSources = await repository.findByCategory("alternative");

      expect(popularSources).toHaveLength(2);
      expect(alternativeSources).toHaveLength(1);
    });
  });

  describe("findActive", () => {
    it("should find only active sources", async () => {
      await createTestSource({ isActive: true });
      await createTestSource({ isActive: false });
      await createTestSource({ isActive: true });

      const activeSources = await repository.findActive();

      expect(activeSources).toHaveLength(2);
      expect(activeSources.every((source) => source.isActive)).toBe(true);
    });
  });

  describe("findByName", () => {
    it("should find a source by name", async () => {
      const createdSource = await createTestSource({
        name: "Unique Source Name",
      });

      const foundSource = await repository.findByName("Unique Source Name");

      expect(foundSource).toBeDefined();
      expect(foundSource?.id).toBe(createdSource.id);
    });

    it("should return null for non-existent name", async () => {
      const foundSource = await repository.findByName("Non-existent Source");
      expect(foundSource).toBeNull();
    });
  });

  describe("update", () => {
    it("should update a source", async () => {
      const createdSource = await createTestSource();
      const updateData = {
        name: "Updated Source Name",
        isActive: false,
        errorCount: 5,
      };

      const updatedSource = await repository.update(
        createdSource.id,
        updateData
      );

      expect(updatedSource).toBeDefined();
      expect(updatedSource?.name).toBe(updateData.name);
      expect(updatedSource?.isActive).toBe(updateData.isActive);
      expect(updatedSource?.errorCount).toBe(updateData.errorCount);
    });

    it("should return null for non-existent id", async () => {
      const updatedSource = await repository.update("non-existent-id", {
        name: "Updated",
      });
      expect(updatedSource).toBeNull();
    });
  });

  describe("updateLastSuccessfulScrape", () => {
    it("should update last successful scrape and reset error count", async () => {
      const createdSource = await createTestSource({ errorCount: 5 });

      const updatedSource = await repository.updateLastSuccessfulScrape(
        createdSource.id
      );

      expect(updatedSource).toBeDefined();
      expect(updatedSource?.lastSuccessfulScrape).toBeInstanceOf(Date);
      expect(updatedSource?.errorCount).toBe(0);
    });

    it("should return null for non-existent id", async () => {
      const result = await repository.updateLastSuccessfulScrape(
        "non-existent-id"
      );
      expect(result).toBeNull();
    });
  });

  describe("incrementErrorCount", () => {
    it("should increment error count", async () => {
      const createdSource = await createTestSource({ errorCount: 2 });

      const updatedSource = await repository.incrementErrorCount(
        createdSource.id
      );

      expect(updatedSource).toBeDefined();
      expect(updatedSource?.errorCount).toBe(3);
    });

    it("should return null for non-existent id", async () => {
      const result = await repository.incrementErrorCount("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("resetErrorCount", () => {
    it("should reset error count to zero", async () => {
      const createdSource = await createTestSource({ errorCount: 10 });

      const updatedSource = await repository.resetErrorCount(createdSource.id);

      expect(updatedSource).toBeDefined();
      expect(updatedSource?.errorCount).toBe(0);
    });
  });

  describe("updateAverageResponseTime", () => {
    it("should set initial average response time", async () => {
      const createdSource = await createTestSource();

      const updatedSource = await repository.updateAverageResponseTime(
        createdSource.id,
        1500
      );

      expect(updatedSource).toBeDefined();
      expect(updatedSource?.averageResponseTime).toBe(1500);
    });

    it("should calculate new average response time", async () => {
      const createdSource = await createTestSource({
        averageResponseTime: 1000,
      });

      const updatedSource = await repository.updateAverageResponseTime(
        createdSource.id,
        2000
      );

      expect(updatedSource).toBeDefined();
      expect(updatedSource?.averageResponseTime).toBe(1500); // (1000 + 2000) / 2
    });

    it("should return null for non-existent id", async () => {
      const result = await repository.updateAverageResponseTime(
        "non-existent-id",
        1000
      );
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a source", async () => {
      const createdSource = await createTestSource();

      const result = await repository.delete(createdSource.id);
      expect(result).toBe(true);

      const foundSource = await repository.findById(createdSource.id);
      expect(foundSource).toBeNull();
    });

    it("should return false for non-existent id", async () => {
      const result = await repository.delete("non-existent-id");
      expect(result).toBe(false);
    });
  });
});
