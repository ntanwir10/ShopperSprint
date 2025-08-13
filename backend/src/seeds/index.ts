import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  try {
    // Clear existing data
    await prisma.productListing.deleteMany();
    await prisma.search.deleteMany();
    await prisma.product.deleteMany();
    await prisma.source.deleteMany();
    await prisma.advertisement.deleteMany();

    console.log("✅ Cleared existing data");

    // Create sources
    const sources = await Promise.all([
      prisma.source.create({
        data: {
          name: "Amazon",
          category: "popular",
          isActive: true,
          configuration: {
            baseUrl: "https://amazon.com",
            searchPath: "/s?k=",
            selectors: {
              productContainer: ".s-result-item",
              productName: ".a-text-normal",
              price: ".a-price-whole",
              availability: ".a-color-success",
              image: ".s-image",
              url: ".a-link-normal",
              rating: ".a-icon-alt",
              reviewCount: ".a-size-base",
            },
            rateLimit: {
              requestsPerMinute: 30,
              concurrent: 2,
            },
          },
        },
      }),
      prisma.source.create({
        data: {
          name: "Best Buy",
          category: "popular",
          isActive: true,
          configuration: {
            baseUrl: "https://bestbuy.com",
            searchPath: "/site/searchpage.jsp?st=",
            selectors: {
              productContainer: ".list-item",
              productName: ".sku-title",
              price: ".priceView-customer-price",
              availability: ".fulfillment-fulfillment-summary",
              image: ".product-image",
              url: ".sku-title a",
              rating: ".c-ratings-reviews",
              reviewCount: ".c-ratings-reviews",
            },
            rateLimit: {
              requestsPerMinute: 25,
              concurrent: 2,
            },
          },
        },
      }),
      prisma.source.create({
        data: {
          name: "Newegg",
          category: "alternative",
          isActive: true,
          configuration: {
            baseUrl: "https://newegg.com",
            searchPath: "/p/pl?d=",
            selectors: {
              productContainer: ".item-cell",
              productName: ".item-title",
              price: ".price-current",
              availability: ".item-stock",
              image: ".item-img img",
              url: ".item-title a",
              rating: ".rating",
              reviewCount: ".item-rating-num",
            },
            rateLimit: {
              requestsPerMinute: 20,
              concurrent: 1,
            },
          },
        },
      }),
      prisma.source.create({
        data: {
          name: "B&H Photo",
          category: "alternative",
          isActive: true,
          configuration: {
            baseUrl: "https://bhphotovideo.com",
            searchPath: "/c/search?q=",
            selectors: {
              productContainer: ".product",
              productName: ".product-name",
              price: ".price",
              availability: ".availability",
              image: ".product-image img",
              url: ".product-name a",
              rating: ".rating",
              reviewCount: ".review-count",
            },
            rateLimit: {
              requestsPerMinute: 15,
              concurrent: 1,
            },
          },
        },
      }),
    ]);

    console.log(
      "✅ Created sources:",
      sources.map((s) => s.name)
    );

    // Create products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "iPhone 15 Pro",
          normalizedName: "iphone 15 pro",
          category: "Electronics",
          specifications: {
            brand: "Apple",
            storage: "128GB",
            color: "Natural Titanium",
            screen: "6.1 inch",
          },
        },
      }),
      prisma.product.create({
        data: {
          name: "Samsung Galaxy S24 Ultra",
          normalizedName: "samsung galaxy s24 ultra",
          category: "Electronics",
          specifications: {
            brand: "Samsung",
            storage: "256GB",
            color: "Titanium Black",
            screen: "6.8 inch",
          },
        },
      }),
      prisma.product.create({
        data: {
          name: "Sony WH-1000XM5 Headphones",
          normalizedName: "sony wh 1000xm5 headphones",
          category: "Audio",
          specifications: {
            brand: "Sony",
            type: "Wireless",
            noiseCancelling: true,
            batteryLife: "30 hours",
          },
        },
      }),
      prisma.product.create({
        data: {
          name: "MacBook Pro 14-inch",
          normalizedName: "macbook pro 14 inch",
          category: "Computers",
          specifications: {
            brand: "Apple",
            processor: "M3 Pro",
            memory: "16GB",
            storage: "512GB SSD",
          },
        },
      }),
      prisma.product.create({
        data: {
          name: "Canon EOS R6 Mark II",
          normalizedName: "canon eos r6 mark ii",
          category: "Photography",
          specifications: {
            brand: "Canon",
            type: "Mirrorless",
            sensor: "24.2MP Full-Frame",
            video: "4K 60p",
          },
        },
      }),
    ]);

    console.log(
      "✅ Created products:",
      products.map((p) => p.name)
    );

    // Create product listings
    const listings = [];
    for (const product of products) {
      for (const source of sources) {
        // Generate realistic prices with some variation
        const basePrice = getBasePrice(product.name);
        const priceVariation = (Math.random() - 0.5) * 0.2; // ±10%
        const price = Math.round(basePrice * (1 + priceVariation) * 100) / 100;

        const listing = await prisma.productListing.create({
          data: {
            productId: product.id,
            sourceId: source.id,
            url: `https://${source.name.toLowerCase()}.com/product/${
              product.id
            }`,
            price,
            currency: "USD",
            availability: getRandomAvailability(),
            imageUrl: `https://via.placeholder.com/300x300?text=${encodeURIComponent(
              product.name
            )}`,
            rating: Math.random() > 0.3 ? 3.5 + Math.random() * 1.5 : null,
            reviewCount:
              Math.random() > 0.3
                ? Math.floor(Math.random() * 1000) + 10
                : null,
            lastScraped: new Date(
              Date.now() - Math.random() * 24 * 60 * 60 * 1000
            ), // Random time in last 24 hours
            isValid: true,
          },
        });
        listings.push(listing);
      }
    }

    console.log("✅ Created product listings:", listings.length);

    // Create advertisements
    const advertisements = await Promise.all([
      prisma.advertisement.create({
        data: {
          title: "Electronics Sale - Up to 40% Off",
          description:
            "Get amazing deals on smartphones, laptops, and more electronics. Limited time offer!",
          imageUrl: "https://via.placeholder.com/300x200?text=Electronics+Sale",
          targetUrl: "https://example.com/electronics-sale",
          category: "electronics",
          keywords: ["electronics", "sale", "discount", "smartphone", "laptop"],
          isActive: true,
          impressions: 0,
          clicks: 0,
        },
      }),
      prisma.advertisement.create({
        data: {
          title: "Free Shipping on Orders Over $50",
          description:
            "Shop with confidence knowing your order ships free when you spend $50 or more.",
          imageUrl: "https://via.placeholder.com/300x200?text=Free+Shipping",
          targetUrl: "https://example.com/free-shipping",
          category: "general",
          keywords: ["free shipping", "shipping", "delivery", "order"],
          isActive: true,
          impressions: 0,
          clicks: 0,
        },
      }),
      prisma.advertisement.create({
        data: {
          title: "New Customer Discount - 20% Off",
          description:
            "First time shopping with us? Get 20% off your entire order with code NEW20.",
          imageUrl:
            "https://via.placeholder.com/300x200?text=New+Customer+Discount",
          targetUrl: "https://example.com/new-customer",
          category: "general",
          keywords: ["new customer", "discount", "first time", "welcome"],
          isActive: true,
          impressions: 0,
          clicks: 0,
        },
      }),
    ]);

    console.log("✅ Created advertisements:", advertisements.length);

    // Create sample search
    const search = await prisma.search.create({
      data: {
        query: "iPhone 15 Pro",
        metadata: {
          totalSources: sources.length,
          successfulSources: products.length,
          searchDuration: 2.5,
          cacheHit: false,
        },
      },
    });

    console.log("✅ Created sample search:", search.query);

    console.log("🎉 Database seeding completed successfully!");
    console.log(
      `📊 Created ${sources.length} sources, ${products.length} products, ${listings.length} listings, and ${advertisements.length} advertisements`
    );
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

function getBasePrice(productName: string): number {
  const priceMap: Record<string, number> = {
    "iPhone 15 Pro": 999,
    "Samsung Galaxy S24 Ultra": 1299,
    "Sony WH-1000XM5 Headphones": 399,
    "MacBook Pro 14-inch": 1999,
    "Canon EOS R6 Mark II": 2499,
  };
  return priceMap[productName] || 500;
}

function getRandomAvailability():
  | "in_stock"
  | "out_of_stock"
  | "limited"
  | "unknown" {
  const rand = Math.random();
  if (rand < 0.7) return "in_stock";
  if (rand < 0.85) return "limited";
  if (rand < 0.95) return "out_of_stock";
  return "unknown";
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
