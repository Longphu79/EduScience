import express from "express";
import { getMyCart, addToCart } from "../controllers/cart.controller.js";
import { verifyToken } from "../config/jwt.js";

const router = express.Router();

router.get("/", verifyToken, getMyCart);
router.post("/add", verifyToken, addToCart);

export default router;