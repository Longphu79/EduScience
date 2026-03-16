import QuizAttempt from "./quizAttempt.model.js";
import Quiz from "./quiz.model.js";

export const getQuizAttemptsByStudentCourse = async (studentId, courseId) => {
  const attempts = await QuizAttempt.find({ studentId, courseId })
    .populate("quizId", "title description passingScore timeLimit")
    .sort({ submittedAt: -1 });

  return attempts.map((item) => ({
    _id: item._id,
    quizId: item.quizId,
    score: item.score,
    correctAnswers: item.correctAnswers,
    totalQuestions: item.totalQuestions,
    passed: item.passed,
    submittedAt: item.submittedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
};

export const getQuizAttemptReviewById = async (attemptId, currentUser) => {
  const attempt = await QuizAttempt.findById(attemptId)
    .populate("quizId", "title description passingScore timeLimit courseId")
    .populate("studentId", "username email fullName name");

  if (!attempt) {
    throw new Error("Quiz attempt not found");
  }

  if (
    currentUser?.role === "student" &&
    String(attempt.studentId?._id || attempt.studentId) !== String(currentUser._id)
  ) {
    throw new Error("You can only review your own attempts");
  }

  return attempt;
};

export const getLatestQuizAttemptReview = async (quizId, studentId) => {
  const attempt = await QuizAttempt.findOne({ quizId, studentId })
    .sort({ submittedAt: -1 })
    .populate("quizId", "title description passingScore timeLimit courseId");

  if (!attempt) {
    throw new Error("No attempt found for this quiz");
  }

  return attempt;
};

export const submitQuizAttempt = async ({ quizId, studentId, answers = [] }) => {
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const totalQuestions = questions.length;

  let correctAnswers = 0;

  const normalizedAnswers = Array.isArray(answers) ? answers : [];

  const answerMap = new Map(
    normalizedAnswers.map((item) => [
      String(item.questionId),
      Array.isArray(item.selectedOptionIndexes) ? item.selectedOptionIndexes : [],
    ])
  );

  const questionReviews = questions.map((question) => {
    const questionId = String(question._id);
    const selectedOptionIndexes = answerMap.get(questionId) || [];

    const correctOptionIndexes = (question.options || [])
      .map((option, index) => (option?.isCorrect ? index : -1))
      .filter((index) => index !== -1);

    const sortedSelected = [...selectedOptionIndexes].sort((a, b) => a - b);
    const sortedCorrect = [...correctOptionIndexes].sort((a, b) => a - b);

    const isCorrect =
      sortedSelected.length === sortedCorrect.length &&
      sortedSelected.every((value, index) => value === sortedCorrect[index]);

    if (isCorrect) {
      correctAnswers += 1;
    }

    return {
      questionId: question._id,
      questionText: question.questionText || question.question || "",
      explanation: question.explanation || "",
      isCorrect,
      selectedOptionIndexes: sortedSelected,
      correctOptionIndexes: sortedCorrect,
      options: (question.options || []).map((option, index) => ({
        index,
        text: option?.text || option || "",
      })),
    };
  });

  const score =
    totalQuestions === 0
      ? 0
      : Math.round((correctAnswers / totalQuestions) * 100);

  const passed = score >= Number(quiz.passingScore || 0);

  const attempt = await QuizAttempt.create({
    quizId: quiz._id,
    courseId: quiz.courseId,
    studentId,
    answers: normalizedAnswers.map((item) => ({
      questionId: item.questionId,
      selectedOptionIndexes: Array.isArray(item.selectedOptionIndexes)
        ? item.selectedOptionIndexes
        : [],
    })),
    score,
    correctAnswers,
    totalQuestions,
    passed,
    questionReviews,
    submittedAt: new Date(),
  });

  return {
    _id: attempt._id,
    quizId: attempt.quizId,
    courseId: attempt.courseId,
    studentId: attempt.studentId,
    score,
    correctAnswers,
    totalQuestions,
    passed,
    submittedAt: attempt.submittedAt,
    questionReviews,
  };
};