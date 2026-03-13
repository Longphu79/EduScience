import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../../shared/components/Button";
import Toast from "../../../shared/components/Toast";
import { CourseCard } from "../../../shared/components/courseCard";
import { getAllCourses } from "../services/course.service";
import "../../../assets/styles/allCoursesPage.css";

const categories = [
  { label: "All", value: "All" },
  { label: "Backend", value: "backend" },
  { label: "Frontend", value: "frontend" },
  { label: "Database", value: "database" },
  { label: "UI/UX", value: "ui-ux" },
  { label: "Mobile Development", value: "Mobile Development" },
];

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

const sortOptions = [
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
  { label: "Newest First", value: "newest" },
];

export default function AllCoursesPage() {
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeLevel, setActiveLevel] = useState("All");
  const [sortBy, setSortBy] = useState("popular");
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useRef(null);

  const handleHeroMove = (e) => {
    const el = heroRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);

        const data = await getAllCourses({
          search: keyword,
          category: activeCategory,
          level: activeLevel === "All" ? "All" : activeLevel.toLowerCase(),
          sortBy,
        });

        setCourses(Array.isArray(data) ? data : data?.data || []);
      } catch (error) {
        console.error(error);
        setToast({
          message: error.message || "Failed to load courses",
          kind: "error",
        });
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [keyword, activeCategory, activeLevel, sortBy]);

  const totalCourses = courses.length;

  const totalStudents = useMemo(
    () => courses.reduce((sum, item) => sum + (item.totalEnrollments || 0), 0),
    [courses]
  );

  const avgRating = useMemo(() => {
    if (!courses.length) return "0.0";
    return (
      courses.reduce((sum, item) => sum + (item.rating || 0), 0) / courses.length
    ).toFixed(1);
  }, [courses]);

  const featuredCourses = courses.slice(0, 4);

  return (
    <div className="courses-page">
      <Toast
        kind={toast.kind}
        message={toast.message}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <div className="courses-bg-orb orb-1" />
      <div className="courses-bg-orb orb-2" />
      <div className="courses-bg-orb orb-3" />
      <div className="courses-grid-pattern" />

      <section
        ref={heroRef}
        className="courses-hero premium-spotlight"
        onMouseMove={handleHeroMove}
      >
        <div className="hero-floating-chip chip-3">Career Growth</div>
        <div className="hero-floating-chip chip-4">Skill Upgrade</div>

        <div className="courses-hero__content">
          <span className="courses-hero__badge">EDUSCIENCE COURSE CATALOG</span>

          <div className="hero-topline">
            <span>Premium learning platform</span>
            <span>Career-driven content</span>
            <span>Modern experience</span>
          </div>

          <h1>
            Build practical skills with
            <span> a modern premium learning experience</span>
          </h1>

          <p>
            Explore high-quality online courses designed for ambitious learners.
            Search, filter, and discover expertly crafted programs built for
            real-world growth, portfolio building, and long-term career value.
          </p>

          <div className="courses-hero__actions">
            <Button
              onClick={() =>
                setToast({
                  message: "Start exploring our premium courses!",
                  kind: "success",
                })
              }
            >
              Start Learning
            </Button>

            <button
              type="button"
              className="ghost-cta"
              onClick={() => window.scrollTo({ top: 860, behavior: "smooth" })}
            >
              Browse Catalog
            </button>
          </div>

          <div className="courses-hero__features">
            <span>✔ Real-world projects</span>
            <span>✔ Expert instructors</span>
            <span>✔ Flexible learning paths</span>
          </div>

          <div className="courses-hero__stats">
            <div className="stat-card">
              <strong>{totalCourses}+</strong>
              <span>Premium Courses</span>
            </div>
            <div className="stat-card">
              <strong>{totalStudents}+</strong>
              <span>Active Enrollments</span>
            </div>
            <div className="stat-card">
              <strong>{avgRating}</strong>
              <span>Average Rating</span>
            </div>
          </div>
        </div>

        <div className="courses-hero__panel">
          <div className="hero-panel-card">
            <p className="hero-panel-card__label">Premium Learning Ecosystem</p>
            <h3>Designed to feel immersive, elegant, and professional</h3>

            <div className="hero-mini-cards">
              <div className="hero-mini-card">
                <strong>120+</strong>
                <span>Expert mentors</span>
              </div>
              <div className="hero-mini-card">
                <strong>40h+</strong>
                <span>Updated weekly</span>
              </div>
            </div>

            <ul>
              <li>Curated pathways from beginner to advanced</li>
              <li>High-end UI with smooth, premium interactions</li>
              <li>Focused learning designed for measurable progress</li>
            </ul>

            <div className="hero-panel-footer">
              <div>
                <span className="hero-panel-footer__label">Trusted by learners</span>
                <strong>{totalStudents}+ enrollments</strong>
              </div>
              <div className="hero-panel-rating">★ {avgRating}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="courses-trustbar">
        <div className="trust-item">
          <strong>Project-based</strong>
          <span>Learn by building</span>
        </div>
        <div className="trust-item">
          <strong>Expert-led</strong>
          <span>Industry-oriented teaching</span>
        </div>
        <div className="trust-item">
          <strong>Flexible</strong>
          <span>Study at your own pace</span>
        </div>
        <div className="trust-item">
          <strong>Premium UX</strong>
          <span>Modern, clean, fast browsing</span>
        </div>
      </section>

      <section className="courses-highlight">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Featured Picks</span>
            <h2>Trending courses learners love right now</h2>
          </div>
          <p>
            Handpicked programs with excellent ratings, practical outcomes, and
            high student engagement.
          </p>
        </div>

        <div className="highlight-strip">
          {featuredCourses.map((course) => (
            <div key={course._id} className="highlight-pill">
              <span>{course.isPopular ? "Popular" : "Featured"}</span>
              <strong>{course.title}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="courses-toolbar">
        <div className="courses-toolbar__search">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Search courses
          </label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by title, category, level, instructor..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-violet-500"
          />
        </div>

        <div className="courses-toolbar__sort">
          <label htmlFor="sort">Sort by</label>
          <select
            id="sort"
            className="courses-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {sortOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="courses-filter-shell">
        <div className="filter-block">
          <div className="filter-block__label">Categories</div>
          <div className="courses-categories">
            {categories.map((category) => (
              <button
                key={category.value}
                type="button"
                className={`category-chip ${
                  activeCategory === category.value ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-block">
          <div className="filter-block__label">Level</div>
          <div className="courses-categories">
            {levels.map((level) => (
              <button
                key={level}
                type="button"
                className={`category-chip ${
                  activeLevel === level ? "active" : ""
                }`}
                onClick={() => setActiveLevel(level)}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="courses-results">
        <div className="courses-results__top">
          <div>
            <span className="section-kicker">Explore Catalog</span>
            <h2>Discover the right course for your next step</h2>
          </div>
          <p>{courses.length} course(s) found</p>
        </div>

        {loading ? (
          <div className="courses-empty">
            <h3>Loading courses...</h3>
          </div>
        ) : courses.length === 0 ? (
          <div className="courses-empty">
            <h3>No matching courses found</h3>
            <p>Try another keyword, level, or category.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {courses.map((course) => (
              <div
                key={course._id}
                className="courses-grid__item enhanced-card-wrap"
              >
                <div className="card-top-badge">
                  {course.isPopular ? "Popular" : "Course"}
                </div>

                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}