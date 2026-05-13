import { BookingStatus, Role } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { sendEmail } from "../config/email";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";
import { bookingConfirmationEmail, bookingCancellationEmail } from "../templates/emails";
import { getParamAsString } from "../utils/params";

const validBookingStatus = (value: string): value is BookingStatus =>
  Object.values(BookingStatus).includes(value as BookingStatus);

/**
 * Get all bookings with pagination
 * GET /bookings
 */
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 50) {
      res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be 1-50" 
      });
      return;
    }

    // Execute queries in parallel for better performance
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          guest: { 
            select: { 
              id: true, 
              name: true, 
              email: true, 
              avatar: true 
            } 
          },
          listing: { 
            select: { 
              id: true, 
              title: true, 
              location: true, 
              pricePerNight: true,
              photos: {
                select: { url: true },
                take: 1
              }
            } 
          }
        }
      }),
      prisma.booking.count()
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: bookings,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    handleControllerError(error, res, "bookings.getAllBookings");
  }
};

/**
 * Get booking by ID with full details
 * GET /bookings/:id
 */
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        listing: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatar: true
              }
            },
            photos: {
              select: {
                id: true,
                url: true
              },
              take: 3
            }
          }
        }
      }
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    res.status(200).json(booking);
  } catch (error) {
    handleControllerError(error, res, "bookings.getBookingById");
  }
};

/**
 * Create a new booking
 * POST /bookings
 */
export const createBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listingId, checkIn, checkOut, guests } = req.body as {
      listingId?: string;  // Changed to string for UUID
      checkIn?: string;
      checkOut?: string;
      guests?: number;
    };

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Validate required fields
    if (listingId === undefined || !checkIn || !checkOut || guests === undefined) {
      res.status(400).json({ message: "Missing required fields: listingId, checkIn, checkOut, guests" });
      return;
    }

    // Validate guests count
    if (!Number.isInteger(guests) || guests < 1) {
      res.status(400).json({ message: "guests must be a positive integer" });
      return;
    }

    const guest = await prisma.user.findUnique({ where: { id: req.userId } });
    if (!guest) {
      res.status(404).json({ message: "Guest user not found" });
      return;
    }

    const listing = await prisma.listing.findUnique({ 
      where: { id: listingId },
      include: {
        host: {
          select: { id: true, name: true, email: true }
        }
      }
    });
    
    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Check if guest capacity is sufficient
    if (guests > listing.guests) {
      res.status(400).json({ 
        message: `This listing can accommodate maximum ${listing.guests} guests, but you requested ${guests}` 
      });
      return;
    }

    // Prevent hosts from booking their own listings
    if (listing.host.id === req.userId) {
      res.status(400).json({ message: "You cannot book your own listing" });
      return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      res.status(400).json({ message: "checkIn and checkOut must be valid dates" });
      return;
    }

    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / millisecondsPerDay);
    if (nights <= 0) {
      res.status(400).json({ message: "checkOut must be after checkIn" });
      return;
    }

    // Validate check-in is in the future (at least tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    if (checkInDate < tomorrow) {
      res.status(400).json({ message: "checkIn must be at least tomorrow" });
      return;
    }

    // Check for booking conflicts (overlapping dates)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        listingId,
        status: BookingStatus.CONFIRMED,
        AND: [
          { checkIn: { lt: checkOutDate } },
          { checkOut: { gt: checkInDate } }
        ]
      }
    });

    if (conflictingBooking) {
      res.status(409).json({ message: "Listing is already booked for these dates" });
      return;
    }

    const totalPrice = nights * listing.pricePerNight;

    const booking = await prisma.booking.create({
      data: {
        guestId: req.userId,
        listingId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice,
        status: BookingStatus.CONFIRMED // Auto-confirm for now
      },
      include: {
        guest: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
            pricePerNight: true
          }
        }
      }
    });

    // Send booking confirmation email (don't block response if it fails)
    sendEmail(
      guest.email,
      "Booking Confirmed!",
      bookingConfirmationEmail(
        guest.name,
        listing.title,
        listing.location,
        checkInDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        checkOutDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        totalPrice
      )
    ).catch((error) => {
      console.error("Failed to send booking confirmation email:", error);
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking
    });
  } catch (error) {
    handleControllerError(error, res, "bookings.createBooking");
  }
};

