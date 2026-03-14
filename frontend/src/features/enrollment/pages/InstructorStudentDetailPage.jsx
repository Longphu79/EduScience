import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { getStudentProgressDetail } from "../services/enrollment.service";

function StatCard({ label, value, tone = "indigo" }) {
  const toneMap = {
    indigo: "from-indigo-500 to-blue-500",
    emerald: "from-emerald-500 to-green-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-4 flex items-end justify-between gap-4">
        <div className="text-3xl font-black text-slate-900">{value}</div>
        <div
          className={`h-10 w-10 rounded-2xl bg-gradient-to-br ${toneMap[tone]} opacity-90`}
        />
      </div>
    </div>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function InstructorStudentDetailPage() {
  const { courseId, studentId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  async function loadData() {
    try {
      setLoading(true);
      const res = await getStudentProgressDetail(courseId, studentId);
      const payload = res?.data ?? res ?? null;
      setData(payload);
    } catch (error) {
      setToast({
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không tải được chi tiết học viên",
        kind: "error",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (courseId && studentId) {
      loadData();
    }
  }, [courseId, studentId]);

  const enrollment = data?.enrollment || {};
  const student = enrollment?.studentId || {};
  const course = enrollment?.courseId || {};

  const quizAttempts = Array.isArray(data?.quizAttempts) ? data.quizAttempts : [];
  const assignmentSubmissions = Array.isArray(data?.assignmentSubmissions)
    ? data.assignmentSubmissions
    : [];

  const lessons = useMemo(() => {
    return Array.isArray(course?.lessonIds) ? course.lessonIds : [];
  }, [course]);

  const completedLessonIds = useMemo(() => {
    const ids = Array.isArray(enrollment?.completedLessons)
      ? enrollment.completedLessons
      : [];
    return ids.map((item) => String(item?._id || item));
  }, [enrollment]);

  const progress = Number(enrollment?.progress || 0);
  const completedLessonsCount = completedLessonIds.length;
  const totalLessons = lessons.length;

  const passedQuizCount = useMemo(() => {
    return quizAttempts.filter((item) => item?.passed).length;
  }, [quizAttempts]);

  const gradedAssignmentsCount = useMemo(() => {
    return assignmentSubmissions.filter(
      (item) => item?.grade !== null && item?.grade !== undefined
    ).length;
  }, [assignmentSubmissions]);

  const averageQuizScore = useMemo(() => {
    if (!quizAttempts.length) return 0;
    const total = quizAttempts.reduce(
      (sum, item) => sum + Number(item?.score || 0),
      0
    );
    return Math.round(total / quizAttempts.length);
  }, [quizAttempts]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Đang tải chi tiết học viên...
          </div>
        </div>
      </div>
    );
  }

  if (!data?.enrollment) {
    return (
      <div className="min-h-screen bg-slate-50">
        {toast.message ? (
          <div className="mx-auto max-w-7xl px-4 pt-4">
            <Toast
              message={toast.message}
              kind={toast.kind}
              onClose={() => setToast({ message: "", kind: "success" })}
            />
          </div>
        ) : null}

        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Không tìm thấy dữ liệu học viên
            </h1>
            <p className="mt-2 text-slate-500">
              Có thể học viên chưa đăng ký khóa học này hoặc dữ liệu chưa sẵn sàng.
            </p>
            <div className="mt-6">
              <Link to={`/instructor/courses/${courseId}/students`}>
                <Button type="button">Quay lại danh sách học viên</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {toast.message ? (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Student analytics
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Chi tiết học viên
            </h1>
            <p className="mt-2 text-slate-500">
              Theo dõi tiến độ học tập, quiz và assignment của học viên trong khóa
              học.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>

            <Link to={`/instructor/courses/${courseId}/students`}>
              <Button type="button">Back to students</Button>
            </Link>
          </div>
        </div>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 p-6 text-white">
            <div className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
              <div className="min-w-0">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-black uppercase">
                    {(student?.username || student?.email || "S").slice(0, 1)}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-2xl font-black">
                      {student?.username || student?.email || "Student"}
                    </h2>
                    <p className="mt-1 text-sm text-white/80">
                      {student?.email || "No email available"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        Role: {student?.role || "student"}
                      </span>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        Course: {course?.title || "N/A"}
                      </span>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                        Progress: {progress}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
                <div className="text-sm text-white/80">Overall progress</div>
                <div className="mt-3 text-5xl font-black">{progress}%</div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${Math.min(100, progress)}%` }}
                  />
                </div>

                <div className="mt-4 text-sm">
                  Status:{" "}
                  <span className="font-bold">
                    {enrollment?.completed ? "Completed" : "In progress"}
                  </span>
                </div>

                <div className="mt-2 text-sm text-white/80">
                  Last lesson:{" "}
                  <span className="font-semibold text-white">
                    {enrollment?.lastLessonId?.title ||
                      enrollment?.lastLessonId ||
                      "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Completed lessons"
            value={completedLessonsCount}
            tone="emerald"
          />
          <StatCard label="Total lessons" value={totalLessons} tone="indigo" />
          <StatCard
            label="Quiz attempts"
            value={quizAttempts.length}
            tone="amber"
          />
          <StatCard
            label="Assignment submissions"
            value={assignmentSubmissions.length}
            tone="rose"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Average quiz score</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {averageQuizScore}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Passed quizzes</div>
            <div className="mt-2 text-3xl font-black text-emerald-600">
              {passedQuizCount}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Graded assignments</div>
            <div className="mt-2 text-3xl font-black text-indigo-600">
              {gradedAssignmentsCount}
            </div>
          </div>
        </div>

        <SectionCard
          title="Lesson progress"
          description="Danh sách toàn bộ bài học và trạng thái hoàn thành của học viên."
        >
          {!lessons.length ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
              Khóa học chưa có bài học.
            </div>
          ) : (
            <div className="grid gap-3">
              {lessons.map((lesson, index) => {
                const isDone = completedLessonIds.includes(String(lesson?._id));
                const isCurrent =
                  String(lesson?._id) ===
                  String(enrollment?.lastLessonId?._id || enrollment?.lastLessonId);

                return (
                  <div
                    key={lesson?._id || index}
                    className={`rounded-2xl border p-4 transition ${
                      isCurrent
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                            Lesson {index + 1}
                          </span>

                          {isCurrent ? (
                            <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-700">
                              Current
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 font-bold text-slate-900">
                          {lesson?.title || "Lesson"}
                        </div>

                        <div className="mt-1 text-sm text-slate-500">
                          {lesson?.description || "No description"}
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                          isDone
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {isDone ? "Completed" : "Not completed"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Quiz attempts"
          description="Lịch sử làm quiz, điểm số và trạng thái đạt/chưa đạt."
        >
          {!quizAttempts.length ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
              Chưa có lượt làm quiz.
            </div>
          ) : (
            <div className="grid gap-4">
              {quizAttempts.map((attempt) => (
                <div
                  key={attempt?._id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-slate-900">
                        {attempt?.quizId?.title || "Quiz"}
                      </div>

                      <div className="text-sm text-slate-600">
                        Score:{" "}
                        <span className="font-semibold text-slate-900">
                          {attempt?.score || 0}
                        </span>{" "}
                        | Correct:{" "}
                        <span className="font-semibold text-slate-900">
                          {attempt?.correctAnswers || 0}/
                          {attempt?.totalQuestions || 0}
                        </span>
                      </div>

                      <div className="text-sm text-slate-500">
                        Submitted:{" "}
                        {attempt?.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                        attempt?.passed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {attempt?.passed ? "Passed" : "Not passed"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Assignment submissions"
          description="Theo dõi bài nộp, điểm số và phản hồi của giảng viên."
        >
          {!assignmentSubmissions.length ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-500">
              Chưa có bài nộp assignment.
            </div>
          ) : (
            <div className="grid gap-4">
              {assignmentSubmissions.map((submission) => (
                <div
                  key={submission?._id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-slate-900">
                        {submission?.assignmentId?.title || "Assignment"}
                      </div>

                      <div className="text-sm text-slate-600">
                        Status:{" "}
                        <span className="font-semibold text-slate-900">
                          {submission?.status || "submitted"}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600">
                        Grade:{" "}
                        <span className="font-semibold text-slate-900">
                          {submission?.grade ?? "Not graded"}
                        </span>
                      </div>

                      <div className="text-sm text-slate-500">
                        Submitted:{" "}
                        {submission?.submittedAt
                          ? new Date(submission.submittedAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Feedback:
                        </span>{" "}
                        {submission?.feedback || "Chưa có feedback"}
                      </div>
                    </div>

                    <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                      {submission?.status || "submitted"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}