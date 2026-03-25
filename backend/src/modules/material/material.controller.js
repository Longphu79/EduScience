import * as materialService from "./material.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
    user: req.user || null,
  };
}

export const createMaterial = async (req, res) => {
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
        message: "Only instructor or admin can create material",
      });
    }

    const data = await materialService.createMaterial(req.body, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Create material successfully",
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

export const getMaterialsByCourse = async (req, res) => {
  try {
    const { user } = getRequester(req);

    const data = await materialService.getMaterialsByCourse(
      req.params.courseId,
      user
    );

    return sendSuccess(res, {
      message: "Get materials by course successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Course not found"
        ? 404
        : err.message === "You are not enrolled in this course"
        ? 403
        : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const getMaterialsByLesson = async (req, res) => {
  try {
    const data = await materialService.getMaterialsByLesson(req.params.lessonId);

    return sendSuccess(res, {
      message: "Get materials by lesson successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message,
    });
  }
};

export const updateMaterial = async (req, res) => {
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
        message: "Only instructor or admin can update material",
      });
    }

    const data = await materialService.updateMaterial(
      req.params.materialId,
      req.body,
      {
        requesterId,
        requesterRole,
      }
    );

    return sendSuccess(res, {
      message: "Update material successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Material not found"
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

export const deleteMaterial = async (req, res) => {
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
        message: "Only instructor or admin can delete material",
      });
    }

    const data = await materialService.deleteMaterial(req.params.materialId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Delete material successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Material not found"
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