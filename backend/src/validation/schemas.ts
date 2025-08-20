import { z } from "zod";

// Security-focused validation helpers
const createSanitizedString = (
  options: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    allowEmpty?: boolean;
  } = {}
) => {
  let schema = z.string();

  if (!options.allowEmpty) {
    schema = schema.min(options.minLength || 1, "Field cannot be empty");
  }

  if (options.maxLength) {
    schema = schema.max(
      options.maxLength,
      `Field cannot exceed ${options.maxLength} characters`
    );
  }

  if (options.pattern) {
    schema = schema.regex(options.pattern, "Invalid format");
  }

  // Remove potential XSS and injection patterns
  return schema.transform((val) => {
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove script tags
      .replace(/javascript:/gi, "") // Remove javascript: protocols
      .replace(/on\w+\s*=/gi, "") // Remove event handlers
      .replace(/[<>]/g, "") // Remove angle brackets
      .trim();
  });
};

const securePasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain uppercase, lowercase, and number"
  );

const secureEmailSchema = z
  .string()
  .email("Invalid email format")
  .max(254, "Email too long")
  .transform((val) => val.toLowerCase().trim());

const secureUsernameSchema = createSanitizedString({
  minLength: 3,
  maxLength: 30,
  pattern: /^[a-zA-Z0-9_-]+$/,
});

// SQL injection prevention for search queries
const secureSqlString = (minLength: number = 1) =>
  createSanitizedString({
    minLength,
    maxLength: 500,
  }).transform((val) => {
    // Remove SQL injection patterns
    return val
      .replace(/['";\\]/g, "") // Remove quotes and backslashes
      .replace(
        /\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi,
        ""
      ); // Remove SQL keywords
  });

// User Authentication & Registration schemas
export const userRegistrationSchema = z.object({
  email: secureEmailSchema,
  username: secureUsernameSchema,
  password: securePasswordSchema,
  firstName: createSanitizedString({
    maxLength: 50,
    allowEmpty: true,
  }).optional(),
  lastName: createSanitizedString({
    maxLength: 50,
    allowEmpty: true,
  }).optional(),
});

export const userLoginSchema = z.object({
  email: secureEmailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password too long"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: securePasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const updateProfileSchema = z
  .object({
    firstName: createSanitizedString({
      maxLength: 50,
      allowEmpty: true,
    }).optional(),
    lastName: createSanitizedString({
      maxLength: 50,
      allowEmpty: true,
    }).optional(),
  })
  .strict(); // Prevent additional fields

export const passwordResetRequestSchema = z.object({
  email: secureEmailSchema,
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: securePasswordSchema,
});

export const emailVerificationSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

// JWT and session validation
export const jwtTokenSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// Search API schemas (updated with security)
export const searchRequestSchema = z.object({
  query: secureSqlString(3), // Minimum 3 characters for search query
  sources: z.array(z.string().max(50)).max(10).optional(), // Limit sources
  maxResults: z.number().min(1).max(100).optional().default(50),
});

export const searchResponseSchema = z.object({
  searchId: z.string().uuid(),
  results: z.array(
    z.object({
      id: z.string().uuid(),
      name: z.string(),
      price: z.number(),
      currency: z.string(),
      availability: z.enum(["in_stock", "out_of_stock", "limited", "unknown"]),
      source: z.string(),
      imageUrl: z.string().url().optional(),
      rating: z.number().min(0).max(5).optional(),
      reviewCount: z.number().min(0).optional(),
      url: z.string().url(),
      lastScraped: z.string().datetime(),
    })
  ),
  metadata: z.object({
    totalSources: z.number(),
    successfulSources: z.number(),
    searchDuration: z.number(),
    cacheHit: z.boolean(),
  }),
});

// Refresh Prices API schemas
export const refreshPricesRequestSchema = z.object({
  searchId: z.string().uuid(),
  productIds: z.array(z.string().uuid()),
});

export const refreshPricesResponseSchema = z.object({
  jobId: z.string().uuid(),
  estimatedCompletion: z.string().datetime(),
});

// Advertisement API schemas
export const advertisementRequestSchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  placement: z.enum(["banner", "sponsored-listing"]),
});

export const advertisementResponseSchema = z.object({
  ads: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      description: z.string(),
      imageUrl: z.string().url(),
      targetUrl: z.string().url(),
      category: z.string(),
    })
  ),
});

export const advertisementTrackRequestSchema = z.object({
  adId: z.string().uuid(),
  event: z.enum(["impression", "click"]),
  searchId: z.string().uuid().optional(),
});

