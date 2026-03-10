import express from "express";
import { getPaymentStatus } from "../controllers/checkout.controller.js";

const router = express.Router();

router.get("/:orderId/status", getPaymentStatus);

export default router;
