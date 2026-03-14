import express from "express";
import {
  getReviewsByCourse,
  createReview,
  updateReview,
  deleteReview,
} from "./review.controller.js";
import { verifyToken } from "../../config/jwt.js";

const router = express.Router();

router.get("/course/:courseId", getReviewsByCourse);
router.post("/", verifyToken, createReview);
router.put("/:reviewId", verifyToken, updateReview);
router.delete("/:reviewId", verifyToken, deleteReview);

export default router;