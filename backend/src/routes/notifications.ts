import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { NotificationService } from "../services/notificationService";
import { WebSocketService } from "../services/websocketService";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Initialize services
const webSocketService = new WebSocketService();
const notificationService = new NotificationService(webSocketService);

// Validation schemas
const createAlertValidation = [
  body("productId").isUUID().withMessage("Valid product ID is required"),
  body("targetPrice")
    .isInt({ min: 1 })
    .withMessage("Target price must be a positive integer"),
  body("currency")
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be 3 characters"),
  body("alertType")
    .optional()
    .isIn(["below", "above", "percentage"])
    .withMessage("Alert type must be below, above, or percentage"),
  body("threshold")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Threshold must be between 1 and 100"),
];

// POST /api/notifications/alerts - Create a new price alert
router.post(
  "/alerts",
  authMiddleware.requireAuth,
  createAlertValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const userId = req.user.id;
      const { productId, targetPrice, currency, alertType, threshold } =
        req.body;

      const alert = await notificationService.createPriceAlert(
        userId,
        productId,
        targetPrice,
        currency,
        alertType,
        threshold
      );

      return res.status(201).json({
        message: "Price alert created successfully",
        alert,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// GET /api/notifications/alerts - Get user's alerts
router.get(
  "/alerts",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const alerts = await notificationService.getUserAlerts(userId);

      res.json({
        message: "Alerts retrieved successfully",
        data: alerts,
        count: alerts.length,
        statusCode: 200,
      });
    } catch (error) {
      console.error("Error retrieving alerts:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve alerts",
        statusCode: 500,
      });
    }
  }
);

// PUT /api/notifications/alerts/:alertId - Update a price alert
router.put(
  "/alerts/:alertId",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { alertId } = req.params;

      if (!alertId) {
        return res.status(400).json({
          error: "Bad request",
          message: "Alert ID is required",
        });
      }

      const updates = req.body;

      const updatedAlert = await notificationService.updatePriceAlert(
        alertId,
        userId,
        updates
      );

      return res.status(200).json({
        message: "Price alert updated successfully",
        alert: updatedAlert,
      });
    } catch (error: any) {
      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return res.status(404).json({
          error: "Not found",
          message: error.message,
        });
      }

      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// DELETE /api/notifications/alerts/:alertId - Delete a price alert
router.delete(
  "/alerts/:alertId",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { alertId } = req.params;

      if (!alertId) {
        return res.status(400).json({
          error: "Bad request",
          message: "Alert ID is required",
        });
      }

      await notificationService.deletePriceAlert(alertId, userId);

      return res.status(200).json({
        message: "Price alert deleted successfully",
      });
    } catch (error: any) {
      if (
        error.message.includes("not found") ||
        error.message.includes("access denied")
      ) {
        return res.status(404).json({
          error: "Not found",
          message: error.message,
        });
      }

      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// GET /api/notifications/preferences/:userId - Get user notification preferences
router.get(
  "/preferences/:userId",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user.id;

      if (!userId) {
        return res.status(400).json({
          error: "Bad request",
          message: "User ID is required",
        });
      }

      // Users can only access their own preferences
      if (userId !== requestingUserId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only access your own preferences",
        });
      }

      const preferences = await notificationService.getUserPreferences(userId);

      if (!preferences) {
        return res.status(404).json({
          error: "Not found",
          message: "User preferences not found",
        });
      }

      return res.status(200).json({
        preferences,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// PUT /api/notifications/preferences/:userId - Update user notification preferences
router.put(
  "/preferences/:userId",
  [
    authMiddleware.requireAuth,
    body("notificationEmail").optional().isBoolean(),
    body("notificationPush").optional().isBoolean(),
    body("quietHoursStart")
      .optional()
      .isString()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("quietHoursEnd")
      .optional()
      .isString()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("timezone").optional().isString(),
    body("language").optional().isString(),
    body("currency").optional().isString(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const { userId } = req.params;
      const requestingUserId = req.user.id;

      // Users can only update their own preferences
      if (userId !== requestingUserId) {
        return res.status(403).json({
          error: "Forbidden",
          message: "You can only update your own preferences",
        });
      }

      // Redirect to the new user preferences endpoint
      return res.status(307).json({
        message: "Please use /api/user-preferences endpoint instead",
        redirect: "/api/user-preferences",
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// GET /api/notifications/stats - Get notification statistics (admin only)
router.get(
  "/stats",
  authMiddleware.requireAdmin,
  async (_req: Request, res: Response) => {
    try {
      const stats = await notificationService.getNotificationStats();

      return res.status(200).json({
        stats,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

export default router;
