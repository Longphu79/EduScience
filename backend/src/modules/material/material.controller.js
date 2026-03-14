import * as materialService from "./material.service.js";

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
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "instructor" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only instructor or admin can create material",
      });
    }

    const data = await materialService.createMaterial(req.body, {
      requesterId,
      requesterRole,
    });

    return res.status(201).json({
      success: true,
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

    return res.status(status).json({
      success: false,
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

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Course not found"
        ? 404
        : err.message === "You are not enrolled in this course"
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMaterialsByLesson = async (req, res) => {
  try {
    const data = await materialService.getMaterialsByLesson(req.params.lessonId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "instructor" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
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

    return res.status(200).json({
      success: true,
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

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "instructor" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only instructor or admin can delete material",
      });
    }

    const data = await materialService.deleteMaterial(req.params.materialId, {
      requesterId,
      requesterRole,
    });

    return res.status(200).json({
      success: true,
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

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};