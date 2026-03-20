import Course from "./course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Material from "../material/material.model.js";
import Quiz from "../quiz/quiz.model.js";
import QuizAttempt from "../quiz/quizAttempt.model.js";
import Assignment from "../assignment/assignment.model.js";
import AssignmentSubmission from "../assignment/assignmentSubmission.model.js";

function roundNumber(value = 0) {
  return Math.round(Number(value) || 0);
}

function escapeRegex(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeLevel(value = "beginner") {
  const allowed = ["beginner", "intermediate", "advanced"];
  const normalized = String(value || "").toLowerCase().trim();
  return allowed.includes(normalized) ? normalized : "beginner";
}

function normalizeString(value = "", fallback = "") {
  const normalized = String(value || "").trim();
  return normalized || fallback;
}

function normalizeSlug(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-\s]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeSortValue(rawSort) {
  switch (rawSort) {
    case "popular":
      return { totalEnrollments: -1, createdAt: -1 };
    case "rating":
    case "highestRated":
      return { rating: -1, totalReviews: -1, createdAt: -1 };
    case "priceAsc":
    case "price-low":
      return { price: 1, createdAt: -1 };
    case "priceDesc":
    case "price-high":
      return { price: -1, createdAt: -1 };
    case "newest":
    default:
      return { createdAt: -1 };
  }
}

function normalizePagination(page, limit) {
  const safePage = Math.max(Number(page) || 1, 1);
  const safeLimit = Math.min(Math.max(Number(limit) || 9, 1), 50);

  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

function normalizeLessonIds(value) {
  return Array.isArray(value) ? value : [];
}

function normalizePriceValue(value, defaultValue = 0) {
  const num = Number(value);
  if (Number.isNaN(num) || num < 0) return defaultValue;
  return num;
}

function normalizeCourseCreatePayload(courseData = {}) {
  const payload = { ...courseData };

  delete payload._id;
  delete payload.totalEnrollments;
  delete payload.totalReviews;
  delete payload.rating;
  delete payload.analytics;
  delete payload.createdAt;
  delete payload.updatedAt;

  payload.title = normalizeString(payload.title);
  payload.slug = normalizeSlug(payload.slug);
  payload.shortDescription = normalizeString(payload.shortDescription);
  payload.description = normalizeString(payload.description);
  payload.category = normalizeString(payload.category, "General");
  payload.thumbnail = normalizeString(payload.thumbnail);
  payload.previewVideo = normalizeString(payload.previewVideo);
  payload.language = normalizeString(payload.language, "vi");
  payload.level = normalizeLevel(payload.level);

  payload.duration = Math.max(Number(payload.duration) || 0, 0);
  payload.price = normalizePriceValue(payload.price, 0);

  if (
    payload.salePrice === null ||
    payload.salePrice === undefined ||
    payload.salePrice === ""
  ) {
    payload.salePrice = null;
  } else {
    payload.salePrice = normalizePriceValue(payload.salePrice, 0);
  }

  payload.isFree = payload.isFree === true || Number(payload.price) === 0;

  if (payload.isFree) {
    payload.price = 0;
    payload.salePrice = 0;
  }

  payload.lessonIds = normalizeLessonIds(payload.lessonIds);
  payload.totalLessons = payload.lessonIds.length;

  return payload;
}

function normalizeCourseUpdatePayload(updateData = {}) {
  const payload = { ...updateData };

  delete payload._id;
  delete payload.instructorId;
  delete payload.totalEnrollments;
  delete payload.totalReviews;
  delete payload.rating;
  delete payload.analytics;
  delete payload.createdAt;
  delete payload.updatedAt;

  const normalized = {};

  if (payload.title !== undefined) {
    normalized.title = normalizeString(payload.title);
  }

  if (payload.slug !== undefined) {
    normalized.slug = normalizeSlug(payload.slug);
  }

  if (payload.shortDescription !== undefined) {
    normalized.shortDescription = normalizeString(payload.shortDescription);
  }

  if (payload.description !== undefined) {
    normalized.description = normalizeString(payload.description);
  }

  if (payload.category !== undefined) {
    normalized.category = normalizeString(payload.category, "General");
  }

  if (payload.thumbnail !== undefined) {
    normalized.thumbnail = normalizeString(payload.thumbnail);
  }

  if (payload.previewVideo !== undefined) {
    normalized.previewVideo = normalizeString(payload.previewVideo);
  }

  if (payload.language !== undefined) {
    normalized.language = normalizeString(payload.language, "vi");
  }

  if (payload.level !== undefined) {
    normalized.level = normalizeLevel(payload.level);
  }

  if (payload.duration !== undefined) {
    normalized.duration = Math.max(Number(payload.duration) || 0, 0);
  }

  if (payload.price !== undefined) {
    normalized.price = normalizePriceValue(payload.price, 0);
  }

  if (payload.salePrice !== undefined) {
    if (
      payload.salePrice === null ||
      payload.salePrice === "" ||
      payload.salePrice === undefined
    ) {
      normalized.salePrice = null;
    } else {
      normalized.salePrice = normalizePriceValue(payload.salePrice, 0);
    }
  }

  if (payload.isFree !== undefined || payload.price !== undefined) {
    const nextIsFree =
      payload.isFree === true ||
      (normalized.price !== undefined && Number(normalized.price) === 0);

    normalized.isFree = nextIsFree;

    if (nextIsFree) {
      normalized.price = 0;
      normalized.salePrice = 0;
    }
  }

  if (payload.lessonIds !== undefined) {
    normalized.lessonIds = normalizeLessonIds(payload.lessonIds);
    normalized.totalLessons = normalized.lessonIds.length;
  }

  if (payload.status !== undefined) {
    normalized.status = payload.status;
  }

  if (payload.isPopular !== undefined) {
    normalized.isPopular = !!payload.isPopular;
  }

  return normalized;
}

async function ensureUniqueSlug(slug, excludeCourseId = null) {
  if (!slug) return;

  const existingCourse = await Course.findOne({
    slug,
    ...(excludeCourseId ? { _id: { $ne: excludeCourseId } } : {}),
  });

  if (existingCourse) {
    throw new Error("Slug already exists");
  }
}

async function buildInstructorCourseAnalytics(courses = []) {
  if (!courses.length) return [];

  const courseIds = courses.map((course) => course._id);

  const [
    enrollments,
    materials,
    quizzes,
    quizAttempts,
    assignments,
    assignmentSubmissions,
  ] = await Promise.all([
    Enrollment.find({ courseId: { $in: courseIds } }).lean(),
    Material.find({ courseId: { $in: courseIds } }).lean(),
    Quiz.find({ courseId: { $in: courseIds } }).lean(),
    QuizAttempt.find({ courseId: { $in: courseIds } }).lean(),
    Assignment.find({ courseId: { $in: courseIds } }).lean(),
    AssignmentSubmission.find({ courseId: { $in: courseIds } }).lean(),
  ]);

  const enrollmentsByCourse = {};
  const materialsByCourse = {};
  const quizzesByCourse = {};
  const quizAttemptsByCourse = {};
  const assignmentsByCourse = {};
  const assignmentSubmissionsByCourse = {};

  for (const item of enrollments) {
    const key = String(item.courseId);
    if (!enrollmentsByCourse[key]) enrollmentsByCourse[key] = [];
    enrollmentsByCourse[key].push(item);
  }

  for (const item of materials) {
    const key = String(item.courseId);
    if (!materialsByCourse[key]) materialsByCourse[key] = [];
    materialsByCourse[key].push(item);
  }

  for (const item of quizzes) {
    const key = String(item.courseId);
    if (!quizzesByCourse[key]) quizzesByCourse[key] = [];
    quizzesByCourse[key].push(item);
  }

  for (const item of quizAttempts) {
    const key = String(item.courseId);
    if (!quizAttemptsByCourse[key]) quizAttemptsByCourse[key] = [];
    quizAttemptsByCourse[key].push(item);
  }

  for (const item of assignments) {
    const key = String(item.courseId);
    if (!assignmentsByCourse[key]) assignmentsByCourse[key] = [];
    assignmentsByCourse[key].push(item);
  }

  for (const item of assignmentSubmissions) {
    const key = String(item.courseId);
    if (!assignmentSubmissionsByCourse[key]) {
      assignmentSubmissionsByCourse[key] = [];
    }
    assignmentSubmissionsByCourse[key].push(item);
  }

  return courses.map((course) => {
    const courseId = String(course._id);

    const courseEnrollments = enrollmentsByCourse[courseId] || [];
    const courseMaterials = materialsByCourse[courseId] || [];
    const courseQuizzes = quizzesByCourse[courseId] || [];
    const courseQuizAttempts = quizAttemptsByCourse[courseId] || [];
    const courseAssignments = assignmentsByCourse[courseId] || [];
    const courseAssignmentSubmissions =
      assignmentSubmissionsByCourse[courseId] || [];

    const totalStudents = courseEnrollments.length;
    const totalMaterials = courseMaterials.length;
    const totalQuizzes = courseQuizzes.length;
    const totalAssignments = courseAssignments.length;
    const totalQuizAttempts = courseQuizAttempts.length;
    const totalAssignmentSubmissions = courseAssignmentSubmissions.length;

    const averageQuizScore = totalQuizAttempts
      ? roundNumber(
          courseQuizAttempts.reduce(
            (sum, item) => sum + (Number(item.score) || 0),
            0
          ) / totalQuizAttempts
        )
      : 0;

    const quizPassRate = totalQuizAttempts
      ? roundNumber(
          (courseQuizAttempts.filter((item) => item.passed).length /
            totalQuizAttempts) *
            100
        )
      : 0;

    const averageProgress = totalStudents
      ? roundNumber(
          courseEnrollments.reduce(
            (sum, item) => sum + (Number(item.progress) || 0),
            0
          ) / totalStudents
        )
      : 0;

    return {
      ...course,
      totalEnrollments: totalStudents,
      analytics: {
        totalStudents,
        totalLessons:
          course.totalLessons ||
          (Array.isArray(course.lessonIds) ? course.lessonIds.length : 0),
        totalMaterials,
        totalQuizzes,
        totalAssignments,
        totalQuizAttempts,
        averageQuizScore,
        quizPassRate,
        totalAssignmentSubmissions,
        averageProgress,
      },
    };
  });
}

export const getPopularCourses = async () => {
  return Course.find({
    isPopular: true,
    status: "published",
  })
    .sort({ totalEnrollments: -1, createdAt: -1 })
    .limit(6)
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const createCourse = async (courseData) => {
  const payload = normalizeCourseCreatePayload(courseData);

  if (!payload.instructorId) {
    throw new Error("Instructor ID is required");
  }

  if (!payload.title) {
    throw new Error("Title is required");
  }

  if (!payload.slug) {
    throw new Error("Slug is required");
  }

  if (!payload.shortDescription) {
    throw new Error("Short description is required");
  }

  await ensureUniqueSlug(payload.slug);

  return Course.create(payload);
};

export const getCourseById = async (courseId) => {
  return Course.findById(courseId)
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const getCourseBySlug = async (slug) => {
  return Course.findOne({
    slug,
    status: "published",
  })
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const getAllCourses = async (query = {}) => {
  const {
    search = "",
    category,
    level,
    pricing,
    instructorId,
    minRating,
    sortBy,
    sort,
    page,
    limit,
    status,
  } = query;

  const filter = {
    status: status || "published",
  };

  if (search?.trim()) {
    const keyword = escapeRegex(search.trim());
    filter.$or = [
      { title: { $regex: keyword, $options: "i" } },
      { shortDescription: { $regex: keyword, $options: "i" } },
      { description: { $regex: keyword, $options: "i" } },
      { category: { $regex: keyword, $options: "i" } },
      { level: { $regex: keyword, $options: "i" } },
    ];
  }

  if (category && category !== "All") {
    filter.category = { $regex: `^${escapeRegex(category)}$`, $options: "i" };
  }

  if (level && level !== "All") {
    filter.level = String(level).toLowerCase();
  }

  if (pricing === "free") {
    filter.isFree = true;
  }

  if (pricing === "paid") {
    filter.isFree = false;
  }

  if (instructorId) {
    filter.instructorId = instructorId;
  }

  if (minRating !== undefined && minRating !== null && minRating !== "") {
    filter.rating = { $gte: Number(minRating) || 0 };
  }

  const sortConfig = normalizeSortValue(sortBy || sort);
  const { page: safePage, limit: safeLimit, skip } = normalizePagination(
    page,
    limit
  );

  const [items, totalItems] = await Promise.all([
    Course.find(filter)
      .populate("instructorId")
      .sort(sortConfig)
      .skip(skip)
      .limit(safeLimit),
    Course.countDocuments(filter),
  ]);

  const totalPages = Math.max(Math.ceil(totalItems / safeLimit), 1);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems,
      totalPages,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
    },
    filters: {
      search,
      category: category || "All",
      level: level || "All",
      pricing: pricing || "all",
      instructorId: instructorId || "",
      minRating: minRating ?? "",
      sortBy: sortBy || sort || "newest",
    },
  };
};

export const getCoursesByInstructor = async (instructorId) => {
  const courses = await Course.find({ instructorId })
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      options: { sort: { order: 1, createdAt: 1 } },
    })
    .sort({ createdAt: -1 })
    .lean();

  return buildInstructorCourseAnalytics(courses);
};

export const getCourseLearningDetail = async (courseId) => {
  return Course.findById(courseId)
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const updateCourse = async (
  courseId,
  updateData,
  { requesterId, requesterRole } = {}
) => {
  const existingCourse = await Course.findById(courseId);

  if (!existingCourse) {
    throw new Error("Course not found");
  }

  if (
    requesterRole !== "admin" &&
    String(existingCourse.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to update this course");
  }

  const payload = normalizeCourseUpdatePayload(updateData);

  if (payload.slug) {
    await ensureUniqueSlug(payload.slug, courseId);
  }

  const updatedCourse = await Course.findByIdAndUpdate(courseId, payload, {
    new: true,
    runValidators: true,
  })
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      options: { sort: { order: 1, createdAt: 1 } },
    });

  return updatedCourse;
};

export const deleteCourse = async (
  courseId,
  { requesterId, requesterRole } = {}
) => {
  const existingCourse = await Course.findById(courseId);

  if (!existingCourse) {
    throw new Error("Course not found");
  }

  if (
    requesterRole !== "admin" &&
    String(existingCourse.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to delete this course");
  }

  const enrollmentCount = await Enrollment.countDocuments({ courseId });

  if (enrollmentCount > 0) {
    throw new Error("Cannot delete course that already has enrollments");
  }

  return Course.findByIdAndDelete(courseId);
};