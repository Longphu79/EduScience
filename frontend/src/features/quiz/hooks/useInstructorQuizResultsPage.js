import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getInstructorAttemptReviewById,
  getQuizAttemptsByQuizAndStudent,
  getQuizResultsByQuizId,
} from "../services/quiz.service";
import {
  filterAndSortQuizResultStudents,
  normalizeAttemptList,
  normalizeAttemptReview,
  normalizeQuizResults,
  quizUnwrap,
} from "../utils/quiz.helpers";

export default function useInstructorQuizResultsPage() {
  const { courseId, quizId } = useParams();

  const [results, setResults] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState("");
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const loadResults = useCallback(async () => {
    if (!quizId) return;

    try {
      setLoading(true);
      const res = await getQuizResultsByQuizId(quizId);
      setResults(normalizeQuizResults(quizUnwrap(res)));
    } catch (error) {
      setToast({
        message: error?.message || "Không tải được kết quả quiz",
        kind: "error",
      });
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const toggleStudentAttempts = useCallback(async (studentId) => {
    if (!studentId) return;

    if (expandedStudentId === String(studentId)) {
      setExpandedStudentId("");
      setStudentAttempts([]);
      return;
    }

    try {
      setAttemptsLoading(true);
      setExpandedStudentId(String(studentId));

      const res = await getQuizAttemptsByQuizAndStudent(quizId, studentId);
      const data = normalizeAttemptList(quizUnwrap(res));
      setStudentAttempts(Array.isArray(data) ? data : []);
    } catch (error) {
      setToast({
        message: error?.message || "Không tải được attempts",
        kind: "error",
      });
      setStudentAttempts([]);
    } finally {
      setAttemptsLoading(false);
    }
  }, [expandedStudentId, quizId]);

  const handleOpenReview = useCallback(async (attemptId) => {
    if (!attemptId) return;

    try {
      setReviewLoading(true);
      setShowReview(true);

      const res = await getInstructorAttemptReviewById(attemptId);
      const normalized = normalizeAttemptReview(
        quizUnwrap(res),
        results?.quiz || {}
      );

      setReviewData(normalized);
    } catch (error) {
      setShowReview(false);
      setReviewData(null);
      setToast({
        message: error?.message || "Không tải được review",
        kind: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  }, [results]);

  const quiz = results?.quiz || {};
  const summary = results?.summary || {};
  const students = results?.students || [];

  const filteredStudents = useMemo(() => {
    return filterAndSortQuizResultStudents(
      students,
      search,
      statusFilter,
      sortBy
    );
  }, [students, search, statusFilter, sortBy]);

  return {
    courseId,
    quizId,
    quiz,
    summary,
    filteredStudents,
    loading,
    expandedStudentId,
    studentAttempts,
    attemptsLoading,
    reviewLoading,
    reviewData,
    showReview,
    setShowReview,
    setReviewData,
    toast,
    setToast,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    toggleStudentAttempts,
    handleOpenReview,
  };
}