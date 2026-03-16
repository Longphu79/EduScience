import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getInstructorQuizzesByCourse,
  deleteQuiz,
  toggleQuizPublished,
  quizUnwrap,
} from "../services/quiz.service";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/state/useAuth";

export default function InstructorQuizManagePage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [publishingId, setPublishingId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const instructorId = user?._id || user?.id || user?.userId || null;

  async function loadQuizzes() {
    try {
      setLoading(true);
      const res = await getInstructorQuizzesByCourse(courseId, instructorId);
      const data = quizUnwrap(res);
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (courseId && instructorId) {
      loadQuizzes();
    }
  }, [courseId, instructorId]);

  async function handleDelete(quizId) {
    const ok = window.confirm("Bạn có chắc muốn xóa quiz này?");
    if (!ok) return;

    try {
      setDeletingId(quizId);
      await deleteQuiz(quizId, instructorId);
      setToast({ message: "Xóa quiz thành công", kind: "success" });
      await loadQuizzes();
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleTogglePublish(quiz) {
    try {
      setPublishingId(quiz._id);
      await toggleQuizPublished(quiz._id, instructorId, !quiz.isPublished);
      setToast({
        message: quiz.isPublished
          ? "Đã chuyển quiz sang Draft"
          : "Đã publish quiz",
        kind: "success",
      });
      await loadQuizzes();
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setPublishingId(null);
    }
  }

  const filteredQuizzes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return quizzes;

    return quizzes.filter((quiz) => {
      const title = quiz.title?.toLowerCase() || "";
      const description = quiz.description?.toLowerCase() || "";
      return title.includes(keyword) || description.includes(keyword);
    });
  }, [quizzes, search]);

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.message ? (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Quizzes</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tạo, chỉnh sửa và theo dõi kết quả quiz của khóa học
            </p>
          </div>

          <Link to={`/instructor/courses/${courseId}/quizzes/create`}>
            <Button>+ Create Quiz</Button>
          </Link>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm quiz theo tên hoặc mô tả..."
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
            Đang tải danh sách quiz...
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <div className="text-lg font-semibold text-gray-800">
              {quizzes.length === 0
                ? "Chưa có quiz nào"
                : "Không tìm thấy quiz phù hợp"}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {quizzes.length === 0
                ? "Hãy tạo quiz đầu tiên cho khóa học này."
                : "Thử từ khóa khác."}
            </p>

            {quizzes.length === 0 ? (
              <div className="mt-5">
                <Link to={`/instructor/courses/${courseId}/quizzes/create`}>
                  <Button>+ Create First Quiz</Button>
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredQuizzes.map((quiz, index) => (
              <div
                key={quiz._id}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                        {index + 1}
                      </span>

                      <h2 className="text-xl font-semibold text-gray-900">
                        {quiz.title || "Untitled Quiz"}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          quiz.isPublished
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {quiz.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      {quiz.description || "Chưa có mô tả."}
                    </p>

                    <div className="flex flex-wrap gap-3 pt-1">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        Questions: {quiz.questions?.length || 0}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        Passing: {quiz.passingScore ?? "N/A"}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        Time limit: {quiz.timeLimit ?? "N/A"} mins
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        Attempts: {quiz.stats?.totalAttempts ?? 0}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        Students: {quiz.stats?.totalStudents ?? 0}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        Avg: {quiz.stats?.averageScore ?? 0}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                        Pass rate: {quiz.stats?.passRate ?? 0}%
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0 flex-wrap">
                    <Button
                      type="button"
                      onClick={() => handleTogglePublish(quiz)}
                      loading={publishingId === quiz._id}
                      disabled={publishingId === quiz._id}
                    >
                      {quiz.isPublished ? "Unpublish" : "Publish"}
                    </Button>

                    <Link
                      to={`/instructor/courses/${courseId}/quizzes/${quiz._id}/edit`}
                    >
                      <Button>Edit</Button>
                    </Link>

                    <Link
                      to={`/instructor/courses/${courseId}/quizzes/${quiz._id}/results`}
                    >
                      <Button type="button">Results</Button>
                    </Link>

                    <Button
                      type="button"
                      onClick={() => handleDelete(quiz._id)}
                      disabled={deletingId === quiz._id}
                      loading={deletingId === quiz._id}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}