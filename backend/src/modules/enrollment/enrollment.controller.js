import * as enrollmentService from "./enrollment.service.js";

export const enrollCourse = async (req, res) => {
  try {
    const studentId = req.user?._id;
    const requesterRole = req.user?.role;
    const { courseId } = req.body;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    if (requesterRole !== "student" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only student or admin can enroll course",
      });
    }

    const enrollment = await enrollmentService.enrollCourse({
      studentId,
      courseId,
    });

    res.status(201).json({
      success: true,
      message: "Enroll course successfully",
      data: enrollment,
    });
  } catch (err) {
    const status =
      err.message === "Course not found"
        ? 404
        : err.message === "Course is not available for enrollment"
        ? 400
        : err.message === "You already enrolled in this course"
        ? 400
        : err.message ===
          "Paid course must be purchased through cart checkout before enrollment"
        ? 400
        : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;
    const { studentId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these courses",
      });
    }

    const myCourses = await enrollmentService.getMyCourses(studentId);

    res.status(200).json({
      success: true,
      message: "Get my courses successfully",
      data: myCourses,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;
    const { instructorId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(instructorId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these instructor courses",
      });
    }

    const courses = await enrollmentService.getInstructorCourses(instructorId);

    res.status(200).json({
      success: true,
      message: "Get instructor courses successfully",
      data: courses,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getEnrollmentByStudentAndCourse = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;
    const { studentId, courseId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this enrollment",
      });
    }

    const enrollment = await enrollmentService.getEnrollmentByStudentAndCourse(
      studentId,
      courseId
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: "Enrollment not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Get enrollment successfully",
      data: enrollment,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const setCurrentLesson = async (req, res) => {
  try {
    const studentId = req.user?._id;
    const requesterRole = req.user?.role;
    const { courseId, lessonId } = req.body;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "student" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only student or admin can set current lesson",
      });
    }

    const data = await enrollmentService.setCurrentLesson({
      studentId,
      courseId,
      lessonId,
    });

    res.status(200).json({
      success: true,
      message: "Set current lesson successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Enrollment not found"
        ? 404
        : err.message === "Course not found"
        ? 404
        : err.message === "Lesson not found in this course"
        ? 400
        : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const studentId = req.user?._id;
    const requesterRole = req.user?.role;
    const { courseId, lessonId } = req.body;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "student" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only student or admin can complete lesson",
      });
    }

    const data = await enrollmentService.completeLesson({
      studentId,
      courseId,
      lessonId,
    });

    res.status(200).json({
      success: true,
      message: "Complete lesson successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Enrollment not found"
        ? 404
        : err.message === "Course not found"
        ? 404
        : err.message === "Lesson not found in this course"
        ? 400
        : 400;

    res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getStudentsByCourse = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;
    const { courseId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await enrollmentService.getStudentsByCourse(courseId, {
      requesterId,
      requesterRole,
    });

    res.status(200).json({
      success: true,
      message: "Get students by course successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Course not found"
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

export const getStudentProgressDetail = async (req, res) => {
  try {
    const requesterId = req.user?._id;
    const requesterRole = req.user?.role;
    const { courseId, studentId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
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

    res.status(200).json({
      success: true,
      message: "Get student progress detail successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Enrollment not found"
        ? 404
        : err.message === "Course not found"
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