import { z } from "zod";

// Use z.enum with literal strings — z.nativeEnum breaks with Prisma enums in Zod v4
const ListingTypeEnum      = z.enum(["APARTMENT", "HOUSE", "VILLA", "CABIN", "CONDO", "STUDIO"]);
const CancellationPolicyEnum = z.enum(["FLEXIBLE", "MODERATE", "STRICT", "NON_REFUNDABLE", "LONG_TERM"]);

export const getAllListingsSchema = z.object({
  query: z.object({
    location: z.string().optional(),
    type:     ListingTypeEnum.optional(),
    maxPrice: z.string().regex(/^\d+(\.\d+)?$/, "maxPrice must be a valid number").optional(),
    page:     z.string().regex(/^\d+$/, "page must be a positive integer").optional(),
    limit:    z.string().regex(/^\d+$/, "limit must be a positive integer").optional(),
    sortBy:   z.enum(["pricePerNight", "createdAt"]).optional(),
    order:    z.enum(["asc", "desc"]).optional(),
  }).optional(),
});

export const getListingByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});

export const createListingSchema = z.object({
  body: z.object({
    title:              z.string().min(1, "Title is required"),
    description:        z.string().min(10, "Description must be at least 10 characters"),
    location:           z.string().min(1, "Location is required"),
    pricePerNight:      z.number().positive("Price per night must be positive"),
    guests:             z.number().int().positive("Guests must be a positive integer"),
    type:               ListingTypeEnum,
    amenities:          z.array(z.string()).min(1, "At least one amenity is required"),
    rating:             z.number().min(0).max(5).optional(),
    isPublished:        z.boolean().optional(),
    cancellationPolicy: CancellationPolicyEnum.optional(),
    weekendPrice:       z.number().positive().optional(),
    weeklyDiscount:     z.number().min(0).max(100).optional(),
    monthlyDiscount:    z.number().min(0).max(100).optional(),
    extraGuestFee:      z.number().min(0).optional(),
    baseGuests:         z.number().int().positive().optional(),
    minNights:          z.number().int().min(1).optional(),
    maxNights:          z.number().int().min(1).optional(),
  }),
  params: z.object({}).optional(),
  query:  z.object({}).optional(),
});

export const updateListingSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
  body: z.object({
    title:              z.string().min(1).optional(),
    description:        z.string().min(10).optional(),
    location:           z.string().min(1).optional(),
    pricePerNight:      z.number().positive().optional(),
    guests:             z.number().int().positive().optional(),
    type:               ListingTypeEnum.optional(),
    amenities:          z.array(z.string()).optional(),
    rating:             z.number().min(0).max(5).optional(),
    hostId:             z.string().uuid().optional(),
    isPublished:        z.boolean().optional(),
    cancellationPolicy: CancellationPolicyEnum.optional(),
    weekendPrice:       z.number().positive().optional(),
    weeklyDiscount:     z.number().min(0).max(100).optional(),
    monthlyDiscount:    z.number().min(0).max(100).optional(),
    extraGuestFee:      z.number().min(0).optional(),
    baseGuests:         z.number().int().positive().optional(),
    minNights:          z.number().int().min(1).optional(),
    maxNights:          z.number().int().min(1).optional(),
  }),
});

export const deleteListingSchema = z.object({
  params: z.object({
    id: z.string().uuid("ID must be a valid UUID"),
  }),
});
