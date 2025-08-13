import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./src/database/schema.ts",
  out: "./src/database/migrations",
  driver: "pg",
  dbCredentials: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || "pricepulse",
    password: process.env.DB_PASSWORD || "pricepulse123",
    database: process.env.DB_NAME || "pricepulse",
  },
  verbose: true,
  strict: true,
});
