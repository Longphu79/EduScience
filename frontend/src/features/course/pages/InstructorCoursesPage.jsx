import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import useInstructorCoursesPage, {
  formatNumber,
  getCourseStatusMeta,
} from "../hooks/useInstructorCoursesPage";
import InstructorCourseCard from "../components/InstructorCourseCard";
import InstructorCoursesStats from "../components/InstructorCoursesStats";
import "../styles/instructor-courses-page.css";

export default function InstructorCoursesPage() {
  const {
    isAuthenticated,
    filteredCourses,
    loading,
    deletingId,
    search,
    sortBy,
    toast,
    dashboard,
    navigate,
    setSearch,
    setSortBy,
    setToast,
    fetchInstructorCourses,
    handleDeleteCourse,
  } = useInstructorCoursesPage();

  if (!isAuthenticated) {
    return (
      <div className="instructor-courses-page">
        <Toast
          {...toast}
          onClose={() => setToast({ message: "", kind: "success" })}
        />

        <div className="instructor-courses-page__auth-card">
          <div className="instructor-courses-page__eyebrow">
            Instructor Dashboard
          </div>
          <h1 className="instructor-courses-page__auth-title">
            Instructor Courses
          </h1>
          <p className="instructor-courses-page__auth-text">
            Please login to manage your course catalog, lessons, materials, quizzes,
            and learner interactions.
          </p>

          <div className="instructor-courses-page__auth-actions">
            <Button onClick={() => navigate("/auth/login")}>Login</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-courses-page">
      <Toast
        {...toast}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <div className="instructor-courses-page__bg-orb instructor-courses-page__bg-orb--1" />
      <div className="instructor-courses-page__bg-orb instructor-courses-page__bg-orb--2" />

      <section className="instructor-courses-page__hero">
        <div className="instructor-courses-page__hero-layout">
          <div>
            <div className="instructor-courses-page__eyebrow">
              Instructor Dashboard
            </div>

            <h1 className="instructor-courses-page__title">My Courses</h1>

            <p className="instructor-courses-page__subtitle">
              Manage your teaching catalog with a smoother, more professional
              workflow. Edit course details, organize lessons, upload materials,
              create quizzes, and monitor student activity in one place.
            </p>
          </div>

          <div className="instructor-courses-page__hero-actions">
            <button
              type="button"
              onClick={fetchInstructorCourses}
              className="instructor-courses-page__secondary-btn"
            >
              Refresh
            </button>

            <Link to="/instructor/courses/create">
              <Button>Create Course</Button>
            </Link>
          </div>
        </div>
      </section>

      <InstructorCoursesStats
        dashboard={dashboard}
        formatNumber={formatNumber}
      />

      <section className="instructor-courses-page__filter-card">
        <div className="instructor-courses-page__filter-grid">
          <div>
            <label className="instructor-courses-page__label">
              Search courses
            </label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course title, description, category..."
              className="instructor-courses-page__input"
            />
          </div>

          <div>
            <label className="instructor-courses-page__label">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="instructor-courses-page__input"
            >
              <option value="latest">Latest</option>
              <option value="students">Students</option>
              <option value="title">Title</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="instructor-courses-page__skeleton-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="instructor-courses-page__skeleton-card">
              <div className="instructor-courses-page__skeleton-image" />
              <div className="instructor-courses-page__skeleton-body">
                <div className="instructor-courses-page__skeleton-line instructor-courses-page__skeleton-line--sm" />
                <div className="instructor-courses-page__skeleton-line instructor-courses-page__skeleton-line--lg" />
                <div className="instructor-courses-page__skeleton-line instructor-courses-page__skeleton-line--md" />
                <div className="instructor-courses-page__skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      ) : !filteredCourses.length ? (
        <div className="instructor-courses-page__empty-card">
          <h2 className="instructor-courses-page__empty-title">
            No courses found
          </h2>
          <p className="instructor-courses-page__empty-text">
            Try another keyword or create your first course to get started.
          </p>

          <div className="instructor-courses-page__empty-actions">
            <Link to="/instructor/courses/create">
              <Button>Create Course</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="instructor-courses-page__courses-grid">
          {filteredCourses.map((course) => (
            <InstructorCourseCard
              key={course._id}
              course={course}
              deletingId={deletingId}
              onDelete={handleDeleteCourse}
              getStatusMeta={getCourseStatusMeta}
            />
          ))}
        </div>
      )}
    </div>
  );
}