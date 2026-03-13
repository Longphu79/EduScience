import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../../shared/components/Button";
import Toast from "../../../shared/components/Toast";
import ReviewList from "../../review/components/ReviewList";
import ReviewForm from "../../review/components/ReviewForm";
import MaterialList from "../../material/components/MaterialList";
import {
  enrollCourse,
  getCourseDetail,
  getAllCourses,
} from "../services/course.service";
import { getMyCourses } from "../../enrollment/services/enrollment.service";
import {
  createReview,
  getReviewsByCourse,
} from "../../review/services/review.service";
import { getMaterialsByCourse } from "../../material/services/material.service";
import { useAuth } from "../../auth/state/useAuth";
import "../../../assets/styles/courseDetail.css";

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
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState(null);
  const [relatedCourses, setRelatedCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [extraLoading, setExtraLoading] = useState(true);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  async function loadExtraData(id) {
    try {
      setExtraLoading(true);

      const [reviewRes, materialRes] = await Promise.allSettled([
        getReviewsByCourse(id),
        getMaterialsByCourse(id),
      ]);

      if (reviewRes.status === "fulfilled") {
        const reviewList = reviewRes.value?.data || reviewRes.value || [];
        setReviews(Array.isArray(reviewList) ? reviewList : []);
      } else {
        setReviews([]);
      }

      if (materialRes.status === "fulfilled") {
        const materialList = materialRes.value?.data || materialRes.value || [];
        setMaterials(Array.isArray(materialList) ? materialList : []);
      } else {
        setMaterials([]);
      }
    } finally {
      setExtraLoading(false);
    }
  }

  useEffect(() => {
    async function fetchCourseDetail() {
      try {
        setLoading(true);

        const data = await getCourseDetail(courseId);
        const courseData = data?.data || data;
        setCourse(courseData);

        if (isAuthenticated && (user?._id || user?.id)) {
          const studentId = user._id || user.id;
          const myCoursesRes = await getMyCourses(studentId);
          const myCourses = myCoursesRes?.data || myCoursesRes || [];

          const enrolled = Array.isArray(myCourses)
            ? myCourses.some(
                (item) =>
                  String(item?.courseId?._id || item?.courseId) ===
                  String(courseData?._id)
              )
            : false;

          setIsEnrolled(enrolled);
        } else {
          setIsEnrolled(false);
        }

        const relatedRes = await getAllCourses({
          category: courseData?.category || "",
          sort: "popular",
        });

        const relatedPayload = relatedRes?.data?.courses || relatedRes?.courses || relatedRes?.data || relatedRes || [];

        setRelatedCourses(
          (Array.isArray(relatedPayload) ? relatedPayload : [])
            .filter((item) => String(item._id) !== String(courseData._id))
            .slice(0, 3)
        );

        await loadExtraData(courseId);
      } catch (error) {
        setToast({
          message: error.message || "Failed to load course detail",
          kind: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetail();
  }, [courseId, isAuthenticated, user]);

  const currentUserId = user?._id || user?.id || "";
  const instructorUserId = course?.instructorId?._id || "";
  const isOwner =
    currentUserId &&
    instructorUserId &&
    String(currentUserId) === String(instructorUserId);

  const instructorName =
    course?.instructorId?.fullName ||
    course?.instructorId?.name ||
    course?.instructorId?.username ||
    course?.instructorId?.email ||
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
    if (course.isFree || Number(course.price) === 0) return "Free";
    if (course.salePrice && Number(course.salePrice) > 0) {
      return `₫${Number(course.salePrice).toLocaleString("vi-VN")}`;
    }
    return `₫${Number(course.price || 0).toLocaleString("vi-VN")}`;
  }, [course]);

  const originalPrice = useMemo(() => {
    if (!course) return "";
    if (course.isFree || Number(course.price) === 0) return "";
    if (course.salePrice && Number(course.salePrice) > 0) {
      return `₫${Number(course.price).toLocaleString("vi-VN")}`;
    }
    return "";
  }, [course]);

  const previewVideoUrl = useMemo(
    () => getYoutubeEmbedUrl(course?.previewVideo || ""),
    [course]
  );

  const lessons = useMemo(() => {
    return Array.isArray(course?.lessonIds) ? course.lessonIds : [];
  }, [course]);

  async function handleEnroll() {
    try {
      if (!isAuthenticated || !(user?._id || user?.id)) {
        setToast({
          message: "Please login first",
          kind: "error",
        });
        navigate("/auth/login");
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
    } catch (error) {
      setToast({
        message: error.message || "Failed to enroll course",
        kind: "error",
      });
    } finally {
      setEnrolling(false);
    }
  }

  async function handleCreateReview(payload) {
    try {
      if (!isAuthenticated) {
        setToast({
          message: "Please login first",
          kind: "error",
        });
        navigate("/auth/login");
        return;
      }

      if (!isEnrolled) {
        setToast({
          message: "You need to enroll this course before reviewing",
          kind: "error",
        });
        return;
      }

      await createReview({
        ...payload,
        studentId: user?._id || user?.id,
      });

      await loadExtraData(courseId);

      setToast({
        message: "Review submitted successfully",
        kind: "success",
      });
    } catch (error) {
      setToast({
        message: error.message || "Failed to submit review",
        kind: "error",
      });
    }
  }

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
              <span className="meta-chip">{lessons.length} lessons</span>
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
                <strong>{course.totalReviews || reviews.length || 0}</strong>
              </div>
            </div>

            <div className="course-section">
              <h2>Curriculum</h2>

              {lessons.length > 0 ? (
                <div className="curriculum">
                  {lessons.map((lesson, index) => (
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
                    This course currently has <strong>{course.totalLessons || 0}</strong>{" "}
                    lesson(s).
                  </p>
                </div>
              )}
            </div>

            <div className="course-section">
              <h2>Materials</h2>
              {extraLoading ? (
                <p>Loading materials...</p>
              ) : materials.length > 0 ? (
                <MaterialList materials={materials} />
              ) : (
                <p>No materials available yet.</p>
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

            {previewVideoUrl ? (
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
            ) : null}

            <div className="course-section">
              <h2>Reviews</h2>

              {isEnrolled && !isOwner ? (
                <div style={{ marginBottom: 20 }}>
                  <ReviewForm courseId={courseId} onSubmit={handleCreateReview} />
                </div>
              ) : (
                <p style={{ marginBottom: 16, color: "#64748b" }}>
                  Enroll this course to write a review.
                </p>
              )}

              {extraLoading ? <p>Loading reviews...</p> : <ReviewList reviews={reviews} />}
            </div>

            {relatedCourses.length > 0 ? (
              <div className="course-section">
                <h2>Related Courses</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {relatedCourses.map((item) => (
                    <Link
                      key={item._id}
                      to={`/courses/${item._id}`}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1"
                    >
                      <div className="text-sm font-semibold text-violet-600">
                        {item.category || "General"}
                      </div>
                      <div className="mt-2 text-lg font-bold text-slate-900">
                        {item.title}
                      </div>
                      <div className="mt-2 text-sm text-slate-500">
                        {item.shortDescription || item.description}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
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

              <div className="price-row">
                <span>Lessons</span>
                <span>{lessons.length}</span>
              </div>

              <div className="price-row">
                <span>Students</span>
                <span>{course.totalEnrollments || 0}</span>
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
              {isEnrolled ? (
                <Link to={`/learn/${course._id}`} className="continue-btn">
                  Continue Learning
                </Link>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}