console.log("Testing basic imports...");

try {
  require("dotenv/config");
  console.log("✅ dotenv loaded");

  const { drizzle } = require("drizzle-orm/postgres-js");
  console.log("✅ drizzle imported");

  const postgres = require("postgres");
  console.log("✅ postgres imported");

  const { createClient } = require("redis");
  console.log("✅ redis imported");

  console.log("✅ All basic imports successful");
} catch (error) {
  console.error("❌ Import failed:", error.message);
}
