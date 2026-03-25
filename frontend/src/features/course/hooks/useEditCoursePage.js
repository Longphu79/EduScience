import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteCourse,
  getCourseDetail,
  updateCourse,
} from "../services/course.service";
import {
  buildCourseFormFromItem,
  validateCourseForm,
} from "../utils/course.helpers";

export default function useEditCoursePage() {
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
    async function fetchCourse() {
      try {
        setLoading(true);
        const payload = await getCourseDetail(courseId);
        setForm(buildCourseFormFromItem(payload));
      } catch (error) {
        setToast({
          message: error.message || "Failed to load course",
          kind: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

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
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const validationError = validateCourseForm(form);
      if (validationError) {
        setToast({
          message: validationError,
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
  }

  async function handleDelete() {
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
  }

  const shortDescriptionCount = useMemo(
    () => form?.shortDescription?.length || 0,
    [form?.shortDescription]
  );

  return {
    courseId,
    form,
    loading,
    saving,
    deleting,
    toast,
    shortDescriptionCount,
    setToast,
    handleChange,
    handleSubmit,
    handleDelete,
    navigate,
  };
}