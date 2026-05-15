import { Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";
import { getParamAsString } from "../utils/params";

const includeMessageUser = {
  sender: { select: { id: true, name: true, avatar: true, role: true } },
  receiver: { select: { id: true, name: true, avatar: true, role: true } },
};

const getAccessibleBooking = async (bookingId: string, userId: string) => {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      OR: [
        { guestId: userId },
        { listing: { hostId: userId } },
      ],
    },
    include: {
      guest: { select: { id: true, name: true, avatar: true } },
      listing: {
        select: {
          id: true,
          title: true,
          location: true,
          hostId: true,
          photos: { select: { url: true }, take: 1 },
          host: { select: { id: true, name: true, avatar: true } },
        },
      },
    },
  });
};

export const getBookingMessages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }
    const bookingId = getParamAsString(req.params.bookingId);
    const booking = await getAccessibleBooking(bookingId, req.userId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const messages = await prisma.message.findMany({
      where: { bookingId },
      orderBy: { createdAt: "asc" },
      include: includeMessageUser,
    });

    res.status(200).json({ booking, messages });
  } catch (error) {
    handleControllerError(error, res, "messages.getBookingMessages");
  }
};

export const sendBookingMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }
    const bookingId = getParamAsString(req.params.bookingId);
    const text = String(req.body.text ?? "").trim();
    if (text.length < 1 || text.length > 1000) {
      res.status(400).json({ message: "Message must be 1-1000 characters" });
      return;
    }

    const booking = await getAccessibleBooking(bookingId, req.userId);
    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const receiverId = req.userId === booking.guestId ? booking.listing.hostId : booking.guestId;
    const message = await prisma.message.create({
      data: { bookingId, senderId: req.userId, receiverId, text },
      include: includeMessageUser,
    });

    res.status(201).json({ message });
  } catch (error) {
    handleControllerError(error, res, "messages.sendBookingMessage");
  }
};
