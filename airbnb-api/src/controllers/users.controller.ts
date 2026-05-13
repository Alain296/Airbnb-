import { Request, Response } from "express";
import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import prisma from "../config/prisma";
import { handleControllerError } from "../utils/error-handler";
import { getParamAsString } from "../utils/params";

const sanitizeUser = <T extends Record<string, unknown>>(user: T): T => {
  if ("password" in user) {
    const { password: _password, ...rest } = user as T & { password?: unknown };
    return rest as T;
  }
  return user;
};

export const getAllUsers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      include: { _count: { select: { listings: true } } }
    });
    res.status(200).json(users.map((user) => sanitizeUser(user)));
  } catch (error) {
    handleControllerError(error, res, "users.getAllUsers");
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      include: { listings: true, bookings: true }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    handleControllerError(error, res, "users.getUserById");
  }
};

export const getUserListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getParamAsString(req.params.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const listings = await prisma.listing.findMany({ where: { hostId: userId } });
    res.status(200).json(listings);
  } catch (error) {
    handleControllerError(error, res, "users.getUserListings");
  }
};

export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getParamAsString(req.params.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: { guestId: userId },
      include: { listing: true }
    });

    res.status(200).json(bookings);
  } catch (error) {
    handleControllerError(error, res, "users.getUserBookings");
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, username, phone, role, password, avatar, bio } = req.body as {
      name?: string;
      email?: string;
      username?: string;
      phone?: string;
      role?: Role;
      password?: string;
      avatar?: string;
      bio?: string;
    };

    if (!name || !email || !username || !phone || !password) {
      res.status(400).json({ message: "Missing required user fields" });
      return;
    }

    const existingUser = await prisma.user.findFirst({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "Email already exists" });
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
      } as never
    });

    res.status(201).json(sanitizeUser(user));
  } catch (error) {
    handleControllerError(error, res, "users.createUser");
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const existingUser = await prisma.user.findFirst({ where: { id } });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (req.body.password) {
      req.body.password = await bcrypt.hash(String(req.body.password), 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: req.body
    });

    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    handleControllerError(error, res, "users.updateUser");
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const existingUser = await prisma.user.findFirst({ where: { id } });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    handleControllerError(error, res, "users.deleteUser");
  }
};

/**
 * Suspend or unsuspend a user account (Admin only)
 * PATCH /users/:id/suspend
 */
export const suspendUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const { suspend } = req.body as { suspend?: boolean };

    if (typeof suspend !== 'boolean') {
      res.status(400).json({ message: "suspend must be a boolean" });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) { res.status(404).json({ message: "User not found" }); return; }

    const user = await prisma.user.update({
      where: { id },
      data: { isSuspended: suspend },
    });

    res.status(200).json({
      message: suspend ? "User suspended successfully" : "User unsuspended successfully",
      user: sanitizeUser(user as unknown as Record<string, unknown>),
    });
  } catch (error) {
    handleControllerError(error, res, "users.suspendUser");
  }
};
