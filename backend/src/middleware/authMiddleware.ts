import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/authService";

// Extend Express Request interface to include user
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export class AuthMiddleware {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Middleware to authenticate JWT token
   */
  authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authorization header is required",
          statusCode: 401,
        });
        return;
      }

      const token = authHeader.startsWith("Bearer ") 
        ? authHeader.substring(7) 
        : authHeader;

      if (!token) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Valid token is required",
          statusCode: 401,
        });
        return;
      }

      // Validate token and get user
      const user = await this.authService.validateToken(token);
      
      if (!user) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Invalid or expired token",
          statusCode: 401,
        });
        return;
      }

      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: "Authentication failed",
        statusCode: 500,
      });
    }
  };

  /**
   * Middleware to require specific user roles
   */
  requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({
          error: "Unauthorized",
          message: "Authentication required",
          statusCode: 401,
        });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          error: "Forbidden",
          message: "Insufficient permissions",
          statusCode: 403,
        });
        return;
      }

      next();
    };
  };

  /**
   * Middleware to require admin role
   */
  requireAdmin = this.requireRole(["admin"]);

  /**
   * Middleware to require moderator or admin role
   */
  requireModerator = this.requireRole(["admin", "moderator"]);

  /**
   * Middleware to require authenticated user (any role)
   */
  requireAuth = this.authenticate;

  /**
   * Optional authentication middleware (doesn't fail if no token)
   */
  optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      
      if (authHeader) {
        const token = authHeader.startsWith("Bearer ") 
          ? authHeader.substring(7) 
          : authHeader;

        if (token) {
          const user = await this.authService.validateToken(token);
          if (user) {
            req.user = user;
          }
        }
      }

      next();
    } catch (error) {
      // Continue without authentication
      next();
    }
  };
}

// Export singleton instance
export const authMiddleware = new AuthMiddleware();
