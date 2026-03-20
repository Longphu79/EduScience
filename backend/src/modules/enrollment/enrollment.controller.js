import * as enrollmentService from "./enrollment.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getUserId(req) {
  return req.user?._id || req.user?.userId || req.user?.id || null;
}

function getUserRole(req) {
  return req.user?.role || null;
}

function getErrorStatus(err) {
  if (!err?.message) return 400;

  if (
    err.message === "Course not found" ||
    err.message === "Enrollment not found"
  ) {
    return 404;
  }

  if (
    err.message.includes("not allowed") ||
    err.message === "Instructor cannot enroll in own course"
  ) {
    return 403;
  }

  if (
    err.message === "Course is not available for enrollment" ||
    err.message === "You already enrolled in this course" ||
    err.message ===
      "Paid course must be purchased through cart checkout before enrollment" ||
    err.message === "Lesson not found in this course"
  ) {
    return 400;
  }

  return 400;
}

export const enrollCourse = async (req, res) => {
  try {
    const studentId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { courseId } = req.body;

    if (!studentId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!courseId || typeof courseId !== "string") {
      return sendError(res, {
        statusCode: 400,
        message: "courseId is required",
      });
    }

    if (!["student", "admin"].includes(requesterRole)) {
      return sendError(res, {
        statusCode: 403,
        message: "Only student or admin can enroll course",
      });
    }

    const enrollment = await enrollmentService.enrollCourse({
      studentId,
      courseId,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Enroll course successfully",
      data: enrollment,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};

export const getStudentDashboardSummary = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { studentId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view this dashboard",
      });
    }

    const data = await enrollmentService.getStudentDashboardSummary(studentId);

    return sendSuccess(res, {
      message: "Get student dashboard summary successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};

export const getInstructorDashboardSummary = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { instructorId } = req.params;

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
        message: "You are not allowed to view this dashboard",
      });
    }

    const data = await enrollmentService.getInstructorDashboardSummary(
      instructorId
    );

    return sendSuccess(res, {
      message: "Get instructor dashboard summary successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { studentId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view these courses",
      });
    }

    const myCourses = await enrollmentService.getMyCourses(studentId);

    return sendSuccess(res, {
      message: "Get my courses successfully",
      data: myCourses,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { instructorId } = req.params;

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

    const courses = await enrollmentService.getInstructorCourses(instructorId);

    return sendSuccess(res, {
      message: "Get instructor courses successfully",
      data: courses,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};

export const getEnrollmentByStudentAndCourse = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { studentId, courseId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view this enrollment",
      });
    }

    const enrollment = await enrollmentService.getEnrollmentByStudentAndCourse(
      studentId,
      courseId
    );

    if (!enrollment) {
      return sendError(res, {
        statusCode: 404,
        message: "Enrollment not found",
      });
    }

    return sendSuccess(res, {
      message: "Get enrollment successfully",
      data: enrollment,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};

export const setCurrentLesson = async (req, res) => {
  try {
    const studentId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { courseId, lessonId } = req.body;

    if (!studentId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!["student", "admin"].includes(requesterRole)) {
      return sendError(res, {
        statusCode: 403,
        message: "Only student or admin can set current lesson",
      });
    }

    const data = await enrollmentService.setCurrentLesson({
      studentId,
      courseId,
      lessonId,
    });

    return sendSuccess(res, {
      message: "Set current lesson successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const studentId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { courseId, lessonId } = req.body;

    if (!studentId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!["student", "admin"].includes(requesterRole)) {
      return sendError(res, {
        statusCode: 403,
        message: "Only student or admin can complete lesson",
      });
    }

    const data = await enrollmentService.completeLesson({
      studentId,
      courseId,
      lessonId,
    });

    return sendSuccess(res, {
      message: "Complete lesson successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};

export const getStudentsByCourse = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { courseId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await enrollmentService.getStudentsByCourse(courseId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Get students by course successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};

export const getStudentProgressDetail = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { courseId, studentId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await enrollmentService.getStudentProgressDetail(
      courseId,
      studentId,
      {
        requesterId,
        requesterRole,
      }
    );

    return sendSuccess(res, {
      message: "Get student progress detail successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message,
    });
  }
};