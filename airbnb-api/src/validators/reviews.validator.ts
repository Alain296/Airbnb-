import { z } from "zod";

// Schema for getting listing reviews
export const getListingReviewsSchema = z.object({
  params: z.object({
    id: z.string().uuid("Listing ID must be a valid UUID")
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, "Page must be a positive integer").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").optional()
  })
});

// Schema for creating a review
export const createReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid("Listing ID must be a valid UUID")
  }),
  body: z.object({
    rating: z.number()
      .int("Rating must be an integer")
      .min(1, "Rating must be at least 1")
      .max(5, "Rating must be at most 5"),
    comment: z.string()
      .min(10, "Comment must be at least 10 characters long")
      .max(1000, "Comment must be less than 1000 characters")
      .trim()
  })
});

// Schema for deleting a review
export const deleteReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid("Review ID must be a valid UUID")
  })
});

// Schema for getting user reviews
export const getUserReviewsSchema = z.object({
  params: z.object({
    id: z.string().uuid("User ID must be a valid UUID")
  }),
  query: z.object({
    page: z.string().regex(/^\d+$/, "Page must be a positive integer").optional(),
    limit: z.string().regex(/^\d+$/, "Limit must be a positive integer").optional()
  })
});

export type GetListingReviewsInput = z.infer<typeof getListingReviewsSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type DeleteReviewInput = z.infer<typeof deleteReviewSchema>;
export type GetUserReviewsInput = z.infer<typeof getUserReviewsSchema>;