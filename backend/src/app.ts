import express from "express";
import helmet from "helmet";
import {
  corsMiddleware,
  rateLimiter,
  errorHandler,
  notFoundHandler,
} from "./middleware";
import { config } from "./config";
import { RepositoryFactory } from "./repositories/index.js";
import { ServiceFactory } from "./services/index.js";
import { injectServices } from "./routes/index.js";
import prisma from "./config/database.js";

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(corsMiddleware);

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Initialize repositories and services
let serviceFactory: ServiceFactory;

const initializeServices = async () => {
  try {
    const repositoryFactory = new RepositoryFactory(prisma);
    serviceFactory = new ServiceFactory(repositoryFactory);

    // Initialize all services
    await serviceFactory.initialize();

    // Inject services into routes
    injectServices({
      searchService: serviceFactory.getSearchService(),
      advertisementService: serviceFactory.getAdvertisementService(),
    });

    console.log("✅ Services initialized and injected into routes");
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    throw error;
  }
};

// Initialize services before setting up routes
initializeServices()
  .then(() => {
    // Import routes after services are initialized
    import("./routes/index.js").then((routesModule) => {
      const routes = routesModule.default;
      app.use("/api", routes);

      // 404 handler
      app.use(notFoundHandler);

      // Error handling middleware (must be last)
      app.use(errorHandler);

      console.log("✅ Routes configured with services");
    });
  })
  .catch((error) => {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n🛑 Shutting down application...");
  if (serviceFactory) {
    await serviceFactory.cleanup();
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🛑 Received SIGTERM, shutting down gracefully...");
  if (serviceFactory) {
    await serviceFactory.cleanup();
  }
  process.exit(0);
});

export default app;
