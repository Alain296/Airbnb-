import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";
import { getCache, setCache, deleteCachePattern, cacheKeys } from "../config/cache";
import { getParamAsString } from "../utils/params";

/**
 * Get all reviews for a specific listing (paginated)
 * GET /listings/:id/reviews
 */
export const getListingReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const listingId = getParamAsString(req.params.id);
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    // Validate parameters
    if (page < 1 || limit < 1 || limit > 50) {
      res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be 1-50" 
      });
      return;
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true }
    });

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Try cache first
    const cacheKey = cacheKeys.listingReviews(listingId, page, limit);
    const cachedResult = getCache(cacheKey);
    
    if (cachedResult) {
      res.status(200).json(cachedResult);
      return;
    }

    // Fetch reviews and count in parallel
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { listingId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true
            }
          }
        }
      }),
      prisma.review.count({
        where: { listingId }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    const result = {
      data: reviews,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };

    // Cache for 30 seconds
    setCache(cacheKey, result, 30);

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res, "reviews.getListingReviews");
  }
};

/**
 * Add a review to a listing
 * POST /listings/:id/reviews
 */
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listingId = getParamAsString(req.params.id);
    const { rating, comment } = req.body as {
      rating?: number;
      comment?: string;
    };

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Validate required fields
    if (rating === undefined || !comment) {
      res.status(400).json({ message: "Rating and comment are required" });
      return;
    }

    // Validate rating range
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be an integer between 1 and 5" });
      return;
    }

    // Validate comment length
    if (comment.trim().length < 10) {
      res.status(400).json({ message: "Comment must be at least 10 characters long" });
      return;
    }

    if (comment.length > 1000) {
      res.status(400).json({ message: "Comment must be less than 1000 characters" });
      return;
    }

    // Check if listing exists
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, hostId: true }
    });

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    // Prevent hosts from reviewing their own listings
    if (listing.hostId === req.userId) {
      res.status(400).json({ message: "You cannot review your own listing" });
      return;
    }

    // Check if user has already reviewed this listing
    const existingReview = await prisma.review.findFirst({
      where: {
        listingId,
        userId: req.userId
      }
    });

    if (existingReview) {
      res.status(400).json({ message: "You have already reviewed this listing" });
      return;
    }

    // Optional: Check if user has actually booked this listing
    const hasBooking = await prisma.booking.findFirst({
      where: {
        listingId,
        guestId: req.userId,
        status: 'CONFIRMED',
        checkOut: {
          lt: new Date() // Only past bookings
        }
      }
    });

    if (!hasBooking) {
      res.status(400).json({ 
        message: "You can only review listings you have stayed at" 
      });
      return;
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment.trim(),
        userId: req.userId,
        listingId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      }
    });

    // Clear cache for this listing's reviews
    deleteCachePattern(`listing:${listingId}:reviews`);

    // Update listing's average rating
    const avgRating = await prisma.review.aggregate({
      where: { listingId },
      _avg: { rating: true }
    });

    await prisma.listing.update({
      where: { id: listingId },
      data: { rating: avgRating._avg?.rating ?? null }
    });

    res.status(201).json({
      message: "Review created successfully",
      review
    });
  } catch (error) {
    handleControllerError(error, res, "reviews.createReview");
  }
};

/**
 * Delete a review
 * DELETE /reviews/:id
 */
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviewId = getParamAsString(req.params.id);

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Find the review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        userId: true,
        listingId: true,
        user: {
          select: { name: true }
        }
      }
    });

    if (!review) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    // Check if user owns the review or is admin
    const isAdmin = req.role === 'ADMIN';
    if (!isAdmin && review.userId !== req.userId) {
      res.status(403).json({ message: "You can only delete your own reviews" });
      return;
    }

    // Delete the review
    await prisma.review.delete({
      where: { id: reviewId }
    });

    // Clear cache for this listing's reviews
    deleteCachePattern(`listing:${review.listingId}:reviews`);

    // Update listing's average rating
    const avgRating = await prisma.review.aggregate({
      where: { listingId: review.listingId },
      _avg: { rating: true }
    });

    await prisma.listing.update({
      where: { id: review.listingId },
      data: { rating: avgRating._avg?.rating ?? null }
    });

    res.status(200).json({ 
      message: "Review deleted successfully" 
    });
  } catch (error) {
    handleControllerError(error, res, "reviews.deleteReview");
  }
};

/**
 * Get all reviews by a specific user
 * GET /users/:id/reviews
 */
export const getUserReviews = async (req: Request, res: Response): Promise<void> => {
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
      select: { id: true, name: true }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Fetch reviews and count in parallel
    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { userId },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              location: true,
              photos: {
                select: { url: true },
                take: 1
              }
            }
          }
        }
      }),
      prisma.review.count({
        where: { userId }
      })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      data: reviews,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        user: {
          id: user.id,
          name: user.name
        }
      }
    });
  } catch (error) {
    handleControllerError(error, res, "reviews.getUserReviews");
  }
};

/**
 * Host responds publicly to a review
 * PATCH /reviews/:id/response
 */
export const respondToReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviewId = getParamAsString(req.params.id);
    const { response } = req.body as { response?: string };

    if (!req.userId) { res.status(401).json({ message: "Unauthorized" }); return; }
    if (!response || response.trim().length < 5) {
      res.status(400).json({ message: "Response must be at least 5 characters" });
      return;
    }
    if (response.length > 1000) {
      res.status(400).json({ message: "Response must be under 1000 characters" });
      return;
    }

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: { listing: { select: { hostId: true } } },
    });

    if (!review) { res.status(404).json({ message: "Review not found" }); return; }

    const isAdmin = req.role === "ADMIN";
    const isHost  = review.listing.hostId === req.userId;

    if (!isAdmin && !isHost) {
      res.status(403).json({ message: "Only the listing host can respond to reviews" });
      return;
    }

    const updated = await prisma.review.update({
      where: { id: reviewId },
      data: {
        hostResponse:    response.trim(),
        hostRespondedAt: new Date(),
      },
      include: { user: { select: { id: true, name: true, avatar: true } } },
    });

    deleteCachePattern(`listing:${review.listingId}:reviews`);

    res.status(200).json({ message: "Response added successfully", review: updated });
  } catch (error) {
    handleControllerError(error, res, "reviews.respondToReview");
  }
};
