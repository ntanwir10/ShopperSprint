import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { AnonymousNotificationService } from "../services/anonymousNotificationService";
import { EmailService } from "../services/emailService";

const router = express.Router();

// Initialize services
const anonymousNotificationService = new AnonymousNotificationService();
const emailService = new EmailService();

// Validation schemas
const createAlertValidation = [
  body("email").isEmail().withMessage("Valid email address is required"),
  body("productId").isUUID().withMessage("Valid product ID is required"),
  body("targetPrice")
    .isFloat({ min: 0.01 })
    .withMessage("Target price must be a positive number"),
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
    .isFloat({ min: 0.1, max: 100 })
    .withMessage("Threshold must be between 0.1 and 100"),
];

const updateAlertValidation = [
  body("targetPrice")
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage("Target price must be a positive number"),
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
    .isFloat({ min: 0.1, max: 100 })
    .withMessage("Threshold must be between 0.1 and 100"),
  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

// POST /api/anonymous-notifications/alerts - Create a new anonymous price alert
router.post(
  "/alerts",
  createAlertValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Invalid request data",
          details: errors.array(),
          statusCode: 400,
        });
      }

      const { email, productId, targetPrice, currency, alertType, threshold } =
        req.body;

      // Convert target price to cents
      const targetPriceInCents = Math.round(targetPrice * 100);

      const alert = await anonymousNotificationService.createAnonymousAlert({
        email,
        productId,
        targetPrice: targetPriceInCents,
        currency,
        alertType,
        threshold,
      });

      return res.status(201).json({
        message:
          "Price alert created successfully. Please check your email to verify.",
        alertId: alert.id,
        statusCode: 201,
        data: {
          id: alert.id,
          email: alert.email,
          targetPrice: alert.targetPrice / 100, // Convert back to dollars for response
          currency: alert.currency,
          alertType: alert.alertType,
          threshold: alert.threshold,
          isVerified: alert.isVerified,
        },
      });
    } catch (error: any) {
      console.error("Error creating anonymous alert:", error);

      if (error.message === "Product not found") {
        return res.status(404).json({
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        });
      }

      if (
        error.message === "You already have an active alert for this product"
      ) {
        return res.status(409).json({
          error: "Conflict",
          message: error.message,
          statusCode: 409,
        });
      }

      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to create price alert",
        statusCode: 500,
      });
    }
  }
);

// GET /api/anonymous-notifications/verify/:verificationToken - Verify an anonymous price alert
router.get(
  "/verify/:verificationToken",
  async (req: Request, res: Response) => {
    try {
      const { verificationToken } = req.params as { verificationToken: string };

      if (!verificationToken) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Verification token is required",
          statusCode: 400,
        });
      }

      const alert = await anonymousNotificationService.verifyAlert(
        verificationToken
      );

      return res.status(200).json({
        message: "Price alert verified successfully!",
        statusCode: 200,
        data: {
          id: alert.id,
          email: alert.email,
          targetPrice: alert.targetPrice / 100,
          currency: alert.currency,
          alertType: alert.alertType,
          threshold: alert.threshold,
          isVerified: alert.isVerified,
          managementToken: alert.managementToken,
        },
      });
    } catch (error: any) {
      console.error("Error verifying alert:", error);

      if (error.message === "Invalid verification token") {
        return res.status(400).json({
          error: "Bad Request",
          message: error.message,
          statusCode: 400,
        });
      }

      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify alert",
        statusCode: 500,
      });
    }
  }
);

// GET /api/anonymous-notifications/alerts/:managementToken - Get alert details for management
router.get("/alerts/:managementToken", async (req: Request, res: Response) => {
  try {
    const { managementToken } = req.params as { managementToken: string };

    if (!managementToken) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Management token is required",
        statusCode: 400,
      });
    }

    const alert = await anonymousNotificationService.getAlertByManagementToken(
      managementToken
    );

    if (!alert) {
      return res.status(404).json({
        error: "Not Found",
        message: "Alert not found",
        statusCode: 404,
      });
    }

    return res.status(200).json({
      message: "Alert retrieved successfully",
      statusCode: 200,
      data: {
        id: alert.id,
        email: alert.email,
        targetPrice: alert.targetPrice / 100,
        currency: alert.currency,
        alertType: alert.alertType,
        threshold: alert.threshold,
        isVerified: alert.isVerified,
        isActive: alert.isActive,
        createdAt: alert.createdAt,
        updatedAt: alert.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Error retrieving alert:", error);

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve alert",
      statusCode: 500,
    });
  }
});

