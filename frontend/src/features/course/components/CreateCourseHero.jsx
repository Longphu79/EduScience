export default function CreateCourseHero({ onBack }) {
  return (
    <section className="create-course-page__hero">
      <div className="create-course-page__hero-layout">
        <div>
          <div className="create-course-page__eyebrow">Instructor Dashboard</div>
          <h1 className="create-course-page__title">Create Course</h1>
          <p className="create-course-page__subtitle">
            Add a new course with complete information for your teaching
            catalog.
          </p>
        </div>

        <div className="create-course-page__hero-actions">
          <button
            type="button"
            onClick={onBack}
            className="create-course-page__secondary-btn"
          >
            Back to courses
          </button>
        </div>
      </div>
    </section>
  );
}