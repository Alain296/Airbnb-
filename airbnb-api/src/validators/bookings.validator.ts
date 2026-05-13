import { z } from "zod";

// Use z.enum with literal strings — z.nativeEnum breaks with Prisma enums in Zod v4
const BookingStatusEnum = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);

export const getBookingByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});

export const createBookingSchema = z.object({
  body: z.object({
    listingId: z.string().uuid("Listing ID must be a valid UUID"),
    checkIn:   z.string().datetime("checkIn must be a valid ISO date"),
    checkOut:  z.string().datetime("checkOut must be a valid ISO date"),
    guests:    z.number().int().positive("guests must be a positive integer"),
  }),
});

export const getUserBookingsSchema = z.object({
  params: z.object({
    id: z.string().uuid("User ID must be a valid UUID"),
  }),
  query: z.object({
    page:  z.string().regex(/^\d+$/, "Page must be a positive integer").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").optional(),
  }),
});

export const updateBookingStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
  body: z.object({
    status: BookingStatusEnum,
  }),
});

export const deleteBookingSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});

export type GetBookingByIdInput      = z.infer<typeof getBookingByIdSchema>;
export type CreateBookingInput       = z.infer<typeof createBookingSchema>;
export type GetUserBookingsInput     = z.infer<typeof getUserBookingsSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type DeleteBookingInput       = z.infer<typeof deleteBookingSchema>;
