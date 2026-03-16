import * as quizService from "./quiz.service.js";

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
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "instructor" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only instructor or admin can create quiz",
      });
    }

    const data = await quizService.createQuiz(req.body, {
      requesterId,
      requesterRole,
    });

    return res.status(201).json({
      success: true,
      message: "Create quiz successfully",
      data,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const getQuizByCourse = async (req, res) => {
  try {
    const data = await quizService.getQuizByCourse(req.params.courseId);

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

export const getInstructorQuizzesByCourse = async (req, res) => {
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

export const getQuizById = async (req, res) => {
  try {
    const hideAnswers = String(req.query.hideAnswers) === "true";
    const data = await quizService.getQuizById(req.params.quizId, hideAnswers);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

export const submitQuizAttempt = async (req, res) => {
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
        message: "Only student or admin can submit quiz attempt",
      });
    }

    const data = await quizService.submitQuizAttempt({
      quizId: req.params.quizId,
      studentId: requesterId,
      answers: req.body.answers || [],
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
        ? 404
        : err.message === "Student is not enrolled in this course"
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
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
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const studentId = routeStudentId || requesterId;

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these attempts",
      });
    }

    const data = await quizService.getAttemptsByStudentCourse(
      studentId,
      courseId
    );

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

export const getMyAttemptsByCourse = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { courseId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (requesterRole !== "student" && requesterRole !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only student or admin can view own attempts",
      });
    }

    const data = await quizService.getAttemptsByStudentCourse(
      requesterId,
      courseId
    );

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

export const getAttemptReviewById = async (req, res) => {
  try {
    const { requesterId } = getRequester(req);

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await quizService.getAttemptReviewById(
      req.params.attemptId,
      requesterId
    );

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz attempt not found"
        ? 404
        : err.message === "You can only review your own attempt"
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getQuizResultsByQuizId = async (req, res) => {
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
        message: "Only instructor or admin can view quiz results",
      });
    }

    const data = await quizService.getQuizResultsByQuizId(
      req.params.quizId,
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
      err.message === "Quiz not found"
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

export const getQuizAttemptsByQuizAndStudent = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
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

export const getInstructorAttemptReviewById = async (req, res) => {
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

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz attempt not found"
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

export const updateQuiz = async (req, res) => {
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
        message: "Only instructor or admin can update quiz",
      });
    }

    const data = await quizService.updateQuiz(req.params.quizId, req.body, {
      requesterId,
      requesterRole,
    });

    return res.status(200).json({
      success: true,
      message: "Update quiz successfully",
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
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

export const deleteQuiz = async (req, res) => {
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
        message: "Only instructor or admin can delete quiz",
      });
    }

    const data = await quizService.deleteQuiz(req.params.quizId, {
      requesterId,
      requesterRole,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
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