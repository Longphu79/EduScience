import * as reviewService from "./review.service.js";

export const getReviewsByCourse = async (req, res) => {
  try {
    const data = await reviewService.getReviewsByCourse(req.params.courseId);

    res.status(200).json({
      success: true,
      message: "Get reviews by course successfully",
      data,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "student" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only student or admin can create review",
      });
    }

    const data = await reviewService.createReview({
      ...req.body,
      studentId: requesterId,
      requesterRole,
    });

    res.status(201).json({
      success: true,
      message: "Create review successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Course not found"
        ? 404
        : err.message === "You must enroll before reviewing"
        ? 403
        : err.message === "You already reviewed this course"
        ? 400
        : err.message === "Instructor cannot review own course"
        ? 403
        : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await reviewService.updateReview(req.params.reviewId, req.body, {
      requesterId,
      requesterRole,
    });

    res.status(200).json({
      success: true,
      message: "Update review successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Review not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await reviewService.deleteReview(req.params.reviewId, {
      requesterId,
      requesterRole,
    });

    res.status(200).json({
      success: true,
      message: "Delete review successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Review not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};