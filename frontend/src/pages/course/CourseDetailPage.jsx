import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../shared/components/Button";
import Toast from "../../shared/components/Toast";
import {
  enrollCourse,
  getCourseDetail,
  getMyCourses,
} from "../../services/course.service";
import { useAuth } from "../../features/auth/state/useAuth";
import "../../assets/styles/courseDetail.css";

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

export default function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        setLoading(true);

        const data = await getCourseDetail(id);
        setCourse(data);

        if (isAuthenticated && (user?._id || user?.id)) {
          const studentId = user._id || user.id;
          const myCourses = await getMyCourses(studentId);

          const enrolled = Array.isArray(myCourses)
            ? myCourses.some((item) => item?.courseId?._id === data?._id)
            : false;

          setIsEnrolled(enrolled);
        } else {
          setIsEnrolled(false);
        }
      } catch (error) {
        console.error("DETAIL ERROR:", error);
        setToast({
          message: error.message || "Failed to load course detail",
          kind: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [id, isAuthenticated, user]);

  const currentUserId = user?._id || user?.id || "";
  const instructorUserId = course?.instructorId?._id || "";
  const isOwner = currentUserId && instructorUserId && currentUserId === instructorUserId;

  const instructorName =
    course?.instructorId?.fullName ||
    course?.instructorId?.name ||
    course?.instructorId?.username ||
    "Instructor";

  const instructorAvatar =
    course?.instructorId?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      instructorName
    )}&background=7c3aed&color=ffffff&bold=true`;

  const displayLevel = course?.level
    ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
    : "Beginner";

  const displayPrice = useMemo(() => {
    if (!course) return "";
    if (course.isFree || course.price === 0) return "Free";
    if (course.salePrice && course.salePrice > 0) {
      return `₫${course.salePrice.toLocaleString("vi-VN")}`;
    }
    return `₫${(course.price || 0).toLocaleString("vi-VN")}`;
  }, [course]);

  const originalPrice = useMemo(() => {
    if (!course) return "";
    if (course.isFree || course.price === 0) return "";
    if (course.salePrice && course.salePrice > 0) {
      return `₫${course.price.toLocaleString("vi-VN")}`;
    }
    return "";
  }, [course]);

  const previewVideoUrl = useMemo(
    () => getYoutubeEmbedUrl(course?.previewVideo || ""),
    [course]
  );

  const handleEnroll = async () => {
    try {
      if (!isAuthenticated || !(user?._id || user?.id)) {
        setToast({
          message: "Please login first",
          kind: "error",
        });
        navigate("/login");
        return;
      }

      if (!course?._id) {
        setToast({
          message: "Course not found",
          kind: "error",
        });
        return;
      }

      if (isOwner) {
        setToast({
          message: "You are the instructor of this course",
          kind: "error",
        });
        return;
      }

      if (isEnrolled) {
        setToast({
          message: "You already enrolled in this course",
          kind: "success",
        });
        return;
      }

      setEnrolling(true);

      await enrollCourse({
        studentId: user._id || user.id,
        courseId: course._id,
      });

      setIsEnrolled(true);

      setCourse((prev) =>
        prev
          ? {
              ...prev,
              totalEnrollments: (prev.totalEnrollments || 0) + 1,
            }
          : prev
      );

      setToast({
        message: "Enroll course successfully",
        kind: "success",
      });

      setTimeout(() => {
        navigate("/my-courses");
      }, 700);
    } catch (error) {
      console.error("ENROLL ERROR:", error);
      setToast({
        message: error.message || "Failed to enroll course",
        kind: "error",
      });
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="course-detail-page">
        <div className="course-detail-wrapper">
          <div className="course-main-card">
            <div className="course-main-content">
              <h2>Loading course detail...</h2>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-detail-page">
        <div className="course-detail-wrapper">
          <div className="course-main-card">
            <div className="course-main-content">
              <h2>Course not found.</h2>
              <div style={{ marginTop: 20 }}>
                <Link to="/courses" className="continue-btn">
                  Back to Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="course-detail-page">
      <Toast
        kind={toast.kind}
        message={toast.message}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <div className="course-detail-wrapper">
        <div className="course-main-card">
          <img
            src={
              course.thumbnail ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
            }
            alt={course.title}
            className="course-main-image"
          />

          <div className="course-main-content">
            <div className="course-meta">
              <span className="meta-chip">{course.category || "General"}</span>
              <span className="meta-chip">{displayLevel}</span>
              <span className="meta-chip">{course.language || "N/A"}</span>
              <span className="meta-chip">
                {course.totalLessons || 0} lessons
              </span>
            </div>

            <h1 className="course-title">{course.title}</h1>

            <p className="course-description">
              {course.description || course.shortDescription}
            </p>

            <div className="course-extra-grid">
              <div className="course-extra-card">
                <span>Duration</span>
                <strong>{course.duration || 0} minutes</strong>
              </div>
              <div className="course-extra-card">
                <span>Students</span>
                <strong>{course.totalEnrollments || 0}</strong>
              </div>
              <div className="course-extra-card">
                <span>Rating</span>
                <strong>{course.rating || 0} / 5</strong>
              </div>
              <div className="course-extra-card">
                <span>Reviews</span>
                <strong>{course.totalReviews || 0}</strong>
              </div>
            </div>

            <div className="course-section">
              <h2>What you will learn</h2>
              <ul className="course-learn-list">
                <li>Understand the core concepts of this course topic.</li>
                <li>Practice through real examples and guided explanation.</li>
                <li>Build practical skills for study and real projects.</li>
                <li>Improve your problem-solving and application ability.</li>
              </ul>
            </div>

            <div className="course-section">
              <h2>Curriculum</h2>

              {Array.isArray(course.lessonIds) && course.lessonIds.length > 0 ? (
                <div className="curriculum">
                  {course.lessonIds.map((lesson, index) => (
                    <div key={lesson._id || index} className="lesson-item">
                      <strong>
                        {index + 1}. {lesson.title || `Lesson ${index + 1}`}
                      </strong>
                      <span>{lesson.duration || 0} min</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="curriculum-empty">
                  <p>No lesson details yet.</p>
                  <p>
                    This course currently has{" "}
                    <strong>{course.totalLessons || 0}</strong> lesson(s).
                  </p>
                </div>
              )}
            </div>

            <div className="course-section">
              <h2>Instructor</h2>
              <div className="instructor-detail-box">
                <img
                  src={instructorAvatar}
                  alt={instructorName}
                  className="instructor-avatar large"
                />
                <div>
                  <h3 className="instructor-name">{instructorName}</h3>
                  <p className="instructor-bio">
                    This instructor is teaching the course and guiding students
                    through practical learning content.
                  </p>
                </div>
              </div>
            </div>

            {previewVideoUrl && (
              <div className="course-section">
                <h2>Preview Video</h2>
                <div className="preview-video">
                  <iframe
                    title="course-preview"
                    src={previewVideoUrl}
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="course-sidebar">
          <div className="course-instructor-card">
            <div className="instructor-row">
              <img
                src={instructorAvatar}
                alt={instructorName}
                className="instructor-avatar"
              />
              <div>
                <p style={{ color: "#64748b", fontSize: 13, marginBottom: 4 }}>
                  Course Instructor
                </p>
                <div className="instructor-name">{instructorName}</div>
              </div>
            </div>

            <div className="course-price-box">
              <div className="price-row">
                <span>Current price</span>
                <strong className="price-main">{displayPrice}</strong>
              </div>

              {originalPrice ? (
                <div className="price-row">
                  <span>Original price</span>
                  <span className="old-price">{originalPrice}</span>
                </div>
              ) : null}

              <div className="price-row">
                <span>Level</span>
                <span>{displayLevel}</span>
              </div>

              <div className="price-row">
                <span>Category</span>
                <span>{course.category || "General"}</span>
              </div>

              <div className="price-row">
                <span>Language</span>
                <span>{course.language || "N/A"}</span>
              </div>

              <div className="price-row">
                <span>Duration</span>
                <span>{course.duration || 0} min</span>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <Button
                onClick={handleEnroll}
                loading={enrolling}
                disabled={isEnrolled || isOwner}
                className="full-btn"
              >
                {isOwner ? "Your Course" : isEnrolled ? "Enrolled" : "Enroll Course"}
              </Button>
            </div>

            <div className="sidebar-actions">
              <Link to="/courses" className="continue-btn secondary">
                Back to Courses
              </Link>
              <Link to="/my-courses" className="continue-btn secondary">
                My Courses
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}