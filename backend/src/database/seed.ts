import { getDb } from "./connection";
import {
  sources,
  products,
  advertisements,
  users,
  userPreferences,
} from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Create sources
    console.log("📡 Creating sources...");
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
            title: "h2 a span",
            price: ".a-price-whole",
            image: "img.s-image",
            rating: "[data-testid='rating']",
            reviewCount: "[data-testid='review-count']",
            availability: "[data-testid='availability']",
          },
          rateLimit: 1000,
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
            title: "[data-testid='product-title']",
            price: "[data-testid='price-wrap']",
            image: "img[data-testid='product-image']",
            rating: "[data-testid='rating']",
            reviewCount: "[data-testid='review-count']",
            availability: "[data-testid='availability']",
          },
          rateLimit: 1000,
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
            title: "h4 a",
            price: ".priceView-customer-price span",
            image: "img.product-image",
            rating: ".rating",
            reviewCount: ".review-count",
            availability: ".availability",
          },
          rateLimit: 1000,
        },
      });

    console.log("✅ Sources created successfully");

    // Create sample products
    console.log("📦 Creating sample products...");
    await getDb()
      .insert(products)
      .values({
        name: "iPhone 15 Pro",
        normalizedName: "iphone 15 pro",
        category: "Electronics",
        specifications: {
          brand: "Apple",
          model: "iPhone 15 Pro",
          storage: "128GB",
          color: "Natural Titanium",
          screenSize: "6.1 inches",
          processor: "A17 Pro",
        },
      });

    await getDb()
      .insert(products)
      .values({
        name: "MacBook Air M2",
        normalizedName: "macbook air m2",
        category: "Electronics",
        specifications: {
          brand: "Apple",
          model: "MacBook Air",
          storage: "256GB",
          color: "Space Gray",
          screenSize: "13.6 inches",
          processor: "M2",
          memory: "8GB",
        },
      });

    await getDb()
      .insert(products)
      .values({
        name: "Sony WH-1000XM5",
        normalizedName: "sony wh 1000xm5",
        category: "Electronics",
        specifications: {
          brand: "Sony",
          model: "WH-1000XM5",
          type: "Over-ear",
          connectivity: "Bluetooth 5.2",
          noiseCancellation: "Yes",
          batteryLife: "30 hours",
        },
      });

    console.log("✅ Sample products created successfully");

    // Create advertisements
    console.log("📢 Creating advertisements...");
    await getDb().insert(advertisements).values([
      {
        title: "Save Big on Electronics",
        description:
          "Get up to 50% off on selected electronics this week only!",
        imageUrl: "https://example.com/electronics-sale.jpg",
        targetUrl: "https://example.com/sale",
        category: "Electronics",
        keywords: ["electronics", "sale", "discount", "deals"],
        isActive: true,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
      {
        title: "New Smartphone Launch",
        description:
          "Be the first to get the latest smartphone with exclusive pre-order bonuses!",
        imageUrl: "https://example.com/smartphone-launch.jpg",
        targetUrl: "https://example.com/preorder",
        category: "Electronics",
        keywords: ["smartphone", "launch", "pre-order", "new"],
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      {
        title: "Laptop Bundle Deals",
        description:
          "Complete laptop setups with accessories included. Limited time offer!",
        imageUrl: "https://example.com/laptop-bundle.jpg",
        targetUrl: "https://example.com/bundles",
        category: "Electronics",
        keywords: ["laptop", "bundle", "accessories", "complete"],
        isActive: true,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      },
    ]);

    console.log("✅ Advertisements created successfully");

    // Create test admin user
    console.log("👤 Creating test admin user...");
    const hashedPassword = await bcrypt.hash("AdminPass123!", 12);

    const [adminUser] = await getDb()
      .insert(users)
      .values({
        email: "admin@example.com",
        username: "admin",
        passwordHash: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isActive: true,
        emailVerified: true,
      })
      .returning();

    if (!adminUser) {
      throw new Error("Failed to create admin user");
    }

    // Create admin user preferences
    await getDb().insert(userPreferences).values({
      userId: adminUser.id,
      notificationEmail: true,
      notificationPush: true,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
      timezone: "UTC",
      language: "en",
      currency: "USD",
    });

    console.log("✅ Test admin user created successfully");
    console.log(`   Email: admin@example.com`);
    console.log(`   Username: admin`);
    console.log(`   Password: AdminPass123!`);

    // Create test regular user
    console.log("👤 Creating test regular user...");
    const regularUserPassword = await bcrypt.hash("UserPass123!", 12);

    const [regularUser] = await getDb()
      .insert(users)
      .values({
        email: "user@example.com",
        username: "testuser",
        passwordHash: regularUserPassword,
        firstName: "Test",
        lastName: "User",
        role: "user",
        isActive: true,
        emailVerified: true,
      })
      .returning();

    if (!regularUser) {
      throw new Error("Failed to create regular user");
    }

    // Create regular user preferences
    await getDb().insert(userPreferences).values({
      userId: regularUser.id,
      notificationEmail: true,
      notificationPush: false,
      quietHoursStart: "23:00",
      quietHoursEnd: "07:00",
      timezone: "America/New_York",
      language: "en",
      currency: "USD",
    });

    console.log("✅ Test regular user created successfully");
    console.log(`   Email: user@example.com`);
    console.log(`   Username: testuser`);
    console.log(`   Password: UserPass123!`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("\n📋 Test Accounts:");
    console.log("   Admin: admin@example.com / AdminPass123!");
    console.log("   User:  user@example.com / UserPass123!");
    console.log("\n🔑 Use these accounts to test the authentication system");

  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

// Run the seed function
seed()
  .then(() => {
    console.log("✅ Seeding completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
