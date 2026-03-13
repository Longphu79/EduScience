import Quiz from "./quiz.model.js";
import QuizAttempt from "./quizAttempt.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";

function normalizeIndexes(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(Number).filter(Number.isInteger))].sort(
    (a, b) => a - b
  );
}

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}

function validateQuestion(question, index) {
  const questionNumber = index + 1;

  if (!question?.questionText?.trim()) {
    throw new Error(`Question ${questionNumber}: question text is required`);
  }

  const type = question.type || "single";
  const options = Array.isArray(question.options) ? question.options : [];

  if (!["single", "multiple", "true-false"].includes(type)) {
    throw new Error(`Question ${questionNumber}: invalid question type`);
  }

  if (type === "true-false") {
    if (options.length !== 2) {
      throw new Error(
        `Question ${questionNumber}: true-false question must have exactly 2 options`
      );
    }
  } else if (options.length < 2) {
    throw new Error(`Question ${questionNumber}: at least 2 options are required`);
  }

  const emptyOption = options.find((opt) => !opt?.text?.trim());
  if (emptyOption) {
    throw new Error(`Question ${questionNumber}: all options must have text`);
  }

  const correctIndexes = options
    .map((opt, idx) => (opt?.isCorrect ? idx : -1))
    .filter((idx) => idx !== -1);

  if (type === "single" || type === "true-false") {
    if (correctIndexes.length !== 1) {
      throw new Error(
        `Question ${questionNumber}: ${type} question must have exactly 1 correct answer`
      );
    }
  }

  if (type === "multiple" && correctIndexes.length < 1) {
    throw new Error(
      `Question ${questionNumber}: multiple choice question must have at least 1 correct answer`
    );
  }
}

function validateQuestions(questions = []) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("Quiz must contain at least 1 question");
  }

  questions.forEach(validateQuestion);
}

function sanitizeQuestion(question = {}) {
  return {
    questionText: question.questionText?.trim() || "",
    type: question.type || "single",
    explanation: question.explanation?.trim() || "",
    points: Number(question.points) > 0 ? Number(question.points) : 1,
    options: (Array.isArray(question.options) ? question.options : []).map((opt) => ({
      text: opt.text?.trim() || "",
      isCorrect: !!opt.isCorrect,
    })),
  };
}

export const createQuiz = async (payload) => {
  const course = await Course.findById(payload.courseId).lean();
  if (!course) throw new Error("Course not found");

  if (String(course.instructorId) !== String(payload.instructorId)) {
    throw new Error("You are not allowed to create quiz for this course");
  }

  const questions = (payload.questions || []).map(sanitizeQuestion);
  validateQuestions(questions);

  const quizPayload = {
    title: payload.title?.trim() || "",
    description: payload.description?.trim() || "",
    courseId: payload.courseId,
    lessonId: payload.lessonId || null,
    instructorId: payload.instructorId,
    timeLimit: Number(payload.timeLimit) || 0,
    passingScore: Number(payload.passingScore) || 0,
    isPublished:
      typeof payload.isPublished === "boolean" ? payload.isPublished : true,
    questions,
  };

  if (!quizPayload.title) {
    throw new Error("Quiz title is required");
  }

  return Quiz.create(quizPayload);
};

export const getQuizByCourse = async (courseId) => {
  return Quiz.find({ courseId, isPublished: true }).sort({ createdAt: 1 });
};

