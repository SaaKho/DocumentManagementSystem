import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, permissions } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Define the structure of the JWT payload
interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

// Extend Request to include user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// Define constants
const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware to authenticate and decode token
export const authMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Middleware to authorize based on user role (e.g., Admin)
export const authorizeRole = (requiredRole: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== requiredRole) {
      return res
        .status(403)
        .json({ message: `Access denied. Requires ${requiredRole} role.` });
    }

    next();
  };
};

export const roleMiddleware = (requiredRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    const { documentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      // Fetch user's role for the specific document
      const permissionsResult = await db
        .select()
        .from(permissions)
        .where(
          and(
            eq(permissions.documentId, documentId),
            eq(permissions.userId, userId)
          )
        )
        .execute();

      console.log("Permissions result:", permissionsResult); // Log permissions result for debugging

      const userRole = permissionsResult[0]?.permissionType;

      console.log("User Role:", userRole); // Log the user role for debugging

      if (!userRole) {
        return res
          .status(403)
          .json({ message: "Access denied. No permission for this document." });
      }

      // Check if the user's role is allowed
      if (requiredRoles.includes(userRole)) {
        return next();
      }

      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      return res.status(500).json({ message: "Server error." });
    }
  };
};

export const adminMiddleware = authorizeRole("Admin");
