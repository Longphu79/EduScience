import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Toast from "../../shared/components/Toast";
import { useAuth } from "../../features/auth/state/useAuth";
import {
  completeLesson,
  getCourseLearningDetail,
  getMyEnrollment,
  setCurrentLesson,
} from "../../services/course.service";
import "../../assets/styles/learnCourse.css";

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

export default function LearnCoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingLesson, setSavingLesson] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  useEffect(() => {
    const fetchLearningData = async () => {
      try {
        if (!isAuthenticated || !(user?._id || user?.id)) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const studentId = user._id || user.id;

        const [courseData, enrollmentData] = await Promise.all([
          getCourseLearningDetail(courseId),
          getMyEnrollment(studentId, courseId),
        ]);

        setCourse(courseData);
        setEnrollment(enrollmentData);

        const lessons = Array.isArray(courseData?.lessonIds)
          ? courseData.lessonIds
          : [];

        let lessonToOpen = null;

        if (enrollmentData?.lastLessonId) {
          lessonToOpen = lessons.find(
            (lesson) =>
              lesson._id === enrollmentData.lastLessonId ||
              lesson._id === enrollmentData.lastLessonId?._id
          );
        }

        if (!lessonToOpen && lessons.length > 0) {
          lessonToOpen = lessons[0];
        }

        setSelectedLesson(lessonToOpen || null);
      } catch (error) {
        console.error(error);
        setToast({
          message: error.message || "Failed to load learning page",
          kind: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLearningData();
  }, [courseId, isAuthenticated, user]);

  const lessons = useMemo(
    () => (Array.isArray(course?.lessonIds) ? course.lessonIds : []),
    [course]
  );

  const completedLessonIds = useMemo(() => {
    return Array.isArray(enrollment?.completedLessons)
      ? enrollment.completedLessons.map((item) =>
          typeof item === "string" ? item : item?._id || String(item)
        )
      : [];
  }, [enrollment]);

  // fallback để tránh case progress có nhưng completedLessons rỗng
  const completedCount = useMemo(() => {
    const byList = completedLessonIds.length;
    const byProgress =
      lessons.length > 0
        ? Math.round(((enrollment?.progress || 0) / 100) * lessons.length)
        : 0;

    return Math.max(byList, byProgress);
  }, [completedLessonIds, enrollment?.progress, lessons.length]);

  const currentLessonIndex = useMemo(() => {
    if (!selectedLesson?._id) return -1;
    return lessons.findIndex((lesson) => lesson._id === selectedLesson._id);
  }, [lessons, selectedLesson]);

  const isCurrentLessonCompleted = useMemo(() => {
    if (!selectedLesson?._id) return false;
    return completedLessonIds.includes(selectedLesson._id);
  }, [completedLessonIds, selectedLesson]);

  const progress = useMemo(() => {
    if (enrollment?.progress !== undefined && enrollment?.progress !== null) {
      return enrollment.progress;
    }

    if (!lessons.length) return 0;
    return Math.round((completedCount / lessons.length) * 100);
  }, [enrollment?.progress, completedCount, lessons.length]);

  const previewVideoUrl = useMemo(
    () => getYoutubeEmbedUrl(selectedLesson?.videoUrl || ""),
    [selectedLesson]
  );

  const handleSelectLesson = async (lesson) => {
    try {
      setSelectedLesson(lesson);

      if (isAuthenticated && (user?._id || user?.id)) {
        setSavingLesson(true);

        await setCurrentLesson({
          studentId: user._id || user.id,
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
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSavingLesson(false);
    }
  };

  const handleCompleteLesson = async () => {
    try {
      if (!selectedLesson?._id) return;

      if (isCurrentLessonCompleted) {
        setToast({
          message: "This lesson is already completed",
          kind: "success",
        });
        return;
      }

      setCompleting(true);

      const selectedLessonId = selectedLesson._id;

      // cập nhật local state ngay để UI đổi liền
      setEnrollment((prev) => {
        if (!prev) return prev;

        const prevCompleted = Array.isArray(prev.completedLessons)
          ? prev.completedLessons.map((item) =>
              typeof item === "string" ? item : item?._id || String(item)
            )
          : [];

        const alreadyExists = prevCompleted.includes(selectedLessonId);

        const nextCompletedIds = alreadyExists
          ? prevCompleted
          : [...prevCompleted, selectedLessonId];

        const nextProgress =
          lessons.length > 0
            ? Math.min(
                100,
                Math.round((nextCompletedIds.length / lessons.length) * 100)
              )
            : 0;

        return {
          ...prev,
          completedLessons: nextCompletedIds,
          lastLessonId: selectedLessonId,
          progress: nextProgress,
          completed: lessons.length > 0 && nextCompletedIds.length >= lessons.length,
        };
      });

      // gọi backend lưu thật
      const data = await completeLesson({
        studentId: user._id || user.id,
        courseId,
        lessonId: selectedLessonId,
      });

      // nếu backend trả dữ liệu mới thì đồng bộ lại
      if (data) {
        setEnrollment((prev) => {
          const responseCompleted = Array.isArray(data?.completedLessons)
            ? data.completedLessons
            : prev?.completedLessons || [];

          const responseProgress =
            typeof data?.progress === "number"
              ? data.progress
              : prev?.progress || 0;

          return {
            ...prev,
            ...data,
            completedLessons: responseCompleted,
            progress: responseProgress,
          };
        });
      }

      setToast({
        message: `"${selectedLesson.title}" marked as completed`,
        kind: "success",
      });

      const nextIndex = currentLessonIndex + 1;
      if (nextIndex < lessons.length) {
        setTimeout(() => {
          handleSelectLesson(lessons[nextIndex]);
        }, 500);
      }
    } catch (error) {
      console.error(error);
      setToast({
        message: error.message || "Failed to complete lesson",
        kind: "error",
      });
    } finally {
      setCompleting(false);
    }
  };

  const handlePrevLesson = () => {
    if (currentLessonIndex > 0) {
      handleSelectLesson(lessons[currentLessonIndex - 1]);
    }
  };

  const handleNextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      handleSelectLesson(lessons[currentLessonIndex + 1]);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="learn-course-page">
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />

        <div className="learn-empty-state">
          <h1>Please login first</h1>
          <p>You need to login to access your learning page.</p>
          <div className="learn-empty-actions">
            <button
              type="button"
              className="learn-action-btn learn-complete-btn"
              onClick={() => navigate("/login")}
            >
              <span>Login</span>
            </button>
            <Link to="/courses" className="learn-secondary-btn">
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="learn-course-page">
        <div className="learn-empty-state">
          <h1>Loading learning page...</h1>
          <p>Please wait while we fetch course lessons and progress.</p>
        </div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return (
      <div className="learn-course-page">
        <div className="learn-empty-state">
          <h1>Unable to access this course</h1>
          <p>You may not be enrolled in this course yet.</p>
          <div className="learn-empty-actions">
            <Link to={`/courses/${courseId}`} className="learn-primary-btn">
              Back to Detail
            </Link>
            <Link to="/my-courses" className="learn-secondary-btn">
              My Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="learn-course-page">
      <Toast
        kind={toast.kind}
        message={toast.message}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <div className="learn-course-topbar">
        <div>
          <p className="learn-course-label">Learning Workspace</p>
          <h1>{course.title}</h1>
        </div>

        <div className="learn-topbar-actions">
          <Link to="/my-courses" className="learn-secondary-btn">
            My Courses
          </Link>
          <Link to={`/courses/${course._id}`} className="learn-secondary-btn">
            Course Detail
          </Link>
        </div>
      </div>

      <div className="learn-progress-card">
        <div className="learn-progress-header">
          <div>
            <span className="learn-progress-title">Your Progress</span>
            <h3>{progress}% completed</h3>
          </div>
          <div className="learn-progress-stat">
            {completedCount}/{lessons.length} lessons
          </div>
        </div>

        <div className="learn-progress-bar">
          <div
            className="learn-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="learn-course-layout">
        <aside className="learn-sidebar">
          <div className="learn-sidebar-head">
            <h2>Course Lessons</h2>
            {savingLesson ? (
              <span>Saving...</span>
            ) : (
              <span>{lessons.length} lessons</span>
            )}
          </div>

          <div className="learn-lesson-list">
            {lessons.length ? (
              lessons.map((lesson, index) => {
                const isActive = selectedLesson?._id === lesson._id;
                const isDone = completedLessonIds.includes(lesson._id);

                return (
                  <button
                    key={lesson._id || index}
                    className={`learn-lesson-item ${isActive ? "active" : ""}`}
                    onClick={() => handleSelectLesson(lesson)}
                    type="button"
                  >
                    <div className="learn-lesson-left">
                      <div className={`learn-lesson-order ${isDone ? "done" : ""}`}>
                        {isDone ? "✓" : index + 1}
                      </div>
                    </div>

                    <div className="learn-lesson-body">
                      <h4>{lesson.title || `Lesson ${index + 1}`}</h4>
                      <p>
                        {lesson.duration || 0} min
                        {isDone ? " • Completed" : ""}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="learn-no-lessons">No lessons available yet.</div>
            )}
          </div>
        </aside>

        <main className="learn-main-content">
          {selectedLesson ? (
            <>
              <div className="learn-video-card">
                <div className="learn-video-header">
                  <div>
                    <p className="learn-video-label">Now Learning</p>
                    <h2>{selectedLesson.title}</h2>
                  </div>

                  {isCurrentLessonCompleted ? (
                    <span className="learn-completed-badge">Completed</span>
                  ) : (
                    <span className="learn-pending-badge">In Progress</span>
                  )}
                </div>

                {previewVideoUrl ? (
                  <div className="learn-video-frame">
                    <iframe
                      title="lesson-video"
                      src={previewVideoUrl}
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="learn-no-video">
                    This lesson does not have a video yet.
                  </div>
                )}
              </div>

              <div className="learn-content-card">
                <h3>Lesson Description</h3>
                <p>
                  {selectedLesson.description ||
                    "No lesson description has been provided yet."}
                </p>
              </div>

              <div className="learn-content-card">
                <h3>Materials</h3>

                {selectedLesson.materialUrl ? (
                  <a
                    href={selectedLesson.materialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="learn-material-link"
                  >
                    Download Material
                  </a>
                ) : (
                  <p>No materials available for this lesson.</p>
                )}
              </div>

              <div className="learn-lesson-actions">
                <button
                  type="button"
                  onClick={handlePrevLesson}
                  disabled={currentLessonIndex <= 0}
                  className="learn-action-btn learn-nav-btn"
                >
                  <span>←</span>
                  <span>Previous Lesson</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteLesson}
                  disabled={completing || isCurrentLessonCompleted}
                  className={`learn-action-btn learn-complete-btn ${
                    isCurrentLessonCompleted ? "is-done" : ""
                  } ${completing ? "is-loading" : ""}`}
                >
                  <span>
                    {completing ? "..." : isCurrentLessonCompleted ? "✓" : "✔"}
                  </span>
                  <span>
                    {completing
                      ? "Saving..."
                      : isCurrentLessonCompleted
                      ? "Completed"
                      : "Mark as Complete"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleNextLesson}
                  disabled={
                    currentLessonIndex === -1 ||
                    currentLessonIndex >= lessons.length - 1
                  }
                  className="learn-action-btn learn-nav-btn"
                >
                  <span>Next Lesson</span>
                  <span>→</span>
                </button>
              </div>
            </>
          ) : (
            <div className="learn-empty-main">
              <h2>No lesson selected</h2>
              <p>Please choose a lesson from the left sidebar.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}