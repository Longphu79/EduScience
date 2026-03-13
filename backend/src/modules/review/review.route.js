import express from "express";
import {
  getReviewsByCourse,
  createReview,
  updateReview,
  deleteReview,
} from "./review.controller.js";

const router = express.Router();

router.get("/course/:courseId", getReviewsByCourse);
router.post("/", createReview);
router.put("/:reviewId", updateReview);
router.delete("/:reviewId", deleteReview);

export default router;