export const getInstructorQuizzesByCourse = async (courseId, instructorId) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new Error("Course not found");

  if (String(course.instructorId) !== String(instructorId)) {
    throw new Error("You are not allowed to view quizzes of this course");
  }

  const quizzes = await Quiz.find({ courseId, instructorId })
    .sort({ createdAt: 1 })
    .lean();

  const quizIds = quizzes.map((q) => q._id);

  const attempts = await QuizAttempt.find({ quizId: { $in: quizIds } }).lean();

  const attemptsByQuizId = attempts.reduce((acc, item) => {
    const key = String(item.quizId);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return quizzes.map((quiz) => {
    const relatedAttempts = attemptsByQuizId[String(quiz._id)] || [];
    const totalAttempts = relatedAttempts.length;
    const uniqueStudents = new Set(
      relatedAttempts.map((item) => String(item.studentId))
    ).size;
    const averageScore = totalAttempts
      ? Math.round(
          relatedAttempts.reduce((sum, item) => sum + (item.score || 0), 0) /
            totalAttempts
        )
      : 0;
    const passRate = totalAttempts
      ? Math.round(
          (relatedAttempts.filter((item) => item.passed).length / totalAttempts) *
            100
        )
      : 0;

    return {
      ...quiz,
      stats: {
        totalAttempts,
        totalStudents: uniqueStudents,
        averageScore,
        passRate,
      },
    };
  });
};

export const getQuizById = async (quizId, hideAnswers = false) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw new Error("Quiz not found");

  if (hideAnswers) {
    quiz.questions = (quiz.questions || []).map((q) => ({
      ...q,
      options: (q.options || []).map((opt) => ({
        text: opt.text,
      })),
    }));
  }

  return quiz;
};

export const submitQuizAttempt = async ({ quizId, studentId, answers = [] }) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw new Error("Quiz not found");

  const enrollment = await Enrollment.findOne({
    courseId: quiz.courseId,
    studentId,
  }).lean();

  if (!enrollment) {
    throw new Error("Student is not enrolled in this course");
  }

  const submittedAnswers = Array.isArray(answers) ? answers : [];
  const answerMap = new Map(
    submittedAnswers.map((item) => [
      String(item.questionId),
      normalizeIndexes(item.selectedOptionIndexes),
    ])
  );

  const questions = Array.isArray(quiz.questions) ? quiz.questions : [];
  const totalQuestions = questions.length;

  let correctAnswers = 0;

  const questionReviews = questions.map((question) => {
    const questionId = String(question._id);
    const selectedOptionIndexes = answerMap.get(questionId) || [];
    const options = Array.isArray(question.options) ? question.options : [];

    const correctOptionIndexes = options
      .map((option, index) => (option?.isCorrect ? index : -1))
      .filter((index) => index !== -1);

    const normalizedCorrect = normalizeIndexes(correctOptionIndexes);
    const isCorrect = arraysEqual(selectedOptionIndexes, normalizedCorrect);

    if (isCorrect) correctAnswers += 1;

    return {
      questionId: question._id,
      questionText: question.questionText || "",
      explanation: question.explanation || "",
      options: options.map((option, index) => ({
        index,
        text: option?.text || "",
        isCorrect: normalizedCorrect.includes(index),
        isSelected: selectedOptionIndexes.includes(index),
      })),
      correctOptionIndexes: normalizedCorrect,
      selectedOptionIndexes,
      isCorrect,
      points: Number(question.points) || 1,
    };
  });

  const score =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const passingScore = Number(quiz.passingScore) || 0;
  const passed = score >= passingScore;

  const attempt = await QuizAttempt.create({
    quizId: quiz._id,
    studentId,
    courseId: quiz.courseId,
    answers: questions.map((question) => ({
      questionId: question._id,
      selectedOptionIndexes: answerMap.get(String(question._id)) || [],
    })),
    score,
    passed,
    correctAnswers,
    totalQuestions,
    questionReviews,
    submittedAt: new Date(),
  });

  return attempt.toObject();
};

export const getAttemptsByStudentCourse = async (studentId, courseId) => {
  const attempts = await QuizAttempt.find({ studentId, courseId })
    .populate("quizId", "title description passingScore timeLimit")
    .sort({ submittedAt: -1, createdAt: -1 })
    .lean();

  return attempts.map((attempt) => ({
    _id: attempt._id,
    quizId: attempt.quizId,
    studentId: attempt.studentId,
    courseId: attempt.courseId,
    score: attempt.score || 0,
    passed: !!attempt.passed,
    correctAnswers: attempt.correctAnswers || 0,
    totalQuestions: attempt.totalQuestions || 0,
    submittedAt: attempt.submittedAt || attempt.createdAt,
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
  }));
};

