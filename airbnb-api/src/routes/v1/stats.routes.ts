import { Router } from "express";
import {
  getListingStats,
  getUserStats,
  getBookingStats
} from "../../controllers/stats.controller";

const statsRouter = Router();

/**
 * @swagger
 * /listings/stats:
 *   get:
 *     summary: Get comprehensive listing statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Listing statistics including totals, averages, and distributions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalListings:
 *                   type: integer
 *                   description: Total number of listings
 *                   example: 120
 *                 averagePrice:
 *                   type: number
 *                   description: Average price per night across all listings
 *                   example: 145.50
 *                 priceRange:
 *                   type: object
 *                   properties:
 *                     min:
 *                       type: number
 *                       example: 25.00
 *                     max:
 *                       type: number
 *                       example: 500.00
 *                 byLocation:
 *                   type: array
 *                   description: Count of listings grouped by location (top 10)
 *                   items:
 *                     type: object
 *                     properties:
 *                       location:
 *                         type: string
 *                         example: "New York"
 *                       count:
 *                         type: integer
 *                         example: 30
 *                 byType:
 *                   type: array
 *                   description: Count of listings grouped by type
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: "APARTMENT"
 *                       count:
 *                         type: integer
 *                         example: 45
 *                 priceDistribution:
 *                   type: object
 *                   properties:
 *                     under50:
 *                       type: integer
 *                     from50to100:
 *                       type: integer
 *                     from100to200:
 *                       type: integer
 *                     from200to500:
 *                       type: integer
 *                     over500:
 *                       type: integer
 *                 topRated:
 *                   type: array
 *                   description: Top 5 highest rated listings
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       location:
 *                         type: string
 *                       rating:
 *                         type: number
 *                       pricePerNight:
 *                         type: number
 *                       _count:
 *                         type: object
 *                         properties:
 *                           reviews:
 *                             type: integer
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *                   description: When the statistics were generated
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
statsRouter.get("/listings/stats", getListingStats);

/**
 * @swagger
 * /users/stats:
 *   get:
 *     summary: Get comprehensive user statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: User statistics including totals, role distribution, and growth metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsers:
 *                   type: integer
 *                   description: Total number of users
 *                   example: 250
 *                 byRole:
 *                   type: array
 *                   description: Count of users grouped by role
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         enum: [HOST, GUEST, ADMIN]
 *                         example: "GUEST"
 *                       count:
 *                         type: integer
 *                         example: 180
 *                 recentSignups:
 *                   type: integer
 *                   description: Number of users who signed up in the last 30 days
 *                   example: 25
 *                 activeHosts:
 *                   type: integer
 *                   description: Number of hosts with at least one listing
 *                   example: 45
 *                 activeGuests:
 *                   type: integer
 *                   description: Number of guests with at least one booking
 *                   example: 120
 *                 topHosts:
 *                   type: array
 *                   description: Top 5 hosts by number of listings
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       avatar:
 *                         type: string
 *                       _count:
 *                         type: object
 *                         properties:
 *                           listings:
 *                             type: integer
 *                           bookings:
 *                             type: integer
 *                 monthlyGrowth:
 *                   type: array
 *                   description: User growth over the last 12 months
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2024-01"
 *                       newUsers:
 *                         type: integer
 *                         example: 15
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
statsRouter.get("/users/stats", getUserStats);

/**
 * @swagger
 * /bookings/stats:
 *   get:
 *     summary: Get comprehensive booking statistics
 *     tags: [Statistics]
 *     responses:
 *       200:
 *         description: Booking statistics including totals, revenue, and trends
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBookings:
 *                   type: integer
 *                   description: Total number of bookings
 *                   example: 85
 *                 byStatus:
 *                   type: array
 *                   description: Count of bookings grouped by status
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                         enum: [PENDING, CONFIRMED, CANCELLED]
 *                         example: "CONFIRMED"
 *                       count:
 *                         type: integer
 *                         example: 65
 *                 revenue:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       description: Total revenue from confirmed bookings
 *                       example: 12450.00
 *                     average:
 *                       type: number
 *                       description: Average booking value
 *                       example: 191.54
 *                     thisMonth:
 *                       type: number
 *                       description: Revenue for current month
 *                       example: 2340.00
 *                 bookingsThisMonth:
 *                   type: integer
 *                   description: Number of bookings created this month
 *                   example: 12
 *                 monthlyTrends:
 *                   type: array
 *                   description: Booking and revenue trends over the last 12 months
 *                   items:
 *                     type: object
 *                     properties:
 *                       month:
 *                         type: string
 *                         example: "2024-01"
 *                       bookings:
 *                         type: integer
 *                         example: 8
 *                       revenue:
 *                         type: number
 *                         example: 1250.00
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
statsRouter.get("/bookings/stats", getBookingStats);

export default statsRouter;
