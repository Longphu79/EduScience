import * as lessonService from "./lesson.service.js";

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
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "instructor" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only instructor or admin can create lesson",
      });
    }

    const data = await lessonService.createLesson(req.body, {
      requesterId,
      requesterRole,
    });

    return res.status(201).json({
      success: true,
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

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateLesson = async (req, res) => {
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
        message: "Only instructor or admin can update lesson",
      });
    }

    const data = await lessonService.updateLesson(req.params.lessonId, req.body, {
      requesterId,
      requesterRole,
    });

    return res.status(200).json({
      success: true,
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

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const deleteLesson = async (req, res) => {
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
        message: "Only instructor or admin can delete lesson",
      });
    }

    const data = await lessonService.deleteLesson(req.params.lessonId, {
      requesterId,
      requesterRole,
    });

    return res.status(200).json({
      success: true,
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

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getLessonsByCourse = async (req, res) => {
  try {
    const data = await lessonService.getLessonsByCourse(req.params.courseId);

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