import { getCourseId } from "../utils/course.helpers";

export default function AllCoursesHighlight({ featuredCourses = [] }) {
  return (
    <>
      <section className="all-courses-page__trustbar">
        <div className="all-courses-page__trust-item">
          <strong>Project-based</strong>
          <span>Learn by building</span>
        </div>
        <div className="all-courses-page__trust-item">
          <strong>Expert-led</strong>
          <span>Industry-oriented teaching</span>
        </div>
        <div className="all-courses-page__trust-item">
          <strong>Flexible</strong>
          <span>Study at your own pace</span>
        </div>
        <div className="all-courses-page__trust-item">
          <strong>Premium UX</strong>
          <span>Modern, clean, fast browsing</span>
        </div>
      </section>

      <section className="all-courses-page__highlight">
        <div className="all-courses-page__section-heading">
          <div>
            <span className="all-courses-page__section-kicker">
              Featured Picks
            </span>
            <h2>Trending courses learners love right now</h2>
          </div>
          <p>
            Handpicked programs with excellent ratings, practical outcomes, and
            high student engagement.
          </p>
        </div>

        <div className="all-courses-page__highlight-strip">
          {featuredCourses.map((course) => (
            <div
              key={getCourseId(course)}
              className="all-courses-page__highlight-pill"
            >
              <span>{course.isPopular ? "Popular" : "Featured"}</span>
              <strong>{course.title}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}