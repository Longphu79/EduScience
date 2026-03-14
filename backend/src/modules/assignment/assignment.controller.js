import * as assignmentService from "./assignment.service.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
    user: req.user || null,
  };
}

export const createAssignment = async (req, res) => {
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
        message: "Only instructor or admin can create assignment",
      });
    }

    const data = await assignmentService.createAssignment(req.body, {
      requesterId,
      requesterRole,
    });

    return res.status(201).json({
      success: true,
      message: "Create assignment successfully",
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

export const getAssignmentsByCourse = async (req, res) => {
  try {
    const { user } = getRequester(req);

    const data = await assignmentService.getAssignmentsByCourse(
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
        : err.message.includes("not allowed")
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getAssignmentById = async (req, res) => {
  try {
    const { user } = getRequester(req);

    const data = await assignmentService.getAssignmentById(
      req.params.assignmentId,
      user
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Assignment not found"
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

export const submitAssignment = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "student" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only student or admin can submit assignment",
      });
    }

    const data = await assignmentService.submitAssignment(
      req.params.assignmentId,
      {
        ...req.body,
        studentId: requesterId,
      }
    );

    return res.status(201).json({
      success: true,
      message: "Submit assignment successfully",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const resubmitAssignment = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "student" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only student or admin can resubmit assignment",
      });
    }

    const data = await assignmentService.resubmitAssignment(
      req.params.assignmentId,
      {
        ...req.body,
        studentId: requesterId,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Resubmit assignment successfully",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getStudentSubmissions = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await assignmentService.getStudentSubmissions(
      req.params.studentId,
      req.params.courseId,
      {
        requesterId,
        requesterRole,
      }
    );

    return res.status(200).json({
      success: true,
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

export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await assignmentService.getSubmissionsByAssignment(
      req.params.assignmentId,
      {
        requesterId,
        requesterRole,
      }
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Assignment not found"
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

export const gradeSubmission = async (req, res) => {
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
        message: "Only instructor or admin can grade submission",
      });
    }

    const data = await assignmentService.gradeSubmission(
      req.params.submissionId,
      {
        ...req.body,
        gradedBy: requesterId,
      },
      {
        requesterId,
        requesterRole,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Grade submission successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Submission not found"
        ? 404
        : err.message === "Assignment not found"
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

export const updateAssignment = async (req, res) => {
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
        message: "Only instructor or admin can update assignment",
      });
    }

    const data = await assignmentService.updateAssignment(
      req.params.assignmentId,
      req.body,
      {
        requesterId,
        requesterRole,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Update assignment successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Assignment not found"
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

export const deleteAssignment = async (req, res) => {
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
        message: "Only instructor or admin can delete assignment",
      });
    }

    const data = await assignmentService.deleteAssignment(
      req.params.assignmentId,
      {
        requesterId,
        requesterRole,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Delete assignment successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Assignment not found"
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