import { AuthService } from "../authService";
import { db } from "../../database/connection";

// Mock the database connection
jest.mock("../../database/connection", () => ({
  db: {
    insert: jest.fn(() => ({
      values: jest.fn(() => ({
        returning: jest.fn(),
      })),
    })),
    update: jest.fn(() => ({
      set: jest.fn(() => ({
        where: jest.fn(() => ({
          returning: jest.fn(),
        })),
      })),
    })),
    query: {
      users: {
        findFirst: jest.fn(),
      },
      userSessions: {
        findFirst: jest.fn(),
      },
    },
  },
}));

describe("AuthService", () => {
  let authService: AuthService;
  let mockedDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
    mockedDb = db as any;
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        username: "testuser",
        password: "TestPass123",
        firstName: "Test",
        lastName: "User",
      };

      const mockUser = {
        id: "user-123",
        email: userData.email,
        username: userData.username,
        passwordHash: "hashedPassword",
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: "user",
        isActive: true,
        emailVerified: false,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock database calls
      mockedDb.query.users.findFirst
        .mockResolvedValueOnce(null) // No existing user with email
        .mockResolvedValueOnce(null); // No existing user with username

      // Mock the insert chain
      const mockInsertChain = {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockUser]),
        }),
      };
      mockedDb.insert.mockReturnValue(mockInsertChain);

      // Mock the update chain
      const mockUpdateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      };
      mockedDb.update.mockReturnValue(mockUpdateChain);

      const result = await authService.registerUser(userData);

      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        isActive: mockUser.isActive,
        emailVerified: mockUser.emailVerified,
        lastLogin: undefined, // Changed from null to undefined
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it("should throw error if user with email already exists", async () => {
      const userData = {
        email: "existing@example.com",
        username: "newuser",
        password: "TestPass123",
      };

      mockedDb.query.users.findFirst.mockResolvedValueOnce({
        id: "existing-user",
        email: userData.email,
      });

      await expect(authService.registerUser(userData)).rejects.toThrow(
        "User with this email already exists"
      );
    });

    it("should throw error if username is already taken", async () => {
      const userData = {
        email: "new@example.com",
        username: "existinguser",
        password: "TestPass123",
      };

      mockedDb.query.users.findFirst
        .mockResolvedValueOnce(null) // No existing user with email
        .mockResolvedValueOnce({
          id: "existing-user",
          username: userData.username,
        });

      await expect(authService.registerUser(userData)).rejects.toThrow(
        "Username is already taken"
      );
    });
  });

  describe("loginUser", () => {
    it("should authenticate user successfully", async () => {
      const loginData = {
        email: "test@example.com",
        password: "TestPass123",
      };

      const mockUser = {
        id: "user-123",
        email: loginData.email,
        username: "testuser",
        passwordHash: "$2a$12$hashedPassword", // bcrypt hash
        firstName: "Test",
        lastName: "User",
        role: "user",
        isActive: true,
        emailVerified: false,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        id: "session-123",
        userId: mockUser.id,
        token: "jwt-token",
        expiresAt: new Date(),
        userAgent: null,
        ipAddress: null,
        isActive: true,
        createdAt: new Date(),
      };

      // Mock database calls
      mockedDb.query.users.findFirst.mockResolvedValue(mockUser);

      // Mock the insert chain for session
      const mockInsertChain = {
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([mockSession]),
        }),
      };
      mockedDb.insert.mockReturnValue(mockInsertChain);

      // Mock the update chain
      const mockUpdateChain = {
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([mockUser]),
          }),
        }),
      };
      mockedDb.update.mockReturnValue(mockUpdateChain);

      // Mock bcrypt.compare to return true
      const bcrypt = require("bcryptjs");
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);

      const result = await authService.loginUser(loginData);

      expect(result.user).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        isActive: mockUser.isActive,
        emailVerified: mockUser.emailVerified,
        lastLogin: undefined, // Changed from null to undefined
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result.token).toBeDefined();
      expect(result.expiresAt).toBeDefined();
    });

    it("should throw error if user not found", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "TestPass123",
      };

      mockedDb.query.users.findFirst.mockResolvedValue(null);

      await expect(authService.loginUser(loginData)).rejects.toThrow(
        "Invalid email or password"
      );
    });

    it("should throw error if account is deactivated", async () => {
      const loginData = {
        email: "test@example.com",
        password: "TestPass123",
      };

      const mockUser = {
        id: "user-123",
        email: loginData.email,
        username: "testuser",
        passwordHash: "$2a$12$hashedPassword",
        firstName: "Test",
        lastName: "User",
        role: "user",
        isActive: false, // Deactivated account
        emailVerified: false,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockedDb.query.users.findFirst.mockResolvedValue(mockUser);

      await expect(authService.loginUser(loginData)).rejects.toThrow(
        "Account is deactivated"
      );
    });
  });

  describe("validateToken", () => {
    it("should return user profile for valid token", async () => {
      const token = "valid-jwt-token";
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        username: "testuser",
        passwordHash: "hashedPassword",
        firstName: "Test",
        lastName: "User",
        role: "user",
        isActive: true,
        emailVerified: false,
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockSession = {
        id: "session-123",
        userId: mockUser.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Future date
        userAgent: null,
        ipAddress: null,
        isActive: true,
        createdAt: new Date(),
      };

      // Mock JWT verify
      const jwt = require("jsonwebtoken");
      jest.spyOn(jwt, "verify").mockReturnValue({ userId: mockUser.id });

      mockedDb.query.userSessions.findFirst.mockResolvedValue(mockSession);
      mockedDb.query.users.findFirst.mockResolvedValue(mockUser);

      const result = await authService.validateToken(token);

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        username: mockUser.username,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
        isActive: mockUser.isActive,
        emailVerified: mockUser.emailVerified,
        lastLogin: mockUser.lastLogin,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it("should return null for invalid token", async () => {
      const token = "invalid-jwt-token";

      // Mock JWT verify to throw error
      const jwt = require("jsonwebtoken");
      jest.spyOn(jwt, "verify").mockImplementation(() => {
        throw new Error("Invalid token");
      });

      const result = await authService.validateToken(token);

      expect(result).toBeNull();
    });

    it("should return null for expired session", async () => {
      const token = "valid-jwt-token";
      const mockSession = {
        id: "session-123",
        userId: "user-123",
        token,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Past date
        userAgent: null,
        ipAddress: null,
        isActive: true,
        createdAt: new Date(),
      };

      // Mock JWT verify
      const jwt = require("jsonwebtoken");
      jest.spyOn(jwt, "verify").mockReturnValue({ userId: "user-123" });

      mockedDb.query.userSessions.findFirst.mockResolvedValue(mockSession);

      const result = await authService.validateToken(token);

      expect(result).toBeNull();
    });
  });
});
