import express from "express";
import searchRoutes, { injectSearchService } from "./search";
import advertisementRoutes, {
  injectAdvertisementService,
} from "./advertisements";

const router = express.Router();

// Service injection function
export const injectServices = (services: any) => {
  injectSearchService(services.searchService);
  injectAdvertisementService(services.advertisementService);
};

// Welcome message
router.get("/", (req, res) => {
  res.json({
    message: "Welcome to the Price Tracker API",
    version: "1.0.0",
    endpoints: {
      search: "/api/search",
      advertisements: "/api/ads",
      health: "/health",
    },
  });
});

// Mount route modules
router.use("/search", searchRoutes);
router.use("/ads", advertisementRoutes);

export default router;
