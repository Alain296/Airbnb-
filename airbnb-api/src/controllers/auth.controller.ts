import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma";
import { sendEmail } from "../config/email";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";
import { welcomeEmail, passwordResetEmail } from "../templates/emails";

const JWT_SECRET = process.env["JWT_SECRET"];

const omitPassword = <T extends { password: string }>(user: T): Omit<T, "password"> => {
  const { password: _password, ...rest } = user;
  return rest;
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, username, phone, password, role, avatar, bio } = req.body as {
      name?: string;
      email?: string;
      username?: string;
      phone?: string;
      password?: string;
      role?: Role;
      avatar?: string;
      bio?: string;
    };

    if (!name || !email || !username || !phone || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters" });
      return;
    }

    if (role === Role.ADMIN) {
      res.status(403).json({ message: "You cannot self-assign ADMIN role" });
      return;
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existing) {
      res.status(409).json({ message: "Email or username already in use" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        phone,
        password: hashedPassword,
        role: role ?? Role.GUEST,
        avatar,
        bio
      }
    });

    // Send welcome email (don't block response if it fails)
    sendEmail(
      user.email,
      "Welcome to Airbnb!",
      welcomeEmail(user.name, user.role)
    ).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    res.status(201).json(omitPassword(user));
  } catch (error) {
    handleControllerError(error, res, "auth.register");
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    if (!JWT_SECRET) {
      res.status(500).json({ message: "JWT_SECRET is not configured" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Check if account is suspended
    if ((user as any).isSuspended) {
      res.status(403).json({ message: "Your account has been suspended. Please contact support." });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ token, user: omitPassword(user) });
  } catch (error) {
    handleControllerError(error, res, "auth.login");
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId || !req.role) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: {
        listings: req.role === Role.HOST || req.role === Role.ADMIN,
        bookings: req.role === Role.GUEST || req.role === Role.ADMIN
      }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(omitPassword(user));
  } catch (error) {
    handleControllerError(error, res, "auth.getMe");
  }
};

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!currentPassword || !newPassword) {
      res.status(400).json({ message: "currentPassword and newPassword are required" });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ message: "New password must be at least 8 characters" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user || !user.password) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Current password is incorrect" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.userId }, data: { password: hashedPassword } });
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    handleControllerError(error, res, "auth.changePassword");
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body as { email?: string };
    const successResponse = { message: "If that email is registered, a reset link has been sent" };

    if (!email) {
      res.status(200).json(successResponse);
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(200).json(successResponse);
      return;
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedToken,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    // Send password reset email (don't block response if it fails)
    const resetLink = `${process.env.API_URL || "http://localhost:3000"}/auth/reset-password/${rawToken}`;
    sendEmail(
      user.email,
      "Password Reset Request",
      passwordResetEmail(user.name, resetLink)
    ).catch((error) => {
      console.error("Failed to send password reset email:", error);
    });

    res.status(200).json(successResponse);
  } catch (error) {
    handleControllerError(error, res, "auth.forgotPassword");
  }
};

export const becomeHost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!JWT_SECRET) {
      res.status(500).json({ message: "JWT_SECRET is not configured" });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (user.role === Role.HOST) {
      res.status(200).json({ message: "Already a host", token: jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" }), user: omitPassword(user) });
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.userId },
      data: { role: Role.HOST },
    });

    // Issue a new token with the updated role
    const token = jwt.sign({ userId: updated.id, role: updated.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(200).json({ message: "You are now a host!", token, user: omitPassword(updated) });
  } catch (error) {
    handleControllerError(error, res, "auth.becomeHost");
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };

    if (!token || !password || password.length < 8) {
      res.status(400).json({ message: "Password must be at least 8 characters" });
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(String(token)).digest("hex");
    const user = await prisma.user.findFirst({
      where: {
        resetToken: hashedToken,
        resetTokenExpiry: { gt: new Date() }
      }
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    handleControllerError(error, res, "auth.resetPassword");
  }
};
