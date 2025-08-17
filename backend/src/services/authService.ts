import { getDb } from "../database/connection";
import { users, userSessions, userPreferences } from "../database/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { EmailService } from "./emailService";

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
  async registerUser(userData: UserRegistrationData): Promise<AuthResponse> {
    // Check if user already exists
    const existingUser = await getDb().query.users.findFirst({
      where: eq(users.email, userData.email),
    });

    if (existingUser) {
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
        const payload: any = {
          email: userData.email,
          token: verificationToken,
        };
        if (userData.firstName) payload.firstName = userData.firstName;
        await this.emailService.sendVerificationEmail(payload);
      }
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }

    // Generate JWT token and session
    const token = this.generateJWT(newUser.id);
    const expiresAtDate = this.calculateExpiryDate();

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

    return {
      user: this.mapToUserProfile(newUser),
      token,
      expiresAt: expiresAtDate.toISOString(),
    };
  }

  /**
   * Authenticate user login
   */
  async loginUser(loginData: UserLoginData): Promise<AuthResponse> {
    // Find user by email
    const user = await getDb().query.users.findFirst({
      where: eq(users.email, loginData.email),
    });

    if (!user) {
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
      throw new Error("Invalid email or password");
    }

    // Generate JWT token and session
    const token = this.generateJWT(user.id);
    const expiresAtDate = this.calculateExpiryDate();

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

    return {
      user: this.mapToUserProfile(user),
      token,
      expiresAt: expiresAtDate.toISOString(),
    };
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const JWT_SECRET = (process.env["JWT_SECRET"] ||
        "your-secret-key-change-in-production") as jwt.Secret;
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
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
      const JWT_SECRET = (process.env["JWT_SECRET"] ||
        "your-secret-key-change-in-production") as jwt.Secret;
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

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
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<void> {
    await getDb()
      .update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.expiresAt, new Date()));
  }

  /**
   * Generate JWT token
   */
  private generateJWT(userId: string): string {
    const JWT_SECRET = (process.env["JWT_SECRET"] ||
      "your-secret-key-change-in-production") as jwt.Secret;
    const JWT_EXPIRES_IN = process.env["JWT_EXPIRES_IN"] || "7d";
    return jwt.sign({ userId }, JWT_SECRET, {
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
        const payload: any = { email: user.email, token: resetToken };
        if (user.firstName) payload.firstName = user.firstName;
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
