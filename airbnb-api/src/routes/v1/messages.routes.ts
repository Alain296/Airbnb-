import { Router } from "express";
import { getBookingMessages, sendBookingMessage } from "../../controllers/messages.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const messagesRouter = Router();

messagesRouter.get("/bookings/:bookingId/messages", authenticate, getBookingMessages);
messagesRouter.post("/bookings/:bookingId/messages", authenticate, sendBookingMessage);

export default messagesRouter;
