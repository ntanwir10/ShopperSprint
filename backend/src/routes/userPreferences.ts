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

// Get user search preferences
router.get(
  "/search",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const preferences = await getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      if (!preferences) {
        return res.status(404).json({
          error: "Preferences not found",
          message: "User preferences not found",
        });
      }

      // Extract search-related preferences
      const searchPreferences = {
        defaultSources: preferences.defaultSources || [],
        defaultSort: preferences.defaultSort || "price",
        defaultSortDirection: preferences.defaultSortDirection || "asc",
        defaultFilters: preferences.defaultFilters || {},
        savedSearches: preferences.savedSearches || [],
        searchHistory: preferences.searchHistory || [],
      };

      return res.status(200).json({
        searchPreferences,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Update user search preferences
router.put(
  "/search",
  authMiddleware.requireAuth,
  [
    body("defaultSources").optional().isArray(),
    body("defaultSort")
      .optional()
      .isIn(["price", "rating", "reviewCount", "lastScraped"]),
    body("defaultSortDirection").optional().isIn(["asc", "desc"]),
    body("defaultFilters").optional().isObject(),
    body("savedSearches").optional().isArray(),
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
        defaultSources,
        defaultSort,
        defaultSortDirection,
        defaultFilters,
        savedSearches,
      } = req.body;

      const preferences = await getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      if (!preferences) {
        return res.status(404).json({
          error: "Preferences not found",
          message: "User preferences not found",
        });
      }

      // Update search preferences
      const [updatedPreferences] = await getDb()
        .update(userPreferences)
        .set({
          defaultSources: defaultSources ?? null,
          defaultSort: defaultSort ?? undefined,
          defaultSortDirection: defaultSortDirection ?? undefined,
          defaultFilters: defaultFilters ?? null,
          savedSearches: savedSearches ?? [],
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();

      if (!updatedPreferences) {
        return res.status(500).json({
          error: "Internal server error",
          message: "Failed to update search preferences",
        });
      }

      return res.status(200).json({
        message: "Search preferences updated successfully",
        searchPreferences: {
          defaultSources: updatedPreferences.defaultSources,
          defaultSort: updatedPreferences.defaultSort,
          defaultSortDirection: updatedPreferences.defaultSortDirection,
          defaultFilters: updatedPreferences.defaultFilters,
          savedSearches: updatedPreferences.savedSearches,
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

// Save search to history
router.post(
  "/search/history",
  authMiddleware.requireAuth,
  [
    body("query").isString().notEmpty(),
    body("resultsCount").optional().isInt({ min: 0 }),
    body("filters").optional().isObject(),
    body("sort").optional().isObject(),
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
      const { query, resultsCount, filters, sort } = req.body;

      const preferences = await getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      if (!preferences) {
        return res.status(404).json({
          error: "Preferences not found",
          message: "User preferences not found",
        });
      }

      // Add search to history
      const searchHistory = preferences.searchHistory || [];
      const newSearchEntry = {
        query,
        resultsCount: resultsCount || 0,
        filters: filters || {},
        sort: sort || {},
        timestamp: new Date().toISOString(),
      };

      // Remove duplicates and keep only last 100 searches
      const filteredHistory = (
        Array.isArray(searchHistory) ? searchHistory : []
      )
        .filter((entry: any) => entry.query !== query)
        .slice(0, 99);

      filteredHistory.unshift(newSearchEntry);

      // Update preferences
      const [updatedPreferences] = await getDb()
        .update(userPreferences)
        .set({
          searchHistory: filteredHistory,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();

      if (!updatedPreferences) {
        return res.status(500).json({
          error: "Internal server error",
          message: "Failed to save search to history",
        });
      }

      return res.status(200).json({
        message: "Search saved to history",
        searchHistory: updatedPreferences.searchHistory,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Save search for later
router.post(
  "/search/saved",
  authMiddleware.requireAuth,
  [
    body("query").isString().notEmpty(),
    body("name").optional().isString(),
    body("filters").optional().isObject(),
    body("sort").optional().isObject(),
    body("notifyOnPriceChange").optional().isBoolean(),
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
      const { query, name, filters, sort, notifyOnPriceChange } = req.body;

      const preferences = await getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      if (!preferences) {
        return res.status(404).json({
          error: "Preferences not found",
          message: "User preferences not found",
        });
      }

      // Add saved search
      const savedSearches: any[] = Array.isArray(preferences.savedSearches)
        ? (preferences.savedSearches as any[])
        : [];
      const newSavedSearch = {
        id: Date.now().toString(),
        query,
        name: name || query,
        filters: filters || {},
        sort: sort || {},
        notifyOnPriceChange: notifyOnPriceChange || false,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };

      // Check if search already exists
      const existingIndex = savedSearches.findIndex(
        (search: any) => search.query === query
      );
      if (existingIndex >= 0) {
        savedSearches[existingIndex] = {
          ...savedSearches[existingIndex],
          ...newSavedSearch,
        };
      } else {
        savedSearches.push(newSavedSearch);
      }

      // Update preferences
      const [updatedPreferences] = await getDb()
        .update(userPreferences)
        .set({
          savedSearches,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();

      if (!updatedPreferences) {
        return res.status(500).json({
          error: "Internal server error",
          message: "Failed to save search",
        });
      }

      return res.status(200).json({
        message: "Search saved successfully",
        savedSearches: updatedPreferences.savedSearches,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Delete saved search
router.delete(
  "/search/saved/:searchId",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;
      const { searchId } = req.params;

      const preferences = await getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      if (!preferences) {
        return res.status(404).json({
          error: "Preferences not found",
          message: "User preferences not found",
        });
      }

      // Remove saved search
      const savedSearches: any[] = Array.isArray(preferences.savedSearches)
        ? (preferences.savedSearches as any[])
        : [];
      const filteredSearches = savedSearches.filter(
        (search: any) => search.id !== searchId
      );

      if (filteredSearches.length === savedSearches.length) {
        return res.status(404).json({
          error: "Search not found",
          message: "Saved search not found",
        });
      }

      // Update preferences
      const [updatedPreferences] = await getDb()
        .update(userPreferences)
        .set({
          savedSearches: filteredSearches,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();

      if (!updatedPreferences) {
        return res.status(500).json({
          error: "Internal server error",
          message: "Failed to delete saved search",
        });
      }

      return res.status(200).json({
        message: "Saved search deleted successfully",
        savedSearches: updatedPreferences.savedSearches,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Get user alert preferences
router.get(
  "/alerts",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user.id;

      const preferences = await getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      if (!preferences) {
        return res.status(404).json({
          error: "Preferences not found",
          message: "User preferences not found",
        });
      }

      // Extract alert-related preferences
      const alertPreferences = {
        notificationEmail: preferences.notificationEmail,
        notificationPush: preferences.notificationPush,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
        alertFrequency: preferences.alertFrequency || "immediate",
        priceChangeThreshold: preferences.priceChangeThreshold || 5,
        maxAlertsPerDay: preferences.maxAlertsPerDay || 10,
        alertCategories: preferences.alertCategories || [],
      };

      return res.status(200).json({
        alertPreferences,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: error.message,
      });
    }
  }
);

// Update user alert preferences
router.put(
  "/alerts",
  authMiddleware.requireAuth,
  [
    body("notificationEmail").optional().isBoolean(),
    body("notificationPush").optional().isBoolean(),
    body("quietHoursStart")
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("quietHoursEnd")
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body("alertFrequency")
      .optional()
      .isIn(["immediate", "hourly", "daily", "weekly"]),
    body("priceChangeThreshold").optional().isFloat({ min: 0, max: 100 }),
    body("maxAlertsPerDay").optional().isInt({ min: 1, max: 50 }),
    body("alertCategories").optional().isArray(),
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
        alertFrequency,
        priceChangeThreshold,
        maxAlertsPerDay,
        alertCategories,
      } = req.body;

      const preferences = await getDb().query.userPreferences.findFirst({
        where: eq(userPreferences.userId, userId),
      });

      if (!preferences) {
        return res.status(404).json({
          error: "Preferences not found",
          message: "User preferences not found",
        });
      }

      // Update alert preferences
      const [updatedPreferences] = await getDb()
        .update(userPreferences)
        .set({
          notificationEmail,
          notificationPush,
          quietHoursStart,
          quietHoursEnd,
          alertFrequency,
          priceChangeThreshold,
          maxAlertsPerDay,
          alertCategories,
          updatedAt: new Date(),
        })
        .where(eq(userPreferences.userId, userId))
        .returning();

      if (!updatedPreferences) {
        return res.status(500).json({
          error: "Internal server error",
          message: "Failed to update alert preferences",
        });
      }

      return res.status(200).json({
        message: "Alert preferences updated successfully",
        alertPreferences: {
          notificationEmail: updatedPreferences.notificationEmail,
          notificationPush: updatedPreferences.notificationPush,
          quietHoursStart: updatedPreferences.quietHoursStart,
          quietHoursEnd: updatedPreferences.quietHoursEnd,
          alertFrequency: updatedPreferences.alertFrequency,
          priceChangeThreshold: updatedPreferences.priceChangeThreshold,
          maxAlertsPerDay: updatedPreferences.maxAlertsPerDay,
          alertCategories: updatedPreferences.alertCategories,
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