/**
 * Get all bookings for a specific user (paginated)
 * GET /users/:id/bookings
 */
export const getUserBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getParamAsString(req.params.id);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 50) {
      res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be 1-50" 
      });
      return;
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, role: true }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Execute queries in parallel
    const [bookings, totalCount] = await Promise.all([
      prisma.booking.findMany({
        where: { guestId: userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              location: true,
              pricePerNight: true,
              photos: {
                select: { url: true },
                take: 1
              },
              host: {
                select: {
                  id: true,
                  name: true,
                  avatar: true
                }
              }
            }
          }
        }
      }),
      prisma.booking.count({
        where: { guestId: userId }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: bookings,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    handleControllerError(error, res, "bookings.getUserBookings");
  }
};

export const updateBookingStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const status = String(req.body.status ?? "").toUpperCase();

    if (!validBookingStatus(status)) {
      res.status(400).json({ message: "Invalid booking status" });
      return;
    }

    const existingBooking = await prisma.booking.findFirst({ 
      where: { id },
      include: {
        guest: {
          select: { id: true, name: true, email: true }
        },
        listing: {
          select: { id: true, title: true, location: true, hostId: true }
        }
      }
    });
    
    if (!existingBooking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    const isAdmin = req.role === Role.ADMIN;
    const isHost  = req.userId === existingBooking.listing.hostId;
    const isGuest = req.userId === existingBooking.guestId;

    // Permission rules:
    // - Admin: can set any status
    // - Host: can CONFIRM or CANCEL bookings for their own listings
    // - Guest: can only CANCEL their own booking (handled by deleteBooking, but allow here too)
    if (!isAdmin && !isHost && !isGuest) {
      res.status(403).json({ message: "You are not authorised to update this booking" });
      return;
    }

    if (!isAdmin) {
      if (isHost && status !== "CONFIRMED" && status !== "CANCELLED") {
        res.status(403).json({ message: "Hosts can only confirm or cancel bookings" });
        return;
      }
      if (isGuest && status !== "CANCELLED") {
        res.status(403).json({ message: "Guests can only cancel bookings" });
        return;
      }
    }

    // Prevent re-cancelling
    if (existingBooking.status === BookingStatus.CANCELLED && status === "CANCELLED") {
      res.status(400).json({ message: "Booking is already cancelled" });
      return;
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: { status },
      include: {
        guest: {
          select: { id: true, name: true, email: true }
        },
        listing: {
          select: { id: true, title: true, location: true }
        }
      }
    });

    // Send email notification to guest on confirm or cancel
    if (existingBooking.guest && existingBooking.listing) {
      if (status === "CONFIRMED") {
        sendEmail(
          existingBooking.guest.email,
          "Booking Confirmed!",
          bookingConfirmationEmail(
            existingBooking.guest.name,
            existingBooking.listing.title,
            existingBooking.listing.location,
            existingBooking.checkIn.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
            existingBooking.checkOut.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
            existingBooking.totalPrice
          )
        ).catch(() => {});
      } else if (status === "CANCELLED") {
        sendEmail(
          existingBooking.guest.email,
          "Booking Cancelled",
          bookingCancellationEmail(
            existingBooking.guest.name,
            existingBooking.listing.title,
            existingBooking.checkIn.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
            existingBooking.checkOut.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
          )
        ).catch(() => {});
      }
    }

    res.status(200).json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    handleControllerError(error, res, "bookings.updateBookingStatus");
  }
};

/**
 * Cancel a booking (DELETE /bookings/:id)
 */
