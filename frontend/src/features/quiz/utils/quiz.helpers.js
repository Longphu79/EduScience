function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function sortByDateDesc(list = [], getDate) {
  return [...list].sort((a, b) => {
    const aTime = new Date(getDate(a) || 0).getTime();
    const bTime = new Date(getDate(b) || 0).getTime();
    return bTime - aTime;
  });
}

function arraysEqual(a = [], b = []) {
  if (a.length !== b.length) return false;

  const left = [...a].map(Number).sort((x, y) => x - y);
  const right = [...b].map(Number).sort((x, y) => x - y);

  return left.every((value, index) => value === right[index]);
}

export function quizUnwrap(res) {
  return res?.data ?? res ?? null;
}

export function getQuizId(item = {}) {
  const rawQuizId =
    item?.quizId?._id ||
    item?.quizId?.id ||
    item?.quizId ||
    item?.quiz?._id ||
    item?.quiz?.id ||
    item?.quiz ||
    item?._id ||
    item?.id ||
    "";

  return typeof rawQuizId === "object"
    ? String(rawQuizId?._id || rawQuizId?.id || "")
    : String(rawQuizId || "");
}

export function getQuestionId(item = {}) {
  return String(
    item?._id ||
      item?.id ||
      item?.questionId?._id ||
      item?.questionId ||
      item?.question?._id ||
      item?.question ||
      ""
  );
}

export function getAttemptId(item = {}) {
  return String(item?._id || item?.id || item?.attemptId || "");
}

export function getStudentId(item = {}) {
  return String(
    item?.studentId?._id ||
      item?.studentId?.id ||
      item?.studentId ||
      item?.student?._id ||
      item?.student?.id ||
      item?.student ||
      ""
  );
}

export function getCourseId(item = {}) {
  return String(
    item?.courseId?._id ||
      item?.courseId?.id ||
      item?.courseId ||
      item?.course?._id ||
      item?.course?.id ||
      item?.course ||
      ""
  );
}

export function getLessonId(item = {}) {
  return String(
    item?.lessonId?._id ||
      item?.lessonId?.id ||
      item?.lessonId ||
      item?.lesson?._id ||
      item?.lesson?.id ||
      item?.lesson ||
      ""
  );
}

export function normalizeQuizOption(option = {}, index = 0) {
  return {
    clientId: option?.clientId || `quiz-option-${index}`,
    index: toNumber(option?.index ?? option?.optionIndex ?? index),
    text: option?.text || option?.optionText || "",
    isCorrect: !!option?.isCorrect,
    isSelected: !!option?.isSelected,
  };
}

export function normalizeQuizQuestion(question = {}, index = 0) {
  const type = question?.type || "single";
  const options = Array.isArray(question?.options)
    ? question.options.map((option, optionIndex) =>
        normalizeQuizOption(option, optionIndex)
      )
    : [];

  return {
    _id: getQuestionId(question),
    id: getQuestionId(question),
    clientId: question?.clientId || `quiz-question-${index}`,
    questionText: question?.questionText || "",
    type,
    explanation: question?.explanation || "",
    points: Math.max(1, toNumber(question?.points, 1)),
    options,
  };
}

export function normalizeQuizItem(quiz = {}) {
  const questions = Array.isArray(quiz?.questions)
    ? quiz.questions.map((question, index) =>
        normalizeQuizQuestion(question, index)
      )
    : [];

  return {
    ...quiz,
    _id: getQuizId(quiz),
    id: getQuizId(quiz),
    courseId: getCourseId(quiz),
    lessonId: getLessonId(quiz),
    title: quiz?.title || "",
    description: quiz?.description || "",
    passingScore: Math.max(0, toNumber(quiz?.passingScore, 0)),
    timeLimit: Math.max(0, toNumber(quiz?.timeLimit, 0)),
    isPublished: !!quiz?.isPublished,
    questions,
    stats: {
      totalAttempts: Math.max(0, toNumber(quiz?.stats?.totalAttempts, 0)),
      totalStudents: Math.max(0, toNumber(quiz?.stats?.totalStudents, 0)),
      averageScore: Math.max(0, toNumber(quiz?.stats?.averageScore, 0)),
      passRate: Math.max(0, toNumber(quiz?.stats?.passRate, 0)),
    },
    createdAt: quiz?.createdAt || null,
    updatedAt: quiz?.updatedAt || null,
  };
}

export function normalizeQuizList(list = []) {
  if (!Array.isArray(list)) return [];
  return list.map((item) => normalizeQuizItem(item));
}

