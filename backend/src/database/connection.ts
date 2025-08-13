import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { createClient } from "redis";
import * as schema from "./schema";

// Environment detection
const isProduction = process.env["NODE_ENV"] === "production";

// Function to create PostgreSQL connection
function createPostgresConnection() {
  // PostgreSQL connection configuration
  const postgresConfig = {
    host: process.env["DB_HOST"] || "localhost",
    port: parseInt(process.env["DB_PORT"] || "5432"),
    user: process.env["DB_USER"] || "pricetracker",
    password: process.env["DB_PASSWORD"] || "pricetracker123",
    database: process.env["DB_NAME"] || "price_tracker",
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    // NeonDB requires SSL in production
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };

  // Use DATABASE_URL if available (NeonDB), otherwise use individual config
  const connectionString = process.env["DATABASE_URL"];

  // Only use DATABASE_URL if it's a valid PostgreSQL connection string
  const isValidPostgresUrl =
    connectionString &&
    (connectionString.startsWith("postgresql://") ||
      connectionString.startsWith("postgres://"));

  const postgresClient = isValidPostgresUrl
    ? postgres(connectionString, {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        ssl: isProduction ? { rejectUnauthorized: false } : false,
      })
    : postgres(postgresConfig);

  // Log which configuration is being used
  if (isValidPostgresUrl) {
    console.log("Using DATABASE_URL connection string");
  } else if (connectionString) {
    console.log(`Ignoring invalid DATABASE_URL: ${connectionString}`);
    console.log("Using individual PostgreSQL configuration");
  } else {
    console.log("Using individual PostgreSQL configuration");
  }

  return postgresClient;
}

// Initialize connections
let postgresClient: postgres.Sql | null = null;
export let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
export let redis: ReturnType<typeof createClient> | null = null;

// Function to initialize all connections
export function initializeConnections() {
  if (!postgresClient) {
    postgresClient = createPostgresConnection();
    db = drizzle(postgresClient, { schema });
  }

  if (!redis) {
    redis = createClient({
      url: process.env["REDIS_URL"] || "redis://localhost:6379",
    });

    redis.on("error", (err) => {
      console.error("Redis Client Error:", err);
    });

    redis.on("connect", () => {
      console.log("Redis connection established");
    });
  }

  return { db: db!, redis: redis!, postgresClient: postgresClient! };
}

// Export getters for the connections
export function getDb() {
  if (!db) {
    throw new Error(
      "Database not initialized. Call initializeConnections() first."
    );
  }
  return db;
}

export function getRedis() {
  if (!redis) {
    throw new Error(
      "Redis not initialized. Call initializeConnections() first."
    );
  }
  return redis;
}

// Initialize Redis connection
export const initRedis = async () => {
  const { redis } = initializeConnections();
  try {
    await redis.connect();
    console.log("Redis connection established");
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
  }
};

// Initialize database connection
export const initDatabase = async () => {
  const { postgresClient } = initializeConnections();
  try {
    // Test database connection
    await postgresClient`SELECT 1`;
    console.log(
      `Database connected successfully to ${
        isProduction ? "NeonDB" : "Docker PostgreSQL"
      }`
    );

    if (isProduction) {
      console.log("Running in production mode with NeonDB");
    } else {
      console.log("Running in development mode with Docker PostgreSQL");
    }
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }
};

// Close connections
export const closeConnections = async () => {
  try {
    if (postgresClient) {
      await postgresClient.end();
    }
    if (redis) {
      await redis.quit();
    }
    console.log("Database connections closed");
  } catch (error) {
    console.error("Error closing connections:", error);
  }
};
