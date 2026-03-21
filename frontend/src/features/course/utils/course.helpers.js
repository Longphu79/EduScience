const FALLBACK_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

export const COURSE_CATEGORIES = [
  { label: "All", value: "All" },
  { label: "Backend", value: "backend" },
  { label: "Frontend", value: "frontend" },
  { label: "Database", value: "database" },
  { label: "UI/UX", value: "ui-ux" },
  { label: "Mobile Development", value: "Mobile Development" },
];

export const COURSE_LEVELS = ["All", "Beginner", "Intermediate", "Advanced"];

export const COURSE_PRICING_OPTIONS = [
  { label: "All", value: "all" },
  { label: "Free", value: "free" },
  { label: "Paid", value: "paid" },
];

export const COURSE_RATING_OPTIONS = [
  { label: "All Ratings", value: "" },
  { label: "4.5+ Stars", value: "4.5" },
  { label: "4.0+ Stars", value: "4" },
  { label: "3.5+ Stars", value: "3.5" },
];

export const COURSE_SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Most Popular", value: "popular" },
  { label: "Highest Rated", value: "rating" },
  { label: "Price: Low to High", value: "priceAsc" },
  { label: "Price: High to Low", value: "priceDesc" },
];

export const INITIAL_COURSE_FORM = {
  title: "",
  slug: "",
  shortDescription: "",
  description: "",
  category: "frontend",
  thumbnail: "",
  previewVideo: "",
  level: "beginner",
  language: "en",
  duration: 0,
  price: 0,
  salePrice: 0,
  isFree: false,
  isPopular: false,
  status: "published",
};

export function getFallbackCourseImage() {
  return FALLBACK_COURSE_IMAGE;
}

export function getSafeImage(url) {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  return null;
}

export function getCourseId(course) {
  if (!course) return "";
  return String(course._id || course.id || "");
}

export function getInstructorId(course) {
  const instructor = course?.instructorId;
  if (!instructor) return "";
  if (typeof instructor === "object") {
    return String(instructor._id || instructor.id || "");
  }
  return String(instructor);
}

export function getCourseLessons(course) {
  return Array.isArray(course?.lessonIds) ? course.lessonIds : [];
}

export function getCourseLevelLabel(level = "") {
  const normalized = String(level || "").trim().toLowerCase();
  if (!normalized) return "Beginner";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function getCoursePriceMeta(course) {
  const price = Number(course?.price || 0);
  const salePrice = Number(course?.salePrice || 0);
  const isFree = course?.isFree === true || price === 0;

  if (isFree) {
    return {
      isFree: true,
      displayPrice: "Free",
      originalPrice: "",
      finalPrice: 0,
    };
  }

  if (salePrice > 0) {
    return {
      isFree: false,
      displayPrice: `₫${salePrice.toLocaleString("vi-VN")}`,
      originalPrice: `₫${price.toLocaleString("vi-VN")}`,
      finalPrice: salePrice,
    };
  }

  return {
    isFree: false,
    displayPrice: `₫${price.toLocaleString("vi-VN")}`,
    originalPrice: "",
    finalPrice: price,
  };
}

export function makeCourseSlug(text = "") {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getYoutubeEmbedUrl(url = "") {
  if (!url) return "";

  if (url.includes("youtube.com/embed/")) return url;

  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return url;
}

export function isYouTubeUrl(url = "") {
  return /youtube\.com|youtu\.be/.test(url);
}

export function normalizeCourseItem(item = {}) {
  return {
    ...item,
    _id: getCourseId(item),
    id: getCourseId(item),
    title: item.title || "",
    slug: item.slug || "",
    shortDescription: item.shortDescription || "",
    description: item.description || "",
    category: item.category || "frontend",
    thumbnail: item.thumbnail || "",
    previewVideo: item.previewVideo || "",
    level: item.level || "beginner",
    language: item.language || "en",
    duration: Number(item.duration || 0),
    price: Number(item.price || 0),
    salePrice: Number(item.salePrice || 0),
    isFree: !!item.isFree,
    isPopular: !!item.isPopular,
    status: item.status || "draft",
    lessonIds: Array.isArray(item.lessonIds) ? item.lessonIds : [],
    totalEnrollments: Number(item.totalEnrollments || 0),
    totalReviews: Number(item.totalReviews || 0),
    rating: Number(item.rating || 0),
    analytics: item.analytics || {},
  };
}

export function normalizeCourseList(items = []) {
  if (!Array.isArray(items)) return [];
  return items.map(normalizeCourseItem);
}

export function buildCourseFormFromItem(item = {}) {
  const course = normalizeCourseItem(item);

  return {
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    description: course.description,
    category: course.category,
    thumbnail: course.thumbnail,
    previewVideo: course.previewVideo,
    level: course.level,
    language: course.language,
    duration: course.duration,
    price: course.price,
    salePrice: course.salePrice,
    isFree: course.isFree,
    isPopular: course.isPopular,
    status: course.status,
  };
}

export function getCoursePreviewImage(url) {
  return getSafeImage(url) || getFallbackCourseImage();
}

export function getCoursePreviewVideo(url) {
  return url && isYouTubeUrl(url) ? getYoutubeEmbedUrl(url) : "";
}

export function validateCourseForm(form) {
  if (!String(form?.title || "").trim()) {
    return "Course title is required";
  }

  if (!String(form?.shortDescription || "").trim()) {
    return "Short description is required";
  }

  return "";
}