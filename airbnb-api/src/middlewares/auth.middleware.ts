import { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env["JWT_SECRET"];

// Use the global Express.Request interface with our extensions
export type AuthRequest = Request;

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!JWT_SECRET) {
    res.status(500).json({ message: "JWT_SECRET is not configured" });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: Role };
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireHost = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.role !== Role.HOST && req.role !== Role.ADMIN) {
    res.status(403).json({ message: "Only hosts can perform this action" });
    return;
  }

  next();
};

export const requireGuest = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.role !== Role.GUEST && req.role !== Role.ADMIN) {
    res.status(403).json({ message: "Only guests can perform this action" });
    return;
  }

  next();
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.role !== Role.ADMIN) {
    res.status(403).json({ message: "Only admins can perform this action" });
    return;
  }

  next();
};

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!JWT_SECRET) {
    // Continue without auth if JWT_SECRET is not configured
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    // Continue without auth if no token provided
    next();
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: Role };
    req.userId = decoded.userId;
    req.role = decoded.role;
  } catch {
    // Continue without auth if token is invalid
    // Don't set userId or role
  }

  next();
};
