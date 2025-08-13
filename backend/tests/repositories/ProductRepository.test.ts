import { describe, it, expect, beforeEach } from "vitest";
import { PrismaProductRepository } from "../../src/repositories/ProductRepository.js";
import { testPrisma, createTestProduct } from "./setup.js";

describe("ProductRepository", () => {
  let repository: PrismaProductRepository;

  beforeEach(() => {
    repository = new PrismaProductRepository(testPrisma);
  });

  describe("create", () => {
    it("should create a new product", async () => {
      const productData = {
        name: "iPhone 15 Pro",
        normalizedName: "iphone 15 pro",
        category: "Electronics",
        specifications: {
          brand: "Apple",
          storage: "128GB",
        },
      };

      const product = await repository.create(productData);

      expect(product).toBeDefined();
      expect(product.id).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.normalizedName).toBe(productData.normalizedName);
      expect(product.category).toBe(productData.category);
      expect(product.specifications).toEqual(productData.specifications);
      expect(product.createdAt).toBeInstanceOf(Date);
      expect(product.updatedAt).toBeInstanceOf(Date);
    });

    it("should create a product without optional fields", async () => {
      const productData = {
        name: "Basic Product",
        normalizedName: "basic product",
      };

      const product = await repository.create(productData);

      expect(product).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.category).toBeNull();
      expect(product.specifications).toBeNull();
    });
  });

  describe("findById", () => {
    it("should find a product by id", async () => {
      const createdProduct = await createTestProduct();

      const foundProduct = await repository.findById(createdProduct.id);

      expect(foundProduct).toBeDefined();
      expect(foundProduct?.id).toBe(createdProduct.id);
      expect(foundProduct?.name).toBe(createdProduct.name);
    });

    it("should return null for non-existent id", async () => {
      const foundProduct = await repository.findById("non-existent-id");
      expect(foundProduct).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should return all products", async () => {
      await createTestProduct({ name: "Product 1" });
      await createTestProduct({ name: "Product 2" });

      const products = await repository.findAll();

      expect(products).toHaveLength(2);
      expect(products[0].name).toBe("Product 2"); // Should be ordered by createdAt desc
      expect(products[1].name).toBe("Product 1");
    });

    it("should return empty array when no products exist", async () => {
      const products = await repository.findAll();
      expect(products).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("should update a product", async () => {
      const createdProduct = await createTestProduct();
      const updateData = {
        name: "Updated Product Name",
        category: "Updated Category",
      };

      const updatedProduct = await repository.update(
        createdProduct.id,
        updateData
      );

      expect(updatedProduct).toBeDefined();
      expect(updatedProduct?.name).toBe(updateData.name);
      expect(updatedProduct?.category).toBe(updateData.category);
      expect(updatedProduct?.normalizedName).toBe(
        createdProduct.normalizedName
      ); // Should remain unchanged
    });

    it("should return null for non-existent id", async () => {
      const updatedProduct = await repository.update("non-existent-id", {
        name: "Updated",
      });
      expect(updatedProduct).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete a product", async () => {
      const createdProduct = await createTestProduct();

      const result = await repository.delete(createdProduct.id);
      expect(result).toBe(true);

      const foundProduct = await repository.findById(createdProduct.id);
      expect(foundProduct).toBeNull();
    });

    it("should return false for non-existent id", async () => {
      const result = await repository.delete("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe("findByNormalizedName", () => {
    it("should find a product by normalized name", async () => {
      const createdProduct = await createTestProduct({
        normalizedName: "unique-normalized-name",
      });

      const foundProduct = await repository.findByNormalizedName(
        "unique-normalized-name"
      );

      expect(foundProduct).toBeDefined();
      expect(foundProduct?.id).toBe(createdProduct.id);
    });

    it("should return null for non-existent normalized name", async () => {
      const foundProduct = await repository.findByNormalizedName(
        "non-existent"
      );
      expect(foundProduct).toBeNull();
    });
  });

  describe("findByCategory", () => {
    it("should find products by category", async () => {
      await createTestProduct({ category: "Electronics" });
      await createTestProduct({ category: "Electronics" });
      await createTestProduct({ category: "Books" });

      const electronicsProducts = await repository.findByCategory(
        "Electronics"
      );
      const booksProducts = await repository.findByCategory("Books");

      expect(electronicsProducts).toHaveLength(2);
      expect(booksProducts).toHaveLength(1);
    });

    it("should return empty array for non-existent category", async () => {
      const products = await repository.findByCategory("NonExistent");
      expect(products).toHaveLength(0);
    });
  });

  describe("search", () => {
    beforeEach(async () => {
      await createTestProduct({
        name: "iPhone 15 Pro",
        normalizedName: "iphone 15 pro",
        category: "Electronics",
      });
      await createTestProduct({
        name: "Samsung Galaxy S24",
        normalizedName: "samsung galaxy s24",
        category: "Electronics",
      });
      await createTestProduct({
        name: "MacBook Pro",
        normalizedName: "macbook pro",
        category: "Computers",
      });
    });

    it("should search products by name", async () => {
      const results = await repository.search("iPhone");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("iPhone 15 Pro");
    });

    it("should search products by normalized name", async () => {
      const results = await repository.search("galaxy");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Samsung Galaxy S24");
    });

    it("should search products by category", async () => {
      const results = await repository.search("Electronics");
      expect(results).toHaveLength(2);
    });

    it("should be case insensitive", async () => {
      const results = await repository.search("IPHONE");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("iPhone 15 Pro");
    });

    it("should return empty array for no matches", async () => {
      const results = await repository.search("NonExistentProduct");
      expect(results).toHaveLength(0);
    });
  });
});
