import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "redis";
import * as schema from "./schema";

// Environment detection (removed unused variable)

// Serverless-optimized connection configuration
function createPostgresConnection() {
  const connectionString = process.env["DATABASE_URL"];

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is required for Vercel deployment"
    );
  }

  // Validate PostgreSQL connection string
  const isValidPostgresUrl =
    connectionString.startsWith("postgresql://") ||
    connectionString.startsWith("postgres://");

  if (!isValidPostgresUrl) {
    throw new Error(
      "Invalid DATABASE_URL format. Must be a PostgreSQL connection string."
    );
  }

  // Serverless-optimized configuration
  const postgresClient = postgres(connectionString, {
    max: 1, // Single connection for serverless
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: { rejectUnauthorized: false }, // Required for most cloud databases
    prepare: false, // Disable prepared statements for better serverless compatibility
  });

  console.log("Using DATABASE_URL connection string for Vercel deployment");
  return postgresClient;
}

// Global connection instances (shared across function invocations)
let postgresClient: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let redis: ReturnType<typeof createClient> | null = null;

// Initialize PostgreSQL connection
export async function initDatabase() {
  if (!postgresClient) {
    try {
      postgresClient = createPostgresConnection();
      db = drizzle(postgresClient, { schema });

      // Test connection
      await postgresClient`SELECT 1`;
      console.log("Database connected successfully for Vercel deployment");
    } catch (error) {
      console.error("Failed to connect to database:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown database error";
      throw new Error(`Database connection failed: ${errorMessage}`);
    }
  }
  return db!;
}

// Initialize Redis connection
export async function initRedis() {
  if (!redis) {
    const redisUrl = process.env["REDIS_URL"];

    if (!redisUrl) {
      console.warn("REDIS_URL not provided. Skipping Redis initialization.");
      return null;
    }

    try {
      redis = createClient({
        url: redisUrl,
        socket: {
          connectTimeout: 5000,
        },
      });

      redis.on("error", (err) => {
        console.error("Redis Client Error:", err);
      });

      redis.on("connect", () => {
        console.log("Redis connection established");
      });

      await redis.connect();
      console.log("Redis connected successfully for Vercel deployment");
    } catch (error) {
      console.error("Redis connection failed:", error);
      // Don't throw error for Redis - app can work without it
      redis = null;
    }
  }
  return redis;
}

// Get database instance
export function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}

// Get Redis instance (can be null)
export function getRedis() {
  return redis;
}

// Get Redis instance with error handling
export function getRedisWithFallback() {
  if (!redis) {
    console.warn("Redis not available. Using fallback behavior.");
    return null;
  }
  return redis;
}

// Close connections (for testing purposes - not needed in serverless)
export async function closeConnections() {
  try {
    if (postgresClient) {
      await postgresClient.end();
      postgresClient = null;
      db = null;
    }
    if (redis) {
      await redis.quit();
      redis = null;
    }
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error closing connections:", error);
  }
}

// Health check function
export async function healthCheck() {
  const results = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    if (db && postgresClient) {
      await postgresClient`SELECT 1`;
      results.database = true;
    }
  } catch (error) {
    console.error("Database health check failed:", error);
  }

  try {
    if (redis) {
      await redis.ping();
      results.redis = true;
    }
  } catch (error) {
    console.error("Redis health check failed:", error);
  }

  return results;
}
