/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         role:
 *           type: string
 *           enum: [HOST, GUEST, ADMIN]
 *           example: "GUEST"
 *         avatar:
 *           type: string
 *           nullable: true
 *           example: "https://res.cloudinary.com/demo/image/upload/v1234567890/avatar.jpg"
 *         avatarPublicId:
 *           type: string
 *           nullable: true
 *           example: "airbnb/avatars/abc123"
 *         bio:
 *           type: string
 *           nullable: true
 *           example: "Travel enthusiast and host"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *
 *     Listing:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         title:
 *           type: string
 *           example: "Cozy Downtown Apartment"
 *         description:
 *           type: string
 *           example: "Beautiful apartment in the heart of the city"
 *         location:
 *           type: string
 *           example: "New York, NY"
 *         pricePerNight:
 *           type: number
 *           example: 120.50
 *         guests:
 *           type: integer
 *           example: 4
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN, CONDO, STUDIO]
 *           example: "APARTMENT"
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           example: ["WiFi", "Kitchen", "Air Conditioning", "Parking"]
 *         rating:
 *           type: number
 *           nullable: true
 *           example: 4.5
 *         hostId:
 *           type: integer
 *           example: 2
 *         host:
 *           $ref: '#/components/schemas/User'
 *         photos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ListingPhoto'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *
 *     ListingPhoto:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         url:
 *           type: string
 *           example: "https://res.cloudinary.com/demo/image/upload/v1234567890/listing.jpg"
 *         publicId:
 *           type: string
 *           example: "airbnb/listings/abc123"
 *         listingId:
 *           type: integer
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *
 *     Booking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         checkIn:
 *           type: string
 *           format: date-time
 *           example: "2024-02-01T15:00:00Z"
 *         checkOut:
 *           type: string
 *           format: date-time
 *           example: "2024-02-05T11:00:00Z"
 *         totalPrice:
 *           type: number
 *           example: 482.00
 *         status:
 *           type: string
 *           enum: [PENDING, CONFIRMED, CANCELLED]
 *           example: "CONFIRMED"
 *         guestId:
 *           type: integer
 *           example: 1
 *         listingId:
 *           type: integer
 *           example: 1
 *         guest:
 *           $ref: '#/components/schemas/User'
 *         listing:
 *           $ref: '#/components/schemas/Listing'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00Z"
 *
 *     RegisterInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - username
 *         - phone
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         username:
 *           type: string
 *           example: "johndoe"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "securePassword123"
 *         role:
 *           type: string
 *           enum: [HOST, GUEST]
 *           example: "GUEST"
 *
 *     LoginInput:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *         password:
 *           type: string
 *           example: "securePassword123"
 *
 *     CreateListingInput:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - location
 *         - pricePerNight
 *         - guests
 *         - type
 *         - amenities
 *       properties:
 *         title:
 *           type: string
 *           example: "Cozy Downtown Apartment"
 *         description:
 *           type: string
 *           example: "Beautiful apartment in the heart of the city"
 *         location:
 *           type: string
 *           example: "New York, NY"
 *         pricePerNight:
 *           type: number
 *           example: 120.50
 *         guests:
 *           type: integer
 *           minimum: 1
 *           example: 4
 *         type:
 *           type: string
 *           enum: [APARTMENT, HOUSE, VILLA, CABIN, CONDO, STUDIO]
 *           example: "APARTMENT"
 *         amenities:
 *           type: array
 *           items:
 *             type: string
 *           example: ["WiFi", "Kitchen", "Air Conditioning", "Parking"]
 *
 *     CreateBookingInput:
 *       type: object
 *       required:
 *         - listingId
 *         - checkIn
 *         - checkOut
 *       properties:
 *         listingId:
 *           type: integer
 *           example: 1
 *         checkIn:
 *           type: string
 *           format: date-time
 *           example: "2024-02-01T15:00:00Z"
 *         checkOut:
 *           type: string
 *           format: date-time
 *           example: "2024-02-05T11:00:00Z"
 *
 *     UpdateUserInput:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "John Doe"
 *         phone:
 *           type: string
 *           example: "+1234567890"
 *         bio:
 *           type: string
 *           example: "Travel enthusiast and host"
 *
 *     ChangePasswordInput:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           example: "oldPassword123"
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           example: "newSecurePassword123"
 *
 *     ForgotPasswordInput:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: "john.doe@example.com"
 *
 *     ResetPasswordInput:
 *       type: object
 *       required:
 *         - password
 *       properties:
 *         password:
 *           type: string
 *           minLength: 6
 *           example: "newSecurePassword123"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Login successful"
 *         token:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Resource not found"
 *         error:
 *           type: string
 *           example: "Detailed error information"
 *
 *     PaginatedResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items: {}
 *         meta:
 *           type: object
 *           properties:
 *             page:
 *               type: integer
 *               example: 1
 *             limit:
 *               type: integer
 *               example: 10
 *             total:
 *               type: integer
 *               example: 50
 *             totalPages:
 *               type: integer
 *               example: 5
 */

import { Router } from "express";
import {
  changePassword,
  forgotPassword,
  getMe,
  login,
  register,
  resetPassword,
  becomeHost,
} from "../../controllers/auth.controller";
import { googleAuth, googleCallback } from "../../controllers/oauth.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { validate } from "../../middlewares/validate.middleware";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema
} from "../../validators/auth.validator";

const authRouter = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User registered successfully"
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Email or username already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/register", validate(registerSchema), register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/login", validate(loginSchema), login);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.get("/me", authenticate, getMe);

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordInput'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password changed successfully"
 *       400:
 *         description: Validation error or incorrect current password
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
 */
authRouter.post("/change-password", authenticate, validate(changePasswordSchema), changePassword);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends a password reset email. Returns the same response whether email exists or not for security.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset email sent (if email exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "If the email exists, a password reset link has been sent"
 */
authRouter.post("/forgot-password", validate(forgotPasswordSchema), forgotPassword);

/**
 * @swagger
 * /auth/reset-password/{token}:
 *   post:
 *     summary: Reset password with token
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Password reset token from email
 *         example: "abc123def456ghi789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordInput'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Password reset successfully"
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
authRouter.post("/reset-password/:token", validate(resetPasswordSchema), resetPassword);

// ── Google OAuth ──────────────────────────────────────────────────────
authRouter.get("/google",          googleAuth);
authRouter.get("/google/callback", googleCallback);

// ── Become a Host ─────────────────────────────────────────────────────
authRouter.post("/become-host", authenticate, becomeHost);

export default authRouter;
