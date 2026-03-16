import * as quizAttemptService from "./quizAttempt.service.js";

export const getQuizAttemptsByStudentCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const data = await quizAttemptService.getQuizAttemptsByStudentCourse(
      studentId,
      courseId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getQuizAttemptReviewById = async (req, res) => {
  try {
    const data = await quizAttemptService.getQuizAttemptReviewById(
      req.params.attemptId,
      req.user
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

export const getLatestQuizAttemptReview = async (req, res) => {
  try {
    const { quizId, studentId } = req.params;
    const data = await quizAttemptService.getLatestQuizAttemptReview(
      quizId,
      studentId
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const submitQuizAttempt = async (req, res) => {
  try {
    const { quizId } = req.params;
    const studentId = req.user?._id || req.body.studentId;
    const answers = req.body.answers || [];

    const data = await quizAttemptService.submitQuizAttempt({
      quizId,
      studentId,
      answers,
    });

    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};