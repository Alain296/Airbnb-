import { Router } from "express";
import { 
  smartSearch,
  smartSearchGET,
  generateDescription,
  guestSupport,
  getBookingRecommendations,
  getReviewSummary,
  testAI
} from "../../controllers/ai.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authenticate, optionalAuth } from "../../middlewares/auth.middleware";
import {
  smartSearchValidator,
  generateDescriptionValidator,
  guestSupportValidator,
  bookingRecommendationsValidator,
  reviewSummarizerValidator
} from "../../validators/ai.validator";

const aiRouter = Router();

/**
 * @swagger
 * /api/v1/ai/test:
 *   get:
 *     summary: Test AI connection
 *     tags: [AI Features]
 *     responses:
 *       200:
 *         description: AI connection successful
 *       500:
 *         description: AI connection failed
 */
aiRouter.get("/test", testAI);

/**
 * @swagger
 * /api/v1/ai/search:
 *   post:
 *     summary: Smart listing search with AI-powered filter extraction
 *     tags: [AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 example: "2 bedroom apartment in downtown under $200"
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results with extracted filters
 *       400:
 *         description: Invalid query or parameters
 *       500:
 *         description: AI service error
 *   get:
 *     summary: Smart listing search with AI-powered filter extraction (GET method)
 *     tags: [AI Features]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *           example: "2 bedroom apartment in downtown under $200"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Search results with extracted filters
 *       400:
 *         description: Invalid query or parameters
 *       500:
 *         description: AI service error
 */
aiRouter.post("/search", validate(smartSearchValidator), smartSearch);
aiRouter.get("/search", smartSearchGET);

/**
 * @swagger
 * /api/v1/ai/generate-description:
 *   post:
 *     summary: Generate AI-powered listing description
 *     tags: [AI Features]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - location
 *               - type
 *               - guests
 *               - pricePerNight
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Cozy Downtown Apartment"
 *               location:
 *                 type: string
 *                 example: "New York, NY"
 *               type:
 *                 type: string
 *                 enum: [APARTMENT, HOUSE, STUDIO, CONDO]
 *               guests:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *               pricePerNight:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 10000
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *               tone:
 *                 type: string
 *                 enum: [professional, friendly, luxury, casual]
 *                 default: friendly
 *     responses:
 *       200:
 *         description: Generated description
 *       401:
 *         description: Authentication required
 *       400:
 *         description: Invalid input data
 */
aiRouter.post("/generate-description", authenticate, validate(generateDescriptionValidator), generateDescription);

/**
 * @swagger
 * /api/v1/ai/support:
 *   post:
 *     summary: AI-powered guest support chatbot
 *     tags: [AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "What are the check-in instructions?"
 *               listingId:
 *                 type: string
 *                 format: uuid
 *               conversationId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: AI support response
 *       400:
 *         description: Invalid message format
 */
aiRouter.post("/support", validate(guestSupportValidator), guestSupport);

/**
 * @swagger
 * /api/v1/ai/recommendations:
 *   post:
 *     summary: Get AI-powered booking recommendations
 *     tags: [AI Features]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - preferences
 *             properties:
 *               preferences:
 *                 type: object
 *                 required:
 *                   - dates
 *                   - guests
 *                 properties:
 *                   location:
 *                     type: string
 *                   budget:
 *                     type: object
 *                     properties:
 *                       min:
 *                         type: number
 *                       max:
 *                         type: number
 *                   dates:
 *                     type: object
 *                     required:
 *                       - checkIn
 *                       - checkOut
 *                     properties:
 *                       checkIn:
 *                         type: string
 *                         format: date-time
 *                       checkOut:
 *                         type: string
 *                         format: date-time
 *                   guests:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 20
 *                   amenities:
 *                     type: array
 *                     items:
 *                       type: string
 *                   type:
 *                     type: string
 *                     enum: [APARTMENT, HOUSE, STUDIO, CONDO]
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Personalized recommendations
 *       400:
 *         description: Invalid preferences
 */
aiRouter.post("/recommendations", optionalAuth, validate(bookingRecommendationsValidator), getBookingRecommendations);

/**
 * @swagger
 * /api/v1/ai/reviews/{listingId}/summary:
 *   get:
 *     summary: Get AI-generated review summary for a listing
 *     tags: [AI Features]
 *     parameters:
 *       - in: path
 *         name: listingId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: refresh
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force refresh of cached summary
 *     responses:
 *       200:
 *         description: Review summary with insights
 *       404:
 *         description: Listing not found or no reviews
 *       400:
 *         description: Invalid listing ID
 */
aiRouter.get("/reviews/:listingId/summary", validate(reviewSummarizerValidator), getReviewSummary);

export default aiRouter;