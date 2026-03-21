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
        <Toast {...toast} onClose={() => setToast({ message: "", kind: "success" })} />

        <div className="instructor-courses-page__auth-card">
          <h1>Instructor Courses</h1>
          <p>Please login to continue.</p>

          <Button onClick={() => navigate("/auth/login")}>Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-courses-page">
      <Toast {...toast} onClose={() => setToast({ message: "", kind: "success" })} />

      <section className="instructor-courses-page__hero">
        <h1>My Courses</h1>

        <div>
          <button onClick={fetchInstructorCourses}>Refresh</button>
          <Link to="/instructor/courses/create">
            <Button>Create Course</Button>
          </Link>
        </div>
      </section>

      <InstructorCoursesStats dashboard={dashboard} formatNumber={formatNumber} />

      <section className="instructor-courses-page__filter-card">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
        />

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="latest">Latest</option>
          <option value="students">Students</option>
          <option value="title">Title</option>
        </select>
      </section>

      {loading ? (
        <div>Loading...</div>
      ) : !filteredCourses.length ? (
        <div>No courses found</div>
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