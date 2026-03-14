import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import { createCourse, courseUnwrap } from "../services/course.service";

const initialForm = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "frontend",
  thumbnail: "",
  previewVideo: "",
  level: "beginner",
  language: "en",
  duration: 0,
  price: 0,
  salePrice: 0,
  isFree: false,
  isPopular: false,
  status: "published",
};

function makeSlug(text = "") {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CreateCoursePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

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

      if (name === "title" && !prev.slug) {
        next.slug = makeSlug(value);
      }

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
      if (!form.title.trim()) {
        setToast({
          message: "Course title is required",
          kind: "error",
        });
        return;
      }

      if (!form.shortDescription.trim()) {
        setToast({
          message: "Short description is required",
          kind: "error",
        });
        return;
      }

      setSubmitting(true);

      const payload = {
        ...form,
      };

      const createdRes = await createCourse(payload);
      const created = courseUnwrap(createdRes);

      setToast({
        message: "Course created successfully",
        kind: "success",
      });

      setTimeout(() => {
        navigate(`/courses/${created._id}`);
      }, 800);
    } catch (error) {
      setToast({
        message: error.message || "Failed to create course",
        kind: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
          Create Course
        </h1>
        <p className="mt-3 text-slate-500">
          Add a new course with basic information for your teaching catalog.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 grid gap-6 md:grid-cols-2">
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

          <div className="flex gap-3 md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3 font-semibold text-white shadow-md disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Course"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/instructor/courses")}
              className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}