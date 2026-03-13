import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getQuizById,
  submitQuizAttempt,
  getAttemptsByStudentCourse,
  quizUnwrap,
} from "../services/quiz.service";
import { useAuth } from "../../auth/state/useAuth";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function buildInitialAnswers(questions = []) {
  const result = {};
  questions.forEach((question) => {
    result[String(question._id)] =
      question.type === "multiple" ? [] : [];
  });
  return result;
}

function normalizeAttemptReview(attempt, quiz) {
  const questionReviews = Array.isArray(attempt?.questionReviews)
    ? attempt.questionReviews
    : [];

  const totalQuestions =
    Number(attempt?.totalQuestions) ||
    questionReviews.length ||
    quiz?.questions?.length ||
    0;

  const correctAnswers =
    Number(attempt?.correctAnswers) ||
    questionReviews.filter((q) => q?.isCorrect).length ||
    0;

  return {
    score: Number(attempt?.score || 0),
    passed: !!attempt?.passed,
    correctAnswers,
    totalQuestions,
    questionReviews,
    submittedAt: attempt?.submittedAt || attempt?.createdAt || null,
  };
}

export default function QuizPage() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentId = user?._id || user?.id || user?.userId;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });
  const [showResult, setShowResult] = useState(false);
  const [resultAttempt, setResultAttempt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    async function loadQuizData() {
      try {
        setLoading(true);

        const [quizRes, attemptRes] = await Promise.all([
          getQuizById(quizId, { hideAnswers: true }),
          studentId
            ? getAttemptsByStudentCourse(studentId, courseId)
            : Promise.resolve([]),
        ]);

        const quizData = quizUnwrap(quizRes);
        const attemptList = quizUnwrap(attemptRes) || [];

        const filteredAttempts = Array.isArray(attemptList)
          ? attemptList.filter((item) => {
              const currentQuizId =
                item.quizId?._id || item.quizId || item.quiz?._id || item.quiz;
              return String(currentQuizId) === String(quizId);
            })
          : [];

        setQuiz(quizData);
        setAttempts(filteredAttempts);
        setAnswers(buildInitialAnswers(quizData?.questions || []));

        if (quizData?.timeLimit) {
          setTimeLeft(Number(quizData.timeLimit) * 60);
        } else {
          setTimeLeft(null);
        }
      } catch (error) {
        setToast({
          message: error.message || "Không tải được quiz",
          kind: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    if (quizId && courseId) {
      loadQuizData();
    }
  }, [quizId, courseId, studentId]);

  useEffect(() => {
    if (timeLeft === null || showResult) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, showResult]);

  const latestAttempt = useMemo(() => {
    if (!attempts.length) return null;
    return attempts[0];
  }, [attempts]);

  function handleSingleChange(questionId, optionIndex) {
    setAnswers((prev) => ({
      ...prev,
      [String(questionId)]: [Number(optionIndex)],
    }));
  }

  function handleMultipleChange(questionId, optionIndex) {
    setAnswers((prev) => {
      const current = Array.isArray(prev[String(questionId)])
        ? prev[String(questionId)]
        : [];

      const normalizedIndex = Number(optionIndex);
      const exists = current.includes(normalizedIndex);

      return {
        ...prev,
        [String(questionId)]: exists
          ? current.filter((item) => item !== normalizedIndex)
          : [...current, normalizedIndex].sort((a, b) => a - b),
      };
    });
  }

  async function handleSubmit(autoSubmit = false) {
    if (!studentId) {
      setToast({
        message: "Vui lòng đăng nhập để làm quiz",
        kind: "error",
      });
      return;
    }

    if (!quiz?.questions?.length) return;

    try {
      setSubmitting(true);

      const payloadAnswers = quiz.questions.map((question) => ({
        questionId: question._id,
        selectedOptionIndexes: Array.isArray(answers[String(question._id)])
          ? answers[String(question._id)].map(Number)
          : [],
      }));

      const res = await submitQuizAttempt(quizId, {
        studentId,
        answers: payloadAnswers,
      });

      const attempt = quizUnwrap(res);
      setResultAttempt(attempt);
      setShowResult(true);

      setToast({
        message: autoSubmit
          ? "Hết thời gian, quiz đã được nộp tự động"
          : "Nộp quiz thành công",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error.message || "Không thể nộp quiz",
        kind: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p>Đang tải quiz...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p>Không tìm thấy quiz.</p>
      </div>
    );
  }

  if (showResult && resultAttempt) {
    const summary = normalizeAttemptReview(resultAttempt, quiz);

    return (
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {toast.message ? (
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        <div className="rounded-3xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">
              {quiz.title}
            </h1>
            <p className="mt-2 text-slate-600">{quiz.description}</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Score</div>
              <div className="mt-2 text-3xl font-black text-slate-900">
                {summary.score}
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Correct</div>
              <div className="mt-2 text-3xl font-black text-slate-900">
                {summary.correctAnswers}/{summary.totalQuestions}
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Result</div>
              <div
                className={`mt-2 text-2xl font-black ${
                  summary.passed ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {summary.passed ? "Passed" : "Not passed"}
              </div>
            </div>

            <div className="rounded-2xl border bg-slate-50 p-4">
              <div className="text-sm text-slate-500">Submitted</div>
              <div className="mt-2 text-sm font-semibold text-slate-900">
                {summary.submittedAt
                  ? new Date(summary.submittedAt).toLocaleString("vi-VN")
                  : "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {(summary.questionReviews || []).map((question, index) => (
              <div
                key={question.questionId || index}
                className="rounded-2xl border p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Câu {index + 1}. {question.questionText}
                  </h3>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      question.isCorrect
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {question.isCorrect ? "Đúng" : "Sai"}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {(question.options || []).map((option) => (
                    <div
                      key={option.index}
                      className={`rounded-xl border px-4 py-3 ${
                        option.isCorrect
                          ? "border-emerald-300 bg-emerald-50"
                          : option.isSelected
                          ? "border-red-300 bg-red-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="text-slate-800">{option.text}</span>

                        <div className="flex gap-2 flex-wrap">
                          {option.isSelected ? (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                              Student selected
                            </span>
                          ) : null}

                          {option.isCorrect ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Correct answer
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {question.explanation ? (
                  <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                    <div className="text-sm font-semibold text-slate-700">
                      Explanation
                    </div>
                    <div className="mt-1 text-sm text-slate-600">
                      {question.explanation}
                    </div>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <Button onClick={() => navigate(`/learn/${courseId}?tab=quizzes`)}>
              Back to Course
            </Button>

            <Button
              type="button"
              onClick={() => {
                setShowResult(false);
                setResultAttempt(null);
                setAnswers(buildInitialAnswers(quiz?.questions || []));
                setTimeLeft(quiz?.timeLimit ? Number(quiz.timeLimit) * 60 : null);
              }}
            >
              Retake Quiz
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      {toast.message ? (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <div className="rounded-3xl border bg-white shadow-sm overflow-hidden">
        <div className="border-b p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{quiz.title}</h1>
              <p className="mt-2 text-slate-600">{quiz.description}</p>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Questions: {quiz.questions?.length || 0}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Passing: {quiz.passingScore || 0}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Attempts: {attempts.length}
                </span>
              </div>
            </div>

            {timeLeft !== null ? (
              <div className="rounded-2xl bg-indigo-50 px-5 py-4 text-center">
                <div className="text-sm text-slate-500">Time left</div>
                <div className="text-2xl font-black text-indigo-700">
                  {formatTime(timeLeft)}
                </div>
              </div>
            ) : null}
          </div>

          {latestAttempt ? (
            <div className="mt-5 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
              <div className="font-semibold text-slate-900 mb-2">
                Latest attempt
              </div>
              <div>Score: {latestAttempt.score ?? 0}</div>
              <div>
                Correct: {latestAttempt.correctAnswers ?? 0}/
                {latestAttempt.totalQuestions ?? 0}
              </div>
              <div>
                Status:{" "}
                <span
                  className={
                    latestAttempt.passed
                      ? "font-semibold text-emerald-600"
                      : "font-semibold text-red-500"
                  }
                >
                  {latestAttempt.passed ? "Passed" : "Not passed"}
                </span>
              </div>
            </div>
          ) : null}
        </div>

        <div className="p-6 space-y-8">
          {(quiz.questions || []).map((question, index) => {
            const selected = answers[String(question._id)] || [];

            return (
              <div key={question._id} className="rounded-2xl border p-5">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Câu {index + 1}. {question.questionText}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {question.type === "multiple"
                      ? "Chọn nhiều đáp án đúng"
                      : "Chọn một đáp án đúng"}
                  </p>
                </div>

                <div className="space-y-3">
                  {(question.options || []).map((option, optIndex) => {
                    const checked = selected.includes(optIndex);

                    return (
                      <label
                        key={optIndex}
                        className="flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer hover:bg-slate-50"
                      >
                        <input
                          type={question.type === "multiple" ? "checkbox" : "radio"}
                          checked={checked}
                          onChange={() => {
                            if (question.type === "multiple") {
                              handleMultipleChange(question._id, optIndex);
                            } else {
                              handleSingleChange(question._id, optIndex);
                            }
                          }}
                          name={`question-${question._id}`}
                          className="mt-1"
                        />
                        <span className="text-slate-800">{option.text}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t bg-slate-50 p-6 flex gap-3">
          <Button
            onClick={() => handleSubmit(false)}
            loading={submitting}
            disabled={submitting}
          >
            Submit Quiz
          </Button>

          <Button
            type="button"
            onClick={() => navigate(`/learn/${courseId}?tab=quizzes`)}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}