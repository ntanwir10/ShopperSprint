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
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./middleware/logger";
import { WebSocketService } from "./services/websocketService";

// Load environment variables
dotenv.config();

// Initialize database connections after environment variables are loaded
initializeConnections();

const app = express();
const server = createServer(app);

// Initialize WebSocket service
const webSocketService = new WebSocketService();

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

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    websocketClients: webSocketService.getConnectedClientsCount(),
  });
});

// API routes
app.use("/api/search", searchRouter);
app.use("/api/ads", advertisementRouter);
app.use("/api/price-history", priceHistoryRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/auth", authRouter);
app.use("/api/user-preferences", userPreferencesRouter);

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
  await closeConnections();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  webSocketService.close();
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

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🌐 Health check: http://localhost:${PORT}/health`);
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
