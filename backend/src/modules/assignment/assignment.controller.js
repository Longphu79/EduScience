import * as assignmentService from "./assignment.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
    user: req.user || null,
  };
}

function buildUploadedUrls(req, fieldName) {
  const fileBag = req.files || {};

  if (Array.isArray(fileBag)) {
    return fileBag.map(
      (file) =>
        `${req.protocol}://${req.get("host")}/uploads/assignments/${file.filename}`
    );
  }

  const files = Array.isArray(fileBag?.[fieldName]) ? fileBag[fieldName] : [];

  return files.map(
    (file) =>
      `${req.protocol}://${req.get("host")}/uploads/assignments/${file.filename}`
  );
}

function parseStringArray(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function getAssignmentErrorStatus(err) {
  if (!err?.message) return 400;

  if (
    err.message === "Assignment not found" ||
    err.message === "Submission not found" ||
    err.message === "No submission found to resubmit" ||
    err.message === "Course not found"
  ) {
    return 404;
  }

  if (
    err.message.includes("not allowed") ||
    err.message === "You are not enrolled in this course"
  ) {
    return 403;
  }

  if (err.message === "Unauthorized") return 401;

  return 400;
}

export const createAssignment = async (req, res) => {
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
        message: "Only instructor or admin can create assignment",
      });
    }

    const uploadedAttachmentUrls = buildUploadedUrls(req, "attachments");

    const data = await assignmentService.createAssignment(
      {
        ...req.body,
        attachmentUrls: uploadedAttachmentUrls,
      },
      {
        requesterId,
        requesterRole,
      }
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "Create assignment successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to create assignment",
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

    return sendSuccess(res, {
      message: "Get assignments successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to get assignments",
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

    return sendSuccess(res, {
      message: "Get assignment successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to get assignment",
    });
  }
};

export const submitAssignment = async (req, res) => {
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
        message: "Only student or admin can submit assignment",
      });
    }

    const uploadedFileUrls = buildUploadedUrls(req, "files");
    const existingFileUrls = parseStringArray(req.body?.fileUrls);

    const data = await assignmentService.submitAssignment(
      req.params.assignmentId,
      {
        ...req.body,
        studentId: requesterId,
        fileUrls: [...existingFileUrls, ...uploadedFileUrls],
      }
    );

    return sendSuccess(res, {
      statusCode: 201,
      message: "Submit assignment successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to submit assignment",
    });
  }
};

export const resubmitAssignment = async (req, res) => {
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
        message: "Only student or admin can resubmit assignment",
      });
    }

    const uploadedFileUrls = buildUploadedUrls(req, "files");
    const existingFileUrls = parseStringArray(req.body?.fileUrls);

    const data = await assignmentService.resubmitAssignment(
      req.params.assignmentId,
      {
        ...req.body,
        studentId: requesterId,
        fileUrls: [...existingFileUrls, ...uploadedFileUrls],
      }
    );

    return sendSuccess(res, {
      message: "Resubmit assignment successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to resubmit assignment",
    });
  }
};

export const getStudentSubmissions = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
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

    return sendSuccess(res, {
      message: "Get student submissions successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to get student submissions",
    });
  }
};

export const getSubmissionsByAssignment = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
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

    return sendSuccess(res, {
      message: "Get submissions by assignment successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to get submissions by assignment",
    });
  }
};

export const gradeSubmission = async (req, res) => {
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

    return sendSuccess(res, {
      message: "Grade submission successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to grade submission",
    });
  }
};

export const updateAssignment = async (req, res) => {
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
        message: "Only instructor or admin can update assignment",
      });
    }

    const uploadedAttachmentUrls = buildUploadedUrls(req, "attachments");
    const keptAttachmentUrls = parseStringArray(req.body?.keptAttachmentUrls);

    const data = await assignmentService.updateAssignment(
      req.params.assignmentId,
      {
        ...req.body,
        attachmentUrls: [...keptAttachmentUrls, ...uploadedAttachmentUrls],
      },
      {
        requesterId,
        requesterRole,
      }
    );

    return sendSuccess(res, {
      message: "Update assignment successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to update assignment",
    });
  }
};

export const deleteAssignment = async (req, res) => {
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

    return sendSuccess(res, {
      message: "Delete assignment successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getAssignmentErrorStatus(err),
      message: err.message || "Failed to delete assignment",
    });
  }
};