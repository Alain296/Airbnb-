import { Router } from "express";
import authRouter from "./auth.routes";
import usersRouter from "./users.routes";
import listingsRouter from "./listings.routes";
import bookingsRouter from "./bookings.routes";
import reviewsRouter from "./reviews.routes";
import statsRouter from "./stats.routes";
import uploadRouter from "./upload.routes";
import aiRouter from "./ai.routes";
import messagesRouter from "./messages.routes";
import accountRouter from "./account.routes";
import { authenticate, requireAdmin } from "../../middlewares/auth.middleware";

const v1Router = Router();

// Auth routes (public)
v1Router.use("/auth", authRouter);

// Upload routes (must come before /users to avoid admin middleware)
v1Router.use(uploadRouter);

// Stats routes — must come BEFORE /users and /listings to avoid middleware conflicts
// e.g. GET /users/stats must not be caught by the admin-only /users router
v1Router.use(statsRouter);

// User routes (admin only)
v1Router.use("/users", authenticate, requireAdmin, usersRouter);

// Signed-in user's own profile, payment methods, and booking messages
v1Router.use("/account", accountRouter);
v1Router.use(messagesRouter);

// Listing routes
v1Router.use("/listings", listingsRouter);

// Booking routes
v1Router.use("/bookings", bookingsRouter);

// Review routes (includes both /listings/:id/reviews and /reviews/:id)
v1Router.use(reviewsRouter);

// AI routes
v1Router.use("/ai", aiRouter);

export default v1Router;
