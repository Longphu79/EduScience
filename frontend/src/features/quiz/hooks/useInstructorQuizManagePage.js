import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  deleteQuiz,
  getInstructorQuizzesByCourse,
  toggleQuizPublished,
} from "../services/quiz.service";
import {
  getQuizId,
  normalizeQuizList,
  quizUnwrap,
} from "../utils/quiz.helpers";

export default function useInstructorQuizManagePage() {
  const { courseId } = useParams();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [publishingId, setPublishingId] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const loadQuizzes = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      const res = await getInstructorQuizzesByCourse(courseId);
      const data = normalizeQuizList(quizUnwrap(res));
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error) {
      setToast({
        message: error?.message || "Không tải được quiz",
        kind: "error",
      });
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const handleDelete = useCallback(async (quizId) => {
    const ok = window.confirm("Bạn có chắc muốn xóa quiz này?");
    if (!ok) return;

    try {
      setDeletingId(quizId);
      await deleteQuiz(quizId);
      setToast({ message: "Xóa quiz thành công", kind: "success" });
      await loadQuizzes();
    } catch (error) {
      setToast({
        message: error?.message || "Không thể xóa quiz",
        kind: "error",
      });
    } finally {
      setDeletingId("");
    }
  }, [loadQuizzes]);

  const handleTogglePublish = useCallback(async (quiz) => {
    const quizId = getQuizId(quiz);

    try {
      setPublishingId(quizId);
      await toggleQuizPublished(quizId, !quiz?.isPublished, quiz);
      setToast({
        message: quiz?.isPublished ? "Đã chuyển quiz sang Draft" : "Đã publish quiz",
        kind: "success",
      });
      await loadQuizzes();
    } catch (error) {
      setToast({
        message: error?.message || "Không thể cập nhật trạng thái quiz",
        kind: "error",
      });
    } finally {
      setPublishingId("");
    }
  }, [loadQuizzes]);

  const filteredQuizzes = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return quizzes;

    return quizzes.filter((quiz) => {
      const title = quiz?.title?.toLowerCase() || "";
      const description = quiz?.description?.toLowerCase() || "";
      return title.includes(keyword) || description.includes(keyword);
    });
  }, [quizzes, search]);

  return {
    courseId,
    quizzes,
    filteredQuizzes,
    loading,
    deletingId,
    publishingId,
    search,
    setSearch,
    toast,
    setToast,
    handleDelete,
    handleTogglePublish,
  };
}