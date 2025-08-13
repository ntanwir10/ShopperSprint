import { describe, it, expect, beforeEach } from "vitest";
import { PrismaProductListingRepository } from "../../src/repositories/ProductListingRepository.js";
import {
  testPrisma,
  createTestProduct,
  createTestSource,
  createTestProductListing,
} from "./setup.js";

describe("ProductListingRepository", () => {
  let repository: PrismaProductListingRepository;
  let testProduct: any;
  let testSource: any;

  beforeEach(async () => {
    repository = new PrismaProductListingRepository(testPrisma);
    testProduct = await createTestProduct();
    testSource = await createTestSource();
  });

  describe("create", () => {
    it("should create a new product listing", async () => {
      const listingData = {
        productId: testProduct.id,
        sourceId: testSource.id,
        url: "https://example.com/product/123",
        price: 299.99,
        currency: "USD",
        availability: "in_stock" as const,
        imageUrl: "https://example.com/image.jpg",
        rating: 4.5,
        reviewCount: 100,
        isValid: true,
      };

      const listing = await repository.create(listingData);

      expect(listing).toBeDefined();
      expect(listing.id).toBeDefined();
      expect(listing.productId).toBe(listingData.productId);
      expect(listing.sourceId).toBe(listingData.sourceId);
      expect(listing.price).toBe(listingData.price);
      expect(listing.currency).toBe(listingData.currency);
      expect(listing.availability).toBe(listingData.availability);
      expect(listing.lastScraped).toBeInstanceOf(Date);
    });

    it("should create a listing with minimal required fields", async () => {
      const listingData = {
        productId: testProduct.id,
        sourceId: testSource.id,
        url: "https://example.com/product/123",
        price: 99.99,
        currency: "USD",
        availability: "in_stock" as const,
        isValid: true,
      };

      const listing = await repository.create(listingData);

      expect(listing).toBeDefined();
      expect(listing.imageUrl).toBeNull();
      expect(listing.rating).toBeNull();
      expect(listing.reviewCount).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find a listing by id", async () => {
      const createdListing = await createTestProductListing(
        testProduct.id,
        testSource.id
      );

      const foundListing = await repository.findById(createdListing.id);

      expect(foundListing).toBeDefined();
      expect(foundListing?.id).toBe(createdListing.id);
    });

    it("should return null for non-existent id", async () => {
      const foundListing = await repository.findById("non-existent-id");
      expect(foundListing).toBeNull();
    });
  });

  describe("findByProductId", () => {
    it("should find listings by product id", async () => {
      const anotherSource = await createTestSource({ name: "Another Source" });

      await createTestProductListing(testProduct.id, testSource.id);
      await createTestProductListing(testProduct.id, anotherSource.id);

      const listings = await repository.findByProductId(testProduct.id);

      expect(listings).toHaveLength(2);
      expect(
        listings.every((listing) => listing.productId === testProduct.id)
      ).toBe(true);
    });

    it("should return empty array for non-existent product id", async () => {
      const listings = await repository.findByProductId("non-existent-id");
      expect(listings).toHaveLength(0);
    });
  });

  describe("findBySourceId", () => {
    it("should find listings by source id", async () => {
      const anotherProduct = await createTestProduct({
        name: "Another Product",
      });

      await createTestProductListing(testProduct.id, testSource.id);
      await createTestProductListing(anotherProduct.id, testSource.id);

      const listings = await repository.findBySourceId(testSource.id);

      expect(listings).toHaveLength(2);
      expect(
        listings.every((listing) => listing.sourceId === testSource.id)
      ).toBe(true);
    });
  });

  describe("findByProductAndSource", () => {
    it("should find listing by product and source combination", async () => {
      const createdListing = await createTestProductListing(
        testProduct.id,
        testSource.id
      );

      const foundListing = await repository.findByProductAndSource(
        testProduct.id,
        testSource.id
      );

      expect(foundListing).toBeDefined();
      expect(foundListing?.id).toBe(createdListing.id);
    });

    it("should return null for non-existent combination", async () => {
      const foundListing = await repository.findByProductAndSource(
        "non-existent",
        "non-existent"
      );
      expect(foundListing).toBeNull();
    });
  });

  describe("findValidListings", () => {
    it("should find only valid listings", async () => {
      await createTestProductListing(testProduct.id, testSource.id, {
        isValid: true,
      });
      await createTestProductListing(testProduct.id, testSource.id, {
        isValid: false,
      });

      const validListings = await repository.findValidListings();

      expect(validListings).toHaveLength(1);
      expect(validListings[0].isValid).toBe(true);
    });
  });

  describe("findByAvailability", () => {
    it("should find listings by availability status", async () => {
      await createTestProductListing(testProduct.id, testSource.id, {
        availability: "in_stock",
      });
      await createTestProductListing(testProduct.id, testSource.id, {
        availability: "out_of_stock",
      });

      const inStockListings = await repository.findByAvailability("in_stock");
      const outOfStockListings = await repository.findByAvailability(
        "out_of_stock"
      );

      expect(inStockListings).toHaveLength(1);
      expect(outOfStockListings).toHaveLength(1);
      expect(inStockListings[0].availability).toBe("in_stock");
      expect(outOfStockListings[0].availability).toBe("out_of_stock");
    });
  });

  describe("update", () => {
    it("should update a listing", async () => {
      const createdListing = await createTestProductListing(
        testProduct.id,
        testSource.id
      );
      const updateData = {
        price: 199.99,
        availability: "limited" as const,
        rating: 4.8,
      };

      const updatedListing = await repository.update(
        createdListing.id,
        updateData
      );

      expect(updatedListing).toBeDefined();
      expect(updatedListing?.price).toBe(updateData.price);
      expect(updatedListing?.availability).toBe(updateData.availability);
      expect(updatedListing?.rating).toBe(updateData.rating);
    });

    it("should return null for non-existent id", async () => {
      const updatedListing = await repository.update("non-existent-id", {
        price: 100,
      });
      expect(updatedListing).toBeNull();
    });
  });

  describe("updateLastScraped", () => {
    it("should update the lastScraped timestamp", async () => {
      const createdListing = await createTestProductListing(
        testProduct.id,
        testSource.id
      );
      const originalTimestamp = createdListing.lastScraped;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedListing = await repository.updateLastScraped(
        createdListing.id
      );

      expect(updatedListing).toBeDefined();
      expect(updatedListing?.lastScraped.getTime()).toBeGreaterThan(
        originalTimestamp.getTime()
      );
    });

    it("should return null for non-existent id", async () => {
      const result = await repository.updateLastScraped("non-existent-id");
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a listing", async () => {
      const createdListing = await createTestProductListing(
        testProduct.id,
        testSource.id
      );

      const result = await repository.delete(createdListing.id);
      expect(result).toBe(true);

      const foundListing = await repository.findById(createdListing.id);
      expect(foundListing).toBeNull();
    });

    it("should return false for non-existent id", async () => {
      const result = await repository.delete("non-existent-id");
      expect(result).toBe(false);
    });
  });
});
