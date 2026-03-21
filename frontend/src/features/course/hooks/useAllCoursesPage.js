import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getAllCourses } from "../services/course.service";

export default function useAllCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [keywordInput, setKeywordInput] = useState(
    searchParams.get("search") || ""
  );
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "All"
  );
  const [activeLevel, setActiveLevel] = useState(
    searchParams.get("level")
      ? String(searchParams.get("level")).charAt(0).toUpperCase() +
          String(searchParams.get("level")).slice(1)
      : "All"
  );
  const [activePricing, setActivePricing] = useState(
    searchParams.get("pricing") || "all"
  );
  const [activeRating, setActiveRating] = useState(
    searchParams.get("minRating") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  const [debouncedKeyword, setDebouncedKeyword] = useState(
    searchParams.get("search") || ""
  );

  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    totalItems: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const heroRef = useRef(null);

  function handleHeroMove(event) {
    const element = heroRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    element.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    element.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedKeyword(keywordInput.trim());
      setPage(1);
    }, 450);

    return () => clearTimeout(timer);
  }, [keywordInput]);

  useEffect(() => {
    const nextParams = {};

    if (debouncedKeyword) nextParams.search = debouncedKeyword;
    if (activeCategory !== "All") nextParams.category = activeCategory;
    if (activeLevel !== "All") nextParams.level = activeLevel.toLowerCase();
    if (activePricing !== "all") nextParams.pricing = activePricing;
    if (activeRating) nextParams.minRating = activeRating;
    if (sortBy && sortBy !== "newest") nextParams.sortBy = sortBy;
    if (page > 1) nextParams.page = String(page);

    setSearchParams(nextParams, { replace: true });
  }, [
    debouncedKeyword,
    activeCategory,
    activeLevel,
    activePricing,
    activeRating,
    sortBy,
    page,
    setSearchParams,
  ]);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);

        const response = await getAllCourses({
          search: debouncedKeyword,
          category: activeCategory,
          level: activeLevel === "All" ? "All" : activeLevel.toLowerCase(),
          pricing: activePricing,
          minRating: activeRating,
          sortBy,
          page,
          limit: 9,
        });

        setCourses(Array.isArray(response?.data) ? response.data : []);
        setPagination(
          response?.pagination || {
            page: 1,
            limit: 9,
            totalItems: 0,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          }
        );
      } catch (error) {
        setToast({
          message: error.message || "Failed to load courses",
          kind: "error",
        });
        setCourses([]);
        setPagination({
          page: 1,
          limit: 9,
          totalItems: 0,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, [
    debouncedKeyword,
    activeCategory,
    activeLevel,
    activePricing,
    activeRating,
    sortBy,
    page,
  ]);

  const totalCourses = pagination.totalItems || courses.length;

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

  function handleResetFilters() {
    setKeywordInput("");
    setDebouncedKeyword("");
    setActiveCategory("All");
    setActiveLevel("All");
    setActivePricing("all");
    setActiveRating("");
    setSortBy("newest");
    setPage(1);
  }

  return {
    heroRef,
    courses,
    loading,
    pagination,
    keywordInput,
    activeCategory,
    activeLevel,
    activePricing,
    activeRating,
    sortBy,
    toast,
    totalCourses,
    totalStudents,
    avgRating,
    featuredCourses,
    setToast,
    setKeywordInput,
    setActiveCategory,
    setActiveLevel,
    setActivePricing,
    setActiveRating,
    setSortBy,
    setPage,
    handleHeroMove,
    handleResetFilters,
  };
}