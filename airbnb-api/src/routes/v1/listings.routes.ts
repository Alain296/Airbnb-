import { Router } from "express";
import {
  createListing,
  deleteListing,
  getAllListings,
  getListingById,
  updateListing,
  searchListings,
  getBlockedDates,
  setBlockedDates,
} from "../../controllers/listings.controller";
import { authenticate, optionalAuth, requireHost } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import { searchLimiter, strictLimiter } from "../../middlewares/rateLimiter";
import {
  createListingSchema,
  deleteListingSchema,
  getAllListingsSchema,
  getListingByIdSchema,
  updateListingSchema
} from "../../validators/listings.validator";

const listingsRouter = Router();

/**
 * @swagger
 * /listings/search:
 *   get:
 *     summary: Advanced search and filtering for listings
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (case-insensitive partial match)
 *         example: "New York"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN, CONDO, STUDIO]
 *         description: Filter by listing type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per night
 *         example: 50
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per night
 *         example: 200
 *       - in: query
 *         name: guests
 *         schema:
 *           type: integer
 *         description: Minimum number of guests the listing can accommodate
 *         example: 2
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 50
 *         description: Number of listings per page (max 50)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, pricePerNight, rating, guests]
 *           default: createdAt
 *         description: Field to sort by
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Search results with pagination and metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Listing'
 *                       - type: object
 *                         properties:
 *                           host:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                               avatar:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                           photos:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 url:
 *                                   type: string
 *                           _count:
 *                             type: object
 *                             properties:
 *                               reviews:
 *                                 type: integer
 *                               bookings:
 *                                 type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       description: Total number of listings matching the search
 *                     page:
 *                       type: integer
 *                       description: Current page number
 *                     limit:
 *                       type: integer
 *                       description: Number of items per page
 *                     totalPages:
 *                       type: integer
 *                       description: Total number of pages
 *                     hasNextPage:
 *                       type: boolean
 *                       description: Whether there is a next page
 *                     hasPrevPage:
 *                       type: boolean
 *                       description: Whether there is a previous page
 *                     filters:
 *                       type: object
 *                       description: Applied filters
 *                     sorting:
 *                       type: object
 *                       description: Applied sorting
 *       400:
 *         description: Invalid search parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       429:
 *         description: Too many search requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.get("/search", searchLimiter, searchListings);

/**
 * @swagger
 * /listings:
 *   get:
 *     summary: Get all listings with optional filters
 *     tags: [Listings]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of listings per page
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *         example: "New York"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN, CONDO, STUDIO]
 *         description: Filter by listing type
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Minimum price per night
 *         example: 50
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Maximum price per night
 *         example: 200
 *       - in: query
 *         name: guests
 *         schema:
 *           type: integer
 *         description: Minimum number of guests
 *         example: 2
 *     responses:
 *       200:
 *         description: Paginated list of listings
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginatedResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.get("/", optionalAuth, validate(getAllListingsSchema), getAllListings);

/**
 * @swagger
 * /listings/{id}:
 *   get:
 *     summary: Get listing by ID
 *     tags: [Listings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Listing details with host information and photos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Listing'
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.get("/:id", optionalAuth, validate(getListingByIdSchema), getListingById);

/**
 * @swagger
 * /listings:
 *   post:
 *     summary: Create a new listing (Host only)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListingInput'
 *     responses:
 *       201:
 *         description: Listing created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing created successfully"
 *                 listing:
 *                   $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Host access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.post("/", authenticate, requireHost, strictLimiter, validate(createListingSchema), createListing);

/**
 * @swagger
 * /listings/{id}:
 *   put:
 *     summary: Update listing (Host only - own listings)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Cozy Downtown Apartment"
 *               description:
 *                 type: string
 *                 example: "Newly renovated apartment in the heart of the city"
 *               location:
 *                 type: string
 *                 example: "New York, NY"
 *               pricePerNight:
 *                 type: number
 *                 example: 130.00
 *               guests:
 *                 type: integer
 *                 example: 4
 *               type:
 *                 type: string
 *                 enum: [APARTMENT, HOUSE, VILLA, CABIN, CONDO, STUDIO]
 *                 example: "APARTMENT"
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["WiFi", "Kitchen", "Air Conditioning", "Parking", "Pool"]
 *     responses:
 *       200:
 *         description: Listing updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing updated successfully"
 *                 listing:
 *                   $ref: '#/components/schemas/Listing'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Can only update own listings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.put("/:id", authenticate, requireHost, strictLimiter, validate(updateListingSchema), updateListing);

/**
 * @swagger
 * /listings/{id}:
 *   delete:
 *     summary: Delete listing (Host only - own listings)
 *     tags: [Listings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Listing ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Listing deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Listing deleted successfully"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Can only delete own listings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Listing not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
listingsRouter.delete("/:id", authenticate, requireHost, strictLimiter, validate(deleteListingSchema), deleteListing);

// Availability / blocked dates
listingsRouter.get("/:id/blocked-dates", getBlockedDates);
listingsRouter.put("/:id/blocked-dates", authenticate, requireHost, setBlockedDates);

export default listingsRouter;

