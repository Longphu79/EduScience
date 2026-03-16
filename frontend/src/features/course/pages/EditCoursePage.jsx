import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import {
  deleteCourse,
  getCourseDetail,
  updateCourse,
  courseUnwrap,
} from "../services/course.service";

export default function EditCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const data = await getCourseDetail(courseId);
        const payload = courseUnwrap(data);

        setForm({
          title: payload.title || "",
          slug: payload.slug || "",
          shortDescription: payload.shortDescription || "",
          description: payload.description || "",
          category: payload.category || "frontend",
          thumbnail: payload.thumbnail || "",
          previewVideo: payload.previewVideo || "",
          level: payload.level || "beginner",
          language: payload.language || "en",
          duration: payload.duration || 0,
          price: payload.price || 0,
          salePrice: payload.salePrice || 0,
          isFree: !!payload.isFree,
          isPopular: !!payload.isPopular,
          status: payload.status || "draft",
        });
      } catch (error) {
        setToast({
          message: error.message || "Failed to load course",
          kind: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : type === "number"
            ? Number(value)
            : value,
      };

      if (name === "isFree" && checked) {
        next.price = 0;
        next.salePrice = 0;
      }

      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!form?.title?.trim()) {
        setToast({
          message: "Course title is required",
          kind: "error",
        });
        return;
      }

      if (!form?.shortDescription?.trim()) {
        setToast({
          message: "Short description is required",
          kind: "error",
        });
        return;
      }

      setSaving(true);
      await updateCourse(courseId, form);

      setToast({
        message: "Course updated successfully",
        kind: "success",
      });

      setTimeout(() => {
        navigate("/instructor/courses");
      }, 700);
    } catch (error) {
      setToast({
        message: error.message || "Failed to update course",
        kind: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?"
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      await deleteCourse(courseId);

      setToast({
        message: "Course deleted successfully",
        kind: "success",
      });

      setTimeout(() => {
        navigate("/instructor/courses");
      }, 700);
    } catch (error) {
      setToast({
        message: error.message || "Failed to delete course",
        kind: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-black text-slate-950">
            Loading course...
          </h1>
          <p className="mt-3 text-slate-500">
            Please wait while we fetch the course information.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <Toast
        kind={toast.kind}
        message={toast.message}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <div className="mx-auto max-w-4xl rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
          Instructor Dashboard
        </p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
          Edit Course
        </h1>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/instructor/courses/${courseId}/lessons`}
            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700"
          >
            Manage Lessons
          </Link>

          <Link
            to={`/instructor/courses/${courseId}/materials`}
            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700"
          >
            Manage Materials
          </Link>

          <Link
            to={`/instructor/courses/${courseId}/quizzes`}
            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700"
          >
            Manage Quizzes
          </Link>

          <Link
            to={`/instructor/courses/${courseId}/assignments`}
            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700"
          >
            Manage Assignments
          </Link>

          <Link
            to={`/instructor/courses/${courseId}/students`}
            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700"
          >
            Manage Students
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-8 grid gap-6 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Course Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Slug
            </label>
            <input
              name="slug"
              value={form.slug}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="database">Database</option>
              <option value="ui-ux">UI/UX</option>
              <option value="Mobile Development">Mobile Development</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Short Description
            </label>
            <textarea
              name="shortDescription"
              value={form.shortDescription}
              onChange={handleChange}
              required
              rows={3}
              maxLength={160}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Thumbnail URL
            </label>
            <input
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Preview Video URL
            </label>
            <input
              name="previewVideo"
              value={form.previewVideo}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Level
            </label>
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Language
            </label>
            <input
              name="language"
              value={form.language}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              disabled={form.isFree}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Sale Price
            </label>
            <input
              type="number"
              name="salePrice"
              value={form.salePrice}
              onChange={handleChange}
              disabled={form.isFree}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="flex items-center gap-6 md:col-span-2">
            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                name="isFree"
                checked={form.isFree}
                onChange={handleChange}
              />
              Free Course
            </label>

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                name="isPopular"
                checked={form.isPopular}
                onChange={handleChange}
              />
              Popular Course
            </label>
          </div>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-md disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/instructor/courses")}
              className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="rounded-2xl bg-red-50 px-6 py-3 font-semibold text-red-600"
            >
              {deleting ? "Deleting..." : "Delete Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}