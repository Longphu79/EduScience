import * as reviewService from "./review.service.js";

export const getReviewsByCourse = async (req, res) => {
  try {
    const data = await reviewService.getReviewsByCourse(req.params.courseId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const createReview = async (req, res) => {
  try {
    const data = await reviewService.createReview(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const data = await reviewService.updateReview(req.params.reviewId, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const data = await reviewService.deleteReview(req.params.reviewId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};