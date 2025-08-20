import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import crypto from "crypto";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

interface ErrorDetails {
  errorId: string;
  timestamp: string;
  statusCode: number;
  message: string;
  originalError?: any;
  stack?: string | undefined;
  userAgent?: string | undefined;
  ip?: string | undefined;
  url?: string | undefined;
  method?: string | undefined;
}

/**
 * Secure error logging - logs detailed error information internally
 * without exposing sensitive data to users
 */
const logErrorSecurely = (error: unknown, req?: Request): string => {
  const errorId = crypto.randomBytes(8).toString("hex");
  const timestamp = new Date().toISOString();

  const errorDetails: ErrorDetails = {
    errorId,
    timestamp,
    statusCode: 500,
    message: "Internal error",
    userAgent: Array.isArray(req?.headers["user-agent"])
      ? req.headers["user-agent"][0]
      : req?.headers["user-agent"],
    ip: req?.ip || req?.connection?.remoteAddress,
    url: req?.url,
    method: req?.method,
  };

  if (error instanceof Error) {
    errorDetails.message = error.message;
    errorDetails.stack = error.stack;
    if ((error as ApiError).statusCode) {
      errorDetails.statusCode = (error as ApiError).statusCode!;
    }
  }

  // Log full error details for internal monitoring
  console.error(`[ERROR ${errorId}]`, {
    ...errorDetails,
    originalError: error,
  });

  return errorId;
};

/**
 * Sanitize error message for user consumption
 */
const sanitizeErrorMessage = (error: unknown, statusCode: number): string => {
  // Only return safe, generic messages to users
  const safeProdMessages: Record<number, string> = {
    400: "Invalid request data",
    401: "Authentication required",
    403: "Access denied",
    404: "Resource not found",
    409: "Resource conflict",
    422: "Invalid input data",
    429: "Too many requests",
    500: "Internal server error",
    503: "Service temporarily unavailable",
  };

  // In production, always use safe messages
  if (process.env["NODE_ENV"] === "production") {
    return safeProdMessages[statusCode] || "An error occurred";
  }

  // In development, provide more context but still sanitize
  if (error instanceof Error) {
    // Remove sensitive patterns from error messages
    let message = error.message
      .replace(/password|secret|key|token/gi, "[REDACTED]")
      .replace(/\b\d{4,}\b/g, "[NUMBERS]") // Remove potential IDs
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[EMAIL]"); // Remove emails

    return message;
  }

  return safeProdMessages[statusCode] || "An error occurred";
};

export const handleApiError = (
  error: unknown,
  res: Response,
  req?: Request
) => {
  // Log error securely and get error ID for tracking
  const errorId = logErrorSecurely(error, req);

  let statusCode = 500;
  let errorType = "Internal Server Error";

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    errorType = "Validation Error";

    // Sanitize validation error details
    const sanitizedDetails = error.errors.map((err) => ({
      path: err.path.join("."),
      message: "Invalid value",
      code: err.code,
    }));

    return res.status(statusCode).json({
      error: errorType,
      message: sanitizeErrorMessage(error, statusCode),
      details: sanitizedDetails,
      statusCode,
      timestamp: new Date().toISOString(),
      errorId,
    });
  }

  // Handle database errors
  if (error instanceof Error && error.message.includes("duplicate key")) {
    statusCode = 409;
    errorType = "Conflict";
  }
  // Handle database connection errors
  else if (error instanceof Error && error.message.includes("connection")) {
    statusCode = 503;
    errorType = "Service Unavailable";
  }
  // Handle custom API errors
  else if (error instanceof Error && (error as ApiError).statusCode) {
    const apiError = error as ApiError;
    statusCode = apiError.statusCode || 500;
    errorType = "API Error";
  }

  return res.status(statusCode).json({
    error: errorType,
    message: sanitizeErrorMessage(error, statusCode),
    statusCode,
    timestamp: new Date().toISOString(),
    errorId,
  });
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If response has already been sent, delegate to default error handler
  if (res.headersSent) {
    return next(error);
  }

  // Log error securely and get error ID for tracking
  const errorId = logErrorSecurely(error, req);

  let statusCode = 500;
  let errorType = "Internal Server Error";

  // Handle specific error types
  if (error.name === "ValidationError") {
    statusCode = 400;
    errorType = "Validation Error";
  } else if (error.name === "UnauthorizedError") {
    statusCode = 401;
    errorType = "Unauthorized";
  } else if (error.name === "ForbiddenError") {
    statusCode = 403;
    errorType = "Forbidden";
  } else if (error.name === "NotFoundError") {
    statusCode = 404;
    errorType = "Not Found";
  } else if ((error as ApiError).statusCode) {
    statusCode = (error as ApiError).statusCode!;
    errorType = "API Error";
  }

  // Always use sanitized error response
  res.status(statusCode).json({
    error: errorType,
    message: sanitizeErrorMessage(error, statusCode),
    statusCode,
    timestamp: new Date().toISOString(),
    errorId,
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
