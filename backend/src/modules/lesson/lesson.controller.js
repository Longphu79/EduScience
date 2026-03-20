import * as lessonService from "./lesson.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
  };
}

export const createLesson = async (req, res) => {
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
        message: "Only instructor or admin can create lesson",
      });
    }

    const data = await lessonService.createLesson(req.body, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Create lesson successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Course not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const updateLesson = async (req, res) => {
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
        message: "Only instructor or admin can update lesson",
      });
    }

    const data = await lessonService.updateLesson(req.params.lessonId, req.body, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Update lesson successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Lesson not found"
        ? 404
        : err.message === "Course not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const deleteLesson = async (req, res) => {
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
        message: "Only instructor or admin can delete lesson",
      });
    }

    const data = await lessonService.deleteLesson(req.params.lessonId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Delete lesson successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Lesson not found"
        ? 404
        : err.message === "Course not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const data = await lessonService.getLessonsByCourse(req.params.courseId);

    return sendSuccess(res, {
      message: "Get lessons successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message,
    });
  }
};