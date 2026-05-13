import { ListingType, Prisma, Role } from "@prisma/client";
import { Request, Response } from "express";
import prisma from "../config/prisma";
import { AuthRequest } from "../middlewares/auth.middleware";
import { handleControllerError } from "../utils/error-handler";
import { getCache, setCache, deleteCachePattern, cacheKeys } from "../config/cache";
import { getParamAsString } from "../utils/params";

const validListingType = (value: string): value is ListingType =>
  Object.values(ListingType).includes(value as ListingType);

/**
 * Advanced search and filtering for listings
 * GET /listings/search
 */
export const searchListings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract and validate query parameters
    const {
      location,
      type,
      minPrice,
      maxPrice,
      guests,
      page = "1",
      limit = "10",
      sortBy = "createdAt",
      order = "desc"
    } = req.query as {
      location?: string;
      type?: string;
      minPrice?: string;
      maxPrice?: string;
      guests?: string;
      page?: string;
      limit?: string;
      sortBy?: string;
      order?: string;
    };

    // Validate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    if (isNaN(pageNum) || pageNum < 1 || isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
      res.status(400).json({ 
        message: "Invalid pagination parameters. Page must be >= 1, limit must be 1-50" 
      });
      return;
    }

    // Build cache key from search parameters
    const searchParams = new URLSearchParams({
      ...(location && { location }),
      ...(type && { type }),
      ...(minPrice && { minPrice }),
      ...(maxPrice && { maxPrice }),
      ...(guests && { guests }),
      page,
      limit,
      sortBy,
      order
    }).toString();

    const cacheKey = cacheKeys.searchListings(searchParams);

    // Try to get from cache first
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      res.status(200).json(cachedResult);
      return;
    }

    // Build dynamic where clause
    const where: Prisma.ListingWhereInput = {};

    if (location) {
      where.location = { 
        contains: location, 
        mode: "insensitive" 
      };
    }

    if (type) {
      const normalizedType = type.toUpperCase();
      if (!validListingType(normalizedType)) {
        res.status(400).json({ message: "Invalid listing type. Must be one of: APARTMENT, HOUSE, VILLA, CABIN, CONDO, STUDIO" });
        return;
      }
      where.type = normalizedType;
    }

    // Price range filtering
    if (minPrice || maxPrice) {
      where.pricePerNight = {};
      
      if (minPrice) {
        const minPriceNum = parseFloat(minPrice);
        if (isNaN(minPriceNum) || minPriceNum < 0) {
          res.status(400).json({ message: "minPrice must be a valid positive number" });
          return;
        }
        where.pricePerNight.gte = minPriceNum;
      }

      if (maxPrice) {
        const maxPriceNum = parseFloat(maxPrice);
        if (isNaN(maxPriceNum) || maxPriceNum < 0) {
          res.status(400).json({ message: "maxPrice must be a valid positive number" });
          return;
        }
        where.pricePerNight.lte = maxPriceNum;
      }

      // Validate price range
      if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
        res.status(400).json({ message: "minPrice cannot be greater than maxPrice" });
        return;
      }
    }

    if (guests) {
      const guestsNum = parseInt(guests, 10);
      if (isNaN(guestsNum) || guestsNum < 1) {
        res.status(400).json({ message: "guests must be a positive integer" });
        return;
      }
      where.guests = { gte: guestsNum };
    }

    // Build orderBy clause
    const validSortFields = ["createdAt", "pricePerNight", "rating", "guests"];
    const validOrders = ["asc", "desc"];

    if (!validSortFields.includes(sortBy)) {
      res.status(400).json({ 
        message: `Invalid sortBy field. Must be one of: ${validSortFields.join(", ")}` 
      });
      return;
    }

    if (!validOrders.includes(order)) {
      res.status(400).json({ 
        message: "Invalid order. Must be 'asc' or 'desc'" 
      });
      return;
    }

    const orderBy = { [sortBy]: order };

    // Execute queries in parallel for better performance
    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        orderBy,
        include: {
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: true
            }
          },
          photos: {
            select: {
              id: true,
              url: true
            },
            take: 1 // Just get the first photo for listing preview
          },
          _count: {
            select: {
              reviews: true,
              bookings: true
            }
          }
        }
      }),
      prisma.listing.count({ where })
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPrevPage = pageNum > 1;

    const result = {
      data: listings,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasNextPage,
        hasPrevPage,
        filters: {
          location,
          type,
          minPrice: minPrice ? parseFloat(minPrice) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
          guests: guests ? parseInt(guests, 10) : undefined
        },
        sorting: {
          sortBy,
          order
        }
      }
    };

    // Cache the result for 60 seconds
    setCache(cacheKey, result, 60);

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res, "listings.searchListings");
  }
};