export const getAttemptReviewById = async (attemptId, studentId) => {
  const attempt = await QuizAttempt.findById(attemptId).lean();
  if (!attempt) throw new Error("Quiz attempt not found");

  if (String(attempt.studentId) !== String(studentId)) {
    throw new Error("You can only review your own attempt");
  }

  return {
    _id: attempt._id,
    quizId: attempt.quizId,
    courseId: attempt.courseId,
    studentId: attempt.studentId,
    score: attempt.score || 0,
    passed: !!attempt.passed,
    correctAnswers: attempt.correctAnswers || 0,
    totalQuestions: attempt.totalQuestions || 0,
    submittedAt: attempt.submittedAt || attempt.createdAt,
    questionReviews: attempt.questionReviews || [],
  };
};

export const getQuizResultsByQuizId = async (quizId, instructorId) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw new Error("Quiz not found");

  if (String(quiz.instructorId) !== String(instructorId)) {
    throw new Error("You are not allowed to view results of this quiz");
  }

  const attempts = await QuizAttempt.find({ quizId })
    .populate("studentId", "username email avatarUrl")
    .sort({ submittedAt: -1, createdAt: -1 })
    .lean();

  const totalAttempts = attempts.length;
  const averageScore = totalAttempts
    ? Math.round(
        attempts.reduce((sum, item) => sum + (item.score || 0), 0) / totalAttempts
      )
    : 0;
  const passRate = totalAttempts
    ? Math.round(
        (attempts.filter((item) => item.passed).length / totalAttempts) * 100
      )
    : 0;

  const studentMap = new Map();

  attempts.forEach((attempt) => {
    const key = String(attempt.studentId?._id || attempt.studentId);
    if (!studentMap.has(key)) {
      studentMap.set(key, {
        studentId: attempt.studentId?._id || attempt.studentId,
        studentName:
          attempt.studentId?.username || attempt.studentId?.email || "Student",
        studentEmail: attempt.studentId?.email || "",
        attemptCount: 0,
        latestScore: 0,
        bestScore: 0,
        latestPassed: false,
        lastSubmittedAt: null,
        attempts: [],
      });
    }

    const current = studentMap.get(key);
    current.attemptCount += 1;
    current.attempts.push({
      _id: attempt._id,
      score: attempt.score || 0,
      passed: !!attempt.passed,
      correctAnswers: attempt.correctAnswers || 0,
      totalQuestions: attempt.totalQuestions || 0,
      submittedAt: attempt.submittedAt || attempt.createdAt,
      createdAt: attempt.createdAt,
    });

    if (!current.lastSubmittedAt) {
      current.latestScore = attempt.score || 0;
      current.latestPassed = !!attempt.passed;
      current.lastSubmittedAt = attempt.submittedAt || attempt.createdAt;
    }

    current.bestScore = Math.max(current.bestScore, attempt.score || 0);
  });

  return {
    quiz: {
      _id: quiz._id,
      title: quiz.title,
      description: quiz.description,
      passingScore: quiz.passingScore,
      timeLimit: quiz.timeLimit,
      totalQuestions: quiz.questions?.length || 0,
      isPublished: !!quiz.isPublished,
    },
    summary: {
      totalAttempts,
      totalStudents: studentMap.size,
      averageScore,
      passRate,
    },
    students: Array.from(studentMap.values()),
  };
};

