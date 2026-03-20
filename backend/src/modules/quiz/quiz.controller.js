import * as quizService from "./quiz.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
  };
}

export const createQuiz = async (req, res) => {
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
        message: "Only instructor or admin can create quiz",
      });
    }

    const data = await quizService.createQuiz(req.body, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Create quiz successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "courseId is required" ||
      err.message === "Quiz title is required" ||
      err.message.includes("Question") ||
      err.message.includes("Quiz must contain")
        ? 400
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

export const getQuizByCourse = async (req, res) => {
  try {
    const data = await quizService.getQuizByCourse(req.params.courseId);

    return sendSuccess(res, {
      message: "Get quizzes by course successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message,
    });
  }
};

export const getInstructorQuizzesByCourse = async (req, res) => {
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
        message: "Only instructor or admin can view instructor quizzes",
      });
    }

    const data = await quizService.getInstructorQuizzesByCourse(
      req.params.courseId,
      {
        requesterId,
        requesterRole,
      }
    );

    return sendSuccess(res, {
      message: "Get instructor quizzes successfully",
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

export const getQuizById = async (req, res) => {
  try {
    const hideAnswers = String(req.query.hideAnswers) === "true";
    const data = await quizService.getQuizById(req.params.quizId, hideAnswers);

    return sendSuccess(res, {
      message: "Get quiz successfully",
      data,
    });
  } catch (err) {
    const status = err.message === "Quiz not found" ? 404 : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const submitQuizAttempt = async (req, res) => {
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
        message: "Only student or admin can submit quiz attempt",
      });
    }

    const data = await quizService.submitQuizAttempt({
      quizId: req.params.quizId,
      studentId: requesterId,
      answers: req.body.answers || [],
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Submit quiz attempt successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
        ? 404
        : err.message === "Student is not enrolled in this course"
        ? 403
        : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const getAttemptsByStudentCourse = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const routeStudentId = req.params.studentId;
    const courseId = req.params.courseId;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const studentId = routeStudentId || requesterId;

    if (requesterRole !== "admin" && String(requesterId) !== String(studentId)) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view these attempts",
      });
    }

    const data = await quizService.getAttemptsByStudentCourse(
      studentId,
      courseId
    );

    return sendSuccess(res, {
      message: "Get attempts by student and course successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message,
    });
  }
};

export const getMyAttemptsByCourse = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { courseId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (!["student", "admin"].includes(requesterRole)) {
      return sendError(res, {
        statusCode: 403,
        message: "Only student or admin can view own attempts",
      });
    }

    const data = await quizService.getAttemptsByStudentCourse(
      requesterId,
      courseId
    );

    return sendSuccess(res, {
      message: "Get my quiz attempts successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: 400,
      message: err.message,
    });
  }
};

export const getAttemptReviewById = async (req, res) => {
  try {
    const { requesterId } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await quizService.getAttemptReviewById(
      req.params.attemptId,
      requesterId
    );

    return sendSuccess(res, {
      message: "Get attempt review successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz attempt not found"
        ? 404
        : err.message === "You can only review your own attempt"
        ? 403
        : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const getQuizResultsByQuizId = async (req, res) => {
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
        message: "Only instructor or admin can view quiz results",
      });
    }

    const data = await quizService.getQuizResultsByQuizId(req.params.quizId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Get quiz results successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
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

export const getQuizAttemptsByQuizAndStudent = async (req, res) => {
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
        message: "Only instructor or admin can view quiz attempts",
      });
    }

    const data = await quizService.getQuizAttemptsByQuizAndStudent(
      req.params.quizId,
      req.params.studentId,
      {
        requesterId,
        requesterRole,
      }
    );

    return sendSuccess(res, {
      message: "Get quiz attempts by quiz and student successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
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

export const getInstructorAttemptReviewById = async (req, res) => {
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
        message: "Only instructor or admin can review student attempts",
      });
    }

    const data = await quizService.getInstructorAttemptReviewById(
      req.params.attemptId,
      {
        requesterId,
        requesterRole,
      }
    );

    return sendSuccess(res, {
      message: "Get instructor attempt review successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz attempt not found"
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

export const updateQuiz = async (req, res) => {
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
        message: "Only instructor or admin can update quiz",
      });
    }

    const data = await quizService.updateQuiz(req.params.quizId, req.body, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Update quiz successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : err.message.includes("Question") ||
          err.message.includes("Quiz must contain")
        ? 400
        : 400;

    return sendError(res, {
      statusCode: status,
      message: err.message,
    });
  }
};

export const deleteQuiz = async (req, res) => {
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
        message: "Only instructor or admin can delete quiz",
      });
    }

    const data = await quizService.deleteQuiz(req.params.quizId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Delete quiz successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
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