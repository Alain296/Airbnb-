import { Router } from "express";
import {
  addPaymentMethod,
  deletePaymentMethod,
  getMe,
  getPaymentMethods,
  updateMe,
} from "../../controllers/account.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const accountRouter = Router();

accountRouter.get("/me", authenticate, getMe);
accountRouter.put("/me", authenticate, updateMe);
accountRouter.get("/payment-methods", authenticate, getPaymentMethods);
accountRouter.post("/payment-methods", authenticate, addPaymentMethod);
accountRouter.delete("/payment-methods/:id", authenticate, deletePaymentMethod);

export default accountRouter;
