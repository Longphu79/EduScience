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
  const courses = await Course.find({
    isPopular: true,
    status: "published",
  })
    .sort({ totalEnrollments: -1 })
    .limit(6)
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });

  return courses;
};

export const createCourse = async (courseData) => {
  const payload = { ...courseData };

  if (payload.isFree) {
    payload.price = 0;
    payload.salePrice = 0;
  }

  if (Array.isArray(payload.lessonIds)) {
    payload.totalLessons = payload.lessonIds.length;
  } else {
    payload.lessonIds = [];
    payload.totalLessons = 0;
  }

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
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  } else {
    filter.status = "published";
  }

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

  let sort = { createdAt: -1 };

  switch (query.sortBy) {
    case "popular":
      sort = { totalEnrollments: -1, createdAt: -1 };
      break;
    case "rating":
      sort = { rating: -1, createdAt: -1 };
      break;
    case "priceAsc":
      sort = { price: 1, createdAt: -1 };
      break;
    case "priceDesc":
      sort = { price: -1, createdAt: -1 };
      break;
    case "newest":
      sort = { createdAt: -1 };
      break;
    default:
      sort = { createdAt: -1 };
      break;
  }

  return await Course.find(filter).populate("instructorId").sort(sort);
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
  return await Course.findById(courseId)
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const updateCourse = async (courseId, updateData) => {
  const payload = { ...updateData };

  if (payload.isFree) {
    payload.price = 0;
    payload.salePrice = 0;
  }

  if (Array.isArray(payload.lessonIds)) {
    payload.totalLessons = payload.lessonIds.length;
  }

  return await Course.findByIdAndUpdate(courseId, payload, {
    new: true,
  })
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const deleteCourse = async (courseId) => {
  return await Course.findByIdAndDelete(courseId);
};