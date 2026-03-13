import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";

import MaterialsTab from "../../material/components/MaterialsTab";
import QuizList from "../../quiz/components/QuizList";
import AssignmentList from "../../assignment/components/AssignmentList";
import ChatBox from "../../chat/components/ChatBox";

import {
  getCourseById,
  courseUnwrap,
} from "../../course/services/course.service";
import {
  getEnrollmentByStudentAndCourse,
  setCurrentLesson,
  completeLesson,
} from "../services/enrollment.service";
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

const VALID_TABS = [
  "lessons",
  "materials",
  "quizzes",
  "assignments",
  "discussion",
];

function getSafeTab(tab) {
  return VALID_TABS.includes(tab) ? tab : "lessons";
}

export default function LearnCoursePage() {
  const { courseId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [currentLesson, setCurrentLessonState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(
    getSafeTab(searchParams.get("tab"))
  );
  const [toast, setToast] = useState({
    message: "",
    kind: "error",
  });

  const studentId = useMemo(() => {
    return user?._id || user?.id || user?.userId || null;
  }, [user]);

  useEffect(() => {
    const tabFromUrl = getSafeTab(searchParams.get("tab"));
    setActiveTab((prev) => (prev === tabFromUrl ? prev : tabFromUrl));
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!isAuthenticated) {
          throw new Error("Vui lòng đăng nhập để học khóa học");
        }

        if (!studentId) {
          throw new Error("Student id not found");
        }

        setLoading(true);

        const [courseRes, enrollmentRes] = await Promise.all([
          getCourseById(courseId),
          getEnrollmentByStudentAndCourse(courseId, studentId),
        ]);

        const courseData = courseUnwrap(courseRes);
        const enrollmentData = enrollmentRes?.data || enrollmentRes;

        setCourse(courseData);
        setEnrollment(enrollmentData);

        const lessons = Array.isArray(courseData?.lessonIds)
          ? [...courseData.lessonIds].sort(
              (a, b) =>
                Number(a?.order || 0) - Number(b?.order || 0) ||
                new Date(a?.createdAt || 0) - new Date(b?.createdAt || 0)
            )
          : [];

        const currentId =
          enrollmentData?.lastLessonId?._id || enrollmentData?.lastLessonId;

        const foundCurrent =
          lessons.find((lesson) => String(lesson._id) === String(currentId)) ||
          lessons[0] ||
          null;

        setCurrentLessonState(foundCurrent);
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
  }, [courseId, isAuthenticated, studentId]);

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
    return raw.map((item) => String(item?._id || item));
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

  const handleChangeTab = (tab) => {
    const safeTab = getSafeTab(tab);
    setActiveTab(safeTab);

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", safeTab);
    setSearchParams(nextParams, { replace: true });
  };

  const handleSelectLesson = async (lesson) => {
    try {
      if (!studentId) {
        throw new Error("Student id not found");
      }

      setCurrentLessonState(lesson);

      await setCurrentLesson({
        studentId,
        courseId,
        lessonId: lesson._id,
      });

      setEnrollment((prev) =>
        prev
          ? {
              ...prev,
              lastLessonId: lesson._id,
            }
          : prev
      );
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
      if (!studentId) {
        throw new Error("Student id not found");
      }

      setActionLoading(true);

      const updatedEnrollment = await completeLesson({
        studentId,
        courseId,
        lessonId: currentLesson._id,
      });

      const normalizedEnrollment = updatedEnrollment?.data || updatedEnrollment;
      setEnrollment(normalizedEnrollment);

      if (nextLesson) {
        setCurrentLessonState(nextLesson);

        await setCurrentLesson({
          studentId,
          courseId,
          lessonId: nextLesson._id,
        });
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
          </div>

          <div className="space-y-2">
            {lessons.map((lesson, index) => {
              const isActive =
                String(lesson._id) === String(currentLesson?._id);
              const isCompleted = completedLessonIds.includes(
                String(lesson._id)
              );

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
                      <p className="font-medium text-slate-900">
                        {lesson.title}
                      </p>
                    </div>
                    {isCompleted && (
                      <span className="text-xs font-semibold text-green-600">
                        Xong
                      </span>
                    )}
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

              <Button
                onClick={handleCompleteLesson}
                loading={actionLoading}
                disabled={!currentLesson || currentLessonCompleted}
              >
                {currentLessonCompleted ? "Đã hoàn thành" : "Hoàn thành bài học"}
              </Button>
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
                Next lesson: <span className="font-medium">{nextLesson.title}</span>
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap gap-2">
              {[
                "lessons",
                "materials",
                "quizzes",
                "assignments",
                "discussion",
              ].map((tab) => (
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
                  {tab === "discussion" && "Thảo luận"}
                </button>
              ))}
            </div>

            {activeTab === "lessons" && (
              <div className="space-y-3">
                {lessons.map((lesson, index) => {
                  const isCompleted = completedLessonIds.includes(
                    String(lesson._id)
                  );

                  return (
                    <div
                      key={lesson._id}
                      className="rounded-xl border border-slate-200 p-4"
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

            {activeTab === "discussion" && (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-slate-600">
                    Thảo luận trực tiếp trong khóa học.
                  </p>
                </div>
                <ChatBox courseId={courseId} />
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}