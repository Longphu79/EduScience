import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  checkout,
  getCheckoutInfo,
  getPaymentStatus,
} from "../controllers/checkout.controller.js";

const router = express.Router();

router.post("/", authMiddleware, checkout);
router.get("/:orderId", authMiddleware, getCheckoutInfo);

export default router;