export const getAllListings = async (req: Request, res: Response): Promise<void> => {
  try {
    const location = req.query.location as string | undefined;
    const type = req.query.type as string | undefined;
    const maxPriceRaw = req.query.maxPrice as string | undefined;
    const pageRaw = req.query.page as string | undefined;
    const limitRaw = req.query.limit as string | undefined;
    const sortBy = req.query.sortBy as "pricePerNight" | "createdAt" | undefined;
    const orderRaw = req.query.order as string | undefined;

    const page = pageRaw ? Number.parseInt(pageRaw, 10) : 1;
    const limit = limitRaw ? Number.parseInt(limitRaw, 10) : 10;

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
      res.status(400).json({ message: "page and limit must be positive integers" });
      return;
    }

    // Build cache key from query parameters
    const queryParams = new URLSearchParams({
      ...(location && { location }),
      ...(type && { type }),
      ...(maxPriceRaw && { maxPrice: maxPriceRaw }),
      page: page.toString(),
      limit: limit.toString(),
      ...(sortBy && { sortBy }),
      ...(orderRaw && { order: orderRaw })
    }).toString();

    const cacheKey = cacheKeys.listings(page, limit, queryParams);

    // Try cache first
    const cachedResult = getCache(cacheKey);
    if (cachedResult) {
      res.status(200).json(cachedResult);
      return;
    }

    const where: Prisma.ListingWhereInput = {};

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (type) {
      const normalizedType = type.toUpperCase();
      if (!validListingType(normalizedType)) {
        res.status(400).json({ message: "Invalid listing type filter" });
        return;
      }
      where.type = normalizedType;
    }

    if (maxPriceRaw !== undefined) {
      const maxPrice = Number(maxPriceRaw);
      if (Number.isNaN(maxPrice)) {
        res.status(400).json({ message: "maxPrice must be a valid number" });
        return;
      }
      where.pricePerNight = { lte: maxPrice };
    }

    const orderBy: { [key: string]: 'asc' | 'desc' } =
      sortBy && (orderRaw === "asc" || orderRaw === "desc")
        ? { [sortBy]: orderRaw }
        : { createdAt: 'desc' };

    const [listings, totalCount] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          location: true,
          pricePerNight: true,
          guests: true,
          type: true,
          rating: true,
          createdAt: true,
          host: { 
            select: { 
              id: true,
              name: true, 
              avatar: true 
            } 
          },
          photos: {
            select: { url: true },
            take: 1
          },
          _count: {
            select: { reviews: true }
          }
        }
      }),
      prisma.listing.count({ where })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    const result = {
      data: listings,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };

    // Cache for 60 seconds
    setCache(cacheKey, result, 60);

    res.status(200).json(result);
  } catch (error) {
    handleControllerError(error, res, "listings.getAllListings");
  }
};

export const getListingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        host: true,
        bookings: true
      }
    });

    if (!listing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    res.status(200).json(listing);
  } catch (error) {
    handleControllerError(error, res, "listings.getListingById");
  }
};

export const createListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, location, pricePerNight, guests, type, amenities, rating } = req.body as {
        title?: string;
        description?: string;
        location?: string;
        pricePerNight?: number;
        guests?: number;
        type?: ListingType;
        amenities?: string[];
        rating?: number;
      };

    if (
      !title ||
      !description ||
      !location ||
      pricePerNight === undefined ||
      guests === undefined ||
      !type ||
      !amenities
    ) {
      res.status(400).json({ message: "Missing required listing fields" });
      return;
    }

    if (!req.userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        location,
        pricePerNight,
        guests,
        type,
        amenities,
        rating,
        hostId: req.userId
      }
    });

    // Clear relevant caches
    deleteCachePattern('listings:');
    deleteCachePattern('search:listings:');
    deleteCachePattern('stats:listings');

    res.status(201).json({
      message: "Listing created successfully",
      listing
    });
  } catch (error) {
    handleControllerError(error, res, "listings.createListing");
  }
};

