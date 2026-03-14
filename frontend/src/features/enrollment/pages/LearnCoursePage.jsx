import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";

import MaterialsTab from "../../material/components/MaterialsTab";
import QuizList from "../../quiz/components/QuizList";
import AssignmentList from "../../assignment/components/AssignmentList";
import ChatBox from "../../chat/components/ChatBox";
import ChatModal from "../../chat/components/ChatModal";

import {
  getCourseById,
  courseUnwrap,
} from "../../course/services/course.service";
import {
  getEnrollmentByStudentAndCourse,
  setCurrentLesson,
  completeLesson,
  enrollmentUnwrap,
} from "../services/enrollment.service";
import {
  getCertificateByCourseStudent,
  generateCertificate,
  certificateUnwrap,
} from "../../certificate/services/certificate.service";
import { useAuth } from "../../auth/state/useAuth";

function getYoutubeEmbedUrl(url = "") {
  if (!url) return "";

  if (url.includes("youtube.com/embed/")) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return url;
}

function isYouTubeUrl(url = "") {
  return /youtube\.com|youtu\.be/.test(url);
}

const VALID_TABS = ["lessons", "materials", "quizzes", "assignments"];

function getSafeTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "lessons";
}

function getLessonId(value) {
  return String(value?._id || value || "");
}

