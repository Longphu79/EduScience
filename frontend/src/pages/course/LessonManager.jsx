import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FileUpload from "../../features/upload/components/FileUpload";
import { uploadLessonVideo } from "../../features/upload/api/uploadApi";
import {
  getLessonsByCourse,
  createLesson,
  updateLesson,
  deleteLesson,
} from "../../features/course/api/courseApi";

const emptyForm = {
  title: "",
  description: "",
  videoUrl: "",
  duration: 0,
  order: 1,
  isPreview: false,
};

const LessonManager = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadLessons = async () => {
    const data = await getLessonsByCourse(courseId);
    setLessons(data);
  };

  useEffect(() => {
    loadLessons();
  }, [courseId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleVideoUpload = async (file) => {
    const result = await uploadLessonVideo(file);
    setForm((prev) => ({ ...prev, videoUrl: result.url }));
    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.videoUrl) {
      alert("Please upload a video first");
      return;
    }
    setLoading(true);
    try {
      if (editingId) {
        await updateLesson(editingId, form);
      } else {
        await createLesson({
          ...form,
          courseId,
          order: lessons.length + 1,
        });
      }
      setForm(emptyForm);
      setEditingId(null);
      await loadLessons();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingId(lesson._id);
    setForm({
      title: lesson.title,
      description: lesson.description || "",
      videoUrl: lesson.videoUrl,
      duration: lesson.duration || 0,
      order: lesson.order,
      isPreview: lesson.isPreview || false,
    });
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    await deleteLesson(lessonId);
    await loadLessons();
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Manage Lessons</h1>
        <button
          onClick={() => navigate(`/course/${courseId}/edit`)}
          className="text-sm text-gray-600 hover:underline"
        >
          Back to Course
        </button>
      </div>

      {/* Lesson list */}
      <div className="space-y-3 mb-8">
        {lessons.length === 0 && (
          <p className="text-gray-500">No lessons yet. Add one below.</p>
        )}
        {lessons.map((lesson) => (
          <div
            key={lesson._id}
            className="bg-white shadow p-4 rounded-xl flex items-center justify-between"
          >
            <div>
              <p className="font-medium">
                {lesson.order}. {lesson.title}
              </p>
              <p className="text-sm text-gray-500">
                {lesson.duration}min{lesson.isPreview ? " | Preview" : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(lesson)}
                className="text-sm bg-gray-200 px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(lesson._id)}
                className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit form */}
      <div className="bg-white shadow p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Edit Lesson" : "Add Lesson"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="border p-2 w-full rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              className="border p-2 w-full rounded"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Duration (minutes)
              </label>
              <input
                name="duration"
                type="number"
                value={form.duration}
                onChange={handleChange}
                min={0}
                className="border p-2 w-full rounded"
              />
            </div>
            <div className="flex items-end gap-2 pb-2">
              <input
                name="isPreview"
                type="checkbox"
                checked={form.isPreview}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">Allow Preview</label>
            </div>
          </div>

          <FileUpload
            accept="video/mp4,video/webm"
            label="Lesson Video"
            preview={form.videoUrl}
            onUpload={handleVideoUpload}
          />

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
            >
              {loading
                ? "Saving..."
                : editingId
                ? "Update Lesson"
                : "Add Lesson"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 px-6 py-2 rounded"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonManager;
