import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import {
  certificateUnwrap,
  generateCertificate,
  getCertificateByCourseStudent,
} from "../../certificate/services/certificate.service";
import {
  courseUnwrap,
  getCourseById,
} from "../../course/services/course.service";
import {
  completeLesson,
  enrollmentUnwrap,
  getEnrollmentByStudentAndCourse,
  setCurrentLesson,
} from "../services/enrollment.service";
import {
  clampProgress,
  getCurrentLessonFromEnrollment,
  getLessonId,
  getSafeTab,
  getUserId,
  sortLessons,
} from "../utils/enrollment.helpers";

export default function useLearnCoursePage() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTab = getSafeTab(searchParams.get("tab"));
  const studentId = useMemo(() => getUserId(user), [user]);

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLessonState] = useState(null);
  const [certificate, setCertificate] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    kind: "error",
  });

  const lessons = useMemo(() => {
    const lessonList = Array.isArray(course?.lessonIds) ? course.lessonIds : [];
    return sortLessons(lessonList);
  }, [course]);

  const completedLessonIds = useMemo(() => {
    const completedLessons = Array.isArray(enrollment?.completedLessons)
      ? enrollment.completedLessons
      : [];

    return completedLessons
      .map((item) => String(getLessonId(item)))
      .filter(Boolean);
  }, [enrollment]);

  const progress = useMemo(
    () => clampProgress(enrollment?.progress || 0),
    [enrollment]
  );

  const currentLessonId = useMemo(
    () => String(getLessonId(currentLesson)),
    [currentLesson]
  );

  const currentLessonIndex = useMemo(() => {
    return lessons.findIndex(
      (lesson) => String(getLessonId(lesson)) === currentLessonId
    );
  }, [lessons, currentLessonId]);

  const nextLesson = useMemo(() => {
    if (currentLessonIndex < 0) return null;
    return lessons[currentLessonIndex + 1] || null;
  }, [lessons, currentLessonIndex]);

  const currentLessonCompleted = useMemo(() => {
    return completedLessonIds.includes(currentLessonId);
  }, [completedLessonIds, currentLessonId]);

  const completedCount = useMemo(
    () => completedLessonIds.length,
    [completedLessonIds]
  );

  const totalLessons = useMemo(() => lessons.length, [lessons]);

  const showToast = useCallback((message, kind = "error") => {
    setToast({ message, kind });
  }, []);

  const syncCurrentLesson = useCallback((courseData, enrollmentData) => {
    const lesson = getCurrentLessonFromEnrollment(courseData, enrollmentData);
    setCurrentLessonState(lesson);
  }, []);

  const resetLearningState = useCallback(() => {
    setCourse(null);
    setEnrollment(null);
    setCurrentLessonState(null);
    setCertificate(null);
  }, []);

  const loadLearningData = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error("Vui lòng đăng nhập để học khóa học");
    }

    if (!studentId) {
      throw new Error("Không tìm thấy student id");
    }

    const [courseResponse, enrollmentResponse] = await Promise.all([
      getCourseById(courseId),
      getEnrollmentByStudentAndCourse(courseId, studentId),
    ]);

    const courseData = courseUnwrap(courseResponse);
    const enrollmentData = enrollmentUnwrap(enrollmentResponse);

    if (!courseData?._id) {
      throw new Error("Khóa học không tồn tại hoặc đã bị xóa");
    }

    if (!enrollmentData?._id) {
      throw new Error("Bạn chưa đăng ký khóa học này hoặc dữ liệu đăng ký không còn hợp lệ");
    }

    setCourse(courseData);
    setEnrollment(enrollmentData);
    syncCurrentLesson(courseData, enrollmentData);
  }, [courseId, isAuthenticated, studentId, syncCurrentLesson]);

  const loadCertificate = useCallback(async () => {
    try {
      if (!courseId || !studentId || progress < 100) {
        setCertificate(null);
        return;
      }

      const response = await getCertificateByCourseStudent(courseId, studentId);
      setCertificate(certificateUnwrap(response));
    } catch {
      setCertificate(null);
    }
  }, [courseId, studentId, progress]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        resetLearningState();
        await loadLearningData();
      } catch (error) {
        resetLearningState();
        showToast(
          error?.message || "Không tải được nội dung khóa học",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      fetchData();
    }
  }, [courseId, loadLearningData, resetLearningState, showToast]);

  useEffect(() => {
    loadCertificate();
  }, [loadCertificate]);

  const handleChangeTab = useCallback(
    (tab) => {
      const safeTab = getSafeTab(tab);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("tab", safeTab);

      setSearchParams(nextParams, {
        replace: true,
        preventScrollReset: true,
      });
    },
    [searchParams, setSearchParams]
  );

  const handleOpenInstructorChat = useCallback(() => {
    window.dispatchEvent(
      new CustomEvent("open-instructor-chat-dock", {
        detail: { courseId },
      })
    );
  }, [courseId]);

  const handleSelectLesson = useCallback(
    async (lesson) => {
      const lessonId = getLessonId(lesson);
      if (!lessonId || !course?._id || !enrollment?._id) return;

      const previousLesson = currentLesson;

      try {
        setCurrentLessonState(lesson);

        const response = await setCurrentLesson({
          courseId,
          lessonId,
        });

        const updatedEnrollment = enrollmentUnwrap(response);
        if (updatedEnrollment) {
          setEnrollment(updatedEnrollment);
        }
      } catch (error) {
        setCurrentLessonState(previousLesson);
        showToast(
          error?.message || "Không thể cập nhật bài học hiện tại",
          "error"
        );
      }
    },
    [course?._id, enrollment?._id, courseId, currentLesson, showToast]
  );

  const handleCompleteLesson = useCallback(async () => {
    const selectedLessonId = getLessonId(currentLesson);
    if (!selectedLessonId || !course?._id || !enrollment?._id) return;

    const upcomingLesson = nextLesson;
    const upcomingLessonId = getLessonId(upcomingLesson);

    try {
      setActionLoading(true);

      const response = await completeLesson({
        courseId,
        lessonId: selectedLessonId,
      });

      const updatedEnrollment = enrollmentUnwrap(response);
      setEnrollment(updatedEnrollment);

      if (upcomingLessonId) {
        setCurrentLessonState(upcomingLesson);

        const currentLessonResponse = await setCurrentLesson({
          courseId,
          lessonId: upcomingLessonId,
        });

        const currentLessonEnrollment = enrollmentUnwrap(currentLessonResponse);
        if (currentLessonEnrollment) {
          setEnrollment(currentLessonEnrollment);
        }
      } else {
        syncCurrentLesson(course, updatedEnrollment);
      }

      showToast("Đã hoàn thành bài học", "success");
    } catch (error) {
      showToast(error?.message || "Không thể hoàn thành bài học", "error");
    } finally {
      setActionLoading(false);
    }
  }, [
    course,
    enrollment,
    courseId,
    currentLesson,
    nextLesson,
    showToast,
    syncCurrentLesson,
  ]);

  const handleGenerateCertificate = useCallback(async () => {
    try {
      if (!courseId) {
        throw new Error("Course id not found");
      }

      if (!course?._id || !enrollment?._id) {
        throw new Error("Dữ liệu khóa học không hợp lệ");
      }

      setCertificateLoading(true);

      const response = await generateCertificate({ courseId });
      const certificateData = certificateUnwrap(response);

      setCertificate(certificateData);
      showToast("Tạo chứng chỉ thành công", "success");
    } catch (error) {
      showToast(error?.message || "Không thể tạo chứng chỉ", "error");
    } finally {
      setCertificateLoading(false);
    }
  }, [course, enrollment, courseId, showToast]);

  const handleBackToMyCourses = useCallback(() => {
    navigate("/my-courses");
  }, [navigate]);

  return {
    courseId,
    activeTab,
    course,
    enrollment,
    currentLesson,
    certificate,
    loading,
    actionLoading,
    certificateLoading,
    toast,
    setToast,
    lessons,
    completedLessonIds,
    progress,
    nextLesson,
    currentLessonCompleted,
    completedCount,
    totalLessons,
    handleChangeTab,
    handleOpenInstructorChat,
    handleSelectLesson,
    handleCompleteLesson,
    handleGenerateCertificate,
    handleBackToMyCourses,
  };
}