import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getQuizByCourse,
  getAttemptsByStudentCourse,
  quizUnwrap,
} from "../services/quiz.service";
import { useAuth } from "../../auth/state/useAuth";

function groupAttemptsByQuiz(attempts = []) {
  const map = {};

  for (const attempt of attempts) {
    const quizId =
      attempt.quizId?._id || attempt.quizId || attempt.quiz?._id || attempt.quiz;

    if (!quizId) continue;
    if (!map[quizId]) map[quizId] = [];
    map[quizId].push(attempt);
  }

  return map;
}

function getAttemptSummary(attempt, quiz) {
  if (!attempt) {
    return {
      score: 0,
      correctAnswers: 0,
      totalQuestions: quiz?.questions?.length || 0,
      passed: false,
    };
  }

  const score = Number(attempt.score || 0);

  let totalQuestions =
    Number(attempt.totalQuestions || 0) || quiz?.questions?.length || 0;

  let correctAnswers = Number(attempt.correctAnswers || 0);

  if ((!correctAnswers || correctAnswers === 0) && Array.isArray(attempt.questionReviews)) {
    correctAnswers = attempt.questionReviews.filter((q) => q?.isCorrect).length;
    if (!totalQuestions) {
      totalQuestions = attempt.questionReviews.length;
    }
  }

  // fallback cho dữ liệu cũ bị lệch:
  // backend hiện lưu score theo %, nên có thể nội suy số câu đúng
  if (
    totalQuestions > 0 &&
    correctAnswers === 0 &&
    score > 0 &&
    !Array.isArray(attempt.questionReviews)
  ) {
    correctAnswers = Math.round((score * totalQuestions) / 100);
  }

  const passed =
    typeof attempt.passed === "boolean"
      ? attempt.passed
      : score >= Number(quiz?.passingScore || 0);

  return {
    score,
    correctAnswers,
    totalQuestions,
    passed,
  };
}

export default function QuizList({ courseId }) {
  const { user } = useAuth();
  const { courseId: routeCourseId } = useParams();

  const finalCourseId = courseId || routeCourseId;
  const studentId = user?._id || user?.id || user?.userId;

  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [quizRes, attemptRes] = await Promise.all([
          getQuizByCourse(finalCourseId),
          studentId
            ? getAttemptsByStudentCourse(studentId, finalCourseId)
            : Promise.resolve([]),
        ]);

        const quizList = quizUnwrap(quizRes) || [];
        const attemptList = quizUnwrap(attemptRes) || [];

        setQuizzes(Array.isArray(quizList) ? quizList : []);
        setAttempts(Array.isArray(attemptList) ? attemptList : []);
      } catch {
        setQuizzes([]);
        setAttempts([]);
      } finally {
        setLoading(false);
      }
    }

    if (finalCourseId) fetchData();
  }, [finalCourseId, studentId]);

  const attemptsMap = useMemo(() => groupAttemptsByQuiz(attempts), [attempts]);

  if (loading) return <p>Đang tải quiz...</p>;

  if (!quizzes.length) {
    return <p className="text-slate-600">Chưa có quiz nào.</p>;
  }

  return (
    <div className="space-y-4">
      {quizzes.map((item) => {
        const quizAttempts = attemptsMap[item._id] || [];
        const latestAttempt = quizAttempts[0] || null;
        const summary = getAttemptSummary(latestAttempt, item);

        return (
          <div
            key={item._id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="text-lg font-semibold text-slate-900">
                    {item.title}
                  </h4>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.isPublished
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-slate-600">
                  {item.description || "Chưa có mô tả quiz."}
                </p>

                <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Questions: {item.questions?.length || 0}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Passing: {item.passingScore || 0}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Time: {item.timeLimit || 0} phút
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    Attempts: {quizAttempts.length}
                  </span>
                </div>

                {latestAttempt ? (
                  <div className="mt-2 rounded-xl border bg-slate-50 p-4 text-sm text-slate-700">
                    <div>Latest score: {summary.score}</div>
                    <div>
                      Correct: {summary.correctAnswers}/{summary.totalQuestions}
                    </div>
                    <div>
                      Status:{" "}
                      <span
                        className={
                          summary.passed
                            ? "font-semibold text-emerald-600"
                            : "font-semibold text-red-500"
                        }
                      >
                        {summary.passed ? "Passed" : "Not passed"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-slate-500">
                    Bạn chưa làm quiz này.
                  </div>
                )}
              </div>

              <div className="shrink-0">
                <Link
                  to={`/learn/${finalCourseId}/quizzes/${item._id}`}
                  className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 font-semibold text-white shadow-sm"
                >
                  {latestAttempt ? "Làm lại quiz" : "Làm quiz"}
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}