export const getQuizAttemptsByQuizAndStudent = async (
  quizId,
  studentId,
  instructorId
) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw new Error("Quiz not found");

  if (String(quiz.instructorId) !== String(instructorId)) {
    throw new Error("You are not allowed to view attempts of this quiz");
  }

  const attempts = await QuizAttempt.find({ quizId, studentId })
    .populate("studentId", "username email avatarUrl")
    .sort({ submittedAt: -1, createdAt: -1 })
    .lean();

  return attempts.map((attempt) => ({
    _id: attempt._id,
    quizId: attempt.quizId,
    studentId: attempt.studentId?._id || attempt.studentId,
    studentName:
      attempt.studentId?.username || attempt.studentId?.email || "Student",
    studentEmail: attempt.studentId?.email || "",
    score: attempt.score || 0,
    passed: !!attempt.passed,
    correctAnswers: attempt.correctAnswers || 0,
    totalQuestions: attempt.totalQuestions || 0,
    submittedAt: attempt.submittedAt || attempt.createdAt,
    createdAt: attempt.createdAt,
  }));
};

export const getInstructorAttemptReviewById = async (attemptId, instructorId) => {
  const attempt = await QuizAttempt.findById(attemptId)
    .populate("quizId", "title instructorId courseId")
    .populate("studentId", "username email avatarUrl")
    .lean();

  if (!attempt) throw new Error("Quiz attempt not found");

  const quizInstructorId =
    attempt.quizId?.instructorId?._id || attempt.quizId?.instructorId;

  if (String(quizInstructorId) !== String(instructorId)) {
    throw new Error("You are not allowed to review this attempt");
  }

  return {
    _id: attempt._id,
    quizId: attempt.quizId?._id || attempt.quizId,
    quizTitle: attempt.quizId?.title || "Quiz",
    courseId: attempt.quizId?.courseId || attempt.courseId,
    studentId: attempt.studentId?._id || attempt.studentId,
    studentName:
      attempt.studentId?.username || attempt.studentId?.email || "Student",
    studentEmail: attempt.studentId?.email || "",
    score: attempt.score || 0,
    passed: !!attempt.passed,
    correctAnswers: attempt.correctAnswers || 0,
    totalQuestions: attempt.totalQuestions || 0,
    submittedAt: attempt.submittedAt || attempt.createdAt,
    questionReviews: attempt.questionReviews || [],
  };
};

export const updateQuiz = async (quizId, payload) => {
  const existingQuiz = await Quiz.findById(quizId).lean();
  if (!existingQuiz) throw new Error("Quiz not found");

  if (
    payload.instructorId &&
    String(existingQuiz.instructorId) !== String(payload.instructorId)
  ) {
    throw new Error("You are not allowed to update this quiz");
  }

  if (payload.patchMode) {
    const updated = await Quiz.findByIdAndUpdate(
      quizId,
      {
        isPublished:
          typeof payload.isPublished === "boolean"
            ? payload.isPublished
            : existingQuiz.isPublished,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updated) throw new Error("Quiz not found");
    return updated;
  }

  const questions = (payload.questions || []).map(sanitizeQuestion);
  validateQuestions(questions);

  const updated = await Quiz.findByIdAndUpdate(
    quizId,
    {
      title: payload.title?.trim() || "",
      description: payload.description?.trim() || "",
      lessonId: payload.lessonId || null,
      timeLimit: Number(payload.timeLimit) || 0,
      passingScore: Number(payload.passingScore) || 0,
      isPublished:
        typeof payload.isPublished === "boolean"
          ? payload.isPublished
          : existingQuiz.isPublished,
      questions,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updated) throw new Error("Quiz not found");
  return updated;
};

export const deleteQuiz = async (quizId, instructorId) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw new Error("Quiz not found");

  if (instructorId && String(quiz.instructorId) !== String(instructorId)) {
    throw new Error("You are not allowed to delete this quiz");
  }

  await Quiz.findByIdAndDelete(quizId);
  await QuizAttempt.deleteMany({ quizId });

  return { message: "Quiz deleted successfully" };
};