export const updateListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const existingListing = await prisma.listing.findFirst({ where: { id } });
    const isAdmin = String(req.role) === "ADMIN";

    if (!existingListing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (!isAdmin && (req.role !== Role.HOST || !req.userId || existingListing.hostId !== req.userId)) {
      res.status(403).json({ message: "You can only edit your own listings" });
      return;
    }

    if (!isAdmin) {
      delete req.body.hostId;
    }

    const listing = await prisma.listing.update({
      where: { id },
      data: req.body
    });

    // Clear relevant caches
    deleteCachePattern('listings:');
    deleteCachePattern('search:listings:');
    deleteCachePattern('stats:listings');

    res.status(200).json({
      message: "Listing updated successfully",
      listing
    });
  } catch (error) {
    handleControllerError(error, res, "listings.updateListing");
  }
};

export const deleteListing = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const existingListing = await prisma.listing.findFirst({ where: { id } });
    const isAdmin = String(req.role) === "ADMIN";

    if (!existingListing) {
      res.status(404).json({ message: "Listing not found" });
      return;
    }

    if (!isAdmin && (req.role !== Role.HOST || !req.userId || existingListing.hostId !== req.userId)) {
      res.status(403).json({ message: "You can only delete your own listings" });
      return;
    }

    await prisma.listing.delete({ where: { id } });

    // Clear relevant caches
    deleteCachePattern('listings:');
    deleteCachePattern('search:listings:');
    deleteCachePattern('stats:listings');

    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (error) {
    handleControllerError(error, res, "listings.deleteListing");
  }
};

/**
 * Get blocked dates for a listing
 * GET /listings/:id/blocked-dates
 */
export const getBlockedDates = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) { res.status(404).json({ message: "Listing not found" }); return; }

    // Also include dates blocked by confirmed bookings
    const [manualBlocked, confirmedBookings] = await Promise.all([
      prisma.blockedDate.findMany({ where: { listingId: id }, orderBy: { date: "asc" } }),
      prisma.booking.findMany({
        where: { listingId: id, status: "CONFIRMED" },
        select: { checkIn: true, checkOut: true },
      }),
    ]);

    // Expand booking ranges into individual dates
    const bookingDates: string[] = [];
    for (const b of confirmedBookings) {
      const cur = new Date(b.checkIn);
      const end = new Date(b.checkOut);
      while (cur < end) {
        bookingDates.push(cur.toISOString().slice(0, 10));
        cur.setDate(cur.getDate() + 1);
      }
    }

    const manualDates = manualBlocked.map((d) => ({
      id: d.id,
      date: d.date.toISOString().slice(0, 10),
    }));

    res.status(200).json({
      manual: manualDates,
      bookings: [...new Set(bookingDates)],
      minNights: listing.minNights,
      maxNights: listing.maxNights,
    });
  } catch (error) {
    handleControllerError(error, res, "listings.getBlockedDates");
  }
};

/**
 * Set blocked dates for a listing (replaces all manual blocked dates)
 * PUT /listings/:id/blocked-dates
 */
export const setBlockedDates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = getParamAsString(req.params.id);
    const { dates } = req.body as { dates?: string[] };

    const listing = await prisma.listing.findUnique({ where: { id } });
    if (!listing) { res.status(404).json({ message: "Listing not found" }); return; }

    const isAdmin = String(req.role) === "ADMIN";
    if (!isAdmin && listing.hostId !== req.userId) {
      res.status(403).json({ message: "You can only manage your own listing's availability" });
      return;
    }

    if (!Array.isArray(dates)) {
      res.status(400).json({ message: "dates must be an array of date strings (YYYY-MM-DD)" });
      return;
    }

    // Delete all existing manual blocked dates and recreate
    await prisma.blockedDate.deleteMany({ where: { listingId: id } });

    if (dates.length > 0) {
      const records = dates.map((d) => ({
        listingId: id,
        date: new Date(d),
      }));
      await prisma.blockedDate.createMany({ data: records, skipDuplicates: true });
    }

    res.status(200).json({ message: "Blocked dates updated", count: dates.length });
  } catch (error) {
    handleControllerError(error, res, "listings.setBlockedDates");
  }
};
