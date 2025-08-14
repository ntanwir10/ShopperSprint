import { getDb } from "./connection";
import { sources } from "./schema";
import { initializeConnections } from "./connection";

async function setupProduction() {
  // Ensure this script only runs in production
  if (process.env["NODE_ENV"] !== "production") {
    throw new Error("This script can only run in production environment");
  }

  try {
    console.log("🏭 Starting production database setup...");
    console.log(`🔧 Environment: ${process.env["NODE_ENV"]}`);

    // Check if we're running locally with production NODE_ENV
    const isLocalDocker =
      process.env["DATABASE_URL"]?.includes("localhost") ||
      process.env["DB_HOST"] === "localhost" ||
      !process.env["DATABASE_URL"];

    if (isLocalDocker) {
      console.log(
        "⚠️  Warning: Running production setup with local Docker database"
      );
      console.log("💡 This is fine for testing production setup locally");
      console.log(
        "💡 In real production, you would use a production database URL"
      );
      console.log("\n📋 For local testing, you can:");
      console.log("   1. Copy .env.production.local to .env.production");
      console.log("   2. Or set DATABASE_URL to your local Docker instance");
      console.log(
        "   3. Or use NODE_ENV=development for full development mode"
      );
    }

    // Initialize database connections
    console.log("🔌 Initializing database connections...");
    try {
      await initializeConnections();
      console.log("✅ Database connections initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize database connections:", error);
      console.log("\n🔧 Troubleshooting tips:");
      console.log(
        "   1. Ensure Docker containers are running: npm run db:start"
      );
      console.log("   2. Check database credentials in .env.production");
      console.log("   3. Verify DATABASE_URL or individual DB_* variables");
      console.log("   4. For local testing, use NODE_ENV=development");
      console.log("   5. Or create .env.production with local Docker settings");
      throw error;
    }

    // Create production sources with real configurations
    console.log("📡 Setting up production sources...");

    await getDb()
      .insert(sources)
      .values({
        name: "Amazon",
        category: "popular",
        isActive: true,
        configuration: {
          baseUrl: "https://www.amazon.com",
          searchUrl: "https://www.amazon.com/s?k={query}",
          selectors: {
            productContainer: "[data-component-type='s-search-result']",
            productName: "h2 a span",
            productPrice: ".a-price-whole",
            productImage: "img.s-image",
            productUrl: "h2 a",
            productRating: "[data-testid='rating']",
            productReviews: "[data-testid='review-count']",
            availability: "[data-testid='availability']",
          },
          rateLimit: 2000, // More conservative rate limiting for production
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

    await getDb()
      .insert(sources)
      .values({
        name: "Walmart",
        category: "popular",
        isActive: true,
        configuration: {
          baseUrl: "https://www.walmart.com",
          searchUrl: "https://www.walmart.com/search?q={query}",
          selectors: {
            productContainer: "[data-item-id]",
            productName: "[data-testid='product-title']",
            productPrice: "[data-testid='price-wrap']",
            productImage: "img[data-testid='product-image']",
            productUrl: "[data-testid='product-title'] a",
            productRating: "[data-testid='rating']",
            productReviews: "[data-testid='review-count']",
            availability: "[data-testid='availability']",
          },
          rateLimit: 2000, // More conservative rate limiting for production
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

    await getDb()
      .insert(sources)
      .values({
        name: "Best Buy",
        category: "alternative",
        isActive: true,
        configuration: {
          baseUrl: "https://www.bestbuy.com",
          searchUrl: "https://www.bestbuy.com/site/searchpage.jsp?st={query}",
          selectors: {
            productContainer: ".list-item",
            productName: "h4 a",
            productPrice: ".priceView-customer-price span",
            productImage: "img.product-image",
            productUrl: "h4 a",
            productRating: ".rating",
            productReviews: ".review-count",
            availability: ".availability",
          },
          rateLimit: 2000, // More conservative rate limiting for production
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });

    // Add more production sources as needed
    // You can add Target, Newegg, Micro Center, etc.

    console.log("✅ Production sources configured successfully");
    console.log("📊 Sources configured:");
    console.log("   - Amazon (Popular)");
    console.log("   - Walmart (Popular)");
    console.log("   - Best Buy (Alternative)");
    console.log("\n⚠️  Important production notes:");
    console.log("   - Rate limiting set to 2 seconds between requests");
    console.log("   - Mock data is disabled");
    console.log("   - Real scraping is enabled");
    console.log(
      "   - Monitor scraping success rates and adjust selectors as needed"
    );
  } catch (error) {
    console.error("❌ Error during production setup:", error);
    throw error;
  }
}

// Run the setup function
setupProduction()
  .then(() => {
    console.log("✅ Production setup completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Production setup failed:", error);
    process.exit(1);
  });
