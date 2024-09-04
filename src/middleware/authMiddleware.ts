import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Define the structure of the JWT payload
interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

// Extend Request to include user
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload; // More specific type for req.user
}

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";

// Middleware to authenticate user and decode token
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

// Middleware to authorize based on user role
export const authorizeRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (req.user.role !== role) {
      return res
        .status(403)
        .json({ message: `Access denied. Requires ${role} role.` });
    }

    next();
  };
};
