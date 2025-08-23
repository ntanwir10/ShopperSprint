// Vercel-specific entry point for serverless functions
// Load environment variables ASAP
import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { json } from "body-parser";
import { logger } from "./middleware/logger";
import { errorHandler } from "./middleware/errorHandler";
import {
  securityHeaders,
  contentSecurityPolicy,
  csrfProtection,
  sanitizeInput,
  requestLogger,
} from "./middleware/validationMiddleware";
import { initDatabase, initRedis } from "./database/connection";

// Import routes
import searchRouter from "./routes/search";
import { advertisementRouter } from "./routes/advertisement";
import { priceHistoryRouter } from "./routes/priceHistory";
import anonymousNotificationsRouter from "./routes/anonymousNotifications";
import { authRouter } from "./routes/auth";
import notificationsRouter from "./routes/notifications";
import { monitoringRouter } from "./routes/monitoring";

const app = express();

// Enforce required secrets/config in production
const IS_PRODUCTION = process.env["NODE_ENV"] === "production";
if (IS_PRODUCTION && !process.env["JWT_SECRET"]) {
  throw new Error("Missing required JWT_SECRET in production environment");
}

// Rate limiting (adjusted for serverless)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for serverless (requests might be bursty)
  message: {
    error: "Too many requests",
    message: "Too many requests from this IP, please try again later.",
    statusCode: 429,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
app.use(securityHeaders);
app.use(contentSecurityPolicy);
app.use(sanitizeInput);

// Core middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // We handle CSP manually
    crossOriginOpenerPolicy: false,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env["FRONTEND_URL"] || "https://shoppersprint.com",
        "http://localhost:5173", // Local development
        "http://localhost:3000",
        "http://localhost:5000",
      ];

      // In production, be more strict but allow Vercel URLs
      if (IS_PRODUCTION) {
        const isVercelApp = origin.includes(".vercel.app");
        const isAllowed = allowedOrigins.includes(origin) || isVercelApp;
        return callback(
          isAllowed ? null : new Error("Not allowed by CORS"),
          isAllowed
        );
      }

      // In development, allow localhost origins
      if (origin.includes("localhost") || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
    ],
    exposedHeaders: [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
    ],
  })
);

app.use(limiter);
app.use(json());
app.use(requestLogger);
app.use(logger);

// Health check endpoints
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env["NODE_ENV"] || "development",
    platform: "vercel",
    authEnabled:
      String(process.env["AUTH_ENABLED"] || "false").toLowerCase() === "true",
  });
});

app.get("/ping", (_req, res) => {
  res.json({
    pong: true,
    timestamp: new Date().toISOString(),
    platform: "vercel",
  });
});

// API routes (with CSRF protection for state-changing operations)
app.use("/api/search", searchRouter);
app.use("/api/ads", advertisementRouter);
app.use("/api/price-history", priceHistoryRouter);
app.use(
  "/api/anonymous-notifications",
  csrfProtection,
  anonymousNotificationsRouter
);

// Gate auth-related routes behind AUTH_ENABLED flag
const AUTH_ENABLED =
  String(process.env["AUTH_ENABLED"] || "false").toLowerCase() === "true";
if (AUTH_ENABLED) {
  app.use("/api/auth", csrfProtection, authRouter);
  app.use("/api/notifications", csrfProtection, notificationsRouter);
}

// Monitoring endpoints always available
app.use("/api/monitoring", monitoringRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  });
});

// Initialize external services (DB/Redis) for serverless
// These will be called on each function invocation
let dbInitialized = false;
let redisInitialized = false;

const initServices = async () => {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (err) {
      console.error("Database init error:", err);
    }
  }

  if (!redisInitialized) {
    try {
      await initRedis();
      redisInitialized = true;
    } catch (err) {
      console.error("Redis init error:", err);
    }
  }
};

// Middleware to ensure services are initialized
app.use(async (_req, _res, next) => {
  await initServices();
  next();
});

// Export as Vercel serverless function
export default app;
