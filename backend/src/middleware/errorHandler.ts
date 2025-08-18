import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const handleApiError = (error: unknown, res: Response) => {
  console.error("API Error:", error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return res.status(400).json({
      error: "Validation Error",
      message: "Invalid request data",
      details: error.errors,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle database errors
  if (error instanceof Error && error.message.includes("duplicate key")) {
    return res.status(409).json({
      error: "Conflict",
      message: "Resource already exists",
      statusCode: 409,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle database connection errors
  if (error instanceof Error && error.message.includes("connection")) {
    return res.status(503).json({
      error: "Service Unavailable",
      message: "Database connection failed",
      statusCode: 503,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle custom API errors
  if (error instanceof Error && (error as ApiError).statusCode) {
    const apiError = error as ApiError;
    return res.status(apiError.statusCode || 500).json({
      error: "API Error",
      message: apiError.message,
      statusCode: apiError.statusCode || 500,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle generic errors
  if (error instanceof Error) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message || "Something went wrong",
      statusCode: 500,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle unknown errors
  return res.status(500).json({
    error: "Internal Server Error",
    message: "An unexpected error occurred",
    statusCode: 500,
    timestamp: new Date().toISOString(),
  });
};

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Unhandled Error:", error);

  // If response has already been sent, delegate to default error handler
  if (res.headersSent) {
    return next(error);
  }

  // Handle specific error types
  if (error.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation Error",
      message: error.message,
      statusCode: 400,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === "UnauthorizedError") {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Authentication required",
      statusCode: 401,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === "ForbiddenError") {
    return res.status(403).json({
      error: "Forbidden",
      message: "Access denied",
      statusCode: 403,
      timestamp: new Date().toISOString(),
    });
  }

  if (error.name === "NotFoundError") {
    return res.status(404).json({
      error: "Not Found",
      message: error.message || "Resource not found",
      statusCode: 404,
      timestamp: new Date().toISOString(),
    });
  }

  // Default error response
  res.status(500).json({
    error: "Internal Server Error",
    message: (process.env["NODE_ENV"] === "production")
      ? "Something went wrong"
      : error.message,
    statusCode: 500,
    timestamp: new Date().toISOString(),
    ...((process.env["NODE_ENV"] === "development") && { stack: error.stack }),
  });
};

// Custom error classes
export class ValidationError extends Error {
  statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends Error {
  statusCode = 401;
  constructor(message: string = "Authentication required") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends Error {
  statusCode = 403;
  constructor(message: string = "Access denied") {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string = "Resource not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends Error {
  statusCode = 409;
  constructor(message: string = "Resource conflict") {
    super(message);
    this.name = "ConflictError";
  }
}

export class RateLimitError extends Error {
  statusCode = 429;
  constructor(message: string = "Too many requests") {
    super(message);
    this.name = "RateLimitError";
  }
}
