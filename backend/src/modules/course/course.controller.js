import * as courseService from "./course.service.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
  };
}

export const getPopularCourses = async (req, res) => {
  try {
    const courses = await courseService.getPopularCourses();

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (err) {
    console.error("getPopularCourses error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const createCourse = async (req, res) => {
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
        message: "Only instructor or admin can create course",
      });
    }

    const course = await courseService.createCourse({
      ...req.body,
      instructorId: requesterId,
    });

    return res.status(201).json({
      success: true,
      message: "Create course successfully",
      data: course,
    });
  } catch (err) {
    console.error("createCourse error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to create course",
      error: err.errors || null,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    console.error("getCourseById error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCourseBySlug = async (req, res) => {
  try {
    const course = await courseService.getCourseBySlug(req.params.slug);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (err) {
    console.error("getCourseBySlug error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses(req.query);

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (err) {
    console.error("getAllCourses error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getCoursesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const { requesterId, requesterRole } = getRequester(req);

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

    const courses = await courseService.getCoursesByInstructor(instructorId);

    return res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (err) {
    console.error("getCoursesByInstructor error:", err);
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateCourse = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      message: "Update course successfully",
      data: course,
    });
  } catch (err) {
    console.error("updateCourse error:", err);

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

export const deleteCourse = async (req, res) => {
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
        message: "Only instructor or admin can delete course",
      });
    }

    const course = await courseService.deleteCourse(req.params.courseId, {
      requesterId,
      requesterRole,
    });

    return res.status(200).json({
      success: true,
      message: "Delete course successfully",
      data: course,
    });
  } catch (err) {
    console.error("deleteCourse error:", err);

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