export function normalizeQuestionReview(question = {}, index = 0) {
  const rawOptions = Array.isArray(question?.options) ? question.options : [];

  let selectedOptionIndexes = Array.isArray(question?.selectedOptionIndexes)
    ? question.selectedOptionIndexes.map(Number)
    : rawOptions
        .filter((option) => option?.isSelected)
        .map((option, optionIndex) =>
          Number(option?.index ?? option?.optionIndex ?? optionIndex)
        );

  let correctOptionIndexes = Array.isArray(question?.correctOptionIndexes)
    ? question.correctOptionIndexes.map(Number)
    : rawOptions
        .filter((option) => option?.isCorrect)
        .map((option, optionIndex) =>
          Number(option?.index ?? option?.optionIndex ?? optionIndex)
        );

  const options = rawOptions.map((option, optionIndex) => {
    const optionId = Number(option?.index ?? option?.optionIndex ?? optionIndex);

    return {
      clientId: option?.clientId || `review-option-${index}-${optionIndex}`,
      index: optionId,
      text: option?.text || option?.optionText || "",
      isCorrect:
        correctOptionIndexes.includes(optionId) || !!option?.isCorrect,
      isSelected:
        selectedOptionIndexes.includes(optionId) || !!option?.isSelected,
    };
  });

  if (correctOptionIndexes.length === 0) {
    correctOptionIndexes = options
      .filter((option) => option.isCorrect)
      .map((option) => option.index);
  }

  if (selectedOptionIndexes.length === 0) {
    selectedOptionIndexes = options
      .filter((option) => option.isSelected)
      .map((option) => option.index);
  }

  return {
    questionId: getQuestionId(question),
    questionText: question?.questionText || `Question ${index + 1}`,
    explanation: question?.explanation || "",
    options,
    correctOptionIndexes,
    selectedOptionIndexes,
    isCorrect:
      typeof question?.isCorrect === "boolean"
        ? question.isCorrect
        : arraysEqual(selectedOptionIndexes, correctOptionIndexes),
  };
}

export function normalizeAttemptItem(attempt = {}) {
  const questionReviews = Array.isArray(attempt?.questionReviews)
    ? attempt.questionReviews.map((question, index) =>
        normalizeQuestionReview(question, index)
      )
    : [];

  const score = Math.max(0, toNumber(attempt?.score, 0));
  const totalQuestions = Math.max(
    0,
    toNumber(attempt?.totalQuestions, questionReviews.length)
  );

  const correctAnswers =
    toNumber(attempt?.correctAnswers, -1) >= 0
      ? Math.max(0, toNumber(attempt?.correctAnswers, 0))
      : questionReviews.filter((question) => question.isCorrect).length;

  return {
    ...attempt,
    _id: getAttemptId(attempt),
    id: getAttemptId(attempt),
    quizId:
      attempt?.quizId?._id ||
      attempt?.quizId?.id ||
      attempt?.quizId ||
      attempt?.quiz?._id ||
      attempt?.quiz?.id ||
      attempt?.quiz ||
      "",
    studentId: getStudentId(attempt),
    studentName:
      attempt?.studentName ||
      attempt?.student?.name ||
      attempt?.studentId?.name ||
      "Student",
    studentEmail:
      attempt?.studentEmail ||
      attempt?.student?.email ||
      attempt?.studentId?.email ||
      "",
    score,
    correctAnswers,
    totalQuestions,
    passed:
      typeof attempt?.passed === "boolean"
        ? attempt.passed
        : score > 0 && totalQuestions > 0
        ? correctAnswers === totalQuestions
        : false,
    submittedAt: attempt?.submittedAt || attempt?.createdAt || null,
    createdAt: attempt?.createdAt || attempt?.submittedAt || null,
    questionReviews,
  };
}

export function normalizeAttemptList(list = []) {
  if (!Array.isArray(list)) return [];
  return sortByDateDesc(
    list.map((item) => normalizeAttemptItem(item)),
    (item) => item?.submittedAt || item?.createdAt
  );
}

export function groupAttemptsByQuiz(attempts = []) {
  const map = {};

  for (const attempt of normalizeAttemptList(attempts)) {
    const quizId = String(attempt?.quizId || "");
    if (!quizId) continue;

    if (!map[quizId]) {
      map[quizId] = [];
    }

    map[quizId].push(attempt);
  }

  return map;
}

export function getAttemptSummary(attempt, quiz) {
  const normalizedQuiz = normalizeQuizItem(quiz || {});
  const normalizedAttempt = attempt ? normalizeAttemptItem(attempt) : null;

  if (!normalizedAttempt) {
    return {
      score: 0,
      correctAnswers: 0,
      totalQuestions: normalizedQuiz?.questions?.length || 0,
      passed: false,
      submittedAt: null,
    };
  }

  const totalQuestions =
    normalizedAttempt.totalQuestions || normalizedQuiz?.questions?.length || 0;

  const passed =
    typeof normalizedAttempt.passed === "boolean"
      ? normalizedAttempt.passed
      : normalizedAttempt.score >= normalizedQuiz.passingScore;

  return {
    score: normalizedAttempt.score,
    correctAnswers: normalizedAttempt.correctAnswers,
    totalQuestions,
    passed,
    submittedAt: normalizedAttempt.submittedAt || normalizedAttempt.createdAt,
  };
}

