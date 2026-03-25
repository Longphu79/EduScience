export function createClientId(prefix = "quiz-item") {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createQuizOption(text = "", isCorrect = false) {
  return {
    clientId: createClientId("quiz-option"),
    text,
    isCorrect: !!isCorrect,
  };
}

export function createDefaultOptions(type = "single") {
  if (type === "true-false") {
    return [createQuizOption("True", true), createQuizOption("False", false)];
  }

  return [
    createQuizOption("", true),
    createQuizOption("", false),
    createQuizOption("", false),
    createQuizOption("", false),
  ];
}

export function ensureSingleCorrectOption(options = []) {
  if (!Array.isArray(options) || options.length === 0) {
    return createDefaultOptions("single");
  }

  const firstCorrectIndex = options.findIndex((option) => option?.isCorrect);

  return options.map((option, index) => ({
    clientId: option?.clientId || createClientId("quiz-option"),
    text: option?.text || "",
    isCorrect:
      firstCorrectIndex === -1 ? index === 0 : index === firstCorrectIndex,
  }));
}

export function ensureAtLeastOneCorrectOption(options = []) {
  if (!Array.isArray(options) || options.length === 0) {
    return createDefaultOptions("multiple");
  }

  if (options.some((option) => option?.isCorrect)) {
    return options.map((option) => ({
      clientId: option?.clientId || createClientId("quiz-option"),
      text: option?.text || "",
      isCorrect: !!option?.isCorrect,
    }));
  }

  return options.map((option, index) => ({
    clientId: option?.clientId || createClientId("quiz-option"),
    text: option?.text || "",
    isCorrect: index === 0,
  }));
}

export function normalizeQuestionTypeOptions(question, nextType) {
  const updatedQuestion = {
    ...question,
    clientId: question?.clientId || createClientId("quiz-question"),
    type: nextType,
  };

  if (nextType === "true-false") {
    updatedQuestion.options = createDefaultOptions("true-false");
    return updatedQuestion;
  }

  const rawOptions = Array.isArray(updatedQuestion.options)
    ? updatedQuestion.options.map((option) => ({
        clientId: option?.clientId || createClientId("quiz-option"),
        text: option?.text || "",
        isCorrect: !!option?.isCorrect,
      }))
    : [];

  if (rawOptions.length < 2) {
    updatedQuestion.options = createDefaultOptions(nextType);
    return updatedQuestion;
  }

  updatedQuestion.options =
    nextType === "single"
      ? ensureSingleCorrectOption(rawOptions)
      : ensureAtLeastOneCorrectOption(rawOptions);

  return updatedQuestion;
}

export function createEmptyQuestion() {
  return {
    clientId: createClientId("quiz-question"),
    questionText: "",
    type: "single",
    explanation: "",
    points: 1,
    options: createDefaultOptions("single"),
  };
}

export function createEmptyQuizForm() {
  return {
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: 15,
    isPublished: true,
    questions: [createEmptyQuestion()],
  };
}

export function buildQuizForm(quiz = {}) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];

  return {
    _id: quiz?._id || quiz?.id || "",
    courseId: quiz?.courseId || "",
    title: quiz?.title || "",
    description: quiz?.description || "",
    passingScore: Number(quiz?.passingScore ?? 70),
    timeLimit: Number(quiz?.timeLimit ?? 15),
    isPublished:
      typeof quiz?.isPublished === "boolean" ? quiz.isPublished : true,
    questions:
      questions.length > 0
        ? questions.map((question) => {
            const type = question?.type || "single";

            let options = Array.isArray(question?.options)
              ? question.options.map((option) => ({
                  clientId: option?.clientId || createClientId("quiz-option"),
                  text: option?.text || "",
                  isCorrect: !!option?.isCorrect,
                }))
              : [];

            if (type === "true-false") {
              options =
                options.length >= 2
                  ? [
                      {
                        clientId:
                          options[0]?.clientId || createClientId("quiz-option"),
                        text: options[0]?.text || "True",
                        isCorrect: !!options[0]?.isCorrect,
                      },
                      {
                        clientId:
                          options[1]?.clientId || createClientId("quiz-option"),
                        text: options[1]?.text || "False",
                        isCorrect: !!options[1]?.isCorrect,
                      },
                    ]
                  : createDefaultOptions("true-false");
            } else if (type === "single") {
              options = ensureSingleCorrectOption(
                options.length > 0 ? options : createDefaultOptions("single")
              );
            } else {
              options = ensureAtLeastOneCorrectOption(
                options.length > 0 ? options : createDefaultOptions("multiple")
              );
            }

            return {
              _id: question?._id || question?.id || "",
              clientId: question?.clientId || createClientId("quiz-question"),
              questionText: question?.questionText || "",
              type,
              explanation: question?.explanation || "",
              points: Number(question?.points ?? 1),
              options,
            };
          })
        : [createEmptyQuestion()],
  };
}

export function buildQuizPayload(form = {}, extra = {}) {
  return {
    ...extra,
    title: form?.title?.trim() || "",
    description: form?.description?.trim() || "",
    passingScore: Math.max(0, Number(form?.passingScore) || 0),
    timeLimit: Math.max(0, Number(form?.timeLimit) || 0),
    isPublished: !!form?.isPublished,
    questions: (form?.questions || []).map((question) => ({
      ...(question?._id ? { _id: question._id } : {}),
      questionText: question?.questionText?.trim() || "",
      type: question?.type || "single",
      explanation: question?.explanation?.trim() || "",
      points: Math.max(1, Number(question?.points) || 1),
      options: (question?.options || []).map((option) => ({
        text: option?.text?.trim() || "",
        isCorrect: !!option?.isCorrect,
      })),
    })),
  };
}

export function validateQuizForm(form = {}) {
  if (!form?.title?.trim()) {
    return "Vui lòng nhập tiêu đề quiz";
  }

  const questions = Array.isArray(form?.questions) ? form.questions : [];

  if (questions.length === 0) {
    return "Quiz phải có ít nhất 1 câu hỏi";
  }

  if (Number(form?.passingScore) < 0) {
    return "Passing score không hợp lệ";
  }

  if (Number(form?.timeLimit) < 0) {
    return "Time limit không hợp lệ";
  }

  for (let questionIndex = 0; questionIndex < questions.length; questionIndex += 1) {
    const question = questions[questionIndex];
    const questionNumber = questionIndex + 1;

    if (!question?.questionText?.trim()) {
      return `Vui lòng nhập nội dung câu hỏi ${questionNumber}`;
    }

    const options = Array.isArray(question?.options) ? question.options : [];

    if (question?.type !== "true-false" && options.length < 2) {
      return `Câu hỏi ${questionNumber} phải có ít nhất 2 đáp án`;
    }

    if (options.some((option) => !option?.text?.trim())) {
      return `Vui lòng nhập đầy đủ nội dung đáp án ở câu hỏi ${questionNumber}`;
    }

    const correctCount = options.filter((option) => option?.isCorrect).length;

    if (correctCount === 0) {
      return `Câu hỏi ${questionNumber} phải có ít nhất 1 đáp án đúng`;
    }

    if (
      (question?.type === "single" || question?.type === "true-false") &&
      correctCount > 1
    ) {
      return `Câu hỏi ${questionNumber} chỉ được có 1 đáp án đúng`;
    }
  }

  return "";
}