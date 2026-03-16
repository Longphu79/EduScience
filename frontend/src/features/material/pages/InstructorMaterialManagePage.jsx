import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { getCourseDetail } from "../../course/services/course.service";
import {
  getMaterialsByCourse,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../services/material.service";
import { getLessonsByCourse } from "../../lesson/services/lesson.service";
import { useAuth } from "../../auth/state/useAuth";

const emptyForm = {
  title: "",
  description: "",
  fileUrl: "",
  fileName: "",
  fileType: "",
  fileSize: 0,
  lessonId: "",
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

function normalizeListResponse(res) {
  return res?.data?.data || res?.data || res || [];
}

function formatBytes(value) {
  const size = Number(value || 0);
  if (!size) return "0 B";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export default function InstructorMaterialManagePage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const instructorId = useMemo(
    () => user?._id || user?.id || user?.userId || null,
    [user]
  );

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingMaterialId, setEditingMaterialId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  async function loadData() {
    try {
      setLoading(true);

      const [courseRes, lessonRes, materialRes] = await Promise.all([
        getCourseDetail(courseId),
        getLessonsByCourse(courseId),
        getMaterialsByCourse(courseId),
      ]);

      const courseData = normalizeCourseResponse(courseRes);
      const lessonData = normalizeListResponse(lessonRes);
      const materialData = normalizeListResponse(materialRes);

      const safeLessons = Array.isArray(lessonData)
        ? [...lessonData].sort(
            (a, b) =>
              Number(a?.order || 0) - Number(b?.order || 0) ||
              new Date(a?.createdAt || 0).getTime() -
                new Date(b?.createdAt || 0).getTime()
          )
        : [];

      const safeMaterials = Array.isArray(materialData)
        ? [...materialData].sort(
            (a, b) =>
              new Date(b?.createdAt || 0).getTime() -
              new Date(a?.createdAt || 0).getTime()
          )
        : [];

      setCourse(courseData || null);
      setLessons(safeLessons);
      setMaterials(safeMaterials);
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load materials",
        kind: "error",
      });
      setCourse(null);
      setLessons([]);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId]);

  function resetForm() {
    setEditingMaterialId("");
    setForm(emptyForm);
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

  function handleEdit(material) {
    setEditingMaterialId(material._id);
    setForm({
      title: material.title || "",
      description: material.description || "",
      fileUrl: material.fileUrl || "",
      fileName: material.fileName || "",
      fileType: material.fileType || "",
      fileSize: Number(material.fileSize || 0),
      lessonId: material.lessonId?._id || material.lessonId || "",
      isPublished: !!material.isPublished,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (!form.title.trim()) {
        setToast({ message: "Material title is required", kind: "error" });
        return;
      }

      if (!form.fileUrl.trim()) {
        setToast({ message: "File URL is required", kind: "error" });
        return;
      }

      if (!form.fileName.trim()) {
        setToast({ message: "File name is required", kind: "error" });
        return;
      }

      if (!instructorId) {
        setToast({ message: "Instructor id not found", kind: "error" });
        return;
      }

      setSaving(true);

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        fileUrl: form.fileUrl.trim(),
        fileName: form.fileName.trim(),
        fileType: form.fileType.trim(),
        fileSize: Number(form.fileSize) || 0,
        courseId,
        lessonId: form.lessonId || null,
        instructorId,
        isPublished: !!form.isPublished,
      };

      if (editingMaterialId) {
        await updateMaterial(editingMaterialId, payload);
        setToast({ message: "Material updated successfully", kind: "success" });
      } else {
        await createMaterial(payload);
        setToast({ message: "Material created successfully", kind: "success" });
      }

      resetForm();
      await loadData();
    } catch (error) {
      setToast({
        message: error?.message || "Failed to save material",
        kind: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(materialId, materialTitle) {
    const ok = window.confirm(
      `Are you sure you want to delete "${materialTitle}"?`
    );
    if (!ok) return;

    try {
      setDeletingId(materialId);
      await deleteMaterial(materialId);

      if (editingMaterialId === materialId) {
        resetForm();
      }

      setToast({ message: "Material deleted successfully", kind: "success" });
      await loadData();
    } catch (error) {
      setToast({
        message: error?.message || "Failed to delete material",
        kind: "error",
      });
    } finally {
      setDeletingId("");
    }
  }

  function getLessonTitle(lessonId) {
    if (!lessonId) return "Course-level material";

    const lesson = lessons.find(
      (item) => String(item._id) === String(lessonId?._id || lessonId)
    );

    return lesson?.title || "Unknown lesson";
  }

  const publishedCount = materials.filter((item) => item.isPublished).length;
  const lessonAttachedCount = materials.filter((item) => item.lessonId).length;
  const courseLevelCount = materials.filter((item) => !item.lessonId).length;
  const totalFileSize = materials.reduce(
    (sum, item) => sum + Number(item.fileSize || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-7xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-950">
            Loading materials...
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
                Manage Materials
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
                to={`/instructor/courses/${courseId}/lessons`}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Manage Lessons
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
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total materials" value={materials.length} />
          <StatCard label="Published" value={publishedCount} />
          <StatCard
            label="Attached to lesson"
            value={lessonAttachedCount}
            hint={`${courseLevelCount} course-level materials`}
          />
          <StatCard
            label="Total file size"
            value={formatBytes(totalFileSize)}
          />
        </section>

        <div className="grid gap-8 lg:grid-cols-[440px_minmax(0,1fr)]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-2xl font-bold text-slate-950">
                {editingMaterialId ? "Edit Material" : "Add Material"}
              </h2>

              {editingMaterialId ? (
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
                  Material Title
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="Enter material title"
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
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="Enter material description"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  File URL
                </label>
                <input
                  name="fileUrl"
                  value={form.fileUrl}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="https://example.com/files/document.pdf"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  File Name
                </label>
                <input
                  name="fileName"
                  value={form.fileName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  placeholder="document.pdf"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    File Type
                  </label>
                  <input
                    name="fileType"
                    value={form.fileType}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                    placeholder="pdf / docx / zip"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    File Size (bytes)
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="fileSize"
                    value={form.fileSize}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Attach to lesson
                </label>
                <select
                  name="lessonId"
                  value={form.lessonId}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
                >
                  <option value="">Course-level material</option>
                  {lessons.map((lesson) => (
                    <option key={lesson._id} value={lesson._id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
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
                    ? editingMaterialId
                      ? "Saving..."
                      : "Creating..."
                    : editingMaterialId
                    ? "Save Material"
                    : "Create Material"}
                </Button>
              </div>
            </form>
          </section>

          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-2xl font-bold text-slate-950">
                Course Materials
              </h2>
              <p className="mt-1 text-slate-500">
                Total materials: {materials.length}
              </p>
            </div>

            {!materials.length ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <h3 className="text-xl font-bold text-slate-900">
                  Chưa có tài liệu nào
                </h3>
                <p className="mt-2 text-slate-500">
                  Hãy thêm tài liệu đầu tiên cho khóa học này.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {materials.map((material, index) => (
                  <div
                    key={material._id}
                    className="rounded-2xl border border-slate-200 p-5 transition hover:border-violet-200 hover:shadow-sm"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                            {index + 1}
                          </span>

                          <h3 className="text-xl font-bold text-slate-950">
                            {material.title}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${
                              material.isPublished
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {material.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>

                        <p className="text-slate-600">
                          {material.description || "No description"}
                        </p>

                        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            Lesson: {getLessonTitle(material.lessonId)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            File: {material.fileName || "N/A"}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            Type: {material.fileType || "Unknown"}
                          </span>
                          <span className="rounded-full bg-slate-100 px-3 py-1">
                            Size: {formatBytes(material.fileSize || 0)}
                          </span>
                        </div>

                        {material.fileUrl ? (
                          <a
                            href={material.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex text-sm font-semibold text-violet-600 hover:text-violet-700"
                          >
                            Open file
                          </a>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(material)}
                          className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(material._id, material.title)
                          }
                          disabled={deletingId === material._id}
                          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                        >
                          {deletingId === material._id ? "Deleting..." : "Delete"}
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