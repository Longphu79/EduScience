import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import { useAuth } from "../../auth/state/useAuth";
import {
  getAttemptsByStudentCourse,
  getQuizByCourse,
} from "../services/quiz.service";
import {
  getAttemptSummary,
  getQuizId,
  getStudentQuizStatusMeta,
  groupAttemptsByQuiz,
  normalizeAttemptList,
  normalizeQuizList,
  quizUnwrap,
} from "../utils/quiz.helpers";
import QuizListItem from "./QuizListItem";

export default function QuizList({ courseId }) {
  const { user } = useAuth();
  const location = useLocation();
  const { courseId: routeCourseId } = useParams();

  const finalCourseId = courseId || routeCourseId;
  const studentId = user?._id || user?.id || user?.userId;

  const [quizzes, setQuizzes] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const loadData = useCallback(async () => {
    if (!finalCourseId) return;

    try {
      setLoading(true);

      const quizRes = await getQuizByCourse(finalCourseId);
      const quizList = normalizeQuizList(quizUnwrap(quizRes)).filter(
        (quiz) => quiz?.isPublished
      );
      setQuizzes(quizList);

      if (studentId) {
        try {
          const attemptRes = await getAttemptsByStudentCourse(finalCourseId);
          const attemptList = normalizeAttemptList(quizUnwrap(attemptRes));
          setAttempts(attemptList);
        } catch (attemptError) {
          console.error("Load quiz attempts error:", attemptError);
          setAttempts([]);
        }
      } else {
        setAttempts([]);
      }
    } catch (error) {
      setToast({
        message: error?.message || "Không tải được danh sách quiz",
        kind: "error",
      });
      setQuizzes([]);
      setAttempts([]);
    } finally {
      setLoading(false);
    }
  }, [finalCourseId, studentId]);

  useEffect(() => {
    loadData();
  }, [loadData, location.pathname, location.search]);

  const attemptsMap = useMemo(() => groupAttemptsByQuiz(attempts), [attempts]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="animate-pulse rounded-[24px] border border-slate-200 bg-white p-5"
          >
            <div className="h-5 w-44 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-full rounded bg-slate-100" />
            <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
            <div className="mt-4 h-10 w-32 rounded-xl bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!quizzes.length) {
    return (
      <>
        {toast.message ? (
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
          <div className="text-base font-semibold text-slate-800">
            Chưa có quiz nào
          </div>
          <div className="mt-2 text-sm text-slate-500">
            Instructor chưa tạo quiz cho khóa học này.
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="space-y-4">
      {toast.message ? (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      {quizzes.map((quiz) => {
        const quizId = getQuizId(quiz);
        const quizAttempts = attemptsMap[quizId] || [];
        const latestAttempt = quizAttempts[0] || null;
        const summary = getAttemptSummary(latestAttempt, quiz);
        const statusMeta = getStudentQuizStatusMeta(
          quiz,
          latestAttempt,
          summary
        );

        return (
          <QuizListItem
            key={quizId}
            item={quiz}
            finalCourseId={finalCourseId}
            quizAttempts={quizAttempts}
            summary={summary}
            statusMeta={statusMeta}
          />
        );
      })}
    </div>
  );
}