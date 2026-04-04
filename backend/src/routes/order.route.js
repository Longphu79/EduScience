import express from "express";
import {
  getOrderHistory,
  getPaymentStatus,
  retryOrder,
} from "../controllers/checkout.controller.js";
import { authMiddleware, requireRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, requireRoles("student"), getOrderHistory);
router.post("/:orderId/retry", authMiddleware, requireRoles("student"), retryOrder);
router.get("/:orderId/status", authMiddleware, requireRoles("student"), getPaymentStatus);

export default router;
