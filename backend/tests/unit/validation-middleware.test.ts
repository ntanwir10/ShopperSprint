import { describe, it, expect, vi } from "vitest";
import { Request, Response } from "express";
import {
  validateRequest,
  validateData,
  safeValidate,
  ValidationError,
} from "../../src/utils/validation.js";
import { searchRequestSchema } from "../../src/types/api.js";
import { z } from "zod";

describe("Validation Middleware and Utilities", () => {
  describe("validateData", () => {
    const testSchema = z.object({
      name: z.string().min(1, "Name is required"),
      age: z.number().min(0, "Age must be positive"),
    });

    it("should return success for valid data", () => {
      const validData = { name: "John", age: 25 };
      const result = validateData(testSchema, validData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validData);
      expect(result.errors).toBeUndefined();
    });

    it("should return errors for invalid data", () => {
      const invalidData = { name: "", age: -5 };
      const result = validateData(testSchema, invalidData);

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.errors).toBeDefined();
    });
  });

  describe("safeValidate", () => {
    const testSchema = z.string().min(3, "Too short");

    it("should return parsed data for valid input", () => {
      const result = safeValidate(testSchema, "hello");
      expect(result).toBe("hello");
    });

    it("should return null for invalid input", () => {
      const result = safeValidate(testSchema, "hi");
      expect(result).toBeNull();
    });
  });

  describe("validateRequest middleware", () => {
    it("should call next() for valid request body", () => {
      const middleware = validateRequest(searchRequestSchema, "body");
      const req = {
        body: {
          query: "iPhone 15 Pro",
          maxResults: 25,
        },
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).validated).toEqual({
        query: "iPhone 15 Pro",
        maxResults: 25,
      });
    });

    it("should return 400 error for invalid request body", () => {
      const middleware = validateRequest(searchRequestSchema, "body");
      const req = {
        body: {
          query: "ab", // Too short
        },
      } as Request;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
          }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it("should validate query parameters", () => {
      const querySchema = z.object({
        page: z.string().transform(Number).pipe(z.number().int().min(1)),
      });
      const middleware = validateRequest(querySchema, "query");
      const req = {
        query: { page: "2" },
      } as Request;
      const res = {} as Response;
      const next = vi.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect((req as any).validated).toEqual({ page: 2 });
    });
  });

  describe("ValidationError class", () => {
    it("should create error with default code", () => {
      const error = new ValidationError("Test error");
      expect(error.message).toBe("Test error");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.name).toBe("ValidationError");
      expect(error.details).toBeUndefined();
    });

    it("should create error with custom code and details", () => {
      const details = { field: "email", value: "invalid@" };
      const error = new ValidationError(
        "Email validation failed",
        "EMAIL_INVALID",
        details
      );

      expect(error.message).toBe("Email validation failed");
      expect(error.code).toBe("EMAIL_INVALID");
      expect(error.details).toEqual(details);
    });

    it("should be instanceof Error", () => {
      const error = new ValidationError("Test");
      expect(error instanceof Error).toBe(true);
      expect(error instanceof ValidationError).toBe(true);
    });
  });
});
