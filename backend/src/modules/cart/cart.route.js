import express from "express";
import {
  getMyCart,
  addToCart,
  removeFromCart,
  updateItemQuantity,
  clearMyCart,
  checkoutMyCart,
} from "./cart.controller.js";
import { verifyToken } from "../../config/jwt.js";

const router = express.Router();

router.get("/", verifyToken, getMyCart);
router.post("/add", verifyToken, addToCart);
router.post("/checkout", verifyToken, checkoutMyCart);
router.delete("/remove/:courseId", verifyToken, removeFromCart);
router.patch("/update", verifyToken, updateItemQuantity);
router.delete("/clear", verifyToken, clearMyCart);

export default router;