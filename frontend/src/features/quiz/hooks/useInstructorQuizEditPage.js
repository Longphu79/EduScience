import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import { getQuizById, updateQuiz } from "../services/quiz.service";
import {
  buildQuizForm,
  buildQuizPayload,
  createEmptyQuizForm,
  validateQuizForm,
} from "../utils/quiz.form.helpers";
import { quizUnwrap } from "../utils/quiz.helpers";

export default function useInstructorQuizEditPage() {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(createEmptyQuizForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getQuizById(quizId);
      const quiz = quizUnwrap(response);
      setForm(buildQuizForm(quiz || {}));
    } catch (error) {
      setToast({
        message: error?.message || "Không tải được quiz",
        kind: "error",
      });
      setForm(createEmptyQuizForm());
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    if (quizId) {
      loadQuiz();
    }
  }, [quizId, loadQuiz]);

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

        await updateQuiz(quizId, payload);

        setToast({ message: "Cập nhật quiz thành công", kind: "success" });
        navigate(`/instructor/courses/${courseId}/quizzes`);
      } catch (error) {
        setToast({
          message: error?.message || "Không thể cập nhật quiz",
          kind: "error",
        });
      } finally {
        setSaving(false);
      }
    },
    [courseId, form, navigate, quizId, user]
  );

  return {
    courseId,
    quizId,
    form,
    setForm,
    loading,
    saving,
    toast,
    setToast,
    handleSubmit,
  };
}