// Notification and Price Alert schemas
export const priceAlertCreateSchema = z.object({
  productId: z.string().uuid(),
  targetPrice: z.number().positive("Target price must be positive"),
  condition: z.enum(["below", "above", "equals"]),
  email: secureEmailSchema.optional(),
  isAnonymous: z.boolean().optional().default(false),
});

export const priceAlertUpdateSchema = z
  .object({
    targetPrice: z
      .number()
      .positive("Target price must be positive")
      .optional(),
    condition: z.enum(["below", "above", "equals"]).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export const anonymousPriceAlertSchema = z.object({
  productId: z.string().uuid(),
  email: secureEmailSchema,
  targetPrice: z.number().positive("Target price must be positive"),
  condition: z.enum(["below", "above", "equals"]).default("below"),
});

export const verifyAnonymousAlertSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

export const manageAnonymousAlertSchema = z.object({
  token: z.string().min(1, "Management token is required"),
  action: z.enum(["activate", "deactivate", "delete"]),
});

// Preference schemas
export const userPreferencesSchema = z
  .object({
    emailNotifications: z.boolean().optional(),
    priceAlertFrequency: z.enum(["instant", "daily", "weekly"]).optional(),
    currency: z.string().length(3).optional(), // ISO currency codes
    language: z.string().length(2).optional(), // ISO language codes
  })
  .strict();

// Rate limiting and security schemas
export const rateLimitBypassSchema = z.object({
  bypassToken: z.string().optional(),
  reason: createSanitizedString({ maxLength: 100 }).optional(),
});

// WebSocket message validation
export const webSocketMessageSchema = z.object({
  type: z.enum([
    "auth",
    "ping",
    "subscribe",
    "unsubscribe",
    "subscribe_product",
    "unsubscribe_product",
    "subscribe_user",
    "unsubscribe_user",
  ]),
  token: z.string().optional(),
  searchId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  data: z.any().optional(),
});

// Product schemas
export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  normalizedName: z.string(),
  category: z.string().optional(),
  specifications: z.record(z.any()).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const productListingSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  sourceId: z.string().uuid(),
  url: z.string().url(),
  price: z.number(),
  currency: z.string(),
  availability: z.enum(["in_stock", "out_of_stock", "limited", "unknown"]),
  imageUrl: z.string().url().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().min(0).optional(),
  lastScraped: z.string().datetime(),
  isValid: z.boolean(),
});

// Source schemas
export const sourceSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: z.enum(["popular", "alternative"]),
  isActive: z.boolean(),
  lastSuccessfulScrape: z.string().datetime().optional(),
  errorCount: z.number(),
  averageResponseTime: z.number().optional(),
  configuration: z.record(z.any()),
});

// Error response schema
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  timestamp: z.string().datetime(),
});

// Success response schema
export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.any().optional(),
});

// Type exports
export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;
export type RefreshPricesRequest = z.infer<typeof refreshPricesRequestSchema>;
export type RefreshPricesResponse = z.infer<typeof refreshPricesResponseSchema>;
export type AdvertisementRequest = z.infer<typeof advertisementRequestSchema>;
export type AdvertisementResponse = z.infer<typeof advertisementResponseSchema>;
export type AdvertisementTrackRequest = z.infer<
  typeof advertisementTrackRequestSchema
>;
export type Product = z.infer<typeof productSchema>;
export type ProductListing = z.infer<typeof productListingSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type SuccessResponse = z.infer<typeof successResponseSchema>;

// New security and validation types
export type UserRegistration = z.infer<typeof userRegistrationSchema>;
export type UserLogin = z.infer<typeof userLoginSchema>;
export type ChangePassword = z.infer<typeof changePasswordSchema>;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;
export type PasswordResetRequest = z.infer<typeof passwordResetRequestSchema>;
export type PasswordReset = z.infer<typeof passwordResetSchema>;
export type EmailVerification = z.infer<typeof emailVerificationSchema>;
export type JwtToken = z.infer<typeof jwtTokenSchema>;
export type PriceAlertCreate = z.infer<typeof priceAlertCreateSchema>;
export type PriceAlertUpdate = z.infer<typeof priceAlertUpdateSchema>;
export type AnonymousPriceAlert = z.infer<typeof anonymousPriceAlertSchema>;
export type VerifyAnonymousAlert = z.infer<typeof verifyAnonymousAlertSchema>;
export type ManageAnonymousAlert = z.infer<typeof manageAnonymousAlertSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type RateLimitBypass = z.infer<typeof rateLimitBypassSchema>;
export type WebSocketMessage = z.infer<typeof webSocketMessageSchema>;
