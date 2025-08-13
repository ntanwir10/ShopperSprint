import { eq, like, desc, asc } from "drizzle-orm";
import { getDb } from "../database/connection";
import { products, productListings, sources } from "../database/schema";
import { Product, ProductListing } from "../validation/schemas";

export class ProductRepository {
  // Create a new product
  async create(
    product: Omit<Product, "id" | "createdAt" | "updatedAt">
  ): Promise<Product> {
    const db = getDb();
    const [result] = await db
      .insert(products)
      .values({
        name: product.name,
        normalizedName: product.normalizedName,
        category: product.category || null,
        specifications: product.specifications || null,
      })
      .returning();

    if (!result) {
      throw new Error("Failed to create product");
    }

    return {
      id: result.id,
      name: result.name,
      normalizedName: result.normalizedName,
      category: result.category || undefined,
      specifications: result.specifications || undefined,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  // Find product by ID
  async findById(id: string): Promise<Product | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (result.length === 0) return null;

    const product = result[0];
    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      normalizedName: product.normalizedName,
      category: product.category || undefined,
      specifications: product.specifications || undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  // Find product by normalized name (for matching across sources)
  async findByNormalizedName(normalizedName: string): Promise<Product | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(products)
      .where(eq(products.normalizedName, normalizedName))
      .limit(1);

    if (result.length === 0) return null;

    const product = result[0];
    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      normalizedName: product.normalizedName,
      category: product.category || undefined,
      specifications: product.specifications || undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }

  // Search products by name
  async searchByName(query: string, limit: number = 50): Promise<Product[]> {
    const db = getDb();
    const results = await db
      .select()
      .from(products)
      .where(like(products.name, `%${query}%`))
      .limit(limit);

    return results.map((product: any) => ({
      id: product.id,
      name: product.name,
      normalizedName: product.normalizedName,
      category: product.category || undefined,
      specifications: product.specifications || undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));
  }

  // Get all products with pagination
  async findAll(
    page: number = 1,
    limit: number = 50
  ): Promise<{ products: Product[]; total: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const [countResult] = await db
      .select({ count: products.id })
      .from(products);
    const total = countResult?.count ? 1 : 0;

    const results = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);

    const productsList = results.map((product) => ({
      id: product.id,
      name: product.name,
      normalizedName: product.normalizedName,
      category: product.category || undefined,
      specifications: product.specifications || undefined,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    }));

    return { products: productsList, total };
  }

  // Update product
  async update(
    id: string,
    updates: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>
  ): Promise<Product | null> {
    const db = getDb();
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.normalizedName !== undefined)
      updateData.normalizedName = updates.normalizedName;
    if (updates.category !== undefined)
      updateData.category = updates.category || null;
    if (updates.specifications !== undefined)
      updateData.specifications = updates.specifications || null;

    const [result] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();

    if (!result) return null;

    return {
      id: result.id,
      name: result.name,
      normalizedName: result.normalizedName,
      category: result.category || undefined,
      specifications: result.specifications || undefined,
      createdAt: result.createdAt.toISOString(),
      updatedAt: result.updatedAt.toISOString(),
    };
  }

  // Delete product
  async delete(id: string): Promise<boolean> {
    const db = getDb();
    await db.delete(products).where(eq(products.id, id));
    return true; // Assume success if no error thrown
  }

  // Get product with all listings
  async getProductWithListings(
    id: string
  ): Promise<{ product: Product; listings: ProductListing[] } | null> {
    const product = await this.findById(id);
    if (!product) return null;

    const db = getDb();
    const listings = await db
      .select()
      .from(productListings)
      .where(eq(productListings.productId, id))
      .orderBy(asc(productListings.price));

    const productListingsResult = listings.map((listing: any) => ({
      id: listing.id,
      productId: listing.productId,
      sourceId: listing.sourceId,
      url: listing.url,
      price: listing.price,
      currency: listing.currency,
      availability: listing.availability,
      imageUrl: listing.imageUrl || undefined,
      rating: listing.rating || undefined,
      reviewCount: listing.reviewCount || undefined,
      lastScraped: listing.lastScraped.toISOString(),
      isValid: listing.isValid,
    }));

    return { product, listings: productListingsResult };
  }

  // Get all product listings by product ID
  async getProductListingsByProductId(productId: string): Promise<any[]> {
    const db = getDb();
    const listings = await db
      .select()
      .from(productListings)
      .where(eq(productListings.productId, productId))
      .orderBy(asc(productListings.price));

    return listings.map((listing: any) => ({
      id: listing.id,
      productId: listing.productId,
      sourceId: listing.sourceId,
      url: listing.url,
      price: listing.price,
      currency: listing.currency,
      availability: listing.availability,
      imageUrl: listing.imageUrl,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      lastScraped: listing.lastScraped,
      isValid: listing.isValid,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
    }));
  }

  // Get product by ID (alias for findById)
  async getProductById(id: string): Promise<Product | null> {
    return this.findById(id);
  }

  // Get source by ID
  async getSourceById(sourceId: string): Promise<any | null> {
    const db = getDb();
    const result = await db
      .select()
      .from(sources)
      .where(eq(sources.id, sourceId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  }
}