export default function LearnCoursePage() {
  const { courseId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLessonState] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(getSafeTab(searchParams.get("tab")));
  const [toast, setToast] = useState({
    message: "",
    kind: "error",
  });

  const studentId = useMemo(() => {
    return user?._id || user?.id || user?.userId || null;
  }, [user]);

  const lessons = useMemo(() => {
    const list = Array.isArray(course?.lessonIds) ? [...course.lessonIds] : [];
    return list.sort(
      (a, b) =>
        Number(a?.order || 0) - Number(b?.order || 0) ||
        new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
    );
  }, [course]);

  const completedLessonIds = useMemo(() => {
    const raw = enrollment?.completedLessons || [];
    return raw.map((item) => getLessonId(item));
  }, [enrollment]);

  const progress = useMemo(
    () => Number(enrollment?.progress || 0),
    [enrollment]
  );

  const currentLessonIndex = useMemo(() => {
    return lessons.findIndex(
      (lesson) => String(lesson._id) === String(currentLesson?._id)
    );
  }, [lessons, currentLesson]);

  const nextLesson = useMemo(() => {
    if (currentLessonIndex < 0) return null;
    return lessons[currentLessonIndex + 1] || null;
  }, [lessons, currentLessonIndex]);

  const currentLessonCompleted = useMemo(() => {
    return completedLessonIds.includes(String(currentLesson?._id));
  }, [completedLessonIds, currentLesson]);

  const syncCurrentLesson = useCallback((courseData, enrollmentData) => {
    const sortedLessons = Array.isArray(courseData?.lessonIds)
      ? [...courseData.lessonIds].sort(
          (a, b) =>
            Number(a?.order || 0) - Number(b?.order || 0) ||
            new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
        )
      : [];

    const currentId =
      enrollmentData?.lastLessonId?._id || enrollmentData?.lastLessonId;

    const foundCurrent =
      sortedLessons.find((lesson) => String(lesson._id) === String(currentId)) ||
      sortedLessons[0] ||
      null;

    setCurrentLessonState(foundCurrent);
  }, []);

  const loadLearningData = useCallback(async () => {
    if (!isAuthenticated) {
      throw new Error("Vui lòng đăng nhập để học khóa học");
    }

    if (!studentId) {
      throw new Error("Student id not found");
    }

    const [courseRes, enrollmentRes] = await Promise.all([
      getCourseById(courseId),
      getEnrollmentByStudentAndCourse(courseId, studentId),
    ]);

    const courseData = courseUnwrap(courseRes);
    const enrollmentData = enrollmentUnwrap(enrollmentRes);

    setCourse(courseData);
    setEnrollment(enrollmentData);
    syncCurrentLesson(courseData, enrollmentData);

    return {
      courseData,
      enrollmentData,
    };
  }, [courseId, isAuthenticated, studentId, syncCurrentLesson]);

  const loadCertificate = useCallback(async () => {
    try {
      if (!courseId || !studentId || Number(enrollment?.progress || 0) < 100) {
        setCertificate(null);
        return;
      }

      const res = await getCertificateByCourseStudent(courseId, studentId);
      setCertificate(certificateUnwrap(res));
    } catch (error) {
      setCertificate(null);
    }
  }, [courseId, studentId, enrollment?.progress]);

  useEffect(() => {
    const tabFromUrl = getSafeTab(searchParams.get("tab"));
    setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl));
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await loadLearningData();
      } catch (error) {
        setToast({
          message: error?.message || "Không tải được nội dung khóa học",
          kind: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchData();
    }
  }, [courseId, loadLearningData]);

  useEffect(() => {
    loadCertificate();
  }, [loadCertificate]);

  const handleChangeTab = (tab) => {
    const safeTab = getSafeTab(tab);
    setActiveTab(safeTab);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", safeTab);
    setSearchParams(nextParams, { replace: true });
  };

  const handleSelectLesson = async (lesson) => {
    try {
      if (!lesson?._id) return;

      setCurrentLessonState(lesson);

      const response = await setCurrentLesson({
        courseId,
        lessonId: lesson._id,
      });

      const updatedEnrollment = enrollmentUnwrap(response);

      if (updatedEnrollment) {
        setEnrollment(updatedEnrollment);
      }
    } catch (error) {
      setToast({
        message: error?.message || "Không thể cập nhật bài học hiện tại",
        kind: "error",
      });
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson?._id) return;

    try {
      setActionLoading(true);

      const response = await completeLesson({
        courseId,
        lessonId: currentLesson._id,
      });

      const normalizedEnrollment = enrollmentUnwrap(response);
      setEnrollment(normalizedEnrollment);

      if (nextLesson) {
        setCurrentLessonState(nextLesson);

        const currentLessonResponse = await setCurrentLesson({
          courseId,
          lessonId: nextLesson._id,
        });

        const currentLessonEnrollment = enrollmentUnwrap(currentLessonResponse);
        if (currentLessonEnrollment) {
          setEnrollment(currentLessonEnrollment);
        }
      }

      setToast({
        message: "Đã hoàn thành bài học",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Không thể hoàn thành bài học",
        kind: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateCertificate = async () => {
    try {
      if (!courseId) {
        throw new Error("Course id not found");
      }

      setCertificateLoading(true);

      const response = await generateCertificate({
        courseId,
      });

      const certificateData = certificateUnwrap(response);
      setCertificate(certificateData);

      setToast({
        message: "Tạo chứng chỉ thành công",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error?.message || "Không thể tạo chứng chỉ",
        kind: "error",
      });
    } finally {
      setCertificateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p>Đang tải nội dung học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p>Không tìm thấy khóa học.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-6">
        {toast.message ? (
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-bold">{course?.title || "Khóa học"}</h2>
              <p className="mt-2 text-sm text-slate-600">Tiến độ: {progress}%</p>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {progress >= 100 ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {certificate ? (
                    <>
                      <Link
                        to={`/learn/${courseId}/certificate`}
                        className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                      >
                        View Certificate
                      </Link>

                      {certificate?.certificateCode ? (
                        <Link
                          to={`/certificate/${certificate.certificateCode}`}
                          className="inline-flex rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                        >
                          Public Certificate
                        </Link>
                      ) : null}
                    </>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleGenerateCertificate}
                      loading={certificateLoading}
                    >
                      Generate Certificate
                    </Button>
                  )}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              {lessons.map((lesson, index) => {
                const isActive =
                  String(lesson._id) === String(currentLesson?._id);
                const isCompleted = completedLessonIds.includes(String(lesson._id));

                return (
                  <button
                    key={lesson._id}
                    type="button"
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full rounded-xl border p-3 text-left transition ${
                      isActive
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-slate-500">Bài {index + 1}</p>
                        <p className="font-medium text-slate-900">{lesson.title}</p>
                      </div>

                      {isCompleted ? (
                        <span className="text-xs font-semibold text-green-600">
                          Xong
                        </span>
                      ) : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <main className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {currentLesson?.title || "Bài học"}
                  </h1>
                  <p className="mt-2 text-slate-600">
                    {currentLesson?.description || "Chọn bài học để bắt đầu."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={() => setChatOpen(true)}
                    className="bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                  >
                    Nhắn tin với instructor
                  </Button>

                  {progress >= 100 && certificate ? (
                    <Link to={`/learn/${courseId}/certificate`}>
                      <Button type="button">View Certificate</Button>
                    </Link>
                  ) : null}

                  {progress >= 100 && !certificate ? (
                    <Button
                      type="button"
                      onClick={handleGenerateCertificate}
                      loading={certificateLoading}
                    >
                      Generate Certificate
                    </Button>
                  ) : null}

                  <Button
                    onClick={handleCompleteLesson}
                    loading={actionLoading}
                    disabled={!currentLesson || currentLessonCompleted}
                  >
                    {currentLessonCompleted ? "Đã hoàn thành" : "Hoàn thành bài học"}
                  </Button>
                </div>
              </div>

              {currentLesson?.videoUrl ? (
                <div className="mt-5 overflow-hidden rounded-2xl">
                  {isYouTubeUrl(currentLesson.videoUrl) ? (
                    <iframe
                      title={currentLesson.title}
                      src={getYoutubeEmbedUrl(currentLesson.videoUrl)}
                      className="h-[420px] w-full"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={currentLesson.videoUrl}
                      controls
                      className="h-[420px] w-full rounded-2xl bg-black"
                    />
                  )}
                </div>
              ) : (
                <div className="mt-5 rounded-xl bg-slate-100 p-8 text-center text-slate-500">
                  Chưa có video cho bài học này.
                </div>
              )}

              {nextLesson ? (
                <div className="mt-4 text-sm text-slate-500">
                  Next lesson:{" "}
                  <span className="font-medium">{nextLesson.title}</span>
                </div>
              ) : null}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {["lessons", "materials", "quizzes", "assignments"].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => handleChangeTab(tab)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium ${
                        activeTab === tab
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {tab === "lessons" && "Bài học"}
                      {tab === "materials" && "Tài liệu"}
                      {tab === "quizzes" && "Quiz"}
                      {tab === "assignments" && "Bài tập"}
                    </button>
                  ))}
                </div>

                <Button type="button" onClick={() => setChatOpen(true)}>
                  Nhắn tin với instructor
                </Button>
              </div>

              {activeTab === "lessons" && (
                <div className="space-y-3">
                  {lessons.map((lesson, index) => {
                    const isCompleted = completedLessonIds.includes(
                      String(lesson._id)
                    );
                    const isActive =
                      String(lesson._id) === String(currentLesson?._id);

                    return (
                      <div
                        key={lesson._id}
                        className={`rounded-xl border p-4 ${
                          isActive
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-500">Bài {index + 1}</p>
                            <p className="font-medium text-slate-900">
                              {lesson.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-600">
                              {lesson.description || "Chưa có mô tả."}
                            </p>
                          </div>

                          {isCompleted ? (
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                              Completed
                            </span>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === "materials" && <MaterialsTab courseId={courseId} />}
              {activeTab === "quizzes" && <QuizList courseId={courseId} />}
              {activeTab === "assignments" && (
                <AssignmentList courseId={courseId} />
              )}
            </section>
          </main>
        </div>
      </div>

      <ChatModal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Nhắn tin với instructor"
        subtitle={course?.title || "Course chat"}
      >
        <div className="h-full p-4">
          <ChatBox courseId={courseId} compact={false} />
        </div>
      </ChatModal>
    </>
  );
}