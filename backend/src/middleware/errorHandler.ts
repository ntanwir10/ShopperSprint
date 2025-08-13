import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ErrorResponse } from '../validation/schemas';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error occurred:', error);

  let statusCode = 500;
  let message = 'Internal Server Error';
  let errorType = 'InternalServerError';

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    statusCode = 400;
    message = 'Validation Error';
    errorType = 'ValidationError';
    console.error('Validation errors:', error.errors);
  }

  // Handle specific error types
  if (error.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
    errorType = 'UnauthorizedError';
  }

  if (error.name === 'ForbiddenError') {
    statusCode = 403;
    message = 'Forbidden';
    errorType = 'ForbiddenError';
  }

  if (error.name === 'NotFoundError') {
    statusCode = 404;
    message = 'Resource not found';
    errorType = 'NotFoundError';
  }

  if (error.name === 'ConflictError') {
    statusCode = 409;
    message = 'Resource conflict';
    errorType = 'ConflictError';
  }

  // Handle database errors
  if (error.message.includes('duplicate key')) {
    statusCode = 409;
    message = 'Resource already exists';
    errorType = 'ConflictError';
  }

  if (error.message.includes('foreign key')) {
    statusCode = 400;
    message = 'Invalid reference';
    errorType = 'BadRequestError';
  }

  const errorResponse: ErrorResponse = {
    error: errorType,
    message: message,
    statusCode,
    timestamp: new Date().toISOString(),
  };

  // Add validation details for Zod errors
  if (error instanceof ZodError) {
    (errorResponse as any).details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  }

  res.status(statusCode).json(errorResponse);
};
