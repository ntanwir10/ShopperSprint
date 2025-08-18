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

const app = express();
const PORT = Number(process.env["PORT"] || 3001);

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

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env["FRONTEND_URL"] || "http://localhost:5173",
    credentials: true,
  })
);
app.use(limiter);
app.use(json());
app.use(logger);

// Health check endpoints
app.get("/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env["NODE_ENV"] || "development",
  });
});

app.get("/ping", (_req, res) => {
  res.json({
    pong: true,
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use("/api/search", searchRouter);
app.use("/api/ads", advertisementRouter);
app.use("/api/price-history", priceHistoryRouter);
app.use("/api/anonymous-notifications", anonymousNotificationsRouter);

// Gate auth-related routes behind AUTH_ENABLED flag
const AUTH_ENABLED = String(process.env["AUTH_ENABLED"] || "false").toLowerCase() === "true";
if (AUTH_ENABLED) {
  app.use("/api/auth", authRouter);
  app.use("/api/notifications", notificationsRouter);
}

// Monitoring endpoints always available (re-enabled)
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
initDatabase().catch((err) => console.error("Database init error:", err));
initRedis().catch((err) => console.error("Redis init error:", err));

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 PricePulse Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env["NODE_ENV"] || "development"}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 API base: http://localhost:${PORT}/api`);
});

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
