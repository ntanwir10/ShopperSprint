/**
 * Example script demonstrating repository pattern usage
 * This file shows how to use the repository pattern for CRUD operations
 */

import { PrismaClient } from "@prisma/client";
import { RepositoryFactory } from "../repositories/index";

async function demonstrateRepositoryUsage() {
  const prisma = new PrismaClient();
  const repositoryFactory = new RepositoryFactory(prisma);

  // Create repository instances
  const productRepo = repositoryFactory.createProductRepository();
  const sourceRepo = repositoryFactory.createSourceRepository();
  const listingRepo = repositoryFactory.createProductListingRepository();
  const searchRepo = repositoryFactory.createSearchRepository();

  try {
    console.log("🚀 Repository Pattern Usage Demo");
    console.log("================================");

    // 1. Create a source
    console.log("\n1. Creating a source...");
    const source = await sourceRepo.create({
      name: "Demo Store",
      category: "popular",
      isActive: true,
      errorCount: 0,
      configuration: {
        baseUrl: "https://demo-store.com",
        searchPath: "/search?q=",
        selectors: {
          productName: ".product-title",
          price: ".price",
          availability: ".stock-status",
          image: ".product-image img",
        },
        rateLimit: {
          requestsPerMinute: 60,
          concurrent: 3,
        },
      },
    });
    console.log(`✅ Created source: ${source.name} (ID: ${source.id})`);

    // 2. Create a product
    console.log("\n2. Creating a product...");
    const product = await productRepo.create({
      name: "Demo Smartphone",
      normalizedName: "demo smartphone",
      category: "Electronics",
      specifications: {
        brand: "Demo Brand",
        model: "Smart X1",
        storage: "256GB",
        color: "Space Gray",
      },
    });
    console.log(`✅ Created product: ${product.name} (ID: ${product.id})`);

    // 3. Create a product listing
    console.log("\n3. Creating a product listing...");
    const listing = await listingRepo.create({
      productId: product.id,
      sourceId: source.id,
      url: "https://demo-store.com/products/smart-x1",
      price: 699.99,
      currency: "USD",
      availability: "in_stock",
      imageUrl: "https://demo-store.com/images/smart-x1.jpg",
      rating: 4.5,
      reviewCount: 128,
      isValid: true,
    });
    console.log(`✅ Created listing: $${listing.price} at ${source.name}`);

    // 4. Create a search record
    console.log("\n4. Creating a search record...");
    const search = await searchRepo.create({
      query: "smartphone",
      userId: "demo-user-123",
      metadata: {
        totalSources: 1,
        successfulSources: 1,
        searchDuration: 1.2,
        cacheHit: false,
      },
    });
    console.log(`✅ Created search: "${search.query}" (ID: ${search.id})`);

    // 5. Demonstrate queries
    console.log("\n5. Demonstrating queries...");

    // Find products by category
    const electronics = await productRepo.findByCategory("Electronics");
    console.log(`📱 Found ${electronics.length} electronics products`);

    // Search products
    const searchResults = await productRepo.search("smartphone");
    console.log(
      `🔍 Search for "smartphone" returned ${searchResults.length} results`
    );

    // Find listings by product
    const productListings = await listingRepo.findByProductId(product.id);
    console.log(
      `💰 Found ${productListings.length} listings for ${product.name}`
    );

    // Find active sources
    const activeSources = await sourceRepo.findActive();
    console.log(`🏪 Found ${activeSources.length} active sources`);

    // Find recent searches
    const recentSearches = await searchRepo.findRecent(5);
    console.log(`📊 Found ${recentSearches.length} recent searches`);

    // 6. Demonstrate updates
    console.log("\n6. Demonstrating updates...");

    // Update source metrics
    await sourceRepo.updateLastSuccessfulScrape(source.id);
    await sourceRepo.updateAverageResponseTime(source.id, 850);
    console.log(`📈 Updated source metrics for ${source.name}`);

    // Update listing timestamp
    await listingRepo.updateLastScraped(listing.id);
    console.log(`⏰ Updated last scraped timestamp for listing`);

    // Update product
    const updatedProduct = await productRepo.update(product.id, {
      specifications: {
        ...product.specifications,
        updated: new Date().toISOString(),
      },
    });
    console.log(`📝 Updated product specifications`);

    // 7. Demonstrate specialized queries
    console.log("\n7. Demonstrating specialized queries...");

    // Find valid listings
    const validListings = await listingRepo.findValidListings();
    console.log(`✅ Found ${validListings.length} valid listings`);

    // Find listings by availability
    const inStockListings = await listingRepo.findByAvailability("in_stock");
    console.log(`📦 Found ${inStockListings.length} in-stock listings`);

    // Find sources by category
    const popularSources = await sourceRepo.findByCategory("popular");
    console.log(`⭐ Found ${popularSources.length} popular sources`);

    console.log("\n🎉 Repository demo completed successfully!");
  } catch (error) {
    console.error("❌ Error during repository demo:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the demo if this file is executed directly
if (require.main === module) {
  demonstrateRepositoryUsage()
    .catch(console.error)
    .finally(() => process.exit(0));
}

export { demonstrateRepositoryUsage };
