import * as courseService from "./course.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
  };
}

function getErrorStatus(err) {
  if (!err?.message) return 400;

  if (err.message === "Course not found") return 404;
  if (err.message === "Unauthorized") return 401;
  if (err.message.includes("not allowed")) return 403;

  if (
    err.message === "Slug already exists" ||
    err.message === "Title is required" ||
    err.message === "Slug is required" ||
    err.message === "Short description is required" ||
    err.message === "Instructor ID is required" ||
    err.message === "Cannot delete course that already has enrollments"
  ) {
    return 400;
  }

  return 400;
}

export const getPopularCourses = async (req, res) => {
  try {
    const courses = await courseService.getPopularCourses();

    return sendSuccess(res, {
      message: "Get popular courses successfully",
      data: courses,
    });
  } catch (err) {
    console.error("getPopularCourses error:", err);

    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to get popular courses",
    });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!["instructor", "admin"].includes(requesterRole)) {
      return sendError(res, {
        statusCode: 403,
        message: "Only instructor or admin can create course",
      });
    }

    const course = await courseService.createCourse({
      ...req.body,
      instructorId: requesterId,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Create course successfully",
      data: course,
    });
  } catch (err) {
    console.error("createCourse error:", err);

    return sendError(res, {
      statusCode:
        err.name === "ValidationError" ? 400 : getErrorStatus(err) || 500,
      message: err.message || "Failed to create course",
      meta: err.errors || null,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.courseId);

    if (!course) {
      return sendError(res, {
        statusCode: 404,
        message: "Course not found",
      });
    }

    return sendSuccess(res, {
      message: "Get course successfully",
      data: course,
    });
  } catch (err) {
    console.error("getCourseById error:", err);

    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to get course",
    });
  }
};

export const getCourseBySlug = async (req, res) => {
  try {
    const course = await courseService.getCourseBySlug(req.params.slug);

    if (!course) {
      return sendError(res, {
        statusCode: 404,
        message: "Course not found",
      });
    }

    return sendSuccess(res, {
      message: "Get course by slug successfully",
      data: course,
    });
  } catch (err) {
    console.error("getCourseBySlug error:", err);

    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to get course by slug",
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const result = await courseService.getAllCourses(req.query);

    return sendSuccess(res, {
      message: "Get courses successfully",
      data: result.items,
      meta: {
        pagination: result.pagination,
        filters: result.filters,
      },
    });
  } catch (err) {
    console.error("getAllCourses error:", err);

    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to get courses",
    });
  }
};

export const getCoursesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(instructorId)
    ) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view these instructor courses",
      });
    }

    const courses = await courseService.getCoursesByInstructor(instructorId);

    return sendSuccess(res, {
      message: "Get instructor courses successfully",
      data: courses,
    });
  } catch (err) {
    console.error("getCoursesByInstructor error:", err);

    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to get instructor courses",
    });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!["instructor", "admin"].includes(requesterRole)) {
      return sendError(res, {
        statusCode: 403,
        message: "Only instructor or admin can update course",
      });
    }

    const course = await courseService.updateCourse(
      req.params.courseId,
      req.body,
      {
        requesterId,
        requesterRole,
      }
    );

    return sendSuccess(res, {
      message: "Update course successfully",
      data: course,
    });
  } catch (err) {
    console.error("updateCourse error:", err);

    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to update course",
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!["instructor", "admin"].includes(requesterRole)) {
      return sendError(res, {
        statusCode: 403,
        message: "Only instructor or admin can delete course",
      });
    }

    const course = await courseService.deleteCourse(req.params.courseId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Delete course successfully",
      data: course,
    });
  } catch (err) {
    console.error("deleteCourse error:", err);

    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to delete course",
    });
  }
};