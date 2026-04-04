import express from "express";
import { authMiddleware, requireRoles } from "../middleware/authMiddleware.js";
import {
  checkout,
  getCheckoutInfo,
  getPaymentStatus,
} from "../controllers/checkout.controller.js";

const router = express.Router();

router.post("/", authMiddleware, requireRoles("student"), checkout);
router.get("/:orderId", authMiddleware, requireRoles("student"), getCheckoutInfo);

export default router;
