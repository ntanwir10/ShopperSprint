// Load environment variables ASAP
import * as dotenv from "dotenv";
import path from "path";

// Load from root .env file
dotenv.config({ path: path.join(__dirname, "../../.env") });

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
import {
  initDatabase,
  initRedis,
  closeConnections,
} from "./database/connection";

// Import routes
import searchRouter from "./routes/search";
import { advertisementRouter } from "./routes/advertisement";
import { priceHistoryRouter } from "./routes/priceHistory";
import anonymousNotificationsRouter from "./routes/anonymousNotifications";
import { authRouter } from "./routes/auth";
import notificationsRouter from "./routes/notifications";
import { monitoringRouter } from "./routes/monitoring";
import waitlistRouter from "./routes/waitlist";
import frontendRouter from "./routes/frontend";
import { webSocketService } from "./services/websocketService";

const app = express();
const PORT = Number(process.env["PORT"] || 3001);

// Enforce required secrets/config in production
const IS_PRODUCTION =
  (process.env["NODE_ENV"] || "development") === "production";
if (IS_PRODUCTION && !process.env["JWT_SECRET"]) {
  throw new Error("Missing required JWT_SECRET in production environment");
}
if (!IS_PRODUCTION && !process.env["JWT_SECRET"]) {
  console.warn(
    "Warning: JWT_SECRET is not set. Authentication features may not work as expected."
  );
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests",
    message: "Too many requests from this IP, please try again later.",
    statusCode: 429,
  },
});

// Security middleware
app.use(securityHeaders);
app.use(contentSecurityPolicy);
app.use(sanitizeInput);

// Core middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // We handle CSP manually
    crossOriginOpenerPolicy: false, // We handle this in nginx
  })
);
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        process.env["FRONTEND_URL"] || "http://localhost:5173",
        "http://localhost:3000", // Additional dev origins
        "http://localhost:5000",
      ];

      // In production, be more strict
      if (process.env["NODE_ENV"] === "production") {
        const isAllowed = allowedOrigins.includes(origin);
        return callback(
          isAllowed ? null : new Error("Not allowed by CORS"),
          isAllowed
        );
      }

      // In development, allow all localhost origins
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
    authEnabled:
      String(process.env["AUTH_ENABLED"] || "false").toLowerCase() === "true",
  });
});

app.get("/ping", (_req, res) => {
  res.json({
    pong: true,
    timestamp: new Date().toISOString(),
  });
});

// API routes (with CSRF protection for state-changing operations)
app.use("/api/search", searchRouter);
app.use("/api/ads", advertisementRouter);
app.use("/api/price-history", priceHistoryRouter);

// CSRF token endpoint (temporarily disabled for deployment)
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: "disabled-for-coming-soon" });
});

// Waitlist endpoint (temporarily without CSRF for testing)
app.use("/api/waitlist", waitlistRouter);
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

// Monitoring endpoints always available (re-enabled)
app.use("/api/monitoring", monitoringRouter);

// Serve static frontend files in production (Railway single-service deployment)
const SERVE_FRONTEND =
  process.env["SERVE_FRONTEND"] === "true" ||
  process.env["RAILWAY_ENVIRONMENT"];
if (SERVE_FRONTEND && IS_PRODUCTION) {
  const frontendPath = path.join(__dirname, "public");

  // Serve static files
  app.use(
    express.static(frontendPath, {
      maxAge: "1y", // Cache static assets for 1 year
      etag: true,
      lastModified: true,
    })
  );

  // Handle client-side routing - serve index.html for non-API routes
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({
        error: "API Not Found",
        message: `API route ${req.originalUrl} not found`,
        statusCode: 404,
      });
    }

    // Serve index.html for all other routes (SPA routing)
    return res.sendFile(path.join(frontendPath, "index.html"), (err) => {
      if (err) {
        console.error("Error serving index.html:", err);
        res.status(500).json({
          error: "Internal Server Error",
          message: "Could not serve frontend application",
          statusCode: 500,
        });
      }
    });
  });
} else {
  // Frontend route for API-only mode
  app.use("/", frontendRouter);
  
  // API-only mode - 404 handler for remaining non-API routes
  app.use("*", (req, res) => {
    res.status(404).json({
      error: "Not Found",
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404,
    });
  });
}

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);

  try {
    await closeConnections();

    console.log("Graceful shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Initialize external services (DB/Redis) without blocking server start
initDatabase().catch((err) => {
  console.error("Database init error:", err);
  console.log("⚠️  Server will continue without database connection");
});

initRedis().catch((err) => {
  console.error("Redis init error:", err);
  console.log("⚠️  Server will continue without Redis connection");
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 ShopperSprint Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env["NODE_ENV"] || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API base: http://localhost:${PORT}/api`);
});

// Initialize WebSocket server on existing HTTP server
try {
  webSocketService.initialize(server);
} catch (err) {
  console.error("Failed to initialize WebSocket server:", err);
}

// Schedule periodic cleanup of expired verification tokens (every 6 hours)
setInterval(async () => {
  try {
    const { AnonymousNotificationService } = await import(
      "./services/anonymousNotificationService"
    );
    const svc = new AnonymousNotificationService();
    const removed = await svc.cleanupExpiredTokens();
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} expired anonymous alert tokens`);
    }
  } catch (err) {
    console.error("Token cleanup job failed:", err);
  }
}, 6 * 60 * 60 * 1000);

// Handle server errors
server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  switch (error.code) {
    case "EACCES":
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default app;
