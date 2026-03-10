import express from "express";
import { getMyCart, addToCart, updateCartQuantity, removeCourseFromCart } from "../controllers/cart.controller.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(authMiddleware); // Apply authentication middleware to all routes in this router


router.get("/", authMiddleware, getMyCart);
router.post("/add", authMiddleware, addToCart);
router.put("/update", authMiddleware, updateCartQuantity);
router.put("/remove", authMiddleware, removeCourseFromCart);

export default router;