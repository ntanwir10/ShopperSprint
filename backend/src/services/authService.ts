import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "../database/connection";
import { users, userPreferences, userSessions } from "../database/schema";
import { eq } from "drizzle-orm";

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
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: UserProfile;
  token: string;
  expiresAt: Date;
}

export class AuthService {
  private readonly JWT_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly SESSION_EXPIRES_IN_DAYS: number;

  constructor() {
    this.JWT_SECRET =
      process.env["JWT_SECRET"] || "your-secret-key-change-in-production";
    this.JWT_EXPIRES_IN = process.env["JWT_EXPIRES_IN"] || "7d";
    this.SESSION_EXPIRES_IN_DAYS = parseInt(
      process.env["SESSION_EXPIRES_IN_DAYS"] || "7"
    );
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
      throw new Error("User with this email already exists");
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

    // Create user
    const [newUser] = await getDb()
      .insert(users)
      .values({
        email: userData.email,
        username: userData.username,
        passwordHash,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
      })
      .returning();

    if (!newUser) {
      throw new Error("Failed to create user");
    }

    // Create default user preferences
    await getDb().insert(userPreferences).values({
      userId: newUser.id,
    });

    // Generate JWT token and session
    const token = this.generateJWT(newUser.id);
    const expiresAt = this.calculateExpiryDate();

    // Store session
    await getDb().insert(userSessions).values({
      userId: newUser.id,
      token,
      expiresAt,
    });

    // Update last login
    await getDb()
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, newUser.id));

    return {
      user: this.mapToUserProfile(newUser),
      token,
      expiresAt,
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
    const expiresAt = this.calculateExpiryDate();

    // Store session
    await getDb().insert(userSessions).values({
      userId: user.id,
      token,
      expiresAt,
    });

    // Update last login
    await getDb()
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, user.id));

    return {
      user: this.mapToUserProfile(user),
      token,
      expiresAt,
    };
  }

  /**
   * Validate JWT token and get user
   */
  async validateToken(token: string): Promise<UserProfile | null> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };

      // Check if session exists and is active
      const session = await getDb().query.userSessions.findFirst({
        where: eq(userSessions.token, token),
      });

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return null;
      }

      // Get user
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
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    } as jwt.SignOptions);
  }

  /**
   * Calculate expiry date for session
   */
  private calculateExpiryDate(): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.SESSION_EXPIRES_IN_DAYS);
    return expiryDate;
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
