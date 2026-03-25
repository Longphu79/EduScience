import { CourseCard } from "../../../shared/components/courseCard";
import CoursePagination from "./CoursePagination";
import { getCourseId } from "../utils/course.helpers";

export default function AllCoursesResults({
  loading,
  courses,
  pagination,
  onChangePage,
}) {
  return (
    <section className="all-courses-page__results">
      <div className="all-courses-page__results-top">
        <div>
          <span className="all-courses-page__section-kicker">
            Explore Catalog
          </span>
          <h2>Discover the right course for your next step</h2>
        </div>
        <p>{pagination.totalItems || courses.length} course(s) found</p>
      </div>

      {loading ? (
        <div className="all-courses-page__empty">
          <h3>Loading courses...</h3>
        </div>
      ) : courses.length === 0 ? (
        <div className="all-courses-page__empty">
          <h3>No matching courses found</h3>
          <p>Try another keyword, filter, or sort option.</p>
        </div>
      ) : (
        <>
          <div className="all-courses-page__grid">
            {courses.map((course) => (
              <div
                key={getCourseId(course)}
                className="all-courses-page__grid-item"
              >
                <div className="all-courses-page__top-badge">
                  {course.isPopular ? "Popular" : "Course"}
                </div>

                <CourseCard course={course} />
              </div>
            ))}
          </div>

          <CoursePagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onChange={onChangePage}
          />
        </>
      )}
    </section>
  );
}