export function getStudentQuizStatusMeta(item, latestAttempt, summary) {
  if (!item?.isPublished) {
    return {
      label: "Draft",
      badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
      helperText: "Quiz này hiện chưa publish.",
      actionText: "Xem quiz",
      cardTone:
        "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
    };
  }

  if (!latestAttempt) {
    return {
      label: "Chưa làm",
      badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
      helperText: "Bạn chưa làm quiz này.",
      actionText: "Làm quiz",
      cardTone:
        "border-slate-200 bg-white hover:border-violet-200 hover:shadow-[0_14px_30px_rgba(79,70,229,0.08)]",
    };
  }

  if (summary?.passed) {
    return {
      label: "Đã đạt",
      badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      helperText: "Bạn đã vượt qua quiz này.",
      actionText: "Làm lại quiz",
      cardTone:
        "border-emerald-200 bg-emerald-50/40 hover:shadow-[0_14px_30px_rgba(16,185,129,0.10)]",
    };
  }

  return {
    label: "Chưa đạt",
    badgeClass: "bg-red-100 text-red-700 border border-red-200",
    helperText: "Bạn có thể làm lại để cải thiện kết quả.",
    actionText: "Làm lại quiz",
    cardTone:
      "border-red-200 bg-red-50/40 hover:shadow-[0_14px_30px_rgba(239,68,68,0.10)]",
  };
}

export function getInstructorQuizStatusMeta(quiz) {
  if (quiz?.isPublished) {
    return {
      label: "Published",
      badgeClass: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      cardTone:
        "border-emerald-200 bg-emerald-50/40 hover:shadow-[0_14px_30px_rgba(16,185,129,0.10)]",
    };
  }

  return {
    label: "Draft",
    badgeClass: "bg-amber-100 text-amber-700 border border-amber-200",
    cardTone:
      "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50",
  };
}

export function formatTime(seconds) {
  const safeSeconds = Math.max(0, toNumber(seconds, 0));
  const mins = Math.floor(safeSeconds / 60);
  const secs = safeSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function buildInitialAnswers(questions = []) {
  return (questions || []).reduce((result, question) => {
    const questionId = getQuestionId(question);
    if (questionId) {
      result[questionId] = [];
    }
    return result;
  }, {});
}

export function normalizeAttemptReview(attempt, quiz) {
  const normalizedAttempt = normalizeAttemptItem(attempt || {});
  const normalizedQuiz = normalizeQuizItem(quiz || {});
  const questionReviews = normalizedAttempt.questionReviews || [];

  return {
    ...normalizedAttempt,
    studentName: normalizedAttempt.studentName || "Student",
    score: normalizedAttempt.score,
    passed:
      typeof normalizedAttempt.passed === "boolean"
        ? normalizedAttempt.passed
        : normalizedAttempt.score >= normalizedQuiz.passingScore,
    correctAnswers:
      normalizedAttempt.correctAnswers ||
      questionReviews.filter((question) => question.isCorrect).length,
    totalQuestions:
      normalizedAttempt.totalQuestions ||
      questionReviews.length ||
      normalizedQuiz.questions.length,
    questionReviews,
    submittedAt: normalizedAttempt.submittedAt || normalizedAttempt.createdAt,
  };
}

export function normalizeQuizResults(results = {}) {
  const rawStudents = Array.isArray(results?.students) ? results.students : [];

  return {
    quiz: normalizeQuizItem(results?.quiz || {}),
    summary: {
      totalAttempts: Math.max(0, toNumber(results?.summary?.totalAttempts, 0)),
      totalStudents: Math.max(0, toNumber(results?.summary?.totalStudents, 0)),
      averageScore: Math.max(0, toNumber(results?.summary?.averageScore, 0)),
      passRate: Math.max(0, toNumber(results?.summary?.passRate, 0)),
    },
    students: rawStudents.map((student) => ({
      studentId: getStudentId(student),
      studentName:
        student?.studentName ||
        student?.student?.name ||
        student?.studentId?.name ||
        "Student",
      studentEmail:
        student?.studentEmail ||
        student?.student?.email ||
        student?.studentId?.email ||
        "",
      attemptCount: Math.max(0, toNumber(student?.attemptCount, 0)),
      latestScore: Math.max(0, toNumber(student?.latestScore, 0)),
      bestScore: Math.max(0, toNumber(student?.bestScore, 0)),
      latestPassed: !!student?.latestPassed,
      lastSubmittedAt: student?.lastSubmittedAt || null,
    })),
  };
}

export function filterAndSortQuizResultStudents(
  students = [],
  search = "",
  statusFilter = "all",
  sortBy = "latest"
) {
  let list = Array.isArray(students) ? [...students] : [];
  const keyword = search.trim().toLowerCase();

  if (keyword) {
    list = list.filter((student) => {
      const name = student?.studentName?.toLowerCase() || "";
      const email = student?.studentEmail?.toLowerCase() || "";
      return name.includes(keyword) || email.includes(keyword);
    });
  }

  if (statusFilter === "passed") {
    list = list.filter((student) => student?.latestPassed);
  } else if (statusFilter === "not-passed") {
    list = list.filter((student) => !student?.latestPassed);
  }

  list.sort((a, b) => {
    if (sortBy === "best") {
      return (b?.bestScore || 0) - (a?.bestScore || 0);
    }

    if (sortBy === "attempts") {
      return (b?.attemptCount || 0) - (a?.attemptCount || 0);
    }

    return (b?.latestScore || 0) - (a?.latestScore || 0);
  });

  return list;
}