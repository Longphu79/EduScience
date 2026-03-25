import { useCallback, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import { createQuiz } from "../services/quiz.service";
import {
  buildQuizPayload,
  createEmptyQuizForm,
  validateQuizForm,
} from "../utils/quiz.form.helpers";

export default function useInstructorQuizCreatePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(createEmptyQuizForm());
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const instructorId = user?._id || user?.id || user?.userId;
      const validationMessage = validateQuizForm(form);

      if (validationMessage) {
        setToast({ message: validationMessage, kind: "error" });
        return;
      }

      if (!instructorId) {
        setToast({
          message: "Không tìm thấy instructorId từ tài khoản đăng nhập",
          kind: "error",
        });
        return;
      }

      try {
        setSaving(true);

        const payload = buildQuizPayload(form, {
          courseId,
          instructorId,
        });

        await createQuiz(payload);

        setToast({ message: "Tạo quiz thành công", kind: "success" });
        navigate(`/instructor/courses/${courseId}/quizzes`);
      } catch (error) {
        setToast({
          message: error?.message || "Không thể tạo quiz",
          kind: "error",
        });
      } finally {
        setSaving(false);
      }
    },
    [courseId, form, navigate, user]
  );

  return {
    courseId,
    form,
    setForm,
    saving,
    toast,
    setToast,
    handleSubmit,
  };
}