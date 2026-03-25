import {
  COURSE_CATEGORIES,
  COURSE_LEVELS,
  COURSE_PRICING_OPTIONS,
  COURSE_RATING_OPTIONS,
  COURSE_SORT_OPTIONS,
} from "../utils/course.helpers";

export default function AllCoursesFilters({
  keywordInput,
  activeCategory,
  activeLevel,
  activePricing,
  activeRating,
  sortBy,
  onChangeKeyword,
  onChangeCategory,
  onChangeLevel,
  onChangePricing,
  onChangeRating,
  onChangeSortBy,
  onResetFilters,
}) {
  return (
    <section className="all-courses-page__filter-shell">
      <div className="all-courses-page__filter-grid">
        <div>
          <label className="all-courses-page__label">Search courses</label>
          <input
            value={keywordInput}
            onChange={(e) => onChangeKeyword(e.target.value)}
            placeholder="Search by title, description, category..."
            className="all-courses-page__input"
          />
        </div>

        <div>
          <label htmlFor="sort" className="all-courses-page__label">
            Sort by
          </label>
          <select
            id="sort"
            className="all-courses-page__input"
            value={sortBy}
            onChange={(e) => onChangeSortBy(e.target.value)}
          >
            {COURSE_SORT_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="all-courses-page__filter-block">
        <div className="all-courses-page__filter-label">Categories</div>
        <div className="all-courses-page__chips">
          {COURSE_CATEGORIES.map((category) => (
            <button
              key={category.value}
              type="button"
              className={`all-courses-page__chip ${
                activeCategory === category.value
                  ? "all-courses-page__chip--active"
                  : ""
              }`}
              onClick={() => onChangeCategory(category.value)}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="all-courses-page__filter-block">
        <div className="all-courses-page__filter-label">Level</div>
        <div className="all-courses-page__chips">
          {COURSE_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              className={`all-courses-page__chip ${
                activeLevel === level ? "all-courses-page__chip--active" : ""
              }`}
              onClick={() => onChangeLevel(level)}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="all-courses-page__extra-filters">
        <div>
          <label className="all-courses-page__label">Pricing</label>
          <select
            value={activePricing}
            onChange={(e) => onChangePricing(e.target.value)}
            className="all-courses-page__input"
          >
            {COURSE_PRICING_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="all-courses-page__label">Minimum rating</label>
          <select
            value={activeRating}
            onChange={(e) => onChangeRating(e.target.value)}
            className="all-courses-page__input"
          >
            {COURSE_RATING_OPTIONS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="all-courses-page__reset-wrap">
          <button
            type="button"
            onClick={onResetFilters}
            className="all-courses-page__reset-btn"
          >
            Reset filters
          </button>
        </div>
      </div>
    </section>
  );
}