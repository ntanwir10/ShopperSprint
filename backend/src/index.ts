import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import dotenv from "dotenv";
import {
  initRedis,
  initDatabase,
  closeConnections,
  initializeConnections,
} from "./database/connection";
import { searchRouter } from "./routes/search";
import { advertisementRouter } from "./routes/advertisement";
import { priceHistoryRouter } from "./routes/priceHistory";
import notificationsRouter from "./routes/notifications";
import { authRouter } from "./routes/auth";
import { userPreferencesRouter } from "./routes/userPreferences";
import { monitoringRouter } from "./routes/monitoring";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { WebSocketService } from "./services/websocketService";
import { MonitoringService } from "./services/monitoringService";
import { CachingService } from "./services/cachingService";

// Load environment variables
dotenv.config();

// Initialize database connections after environment variables are loaded
initializeConnections();

const app = express();
const server = createServer(app);

// Initialize WebSocket service
const webSocketService = new WebSocketService();

// Declare service variables (will be initialized after connections)
let monitoringService: MonitoringService;
let cachingService: CachingService;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env["FRONTEND_URL"] || "http://localhost:5173",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(logger);

// Lightweight health check endpoint (for frontend)
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    websocketClients: webSocketService.getConnectedClientsCount(),
  });
});

// Fast ping endpoint (for frontend health checks)
app.get("/ping", (_req, res) => {
  res.json({ pong: true, timestamp: new Date().toISOString() });
});

// API routes
app.use("/api/search", searchRouter);
app.use("/api/ads", advertisementRouter);
app.use("/api/price-history", priceHistoryRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/auth", authRouter);
app.use("/api/user-preferences", userPreferencesRouter);
app.use("/api/monitoring", monitoringRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
    timestamp: new Date().toISOString(),
  });
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  webSocketService.close();
  if (monitoringService) monitoringService.stop();
  if (cachingService) cachingService.stop();
  await closeConnections();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  webSocketService.close();
  if (monitoringService) monitoringService.stop();
  if (cachingService) cachingService.stop();
  await closeConnections();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Start server
const PORT = process.env["PORT"] || 3001;

const startServer = async () => {
  try {
    // Initialize database connection
    await initDatabase();

    // Initialize Redis connection
    await initRedis();

    // Initialize WebSocket service
    webSocketService.initialize(server);

    // Initialize monitoring and caching services
    monitoringService = new MonitoringService();
    cachingService = new CachingService();
    await monitoringService.loadPersistedData();
    console.log("📊 Monitoring service initialized");

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`📊 Monitoring service ready`);
      console.log(`💾 Caching service ready`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
      console.log(
        `📈 Monitoring: http://localhost:${PORT}/api/monitoring/health`
      );
      console.log(
        `🔧 Environment: ${process.env["NODE_ENV"] || "development"}`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export { webSocketService };
