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

function normalizeSortValue(rawSort) {
  switch (rawSort) {
    case "popular":
      return { totalEnrollments: -1, createdAt: -1 };
    case "rating":
      return { rating: -1, createdAt: -1 };
    case "priceAsc":
    case "price-low":
      return { price: 1, createdAt: -1 };
    case "priceDesc":
    case "price-high":
      return { price: -1, createdAt: -1 };
    case "newest":
      return { createdAt: -1 };
    default:
      return { createdAt: -1 };
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
  return await Course.find({
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
  const payload = { ...courseData };

  if (!payload.instructorId) {
    throw new Error("Instructor ID is required");
  }

  delete payload._id;
  delete payload.totalEnrollments;
  delete payload.totalReviews;
  delete payload.rating;

  if (payload.isFree) {
    payload.price = 0;
    payload.salePrice = 0;
  }

  if (!Array.isArray(payload.lessonIds)) {
    payload.lessonIds = [];
  }

  payload.totalLessons = payload.lessonIds.length;

  return await Course.create(payload);
};

export const getCourseById = async (courseId) => {
  return await Course.findById(courseId)
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const getCourseBySlug = async (slug) => {
  return await Course.findOne({
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
  const filter = {
    status: query.status || "published",
  };

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { category: { $regex: query.search, $options: "i" } },
      { level: { $regex: query.search, $options: "i" } },
    ];
  }

  if (query.category && query.category !== "All") {
    filter.category = { $regex: `^${query.category}$`, $options: "i" };
  }

  if (query.level && query.level !== "All") {
    filter.level = String(query.level).toLowerCase();
  }

  const sort = normalizeSortValue(query.sortBy || query.sort);

  return await Course.find(filter)
    .populate("instructorId")
    .sort(sort);
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

  return await buildInstructorCourseAnalytics(courses);
};

export const getCourseLearningDetail = async (courseId) => {
  return await Course.findById(courseId)
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

  const payload = { ...updateData };

  delete payload.instructorId;
  delete payload._id;
  delete payload.totalEnrollments;
  delete payload.totalReviews;
  delete payload.rating;

  if (payload.isFree) {
    payload.price = 0;
    payload.salePrice = 0;
  }

  if (Array.isArray(payload.lessonIds)) {
    payload.totalLessons = payload.lessonIds.length;
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

  return await Course.findByIdAndDelete(courseId);
};