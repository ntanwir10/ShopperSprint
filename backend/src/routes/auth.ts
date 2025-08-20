import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import { AuthService } from "../services/authService";
import { authMiddleware } from "../middleware/authMiddleware";
import { oauthService } from "../services/oauthService";

const router = Router();
const authService = new AuthService();

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const registerValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("username")
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username must be 3-30 characters and contain only letters, numbers, and underscores"
    ),
  body("password")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must be at least 8 characters with at least one lowercase letter, one uppercase letter, and one number"
    ),
  body("firstName").optional().trim().isLength({ max: 50 }),
  body("lastName").optional().trim().isLength({ max: 50 }),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const profileUpdateValidation = [
  body("firstName").optional().trim().isLength({ max: 50 }),
  body("lastName").optional().trim().isLength({ max: 50 }),
];

const passwordChangeValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must be at least 8 characters with at least one lowercase letter, one uppercase letter, and one number"
    ),
];

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  "/register",
  authLimiter,
  registerValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const userData = req.body;
      const result = await authService.registerUser(userData);

      return res.status(201).json({
        message: "User registered successfully",
        user: result.user,
        token: result.token,
        expiresAt: result.expiresAt,
      });
    } catch (error: any) {
      if (
        error.message.includes("already exists") ||
        error.message.includes("already taken")
      ) {
        return res.status(409).json({
          error: "Registration failed",
          message: error.message,
        });
      }

      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to register user",
      });
    }
  }
);

/**
 * POST /api/auth/login
 * Authenticate user login
 */
router.post(
  "/login",
  authLimiter,
  loginValidation,
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const loginData = req.body;
      const result = await authService.loginUser(loginData);

      return res.status(200).json({
        message: "Login successful",
        user: result.user,
        token: result.token,
        expiresAt: result.expiresAt,
      });
    } catch (error: any) {
      if (
        error.message.includes("Invalid email or password") ||
        error.message.includes("deactivated")
      ) {
        return res.status(401).json({
          error: "Authentication failed",
          message: error.message,
        });
      }

      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to authenticate user",
      });
    }
  }
);

// OAuth start endpoints
router.get("/oauth/google", async (_req: Request, res: Response) => {
  try {
    const { url } = await oauthService.startAuth("google");
    res.redirect(url);
  } catch (e) {
    console.error("OAuth start (google) failed", e);
    res.status(500).json({ error: "OAuthStartFailed" });
  }
});

router.get("/oauth/apple", async (_req: Request, res: Response) => {
  try {
    const { url } = await oauthService.startAuth("apple");
    res.redirect(url);
  } catch (e) {
    console.error("OAuth start (apple) failed", e);
    res.status(500).json({ error: "OAuthStartFailed" });
  }
});

// OAuth callback endpoints
router.get("/oauth/google/callback", async (req: Request, res: Response) => {
  try {
    const { token, expiresAt } = await oauthService.handleCallback("google", {
      code: req.query["code"] as string,
      state: req.query["state"] as string,
    });
    const frontendUrl = process.env["FRONTEND_URL"] || "http://localhost:5173";
    const redirect = new URL("/oauth/callback", frontendUrl);
    redirect.searchParams.set("token", token);
    redirect.searchParams.set("expiresAt", expiresAt);
    res.redirect(redirect.toString());
  } catch (e) {
    console.error("OAuth callback (google) failed", e);
    res.status(400).json({ error: "OAuthCallbackFailed" });
  }
});

router.get("/oauth/apple/callback", async (req: Request, res: Response) => {
  try {
    const { token, expiresAt } = await oauthService.handleCallback("apple", {
      code: req.query["code"] as string,
      state: req.query["state"] as string,
    });
    const frontendUrl = process.env["FRONTEND_URL"] || "http://localhost:5173";
    const redirect = new URL("/oauth/callback", frontendUrl);
    redirect.searchParams.set("token", token);
    redirect.searchParams.set("expiresAt", expiresAt);
    res.redirect(redirect.toString());
  } catch (e) {
    console.error("OAuth callback (apple) failed", e);
    res.status(400).json({ error: "OAuthCallbackFailed" });
  }
});

/**
 * POST /api/auth/request-password-reset
 */
router.post(
  "/request-password-reset",
  [body("email").isEmail()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
      }
      const ok = await authService.sendPasswordResetEmail(req.body.email);
      return res.json({ success: ok });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  }
);

/**
 * POST /api/auth/reset-password
 */
router.post(
  "/reset-password",
  [body("token").isString(), body("password").isLength({ min: 8 })],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
      }
      const { token, password } = req.body;
      const ok = await authService.resetPassword(token, password);
      if (!ok)
        return res
          .status(400)
          .json({ error: "ResetFailed", message: "Invalid or expired token" });
      return res.json({ success: true });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  }
);

/**
 * POST /api/auth/verify-email
 */
router.post(
  "/verify-email",
  [body("token").isString()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ error: "Validation failed", details: errors.array() });
      }
      const ok = await authService.verifyEmail(req.body.token);
      if (!ok)
        return res.status(400).json({
          error: "VerificationFailed",
          message: "Invalid or expired token",
        });
      return res.json({ success: true });
    } catch (error: any) {
      return res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    }
  }
);

/**
 * POST /api/auth/logout
 * Logout user (invalidate session)
 */
router.post(
  "/logout",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ")
        ? authHeader.substring(7)
        : authHeader;

      if (token) {
        await authService.logoutUser(token);
      }

      res.json({
        message: "Logout successful",
        statusCode: 200,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to logout",
        statusCode: 500,
      });
    }
  }
);

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get(
  "/profile",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = req.user;

      res.json({
        message: "Profile retrieved successfully",
        data: user,
        statusCode: 200,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to retrieve profile",
        statusCode: 500,
      });
    }
  }
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  "/profile",
  authMiddleware.requireAuth,
  profileUpdateValidation,
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
      const updates = req.body;
      const updatedProfile = await authService.updateUserProfile(
        userId,
        updates
      );

      return res.status(200).json({
        message: "Profile updated successfully",
        user: updatedProfile,
      });
    } catch (error: any) {
      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to update profile",
      });
    }
  }
);

/**
 * PUT /api/auth/change-password
 * Change user password
 */
router.put(
  "/change-password",
  authMiddleware.requireAuth,
  passwordChangeValidation,
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
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(userId, currentPassword, newPassword);

      return res.status(200).json({
        message: "Password changed successfully",
      });
    } catch (error: any) {
      if (error.message.includes("Current password is incorrect")) {
        return res.status(400).json({
          error: "Password change failed",
          message: error.message,
        });
      }

      return res.status(500).json({
        error: "Internal server error",
        message: "Failed to change password",
      });
    }
  }
);

/**
 * GET /api/auth/verify
 * Verify authentication token
 */
router.get(
  "/verify",
  authMiddleware.requireAuth,
  async (req: Request, res: Response) => {
    try {
      res.json({
        message: "Token is valid",
        data: {
          user: req.user,
          valid: true,
        },
        statusCode: 200,
      });
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to verify token",
        statusCode: 500,
      });
    }
  }
);

export { router as authRouter };