// PUT /api/anonymous-notifications/alerts/:managementToken - Update an anonymous price alert
router.put(
  "/alerts/:managementToken",
  updateAlertValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Invalid request data",
          details: errors.array(),
          statusCode: 400,
        });
      }

      const { managementToken } = req.params as { managementToken: string };
      const updates = req.body;

      // Convert target price to cents if provided
      if (updates.targetPrice) {
        updates.targetPrice = Math.round(updates.targetPrice * 100);
      }

      const updatedAlert = await anonymousNotificationService.updateAlert(
        managementToken,
        updates
      );

      return res.status(200).json({
        message: "Price alert updated successfully",
        statusCode: 200,
        data: {
          id: updatedAlert.id,
          email: updatedAlert.email,
          targetPrice: updatedAlert.targetPrice / 100,
          currency: updatedAlert.currency,
          alertType: updatedAlert.alertType,
          threshold: updatedAlert.threshold,
          isVerified: updatedAlert.isVerified,
          isActive: updatedAlert.isActive,
          updatedAt: updatedAlert.updatedAt,
        },
      });
    } catch (error: any) {
      console.error("Error updating alert:", error);

      if (error.message === "Alert not found") {
        return res.status(404).json({
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        });
      }

      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update alert",
        statusCode: 500,
      });
    }
  }
);

// DELETE /api/anonymous-notifications/alerts/:managementToken - Delete an anonymous price alert
router.delete(
  "/alerts/:managementToken",
  async (req: Request, res: Response) => {
    try {
      const { managementToken } = req.params as { managementToken: string };

      if (!managementToken) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Management token is required",
          statusCode: 400,
        });
      }

      await anonymousNotificationService.deleteAlert(managementToken);

      return res.status(200).json({
        message: "Price alert deleted successfully",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Error deleting alert:", error);

      if (error.message === "Alert not found") {
        return res.status(404).json({
          error: "Not Found",
          message: error.message,
          statusCode: 404,
        });
      }

      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to delete alert",
        statusCode: 500,
      });
    }
  }
);

// POST /api/anonymous-notifications/alerts/:managementToken/resend-verification - Resend verification email
router.post(
  "/alerts/:managementToken/resend-verification",
  async (req: Request, res: Response) => {
    try {
      const { managementToken } = req.params as { managementToken: string };

      if (!managementToken) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Management token is required",
          statusCode: 400,
        });
      }

      const alert =
        await anonymousNotificationService.getAlertByManagementToken(
          managementToken
        );

      if (!alert) {
        return res.status(404).json({
          error: "Not Found",
          message: "Alert not found",
          statusCode: 404,
        });
      }

      if (alert.isVerified) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Alert is already verified",
          statusCode: 400,
        });
      }

      // Resend verification email
      await emailService.sendVerificationEmail(alert);

      return res.status(200).json({
        message: "Verification email sent successfully",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Error resending verification email:", error);

      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to resend verification email",
        statusCode: 500,
      });
    }
  }
);

// POST /api/anonymous-notifications/alerts/:managementToken/send-management-link - Send management link email
router.post(
  "/alerts/:managementToken/send-management-link",
  async (req: Request, res: Response) => {
    try {
      const { managementToken } = req.params as { managementToken: string };

      if (!managementToken) {
        return res.status(400).json({
          error: "Bad Request",
          message: "Management token is required",
          statusCode: 400,
        });
      }

      const alert =
        await anonymousNotificationService.getAlertByManagementToken(
          managementToken
        );

      if (!alert) {
        return res.status(404).json({
          error: "Not Found",
          message: "Alert not found",
          statusCode: 404,
        });
      }

      // Send management link email
      await emailService.sendManagementLinkEmail(alert);

      return res.status(200).json({
        message: "Management link email sent successfully",
        statusCode: 200,
      });
    } catch (error: any) {
      console.error("Error sending management link email:", error);

      return res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to send management link email",
        statusCode: 500,
      });
    }
  }
);

// GET /api/anonymous-notifications/stats - Get notification statistics (public endpoint)
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const stats = await anonymousNotificationService.getNotificationStats();

    return res.status(200).json({
      message: "Statistics retrieved successfully",
      statusCode: 200,
      data: stats,
    });
  } catch (error: any) {
    console.error("Error retrieving notification stats:", error);

    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to retrieve statistics",
      statusCode: 500,
    });
  }
});

// POST /api/anonymous-notifications/test-email - Test email service (non-production)
const isNonProd = (process.env["NODE_ENV"] || "development") !== "production";
if (isNonProd) {
  router.post(
    "/test-email",
    [body("email").isEmail().withMessage("Valid email address is required")],
    async (req: Request, res: Response) => {
      try {
        // First verify transport to surface clear errors
        const verify = await emailService.verifyConnection();
        if (!verify.ok) {
          return res.status(500).json({
            error: "SMTPVerifyFailed",
            message: verify.error || "SMTP verify failed",
            statusCode: 500,
          });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            error: "Validation failed",
            message: "Invalid request data",
            details: errors.array(),
            statusCode: 400,
          });
        }

        const { email } = req.body as { email: string };

        await emailService.sendTestEmail(
          email,
          "PricePulse Test Email",
          "This is a test email from PricePulse."
        );

        return res.status(200).json({
          message: "Test email sent successfully",
          statusCode: 200,
        });
      } catch (error: any) {
        console.error("Error sending test email:", error);

        return res.status(500).json({
          error: "Internal Server Error",
          message: "Failed to send test email",
          statusCode: 500,
        });
      }
    }
  );
}

export default router;
