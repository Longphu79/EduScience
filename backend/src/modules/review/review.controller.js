import * as reviewService from "./review.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
  };
}

function getReviewErrorStatus(err) {
  if (!err?.message) return 400;

  if (
    err.message === "Course not found" ||
    err.message === "Review not found"
  ) {
    return 404;
  }

  if (
    err.message === "You must enroll before reviewing" ||
    err.message === "Instructor cannot review own course" ||
    err.message.includes("not allowed")
  ) {
    return 403;
  }

  return 400;
}

export const getReviewsByCourse = async (req, res) => {
  try {
    const data = await reviewService.getReviewsByCourse(req.params.courseId);

    return sendSuccess(res, {
      message: "Get reviews by course successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getReviewErrorStatus(err),
      message: err.message || "Failed to get reviews by course",
    });
  }
};

export const createReview = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!["student", "admin"].includes(requesterRole)) {
      return sendError(res, {
        statusCode: 403,
        message: "Only student or admin can create review",
      });
    }

    const data = await reviewService.createReview({
      ...req.body,
      studentId: requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Create review successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getReviewErrorStatus(err),
      message: err.message || "Failed to create review",
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await reviewService.updateReview(req.params.reviewId, req.body, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Update review successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getReviewErrorStatus(err),
      message: err.message || "Failed to update review",
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await reviewService.deleteReview(req.params.reviewId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Delete review successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getReviewErrorStatus(err),
      message: err.message || "Failed to delete review",
    });
  }
};