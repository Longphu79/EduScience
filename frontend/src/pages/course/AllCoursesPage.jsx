import { useMemo, useRef, useState } from "react";
import TextField from "../../shared/components/TextField";
import Button from "../../shared/components/Button";
import Toast from "../../shared/components/Toast";
import { CourseCard } from "../../shared/components/courseCard";
import "../../assets/styles/allCoursesPage.css";

const mockCourses = [
  {
    _id: "1",
    title: "ReactJS for Modern Frontend Development",
    category: "Programming",
    rating: 5,
    totalReviews: 128,
    price: 49,
    totalLessons: 24,
    duration: 18,
    totalEnrollments: 2400,
    level: "Beginner",
    tag: "Best Seller",
    thumbnail:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
    instructorId: {
      name: "Emily Carter",
      avatarUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    _id: "2",
    title: "Advanced Node.js Backend Architecture",
    category: "Programming",
    rating: 4,
    totalReviews: 94,
    price: 79,
    totalLessons: 30,
    duration: 22,
    totalEnrollments: 1800,
    level: "Advanced",
    tag: "Hot",
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    instructorId: {
      name: "Michael Brown",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    _id: "3",
    title: "UI/UX Design Fundamentals for Beginners",
    category: "Design",
    rating: 5,
    totalReviews: 166,
    price: 39,
    totalLessons: 20,
    duration: 14,
    totalEnrollments: 3100,
    level: "Beginner",
    tag: "Popular",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    instructorId: {
      name: "Sophia Lee",
      avatarUrl:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    _id: "4",
    title: "Business Strategy and Startup Growth",
    category: "Business",
    rating: 4,
    totalReviews: 73,
    price: 55,
    totalLessons: 18,
    duration: 12,
    totalEnrollments: 1200,
    level: "Intermediate",
    tag: "New",
    thumbnail:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    instructorId: {
      name: "Daniel Smith",
      avatarUrl:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    _id: "5",
    title: "Digital Marketing Masterclass",
    category: "Marketing",
    rating: 4,
    totalReviews: 102,
    price: 45,
    totalLessons: 26,
    duration: 16,
    totalEnrollments: 2000,
    level: "Intermediate",
    tag: "Trending",
    thumbnail:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    instructorId: {
      name: "Olivia Martinez",
      avatarUrl:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    _id: "6",
    title: "Data Science with Python",
    category: "Data Science",
    rating: 5,
    totalReviews: 189,
    price: 89,
    totalLessons: 36,
    duration: 28,
    totalEnrollments: 3500,
    level: "Advanced",
    tag: "Top Rated",
    thumbnail:
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80",
    instructorId: {
      name: "James Wilson",
      avatarUrl:
        "https://images.unsplash.com/photo-1502767089025-6572583495b0?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    _id: "7",
    title: "MongoDB from Zero to Hero",
    category: "Programming",
    rating: 4,
    totalReviews: 88,
    price: 42,
    totalLessons: 21,
    duration: 15,
    totalEnrollments: 1450,
    level: "Intermediate",
    tag: "Hot",
    thumbnail:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
    instructorId: {
      name: "Ava Johnson",
      avatarUrl:
        "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80",
    },
  },
  {
    _id: "8",
    title: "Creative Brand Design Essentials",
    category: "Design",
    rating: 5,
    totalReviews: 76,
    price: 52,
    totalLessons: 19,
    duration: 13,
    totalEnrollments: 970,
    level: "Intermediate",
    tag: "New",
    thumbnail:
      "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
    instructorId: {
      name: "Emma Davis",
      avatarUrl:
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80",
    },
  },
];

const categories = [
  "All",
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Data Science",
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
  const [toast, setToast] = useState("");
  const heroRef = useRef(null);

  const handleHeroMove = (e) => {
    const el = heroRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  };

  const filteredCourses = useMemo(() => {
    let data = [...mockCourses];

    if (keyword.trim()) {
      const lower = keyword.toLowerCase();
      data = data.filter(
        (course) =>
          course.title.toLowerCase().includes(lower) ||
          course.category.toLowerCase().includes(lower) ||
          course.level.toLowerCase().includes(lower) ||
          course.instructorId?.name?.toLowerCase().includes(lower)
      );
    }

    if (activeCategory !== "All") {
      data = data.filter((course) => course.category === activeCategory);
    }

    if (activeLevel !== "All") {
      data = data.filter((course) => course.level === activeLevel);
    }

    switch (sortBy) {
      case "rating":
        data.sort((a, b) => b.rating - a.rating);
        break;
      case "priceAsc":
        data.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        data.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        data.reverse();
        break;
      default:
        data.sort((a, b) => b.totalEnrollments - a.totalEnrollments);
    }

    return data;
  }, [keyword, activeCategory, activeLevel, sortBy]);

  const totalCourses = mockCourses.length;
  const totalStudents = mockCourses.reduce(
    (sum, item) => sum + item.totalEnrollments,
    0
  );
  const avgRating = (
    mockCourses.reduce((sum, item) => sum + item.rating, 0) / mockCourses.length
  ).toFixed(1);

  const featuredCourses = mockCourses.slice(0, 4);

  return (
    <div className="courses-page">
      <Toast kind="success" message={toast} onClose={() => setToast("")} />

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
            <Button onClick={() => setToast("Start exploring our premium courses!")}>
              Start Learning
            </Button>

            <button
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
                <strong>16,000+ enrollments</strong>
              </div>
              <div className="hero-panel-rating">★ 4.9</div>
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
              <span>{course.tag}</span>
              <strong>{course.title}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="courses-toolbar">
        <div className="courses-toolbar__search">
          <TextField
            label="Search courses"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Search by title, category, level, instructor..."
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
                key={category}
                className={`category-chip ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
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
          <p>{filteredCourses.length} course(s) found</p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="courses-empty">
            <h3>No matching courses found</h3>
            <p>Try another keyword, level, or category.</p>
          </div>
        ) : (
          <div className="courses-grid">
            {filteredCourses.map((course) => (
              <div key={course._id} className="courses-grid__item enhanced-card-wrap">
                <div className="card-top-badge">{course.tag}</div>
                <CourseCard course={course} />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="courses-benefits">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Why EduScience</span>
            <h2>A learning platform built for serious growth</h2>
          </div>
          <p>
            Strong visual design, clear course discovery, and practical content
            structure help learners stay focused and motivated.
          </p>
        </div>

        <div className="benefit-grid">
          <div className="benefit-card">
            <div className="benefit-icon">⚡</div>
            <h3>Fast & focused</h3>
            <p>Modern catalog browsing with less friction and cleaner discovery.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🎯</div>
            <h3>Career-oriented</h3>
            <p>Content designed around real skills, real tools, and real outcomes.</p>
          </div>
          <div className="benefit-card">
            <div className="benefit-icon">🌍</div>
            <h3>Flexible access</h3>
            <p>Learn comfortably across devices with a premium visual experience.</p>
          </div>
        </div>
      </section>

      <section className="courses-cta">
        <div className="courses-cta__inner">
          <div>
            <span className="section-kicker">Get Started</span>
            <h2>Ready to unlock your next learning milestone?</h2>
            <p>
              Join a platform built to help learners stay inspired, focused, and
              future-ready with a polished modern interface.
            </p>
          </div>

          <div className="courses-cta__actions">
            <Button onClick={() => setToast("You are ready to start learning!")}>
              Join Now
            </Button>
            <button className="ghost-cta">View Learning Paths</button>
          </div>
        </div>
      </section>
    </div>
  );
}