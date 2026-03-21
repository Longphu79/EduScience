import Button from "../../../shared/components/Button";

export default function AllCoursesHero({
  heroRef,
  totalCourses,
  totalStudents,
  avgRating,
  onHeroMove,
  onStartLearning,
}) {
  return (
    <section
      ref={heroRef}
      className="all-courses-page__hero"
      onMouseMove={onHeroMove}
    >
      <div className="all-courses-page__floating-chip all-courses-page__floating-chip--3">
        Career Growth
      </div>
      <div className="all-courses-page__floating-chip all-courses-page__floating-chip--4">
        Skill Upgrade
      </div>

      <div className="all-courses-page__hero-content">
        <span className="all-courses-page__hero-badge">
          EDUSCIENCE COURSE CATALOG
        </span>

        <div className="all-courses-page__hero-topline">
          <span>Premium learning platform</span>
          <span>Career-driven content</span>
          <span>Modern experience</span>
        </div>

        <h1 className="all-courses-page__hero-title">
          Build practical skills with
          <span> a modern premium learning experience</span>
        </h1>

        <p className="all-courses-page__hero-text">
          Explore high-quality online courses designed for ambitious learners.
          Search, filter, and discover expertly crafted programs built for
          real-world growth, portfolio building, and long-term career value.
        </p>

        <div className="all-courses-page__hero-actions">
          <Button onClick={onStartLearning}>Start Learning</Button>

          <button
            type="button"
            className="all-courses-page__ghost-cta"
            onClick={() => window.scrollTo({ top: 860, behavior: "smooth" })}
          >
            Browse Catalog
          </button>
        </div>

        <div className="all-courses-page__hero-features">
          <span>✔ Real-world projects</span>
          <span>✔ Expert instructors</span>
          <span>✔ Flexible learning paths</span>
        </div>

        <div className="all-courses-page__hero-stats">
          <div className="all-courses-page__stat-card">
            <strong>{totalCourses}+</strong>
            <span>Premium Courses</span>
          </div>
          <div className="all-courses-page__stat-card">
            <strong>{totalStudents}+</strong>
            <span>Active Enrollments</span>
          </div>
          <div className="all-courses-page__stat-card">
            <strong>{avgRating}</strong>
            <span>Average Rating</span>
          </div>
        </div>
      </div>

      <div className="all-courses-page__hero-panel">
        <div className="all-courses-page__hero-panel-card">
          <p className="all-courses-page__hero-panel-label">
            Premium Learning Ecosystem
          </p>
          <h3>Designed to feel immersive, elegant, and professional</h3>

          <div className="all-courses-page__hero-mini-cards">
            <div className="all-courses-page__hero-mini-card">
              <strong>120+</strong>
              <span>Expert mentors</span>
            </div>
            <div className="all-courses-page__hero-mini-card">
              <strong>40h+</strong>
              <span>Updated weekly</span>
            </div>
          </div>

          <ul className="all-courses-page__hero-panel-list">
            <li>Curated pathways from beginner to advanced</li>
            <li>High-end UI with smooth, premium interactions</li>
            <li>Focused learning designed for measurable progress</li>
          </ul>

          <div className="all-courses-page__hero-panel-footer">
            <div>
              <span className="all-courses-page__hero-panel-footer-label">
                Trusted by learners
              </span>
              <strong>{totalStudents}+ enrollments</strong>
            </div>
            <div className="all-courses-page__hero-panel-rating">
              ★ {avgRating}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}