import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { handleApiError } from "./errorHandler";

// Extend Request interface to include file property
interface RequestWithFile extends Request {
  file?: {
    originalname?: string;
    size: number;
    mimetype: string;
  };
}

/**
 * Validation middleware factory
 * Creates middleware that validates request data against Zod schemas
 */
export const validateRequest = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // Validate query parameters
      if (schemas.query) {
        req.query = await schemas.query.parseAsync(req.query);
      }

      // Validate route parameters
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      // Validate headers
      if (schemas.headers) {
        req.headers = await schemas.headers.parseAsync(req.headers);
      }

      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return handleApiError(error, res, req);
      }
      return handleApiError(new Error("Validation failed"), res, req);
    }
  };
};

/**
 * Sanitize and validate file uploads
 */
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  const {
    maxSize = 5 * 1024 * 1024,
    allowedTypes = [],
    required = false,
  } = options;

  return (req: RequestWithFile, res: Response, next: NextFunction) => {
    const file = req.file;

    if (required && !file) {
      return handleApiError(new Error("File upload is required"), res, req);
    }

    if (!file) {
      return next();
    }

    // Check file size
    if (file.size > maxSize) {
      return handleApiError(
        new Error(`File size exceeds limit of ${maxSize} bytes`),
        res,
        req
      );
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
      return handleApiError(
        new Error(`File type ${file.mimetype} not allowed`),
        res,
        req
      );
    }

    // Sanitize filename
    if (file.originalname) {
      file.originalname = file.originalname
        .replace(/[<>:"/\\|?*]/g, "") // Remove dangerous characters
        .replace(/\.\./g, "") // Remove directory traversal
        .substring(0, 255); // Limit length
    }

    next();
  };
};

/**
 * Rate limiting validation middleware
 */
export const validateRateLimit = (
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || "unknown";
    const now = Date.now();

    // Clean up old entries
    for (const [id, data] of requestCounts.entries()) {
      if (now > data.resetTime) {
        requestCounts.delete(id);
      }
    }

    // Get or create rate limit data
    let clientData = requestCounts.get(clientId);
    if (!clientData || now > clientData.resetTime) {
      clientData = { count: 0, resetTime: now + windowMs };
      requestCounts.set(clientId, clientData);
    }

    // Check rate limit
    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        error: "Too Many Requests",
        message: "Rate limit exceeded",
        statusCode: 429,
        timestamp: new Date().toISOString(),
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
      });
    }

    // Increment count
    clientData.count++;

    // Add rate limit headers
    res.set({
      "X-RateLimit-Limit": maxRequests.toString(),
      "X-RateLimit-Remaining": (maxRequests - clientData.count).toString(),
      "X-RateLimit-Reset": Math.ceil(clientData.resetTime / 1000).toString(),
    });

    return next();
  };
};

/**
 * Security headers middleware
 */
export const securityHeaders = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  // Remove server information
  res.removeHeader("X-Powered-By");

  // Set security headers
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  });

  next();
};

/**
 * Content Security Policy middleware
 */
export const contentSecurityPolicy = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' wss: ws:",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.set("Content-Security-Policy", csp);
  next();
};

/**
 * CSRF protection middleware
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  // Skip CSRF for WebSocket upgrade requests
  if (req.headers.upgrade?.toLowerCase() === "websocket") {
    return next();
  }

  // Check for CSRF token in header
  const token = req.headers["x-csrf-token"] || req.headers["x-xsrf-token"];

  if (!token) {
    return res.status(403).json({
      error: "Forbidden",
      message: "CSRF token missing",
      statusCode: 403,
      timestamp: new Date().toISOString(),
    });
  }

  // Simple token validation (in production, use proper CSRF tokens)
  const expectedToken = req.headers["x-requested-with"];
  if (token !== expectedToken && expectedToken !== "XMLHttpRequest") {
    return res.status(403).json({
      error: "Forbidden",
      message: "Invalid CSRF token",
      statusCode: 403,
      timestamp: new Date().toISOString(),
    });
  }

  next();
};

/**
 * Input sanitization middleware for common XSS patterns
 */
export const sanitizeInput = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === "string") {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .trim();
    }

    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }

    if (obj && typeof obj === "object") {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

/**
 * Request logging middleware
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  // Log request
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`
  );

  // Override res.end to capture response data
  const originalEnd = res.end.bind(res);
  res.end = function (...args: any[]) {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.url} - ${
        res.statusCode
      } - ${duration}ms`
    );
    return originalEnd(...args);
  };

  next();
};
