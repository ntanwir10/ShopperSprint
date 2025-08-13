import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

/**
 * Middleware factory for validating request data using Zod schemas
 * @param schema - Zod schema to validate against
 * @param target - Target to validate ('body', 'query', or 'params')
 * @returns Express middleware function
 */
export const validateRequest = (
  schema: AnyZodObject,
  target: "body" | "query" | "params" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req[target]);
      req[target] = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = formatZodErrors(error);
        return res.status(400).json({
          error: {
            code: "VALIDATION_ERROR",
            message: "Request validation failed",
            details: validationErrors,
            timestamp: new Date().toISOString(),
          },
        });
      }
      
      // Handle unexpected errors
      console.error("Unexpected validation error:", error);
      return res.status(500).json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Internal server error during validation",
          timestamp: new Date().toISOString(),
        },
      });
    }
  };
};

/**
 * Format Zod validation errors into a consistent structure
 * @param error - Zod error object
 * @returns Formatted error details
 */
function formatZodErrors(error: ZodError): Array<{
  field: string;
  message: string;
  code: string;
}> {
  if (!error || !error.errors || !Array.isArray(error.errors)) {
    return [];
  }

  return error.errors.map((err: any) => ({
    field: err.path.join("."),
    message: err.message,
    code: err.code,
  }));
}
