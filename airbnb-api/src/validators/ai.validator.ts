import { z } from "zod";

// Smart Search Validator
export const smartSearchValidator = z.object({
  body: z.object({
    query: z.string()
      .min(1, "Query is required")
      .max(500, "Query must be less than 500 characters")
      .trim()
  }),
  query: z.object({
    page: z.string().optional().refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 1),
      "Page must be a positive integer"
    ),
    limit: z.string().optional().refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 1 && Number(val) <= 50),
      "Limit must be between 1 and 50"
    )
  })
});

// Description Generator Validator
export const generateDescriptionValidator = z.object({
  body: z.object({
    title: z.string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    location: z.string()
      .min(1, "Location is required")
      .max(100, "Location must be less than 100 characters"),
    type: z.enum(["APARTMENT", "HOUSE", "STUDIO", "CONDO"]),
    guests: z.number()
      .int("Guests must be an integer")
      .min(1, "Guests must be at least 1")
      .max(20, "Guests cannot exceed 20"),
    pricePerNight: z.number()
      .min(1, "Price must be at least $1")
      .max(10000, "Price cannot exceed $10,000"),
    amenities: z.array(z.string()).optional(),
    tone: z.enum(["professional", "friendly", "luxury", "casual"]).optional().default("friendly")
  })
});

// Guest Support Chatbot Validator
export const guestSupportValidator = z.object({
  body: z.object({
    message: z.string()
      .min(1, "Message is required")
      .max(1000, "Message must be less than 1000 characters"),
    listingId: z.string()
      .uuid("Invalid listing ID format")
      .optional()
      .or(z.literal(undefined))
      .or(z.null()),
    conversationId: z.string()
      .optional()
      .or(z.literal(undefined))
      .or(z.null())
  })
});

// Booking Recommendations Validator
export const bookingRecommendationsValidator = z.object({
  body: z.object({
    preferences: z.object({
      location: z.string().optional(),
      budget: z.object({
        min: z.number().min(0).optional(),
        max: z.number().min(0).optional()
      }).optional(),
      dates: z.object({
        checkIn: z.string().datetime("Invalid check-in date format"),
        checkOut: z.string().datetime("Invalid check-out date format")
      }),
      guests: z.number()
        .int("Guests must be an integer")
        .min(1, "Guests must be at least 1")
        .max(20, "Guests cannot exceed 20"),
      amenities: z.array(z.string()).optional(),
      type: z.enum(["APARTMENT", "HOUSE", "STUDIO", "CONDO"]).optional()
    }),
    userId: z.string().uuid("Invalid user ID format").optional()
  })
});

// Review Summarizer Validator
export const reviewSummarizerValidator = z.object({
  params: z.object({
    listingId: z.string().uuid("Invalid listing ID format")
  }),
  query: z.object({
    refresh: z.string().optional().refine(
      (val) => !val || val === "true" || val === "false",
      "Refresh must be true or false"
    )
  })
});