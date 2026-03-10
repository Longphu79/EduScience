import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileUpload from "../../features/upload/components/FileUpload";
import {
  uploadCourseThumbnail,
  uploadCoursePreview,
} from "../../features/upload/api/uploadApi";
import {
  createCourse,
  updateCourse,
  getCourseById,
} from "../../features/course/api/courseApi";

const CourseForm = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(courseId);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    category: "",
    level: "beginner",
    language: "vi",
    price: 0,
    isFree: false,
    thumbnail: "",
    previewVideo: "",
  });

  useEffect(() => {
    if (isEdit) {
      getCourseById(courseId).then((course) => {
        setForm({
          title: course.title || "",
          slug: course.slug || "",
          shortDescription: course.shortDescription || "",
          description: course.description || "",
          category: course.category || "",
          level: course.level || "beginner",
          language: course.language || "vi",
          price: course.price || 0,
          isFree: course.isFree || false,
          thumbnail: course.thumbnail || "",
          previewVideo: course.previewVideo || "",
        });
      });
    }
  }, [courseId, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setForm((prev) => ({ ...prev, title, slug }));
  };

  const handleThumbnailUpload = async (file) => {
    const result = await uploadCourseThumbnail(file);
    setForm((prev) => ({ ...prev, thumbnail: result.url }));
    return result;
  };

  const handlePreviewUpload = async (file) => {
    const result = await uploadCoursePreview(file);
    setForm((prev) => ({ ...prev, previewVideo: result.url }));
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateCourse(courseId, form);
        alert("Course updated!");
      } else {
        // instructorId will need to come from the logged-in user's instructor profile
        const stored = localStorage.getItem("user");
        const user = stored ? JSON.parse(stored) : {};
        const course = await createCourse({ ...form, instructorId: user._id });
        alert("Course created!");
        navigate(`/course/${course._id}/edit`);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        {isEdit ? "Edit Course" : "Create Course"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            name="title"
            value={form.title}
            onChange={handleTitleChange}
            required
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className="border p-2 w-full rounded bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Short Description (max 160 chars)
          </label>
          <input
            name="shortDescription"
            value={form.shortDescription}
            onChange={handleChange}
            maxLength={160}
            required
            className="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="border p-2 w-full rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Level</label>
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              className="border p-2 w-full rounded"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              min={0}
              className="border p-2 w-full rounded"
            />
          </div>
          <div className="flex items-end gap-2 pb-2">
            <input
              name="isFree"
              type="checkbox"
              checked={form.isFree}
              onChange={handleChange}
              className="w-4 h-4"
            />
            <label className="text-sm font-medium">Free Course</label>
          </div>
        </div>

        <FileUpload
          accept="image/jpeg,image/png,image/webp"
          label="Thumbnail"
          preview={form.thumbnail}
          onUpload={handleThumbnailUpload}
        />

        <FileUpload
          accept="video/mp4,video/webm"
          label="Preview Video"
          preview={form.previewVideo}
          onUpload={handlePreviewUpload}
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Course" : "Create Course"}
        </button>
      </form>

      {isEdit && (
        <div className="mt-8">
          <button
            onClick={() => navigate(`/course/${courseId}/lessons`)}
            className="bg-gray-800 text-white px-6 py-2 rounded"
          >
            Manage Lessons
          </button>
        </div>
      )}
    </div>
  );
};

export default CourseForm;
