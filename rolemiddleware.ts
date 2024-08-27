import { Request, Response, NextFunction } from "express";
import { UserRole } from "../drizzle/schema";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
  };
}

// Middleware to check if the user has the required role
export const roleMiddleware = (requiredRole: UserRole) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return res
        .status(401)
        .json({ message: "Access denied. No user authenticated." });
    }

    if (user.role !== requiredRole) {
      return res
        .status(403)
        .json({ message: `Access denied. ${requiredRole} role required.` });
    }

    next();
  };
};
