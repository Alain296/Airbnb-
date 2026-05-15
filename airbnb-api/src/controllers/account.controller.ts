import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";

const sanitizeUser = <T extends Record<string, unknown>>(user: T): T => {
  if ("password" in user) {
    const { password: _password, ...rest } = user as T & { password?: unknown };
    return rest as T;
  }
  return user;
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.status(200).json(sanitizeUser(user as unknown as Record<string, unknown>));
  } catch (error) {
    handleControllerError(error, res, "account.getMe");
  }
};

export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }
    const { name, username, phone, bio } = req.body as { name?: string; username?: string; phone?: string; bio?: string };
    if (!name?.trim() || !username?.trim() || !phone?.trim()) {
      res.status(400).json({ message: "Name, username, and phone are required" });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.userId },
      data: { name: name.trim(), username: username.trim(), phone: phone.trim(), bio: bio?.trim() || null },
    });
    res.status(200).json({ message: "Profile updated", user: sanitizeUser(user as unknown as Record<string, unknown>) });
  } catch (error) {
    handleControllerError(error, res, "account.updateMe");
  }
};

export const getPaymentMethods = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }
    const data = await prisma.paymentMethod.findMany({
      where: { userId: req.userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
    res.status(200).json({ data });
  } catch (error) {
    handleControllerError(error, res, "account.getPaymentMethods");
  }
};

export const addPaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }
    const { cardNumber, expiry, holderName } = req.body as { cardNumber?: string; expiry?: string; holderName?: string };
    const digits = String(cardNumber ?? "").replace(/\D/g, "");
    const match = String(expiry ?? "").match(/^(\d{2})\/(\d{2})$/);
    if (digits.length < 12 || !match || !holderName?.trim()) {
      res.status(400).json({ message: "Valid card number, expiry (MM/YY), and holder name are required" });
      return;
    }

    const expiryMonth = Number(match[1]);
    const expiryYear = 2000 + Number(match[2]);
    if (expiryMonth < 1 || expiryMonth > 12) {
      res.status(400).json({ message: "Expiry month must be between 01 and 12" });
      return;
    }

    const existingCount = await prisma.paymentMethod.count({ where: { userId: req.userId } });
    const brand = digits.startsWith("4") ? "Visa" : digits.startsWith("5") ? "Mastercard" : "Card";
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId: req.userId,
        brand,
        last4: digits.slice(-4),
        expiryMonth,
        expiryYear,
        holderName: holderName.trim(),
        isDefault: existingCount === 0,
      },
    });
    res.status(201).json({ message: "Payment method added", paymentMethod });
  } catch (error) {
    handleControllerError(error, res, "account.addPaymentMethod");
  }
};

export const deletePaymentMethod = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }
    const id = String(req.params.id ?? "");
    const deleted = await prisma.paymentMethod.deleteMany({ where: { id, userId: req.userId } });
    if (!deleted.count) { res.status(404).json({ message: "Payment method not found" }); return; }
    res.status(200).json({ message: "Payment method removed" });
  } catch (error) {
    handleControllerError(error, res, "account.deletePaymentMethod");
  }
};
