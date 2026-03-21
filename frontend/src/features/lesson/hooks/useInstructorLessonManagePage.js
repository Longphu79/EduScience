import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import {
  courseUnwrap,
  getCourseDetail,
} from "../../course/services/course.service";
import {
  createLesson,
  deleteLesson,
  getLessonsByCourse,
  updateLesson,
} from "../services/lesson.service";
import {
  formatDuration,
  getDefaultLessonForm,
  getLessonId,
  getNextLessonOrder,
  normalizeLessonResponse,
  sortLessons,
} from "../utils/lesson.helpers";

function getInstructorId(user) {
  return user?._id || user?.id || user?.userId || null;
}

export default function useInstructorLessonManagePage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const instructorId = useMemo(() => getInstructorId(user), [user]);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingLessonId, setEditingLessonId] = useState("");
  const [form, setForm] = useState(getDefaultLessonForm(1));
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [courseRes, lessonRes] = await Promise.all([
        getCourseDetail(courseId),
        getLessonsByCourse(courseId),
      ]);

      const courseData = courseUnwrap(courseRes);
      const lessonData = normalizeLessonResponse(lessonRes);
      const safeLessons = Array.isArray(lessonData)
        ? sortLessons(lessonData)
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
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId, loadData]);

  useEffect(() => {
    if (!editingLessonId) {
      setForm(getDefaultLessonForm(getNextLessonOrder(lessons)));
    }
  }, [lessons, editingLessonId]);

  const resetForm = useCallback(() => {
    setEditingLessonId("");
    setForm(getDefaultLessonForm(getNextLessonOrder(lessons)));
  }, [lessons]);

  const handleChange = useCallback((e) => {
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
  }, []);

  const handleEdit = useCallback((lesson) => {
    const lessonId = getLessonId(lesson);

    setEditingLessonId(lessonId);
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
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        if (!instructorId) {
          setToast({ message: "Instructor id not found", kind: "error" });
          return;
        }

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
          setToast({
            message: "Lesson updated successfully",
            kind: "success",
          });
        } else {
          await createLesson(payload);
          setToast({
            message: "Lesson created successfully",
            kind: "success",
          });
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
    },
    [courseId, editingLessonId, form, instructorId, loadData, resetForm]
  );

  const handleDelete = useCallback(
    async (lessonId, lessonTitle) => {
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

        setToast({
          message: "Lesson deleted successfully",
          kind: "success",
        });

        await loadData();
      } catch (error) {
        setToast({
          message: error?.message || "Failed to delete lesson",
          kind: "error",
        });
      } finally {
        setDeletingId("");
      }
    },
    [editingLessonId, loadData, resetForm]
  );

  const stats = useMemo(() => {
    const totalLessons = lessons.length;
    const publishedLessons = lessons.filter((item) => item.isPublished).length;
    const previewLessons = lessons.filter((item) => item.isPreview).length;
    const totalDuration = lessons.reduce(
      (sum, item) => sum + Number(item.duration || 0),
      0
    );

    return {
      totalLessons,
      publishedLessons,
      previewLessons,
      totalDuration,
      totalDurationLabel: formatDuration(totalDuration),
    };
  }, [lessons]);

  return {
    courseId,
    course,
    lessons,
    loading,
    saving,
    deletingId,
    editingLessonId,
    form,
    toast,
    setToast,
    stats,
    handleChange,
    handleEdit,
    handleSubmit,
    handleDelete,
    resetForm,
  };
}