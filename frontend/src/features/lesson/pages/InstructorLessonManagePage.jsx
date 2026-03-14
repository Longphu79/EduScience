import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { getCourseDetail } from "../../course/services/course.service";
import {
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../services/lesson.service";
import { useAuth } from "../../auth/state/useAuth";

const emptyForm = {
  title: "",
  description: "",
  videoUrl: "",
  materialUrl: "",
  duration: 0,
  order: 1,
  isPreview: false,
  isPublished: true,
};

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="mt-2 text-3xl font-black text-slate-900">{value}</h3>
      {hint ? <p className="mt-2 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}

function normalizeCourseResponse(res) {
  return res?.data?.data || res?.data || res || null;
}

function normalizeLessonResponse(res) {
  return res?.data?.data || res?.data || res || [];
}

export default function InstructorLessonManagePage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const instructorId = useMemo(
    () => user?._id || user?.id || user?.userId || null,
    [user]
  );

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingLessonId, setEditingLessonId] = useState("");
  const [form, setForm] = useState({
    ...emptyForm,
    order: 1,
  });
  const [toast, setToast] = useState({ message: "", kind: "success" });

  async function loadData() {
    try {
      setLoading(true);

      const [courseRes, lessonRes] = await Promise.all([
        getCourseDetail(courseId),
        getLessonsByCourse(courseId),
      ]);

      const courseData = normalizeCourseResponse(courseRes);
      const lessonData = normalizeLessonResponse(lessonRes);

      const safeLessons = Array.isArray(lessonData)
        ? [...lessonData].sort(
            (a, b) =>
              Number(a?.order || 0) - Number(b?.order || 0) ||
              new Date(a?.createdAt || 0).getTime() -
                new Date(b?.createdAt || 0).getTime()
          )
        : [];

      setCourse(courseData || null);
      setLessons(safeLessons);
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load lessons",
        kind: "error",
      });
      setCourse(null);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  useEffect(() => {
    if (!editingLessonId) {
      setForm((prev) => ({
        ...prev,
        ...emptyForm,
        order: lessons.length + 1,
      }));
    }
  }, [lessons, editingLessonId]);

  function resetForm() {
    setEditingLessonId("");
    setForm({
      ...emptyForm,
      order: lessons.length + 1,
    });
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  }

  function handleEdit(lesson) {
    setEditingLessonId(lesson._id);
    setForm({
      title: lesson.title || "",
      description: lesson.description || "",
      videoUrl: lesson.videoUrl || "",
      materialUrl: lesson.materialUrl || "",
      duration: Number(lesson.duration || 0),
      order: Number(lesson.order || 1),
      isPreview: !!lesson.isPreview,
      isPublished: !!lesson.isPublished,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (!form.title.trim()) {
        setToast({ message: "Lesson title is required", kind: "error" });
        return;
      }

      if (!form.videoUrl.trim()) {
        setToast({ message: "Video URL is required", kind: "error" });
        return;
      }

      setSaving(true);

      const payload = {
        ...form,
        title: form.title.trim(),
        description: form.description.trim(),
        videoUrl: form.videoUrl.trim(),
        materialUrl: form.materialUrl.trim(),
        duration: Number(form.duration) || 0,
        order: Number(form.order) || 1,
        courseId,
        instructorId,
      };

      if (editingLessonId) {
        await updateLesson(editingLessonId, payload);
        setToast({ message: "Lesson updated successfully", kind: "success" });
      } else {
        await createLesson(payload);
        setToast({ message: "Lesson created successfully", kind: "success" });
      }

      resetForm();
      await loadData();
    } catch (error) {
      setToast({
        message: error?.message || "Failed to save lesson",
        kind: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(lessonId, lessonTitle) {
    const ok = window.confirm(
      `Are you sure you want to delete "${lessonTitle}"?`
    );
    if (!ok) return;

    try {
      setDeletingId(lessonId);
      await deleteLesson(lessonId);

      if (editingLessonId === lessonId) {
        resetForm();
      }

      setToast({ message: "Lesson deleted successfully", kind: "success" });
      await loadData();
    } catch (error) {
      setToast({
        message: error?.message || "Failed to delete lesson",
        kind: "error",
      });
    } finally {
      setDeletingId("");
    }
  }

  const totalLessons = lessons.length;
  const publishedLessons = lessons.filter((item) => item.isPublished).length;
  const previewLessons = lessons.filter((item) => item.isPreview).length;
  const totalDuration = lessons.reduce(
    (sum, item) => sum + Number(item.duration || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-950">
            Loading lessons...
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      {toast.message ? (
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
                Instructor Dashboard
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                Manage Lessons
              </h1>
              <p className="mt-3 text-slate-500">
                Course:{" "}
                <span className="font-semibold text-slate-700">
                  {course?.title || "Unknown course"}
                </span>
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/instructor/courses"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Courses
              </Link>

              <Link
                to={`/instructor/courses/${courseId}/edit`}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Edit Course
              </Link>

              <Link
                to={`/instructor/courses/${courseId}/materials`}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Manage Materials
              </Link>

              <Link
                to={`/instructor/courses/${courseId}/quizzes`}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Manage Quizzes
              </Link>

              <Link
                to={`/instructor/courses/${courseId}/assignments`}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Manage Assignments
              </Link>

              <Link
                to={`/instructor/courses/${courseId}/students`}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Manage Students
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total lessons" value={totalLessons} />
          <StatCard label="Published" value={publishedLessons} />
          <StatCard label="Preview lessons" value={previewLessons} />
          <StatCard label="Total duration" value={`${totalDuration} min`} />
        </section>

        <div className="grid gap-8 lg:grid-cols-[440px_minmax(0,1fr)]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-950">
                {editingLessonId ? "Edit Lesson" : "Add Lesson"}
              </h2>

              {editingLessonId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel Edit
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Lesson Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="Enter lesson title"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="Enter lesson description"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Video URL
                </label>
                <input
                  name="videoUrl"
                  value={form.videoUrl}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Material URL
                </label>
                <input
                  name="materialUrl"
                  value={form.materialUrl}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="Optional material link"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="duration"
                    value={form.duration}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="order"
                    value={form.order}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-5 pt-2">
                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    name="isPreview"
                    checked={form.isPreview}
                    onChange={handleChange}
                  />
                  Preview lesson
                </label>

                <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                  />
                  Published
                </label>
              </div>

              <div className="pt-2">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? editingLessonId
                      ? "Saving..."
                      : "Creating..."
                    : editingLessonId
                    ? "Save Lesson"
                    : "Create Lesson"}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-slate-950">
                  Course Lessons
                </h2>
                <p className="mt-1 text-slate-500">
                  Total lessons: {lessons.length}
                </p>
              </div>
            </div>

            {!lessons.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-xl font-bold text-slate-900">
                  Chưa có bài học nào
                </h3>
                <p className="mt-2 text-slate-500">
                  Hãy tạo bài học đầu tiên cho khóa học này.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    className="rounded-2xl border border-slate-200 p-5 transition hover:border-violet-200 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                            {index + 1}
                          </span>

                          <h3 className="text-xl font-bold text-slate-950">
                            {lesson.title}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              lesson.isPublished
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {lesson.isPublished ? "Published" : "Draft"}
                          </span>

                          {lesson.isPreview ? (
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                              Preview
                            </span>
                          ) : null}
                        </div>

                        <p className="text-slate-600">
                          {lesson.description || "No description"}
                        </p>

                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            Order: {lesson.order || 0}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            Duration: {lesson.duration || 0} min
                          </span>
                        </div>

                        {lesson.videoUrl ? (
                          <a
                            href={lesson.videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-sm font-semibold text-violet-600 hover:text-violet-700"
                          >
                            Open video
                          </a>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(lesson)}
                          className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(lesson._id, lesson.title)}
                          disabled={deletingId === lesson._id}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          {deletingId === lesson._id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}