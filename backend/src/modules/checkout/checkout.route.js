import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import {
    checkout,
    getCheckoutInfo,
    getPaymentStatus,
} from "./checkout.controller.js";

const router = express.Router();

router.post("/", verifyToken, checkout);
router.get("/:orderId", verifyToken, getCheckoutInfo);

export default router;
