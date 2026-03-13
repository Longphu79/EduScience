import * as quizService from "./quiz.service.js";

export const createQuiz = async (req, res) => {
  try {
    const data = await quizService.createQuiz(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getQuizByCourse = async (req, res) => {
  try {
    const data = await quizService.getQuizByCourse(req.params.courseId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getInstructorQuizzesByCourse = async (req, res) => {
  try {
    const instructorId = req.query.instructorId || req.body?.instructorId;
    if (!instructorId) {
      return res
        .status(400)
        .json({ success: false, message: "Instructor ID is required" });
    }

    const data = await quizService.getInstructorQuizzesByCourse(
      req.params.courseId,
      instructorId
    );

    res.status(200).json({ success: true, data });
  } catch (err) {
    const status =
      err.message === "Course not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    res.status(status).json({ success: false, message: err.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const hideAnswers = String(req.query.hideAnswers) === "true";
    const data = await quizService.getQuizById(req.params.quizId, hideAnswers);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user?._id || req.body.studentId;

    if (!studentId) {
      return res
        .status(400)
        .json({ success: false, message: "Student ID is required" });
    }

    const data = await quizService.submitQuizAttempt({
      quizId,
      studentId,
      answers: req.body.answers || [],
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAttemptsByStudentCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const data = await quizService.getAttemptsByStudentCourse(
      studentId,
      courseId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getAttemptReviewById = async (req, res) => {
  try {
    const studentId = req.user?._id || req.query.studentId || req.body?.studentId;

    if (!studentId) {
      return res
        .status(400)
        .json({ success: false, message: "Student ID is required" });
    }

    const data = await quizService.getAttemptReviewById(
      req.params.attemptId,
      studentId
    );

    res.status(200).json({ success: true, data });
  } catch (err) {
    const status =
      err.message === "Quiz attempt not found"
        ? 404
        : err.message === "You can only review your own attempt"
        ? 403
        : 400;

    res.status(status).json({ success: false, message: err.message });
  }
};

export const getQuizResultsByQuizId = async (req, res) => {
  try {
    const instructorId = req.query.instructorId || req.body?.instructorId;
    if (!instructorId) {
      return res
        .status(400)
        .json({ success: false, message: "Instructor ID is required" });
    }

    const data = await quizService.getQuizResultsByQuizId(
      req.params.quizId,
      instructorId
    );

    res.status(200).json({ success: true, data });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    res.status(status).json({ success: false, message: err.message });
  }
};

export const getQuizAttemptsByQuizAndStudent = async (req, res) => {
  try {
    const instructorId = req.query.instructorId || req.body?.instructorId;
    if (!instructorId) {
      return res
        .status(400)
        .json({ success: false, message: "Instructor ID is required" });
    }

    const data = await quizService.getQuizAttemptsByQuizAndStudent(
      req.params.quizId,
      req.params.studentId,
      instructorId
    );

    res.status(200).json({ success: true, data });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    res.status(status).json({ success: false, message: err.message });
  }
};

export const getInstructorAttemptReviewById = async (req, res) => {
  try {
    const instructorId = req.query.instructorId || req.body?.instructorId;
    if (!instructorId) {
      return res
        .status(400)
        .json({ success: false, message: "Instructor ID is required" });
    }

    const data = await quizService.getInstructorAttemptReviewById(
      req.params.attemptId,
      instructorId
    );

    res.status(200).json({ success: true, data });
  } catch (err) {
    const status =
      err.message === "Quiz attempt not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    res.status(status).json({ success: false, message: err.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const data = await quizService.updateQuiz(req.params.quizId, req.body);
    res.status(200).json({ success: true, data });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    res.status(status).json({ success: false, message: err.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const instructorId = req.query.instructorId || req.body?.instructorId;
    if (!instructorId) {
      return res
        .status(400)
        .json({ success: false, message: "Instructor ID is required" });
    }

    const data = await quizService.deleteQuiz(req.params.quizId, instructorId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    const status =
      err.message === "Quiz not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    res.status(status).json({ success: false, message: err.message });
  }
};