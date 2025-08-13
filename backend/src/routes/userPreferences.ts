import express, { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { getDb } from "../database/connection";
import { userPreferences } from "../database/schema";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Validation schemas
const preferencesValidation = [
  body("notificationEmail")
    .optional()
    .isBoolean()
    .withMessage("notificationEmail must be a boolean"),
  body("notificationPush")
    .optional()
    .isBoolean()
    .withMessage("notificationPush must be a boolean"),
  body("quietHoursStart")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("quietHoursStart must be in HH:MM format"),
  body("quietHoursEnd")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("quietHoursEnd must be in HH:MM format"),
  body("timezone")
    .optional()
    .isString()
    .isLength({ min: 1, max: 50 })
    .withMessage("timezone must be a string between 1 and 50 characters"),
  body("language")
    .optional()
    .isString()
    .isLength({ min: 2, max: 5 })
    .withMessage("language must be a string between 2 and 5 characters"),
  body("currency")
    .optional()
    .isString()
    .isLength({ min: 3, max: 3 })
    .withMessage("currency must be a 3-character string"),
];

// Get user preferences
router.get(
  "/",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const preferences = await getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      if (!preferences) {
        // Create default preferences if they don't exist
        const [newPreferences] = await getDb()
          .insert(userPreferences)
          .values({
            userId,
          })
          .returning();

        return res.status(200).json({
          preferences: newPreferences,
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

// Update user preferences
router.put(
  "/",
  authMiddleware.requireAuth,
  preferencesValidation,
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
      const {
        notificationEmail,
        notificationPush,
        quietHoursStart,
        quietHoursEnd,
        timezone,
        language,
        currency,
      } = req.body;

      // Check if preferences exist
      const existingPreferences = await getDb().query.userPreferences.findFirst(
        {
          where: eq(userPreferences.userId, userId),
        }
      );

      let updatedPreferences;

      if (existingPreferences) {
        // Update existing preferences
        [updatedPreferences] = await getDb()
          .update(userPreferences)
          .set({
            notificationEmail,
            notificationPush,
            quietHoursStart,
            quietHoursEnd,
            timezone,
            language,
            currency,
            updatedAt: new Date(),
          })
          .where(eq(userPreferences.userId, userId))
          .returning();
      } else {
        // Create new preferences
        [updatedPreferences] = await getDb()
          .insert(userPreferences)
          .values({
            userId,
            notificationEmail,
            notificationPush,
            quietHoursStart,
            quietHoursEnd,
            timezone,
            language,
            currency,
          })
          .returning();
      }

      return res.status(200).json({
        message: "Preferences updated successfully",
        preferences: updatedPreferences,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Patch user preferences (partial update)
router.patch(
  "/",
  authMiddleware.requireAuth,
  preferencesValidation,
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
      const updateData = req.body;

      // Check if preferences exist
      const existingPreferences = await getDb().query.userPreferences.findFirst(
        {
          where: eq(userPreferences.userId, userId),
        }
      );

      let updatedPreferences;

      if (existingPreferences) {
        // Update existing preferences with only provided fields
        [updatedPreferences] = await getDb()
          .update(userPreferences)
          .set({
            ...updateData,
            updatedAt: new Date(),
          })
          .where(eq(userPreferences.userId, userId))
          .returning();
      } else {
        // Create new preferences with provided fields and defaults
        [updatedPreferences] = await getDb()
          .insert(userPreferences)
          .values({
            userId,
            ...updateData,
            notificationEmail: updateData.notificationEmail ?? true,
            notificationPush: updateData.notificationPush ?? true,
            timezone: updateData.timezone ?? "UTC",
            language: updateData.language ?? "en",
            currency: updateData.currency ?? "USD",
          })
          .returning();
      }

      return res.status(200).json({
        message: "Preferences updated successfully",
        preferences: updatedPreferences,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Reset preferences to defaults
router.delete(
  "/",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      // Reset to default values
      const [resetPreferences] = await getDb()
        .update(userPreferences)
        .set({
          notificationEmail: true,
          notificationPush: true,
          quietHoursStart: null,
          quietHoursEnd: null,
          timezone: "UTC",
          language: "en",
          currency: "USD",
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();

      return res.status(200).json({
        message: "Preferences reset to defaults successfully",
        preferences: resetPreferences,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Get notification settings
router.get(
  "/notification-settings",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const preferences = await getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      if (!preferences) {
        return res.status(404).json({
          error: "Not found",
          message: "User preferences not found",
        });
      }

      return res.status(200).json({
        notificationSettings: {
          notificationEmail: preferences.notificationEmail,
          notificationPush: preferences.notificationPush,
          quietHoursStart: preferences.quietHoursStart,
          quietHoursEnd: preferences.quietHoursEnd,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Update notification settings
router.put(
  "/notification-settings",
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

      const userId = req.user.id;
      const {
        notificationEmail,
        notificationPush,
        quietHoursStart,
        quietHoursEnd,
      } = req.body;

      // Check if preferences exist
      const existingPreferences = await getDb().query.userPreferences.findFirst(
        {
          where: eq(userPreferences.userId, userId),
        }
      );

      let updatedPreferences;

      if (existingPreferences) {
        // Update existing preferences
        [updatedPreferences] = await getDb()
          .update(userPreferences)
          .set({
            notificationEmail,
            notificationPush,
            quietHoursStart,
            quietHoursEnd,
            updatedAt: new Date(),
          })
          .where(eq(userPreferences.userId, userId))
          .returning();
      } else {
        // Create new preferences
        [updatedPreferences] = await getDb()
          .insert(userPreferences)
          .values({
            userId,
            notificationEmail,
            notificationPush,
            quietHoursStart,
            quietHoursEnd,
            timezone: "UTC",
            language: "en",
            currency: "USD",
          })
          .returning();
      }

      if (!updatedPreferences) {
        return res.status(500).json({
          error: "Internal server error",
          message: "Failed to update notification settings",
        });
      }

      return res.status(200).json({
        message: "Notification settings updated successfully",
        notificationSettings: {
          notificationEmail: updatedPreferences.notificationEmail,
          notificationPush: updatedPreferences.notificationPush,
          quietHoursStart: updatedPreferences.quietHoursStart,
          quietHoursEnd: updatedPreferences.quietHoursEnd,
        },
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

export { router as userPreferencesRouter };
