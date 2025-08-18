import { getDb } from "../database/connection";
import { users, userSessions, userPreferences } from "../database/schema";
import { eq, lt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { EmailService } from "./emailService";
import { auditService } from "./auditService";

export interface UserRegistrationData {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  role: "user" | "admin" | "moderator";
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  expiresAt: string;
}

export class AuthService {
  private emailService: EmailService | null = null;
  private readonly MAX_CONCURRENT_SESSIONS = 5; // Maximum sessions per user

  constructor() {
    try {
      this.emailService = new EmailService();
    } catch (error) {
      console.warn(
        "Email service initialization failed, continuing without email:",
        error
      );
      this.emailService = null;
    }
  }

  /**
   * Register a new user
   */
  async registerUser(
    userData: UserRegistrationData,
    ipAddress?: string
  ): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await getDb().query.users.findFirst({
        where: eq(users.email, userData.email),
      });

      if (existingUser) {
        await auditService.logAuthEvent(
          "registration",
          undefined,
          ipAddress,
          undefined,
          false,
          "Email already registered"
        );
        throw new Error("Email is already registered");
      }

      const existingUsername = await getDb().query.users.findFirst({
        where: eq(users.username, userData.username),
      });

      if (existingUsername) {
        throw new Error("Username is already taken");
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Create user
      const [newUser] = await getDb()
        .insert(users)
        .values({
          email: userData.email,
          username: userData.username,
          passwordHash,
          firstName: userData.firstName || null,
          lastName: userData.lastName || null,
          emailVerified: false,
          verificationToken,
          verificationExpires,
        })
        .returning();

      if (!newUser) {
        throw new Error("Failed to create user");
      }

      // Create default user preferences
      await getDb().insert(userPreferences).values({
        userId: newUser.id,
      });

      // Send verification email
      try {
        if (this.emailService) {
          const payload: { email: string; token: string; firstName?: string } =
            {
              email: userData.email,
              token: verificationToken,
            };
          if (userData.firstName) payload.firstName = userData.firstName;
          await this.emailService.sendUserVerificationEmail(payload);
        }
      } catch (error) {
        console.error("Failed to send verification email:", error);
      }

      // Generate JWT token and session
      const token = this.generateJWT(newUser.id);
      const expiresAtDate = this.calculateExpiryDate();

      // Enforce session limits before creating new session
      await this.enforceSessionLimit(newUser.id);

      // Store session
      await getDb().insert(userSessions).values({
        userId: newUser.id,
        token,
        expiresAt: expiresAtDate,
      });

      // Update last login
      await getDb()
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, newUser.id));

      // Log successful registration
      await auditService.logAuthEvent(
        "registration",
        newUser.id,
        ipAddress,
        undefined,
        true
      );

      return {
        user: this.mapToUserProfile(newUser),
        token,
        expiresAt: expiresAtDate.toISOString(),
      };
    } catch (error) {
      // Log failed registration
      await auditService.logAuthEvent(
        "registration",
        undefined,
        ipAddress,
        undefined,
        false,
        error instanceof Error ? error.message : "Unknown error"
      );
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  async loginUser(
    loginData: UserLoginData,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await getDb().query.users.findFirst({
        where: eq(users.email, loginData.email),
      });

      if (!user) {
        await auditService.logAuthEvent(
          "failed_login",
          undefined,
          ipAddress,
          userAgent,
          false,
          "User not found"
        );
        throw new Error("Invalid email or password");
      }

      if (!user.isActive) {
        throw new Error("Account is deactivated");
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(
        loginData.password,
        user.passwordHash
      );
      if (!isPasswordValid) {
        await auditService.logAuthEvent(
          "failed_login",
          user.id,
          ipAddress,
          userAgent,
          false,
          "Invalid password"
        );
        throw new Error("Invalid email or password");
      }

      // Generate JWT token and session
      const token = this.generateJWT(user.id);
      const expiresAtDate = this.calculateExpiryDate();

      // Enforce session limits before creating new session
      await this.enforceSessionLimit(user.id);

      // Store session
      await getDb().insert(userSessions).values({
        userId: user.id,
        token,
        expiresAt: expiresAtDate,
      });

      // Update last login
      await getDb()
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, user.id));

      // Log successful login
      await auditService.logAuthEvent(
        "login",
        user.id,
        ipAddress,
        userAgent,
        true
      );

      return {
        user: this.mapToUserProfile(user),
        token,
        expiresAt: expiresAtDate.toISOString(),
      };
    } catch (error) {
      // Additional error logging if not already logged
      if (
        error instanceof Error &&
        !error.message.includes("Invalid email or password") &&
        !error.message.includes("Account is deactivated")
      ) {
        await auditService.logAuthEvent(
          "failed_login",
          undefined,
          ipAddress,
          userAgent,
          false,
          error.message
        );
      }
      throw error;
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const secret = process.env["JWT_SECRET"];

      // Enforce secure JWT secret in all environments
      if (!secret) {
        throw new Error("JWT_SECRET environment variable is required");
      }

      // Check for insecure default secrets
      if (
        secret === "your-secret-key-change-in-production" ||
        secret === "dev-secret" ||
        secret.length < 32
      ) {
        throw new Error(
          "JWT_SECRET must be a secure secret of at least 32 characters"
        );
      }

      const decoded = jwt.verify(token, secret as jwt.Secret) as {
        userId: string;
      };
      return decoded;
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  /**
   * Validate JWT token and get user
   */
  async validateToken(token: string): Promise<UserProfile | null> {
    try {
      const secret = process.env["JWT_SECRET"];

      // Enforce secure JWT secret in all environments
      if (!secret) {
        return null;
      }

      // Check for insecure default secrets
      if (
        secret === "your-secret-key-change-in-production" ||
        secret === "dev-secret" ||
        secret.length < 32
      ) {
        return null;
      }

      const decoded = jwt.verify(token, secret as jwt.Secret) as {
        userId: string;
      };

      // Check if session exists and is active
      const session = await getDb().query.userSessions.findFirst({
        where: eq(userSessions.token, token),
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return null;
      }

      // Get user profile
      const user = await getDb().query.users.findFirst({
        where: eq(users.id, decoded.userId),
      });

      if (!user || !user.isActive) {
        return null;
      }

      return this.mapToUserProfile(user);
    } catch (error) {
      return null;
    }
  }

  /**
   * Logout user by invalidating session
   */
  async logoutUser(token: string): Promise<void> {
    await getDb()
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.token, token));
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const user = await getDb().query.users.findFirst({
      where: eq(users.id, userId),
    });

    return user ? this.mapToUserProfile(user) : null;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const allowedUpdates: any = {};

    if (updates.firstName !== undefined) {
      allowedUpdates.firstName = updates.firstName || null;
    }
    if (updates.lastName !== undefined) {
      allowedUpdates.lastName = updates.lastName || null;
    }

    const [updatedUser] = await getDb()
      .update(users)
      .set({
        ...allowedUpdates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      throw new Error("Failed to update user profile");
    }

    return this.mapToUserProfile(updatedUser);
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await getDb().query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isCurrentPasswordValid) {
      throw new Error("Current password is incorrect");
    }

    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await getDb()
      .update(users)
      .set({
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Revoke all existing sessions for this user
    await getDb()
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  }

  /**
   * Enforce concurrent session limits per user
   * Security: Prevent session hijacking and limit concurrent sessions
   */
  private async enforceSessionLimit(userId: string): Promise<void> {
    // Get all active sessions for the user, ordered by creation time (newest first)
    const activeSessions = await getDb().query.userSessions.findMany({
      where: eq(userSessions.userId, userId),
      orderBy: [userSessions.createdAt],
    });

    // Filter for truly active sessions (not expired and active)
    const now = new Date();
    const validSessions = activeSessions.filter(
      (session) => session.isActive && session.expiresAt > now
    );

    // If we're at or over the limit, deactivate the oldest sessions
    if (validSessions.length >= this.MAX_CONCURRENT_SESSIONS) {
      const sessionsToDeactivate = validSessions.slice(
        0,
        validSessions.length - this.MAX_CONCURRENT_SESSIONS + 1
      );

      for (const session of sessionsToDeactivate) {
        await getDb()
          .update(userSessions)
          .set({ isActive: false })
          .where(eq(userSessions.id, session.id));
      }

      console.log(
        `Deactivated ${sessionsToDeactivate.length} old sessions for user ${userId}`
      );
    }
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    // Deactivate all sessions that are expired
    const now = new Date();
    await getDb()
      .update(userSessions)
      .set({ isActive: false })
      .where(lt(userSessions.expiresAt, now));
  }

  /**
   * Generate JWT token
   */
  private generateJWT(userId: string): string {
    const secret = process.env["JWT_SECRET"];

    // Enforce secure JWT secret in all environments
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is required");
    }

    // Check for insecure default secrets
    if (
      secret === "your-secret-key-change-in-production" ||
      secret === "dev-secret" ||
      secret.length < 32
    ) {
      throw new Error(
        "JWT_SECRET must be a secure secret of at least 32 characters"
      );
    }

    const JWT_EXPIRES_IN = process.env["JWT_EXPIRES_IN"] || "7d";
    return jwt.sign({ userId }, secret as jwt.Secret, {
      expiresIn: JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Calculate expiry date for session
   */
  private calculateExpiryDate(): Date {
    const SESSION_EXPIRES_IN_DAYS = parseInt(
      process.env["SESSION_EXPIRES_IN_DAYS"] || "7"
    );
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + SESSION_EXPIRES_IN_DAYS);
    return expiryDate;
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<boolean> {
    try {
      const user = await getDb().query.users.findFirst({
        where: eq(users.verificationToken, token),
      });

      if (!user) {
        throw new Error("Invalid verification token");
      }

      if (user.verificationExpires && new Date() > user.verificationExpires) {
        throw new Error("Verification token has expired");
      }

      // Update user as verified
      await getDb()
        .update(users)
        .set({
          emailVerified: true,
          verificationToken: null,
          verificationExpires: null,
        })
        .where(eq(users.id, user.id));

      return true;
    } catch (error) {
      console.error("Email verification failed:", error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<boolean> {
    try {
      const user = await getDb().query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        // Don't reveal if user exists or not
        return true;
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Store reset token
      await getDb()
        .update(users)
        .set({
          resetToken,
          resetExpires,
        })
        .where(eq(users.id, user.id));

      // Send reset email
      if (this.emailService) {
        const payload: { email: string; token: string; firstName?: string } = {
          email: user.email,
          token: resetToken,
        };
        if (user.firstName) payload.firstName = user.firstName as string;
        await this.emailService.sendPasswordResetEmail(payload);
      }

      return true;
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      return false;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    try {
      const user = await getDb().query.users.findFirst({
        where: eq(users.resetToken, token),
      });

      if (!user) {
        throw new Error("Invalid reset token");
      }

      if (user.resetExpires && new Date() > user.resetExpires) {
        throw new Error("Reset token has expired");
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update password and clear reset token
      await getDb()
        .update(users)
        .set({
          passwordHash,
          resetToken: null,
          resetExpires: null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      return true;
    } catch (error) {
      console.error("Password reset failed:", error);
      return false;
    }
  }

  /**
   * Map database user to UserProfile
   */
  private mapToUserProfile(user: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      lastLogin: user.lastLogin || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
