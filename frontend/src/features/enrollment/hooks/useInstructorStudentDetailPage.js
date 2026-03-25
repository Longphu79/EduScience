import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentProgressDetail } from "../services/enrollment.service";
import {
  clampProgress,
  getLessonId,
  getStudentDisplayName,
  sortLessons,
} from "../utils/enrollment.helpers";

export default function useInstructorStudentDetailPage() {
  const { courseId, studentId } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getStudentProgressDetail(courseId, studentId);
      const payload = response?.data ?? response ?? null;
      setData(payload);
    } catch (error) {
      setToast({
        message:
          error?.response?.data?.message ||
          error?.message ||
          "Không tải được chi tiết học viên",
        kind: "error",
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [courseId, studentId]);

  useEffect(() => {
    if (courseId && studentId) {
      loadData();
    }
  }, [courseId, studentId, loadData]);

  const enrollment = data?.enrollment || {};
  const student = enrollment?.studentId || {};
  const course = enrollment?.courseId || {};

  const quizAttempts = useMemo(() => {
    return Array.isArray(data?.quizAttempts) ? data.quizAttempts : [];
  }, [data]);

  const assignmentSubmissions = useMemo(() => {
    return Array.isArray(data?.assignmentSubmissions)
      ? data.assignmentSubmissions
      : [];
  }, [data]);

  const lessons = useMemo(() => {
    return sortLessons(Array.isArray(course?.lessonIds) ? course.lessonIds : []);
  }, [course]);

  const completedLessonIds = useMemo(() => {
    const ids = Array.isArray(enrollment?.completedLessons)
      ? enrollment.completedLessons
      : [];

    return ids.map((item) => String(getLessonId(item))).filter(Boolean);
  }, [enrollment]);

  const progress = useMemo(() => {
    return clampProgress(enrollment?.progress || 0);
  }, [enrollment]);

  const studentName = useMemo(() => getStudentDisplayName(student), [student]);

  const stats = useMemo(() => {
    const averageQuizScore = quizAttempts.length
      ? Math.round(
          quizAttempts.reduce((sum, item) => sum + Number(item?.score || 0), 0) /
            quizAttempts.length
        )
      : 0;

    const passedQuizCount = quizAttempts.filter((item) => item?.passed).length;
    const gradedAssignmentsCount = assignmentSubmissions.filter(
      (item) => item?.grade !== null && item?.grade !== undefined
    ).length;

    return {
      completedLessonsCount: completedLessonIds.length,
      totalLessons: lessons.length,
      quizAttemptsCount: quizAttempts.length,
      assignmentSubmissionsCount: assignmentSubmissions.length,
      averageQuizScore,
      passedQuizCount,
      gradedAssignmentsCount,
    };
  }, [assignmentSubmissions, completedLessonIds, lessons, quizAttempts]);

  return {
    courseId,
    studentId,
    loading,
    toast,
    setToast,
    loadData,
    enrollment,
    student,
    studentName,
    course,
    progress,
    lessons,
    completedLessonIds,
    quizAttempts,
    assignmentSubmissions,
    stats,
    hasEnrollment: !!data?.enrollment,
  };
}