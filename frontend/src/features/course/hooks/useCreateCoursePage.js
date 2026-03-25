import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCourse } from "../services/course.service";
import {
  INITIAL_COURSE_FORM,
  makeCourseSlug,
  validateCourseForm,
} from "../utils/course.helpers";

export default function useCreateCoursePage() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_COURSE_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

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

      if (name === "title" && !prev.slug) {
        next.slug = makeCourseSlug(value);
      }

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

      setSubmitting(true);

      const created = await createCourse(form);

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
  }

  const shortDescriptionCount = useMemo(
    () => form.shortDescription.length,
    [form.shortDescription]
  );

  return {
    form,
    submitting,
    toast,
    shortDescriptionCount,
    setToast,
    handleChange,
    handleSubmit,
    navigate,
  };
}