export const deleteBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);

    const existingBooking = await prisma.booking.findFirst({ 
      where: { id },
      include: {
        guest: {
          select: { id: true, name: true, email: true }
        },
        listing: {
          select: { id: true, title: true, hostId: true }
        }
      }
    });

    if (!existingBooking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Check permissions: guest can cancel own bookings, host can cancel bookings for their listings, admin can cancel any
    const isGuest = req.userId === existingBooking.guestId;
    const isHost = req.userId === existingBooking.listing.hostId;
    const isAdmin = req.role === Role.ADMIN;

    if (!isGuest && !isHost && !isAdmin) {
      res.status(403).json({ message: "You can only cancel your own bookings or bookings for your listings" });
      return;
    }

    // Check if already cancelled
    if (existingBooking.status === BookingStatus.CANCELLED) {
      res.status(400).json({ message: "Booking is already cancelled" });
      return;
    }

    // Check cancellation policy (e.g., can't cancel within 24 hours of check-in)
    const now = new Date();
    const checkInDate = new Date(existingBooking.checkIn);
    const hoursUntilCheckIn = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilCheckIn < 24 && hoursUntilCheckIn > 0) {
      res.status(400).json({ 
        message: "Cannot cancel booking within 24 hours of check-in date" 
      });
      return;
    }

    // Update status to CANCELLED instead of deleting (keep history)
    await prisma.booking.update({
      where: { id },
      data: { status: BookingStatus.CANCELLED }
    });

    // Send cancellation email (don't block response if it fails)
    if (existingBooking.guest && existingBooking.listing) {
      sendEmail(
        existingBooking.guest.email,
        "Booking Cancelled",
        bookingCancellationEmail(
          existingBooking.guest.name,
          existingBooking.listing.title,
          existingBooking.checkIn.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
          existingBooking.checkOut.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
        )
      ).catch((error) => {
        console.error("Failed to send cancellation email:", error);
      });
    }

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    handleControllerError(error, res, "bookings.deleteBooking");
  }
};

/**
 * Modify a booking's dates and guest count (Guest only — own bookings)
 * PATCH /bookings/:id/modify
 */
export const modifyBooking = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const { checkIn, checkOut, guests } = req.body as {
      checkIn?: string;
      checkOut?: string;
      guests?: number;
    };

    if (!checkIn || !checkOut || guests === undefined) {
      res.status(400).json({ message: "checkIn, checkOut, and guests are required" });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { listing: { select: { id: true, hostId: true, pricePerNight: true, guests: true } } },
    });

    if (!booking) { res.status(404).json({ message: "Booking not found" }); return; }

    const isGuest = req.userId === booking.guestId;
    const isAdmin = req.role === Role.ADMIN;
    if (!isGuest && !isAdmin) {
      res.status(403).json({ message: "You can only modify your own bookings" });
      return;
    }

    if (booking.status === BookingStatus.CANCELLED) {
      res.status(400).json({ message: "Cannot modify a cancelled booking" });
      return;
    }

    if (guests > booking.listing.guests) {
      res.status(400).json({ message: `This listing accommodates max ${booking.listing.guests} guests` });
      return;
    }

    const checkInDate  = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      res.status(400).json({ message: "Invalid dates" });
      return;
    }

    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) { res.status(400).json({ message: "checkOut must be after checkIn" }); return; }

    // Check for conflicts (excluding this booking)
    const conflict = await prisma.booking.findFirst({
      where: {
        listingId: booking.listingId,
        status: BookingStatus.CONFIRMED,
        id: { not: id },
        AND: [{ checkIn: { lt: checkOutDate } }, { checkOut: { gt: checkInDate } }],
      },
    });
    if (conflict) { res.status(409).json({ message: "Listing is already booked for these dates" }); return; }

    const totalPrice = nights * booking.listing.pricePerNight;

    const updated = await prisma.booking.update({
      where: { id },
      data: { checkIn: checkInDate, checkOut: checkOutDate, totalPrice },
      include: {
        listing: { select: { id: true, title: true, location: true } },
        guest:   { select: { id: true, name: true, email: true } },
      },
    });

    res.status(200).json({ message: "Booking modified successfully", booking: updated });
  } catch (error) {
    handleControllerError(error, res, "bookings.modifyBooking");
  }
};
