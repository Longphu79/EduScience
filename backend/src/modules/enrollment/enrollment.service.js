import Enrollment from "./enrollment.model.js";
import Course from "../course/course.model.js";
import Quiz from "../quiz/quiz.model.js";
import QuizAttempt from "../quiz/quizAttempt.model.js";
import Assignment from "../assignment/assignment.model.js";
import AssignmentSubmission from "../assignment/assignmentSubmission.model.js";
import Certificate from "../certificate/certificate.model.js";
import ChatConversation from "../chat/chatConversation.model.js";

const lessonPopulateConfig = {
  path: "lessonIds",
  match: { isPublished: true },
  options: { sort: { order: 1, createdAt: 1 } },
};

async function getPublishedCourseWithLessons(courseId) {
  return Course.findById(courseId).populate(lessonPopulateConfig);
}

function toStringId(value) {
  return String(value?._id || value || "");
}

function calcProgress(totalLessons, completedLessonsCount) {
  if (!totalLessons || totalLessons <= 0) return 0;

  return Math.min(
    100,
    Math.round(
      (Number(completedLessonsCount || 0) / Number(totalLessons)) * 100
    )
  );
}

export const createEnrollmentRecord = async ({ studentId, courseId }) => {
  if (!studentId || !courseId) {
    throw new Error("studentId and courseId are required");
  }

  const existed = await Enrollment.findOne({ studentId, courseId });
  if (existed) {
    return existed;
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (course.status !== "published") {
    throw new Error("Course is not available for enrollment");
  }

  const enrollment = await Enrollment.create({
    studentId,
    courseId,
    progress: 0,
    completed: false,
    completedAt: null,
    completedLessons: [],
    lastLessonId: null,
  });

  await Course.findByIdAndUpdate(courseId, {
    $inc: { totalEnrollments: 1 },
  });

  return enrollment;
};

export const enrollCourse = async ({ studentId, courseId }) => {
  if (!studentId || !courseId) {
    throw new Error("studentId and courseId are required");
  }

  const existed = await Enrollment.findOne({ studentId, courseId });
  if (existed) {
    throw new Error("You already enrolled in this course");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (course.status !== "published") {
    throw new Error("Course is not available for enrollment");
  }

  if (String(course.instructorId) === String(studentId)) {
    throw new Error("Instructor cannot enroll in own course");
  }

  const isFreeCourse =
    course.isFree === true || Number(course.price || 0) === 0;

  if (!isFreeCourse) {
    throw new Error(
      "Paid course must be purchased through cart checkout before enrollment"
    );
  }

  return await createEnrollmentRecord({ studentId, courseId });
};

export const getStudentDashboardSummary = async (studentId) => {
  if (!studentId) {
    throw new Error("studentId is required");
  }

  const enrollments = await Enrollment.find({ studentId })
    .populate({
      path: "courseId",
      populate: [{ path: "instructorId" }, lessonPopulateConfig],
    })
    .sort({ updatedAt: -1 });

  const courseIds = enrollments
    .map((item) => item?.courseId?._id || item?.courseId)
    .filter(Boolean);

  const [quizzes, attempts, assignments, submissions, certificates] =
    await Promise.all([
      Quiz.find({ courseId: { $in: courseIds }, isPublished: true }).lean(),
      QuizAttempt.find({ studentId, courseId: { $in: courseIds } }).lean(),
      Assignment.find({
        courseId: { $in: courseIds },
        isPublished: true,
      }).lean(),
      AssignmentSubmission.find({
        studentId,
        courseId: { $in: courseIds },
      }).lean(),
      Certificate.find({ studentId, courseId: { $in: courseIds } }).lean(),
    ]);

  const totalEnrolledCourses = enrollments.length;

  const totalCompletedCourses = enrollments.filter(
    (item) => item.completed
  ).length;

  const totalInProgressCourses = enrollments.filter(
    (item) => !item.completed && Number(item.progress || 0) > 0
  ).length;

  const totalLessonCount = enrollments.reduce((sum, item) => {
    const lessons = Array.isArray(item?.courseId?.lessonIds)
      ? item.courseId.lessonIds.length
      : 0;

    return sum + lessons;
  }, 0);

  const totalCompletedLessons = enrollments.reduce((sum, item) => {
    const completed = Array.isArray(item?.completedLessons)
      ? item.completedLessons.length
      : 0;

    return sum + completed;
  }, 0);

  const attemptMap = new Map();
  attempts.forEach((item) => {
    const key = String(item.quizId);
    if (!attemptMap.has(key)) {
      attemptMap.set(key, true);
    }
  });

  const submissionMap = new Map();
  submissions.forEach((item) => {
    const key = String(item.assignmentId);
    if (!submissionMap.has(key)) {
      submissionMap.set(key, true);
    }
  });

  const pendingQuizCount = quizzes.filter(
    (quiz) => !attemptMap.has(String(quiz._id))
  ).length;

  const pendingAssignmentCount = assignments.filter(
    (assignment) => !submissionMap.has(String(assignment._id))
  ).length;

  const continueLearningCourses = enrollments
    .filter((item) => item?.courseId)
    .map((item) => ({
      enrollmentId: item._id,
      courseId: item.courseId?._id || item.courseId,
      title: item.courseId?.title || "Course",
      thumbnail: item.courseId?.thumbnail || "",
      shortDescription: item.courseId?.shortDescription || "",
      progress: Number(item.progress || 0),
      completed: !!item.completed,
      completedAt: item.completedAt || null,
      totalLessons: Array.isArray(item.courseId?.lessonIds)
        ? item.courseId.lessonIds.length
        : 0,
      completedLessons: Array.isArray(item.completedLessons)
        ? item.completedLessons.length
        : 0,
      lastLessonId: item.lastLessonId || null,
      updatedAt: item.updatedAt,
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6);

  return {
    totalEnrolledCourses,
    totalInProgressCourses,
    totalCompletedCourses,
    totalLessonCount,
    totalCompletedLessons,
    pendingQuizCount,
    pendingAssignmentCount,
    certificateCount: certificates.length,
    continueLearningCourses,
  };
};

export const getInstructorDashboardSummary = async (instructorId) => {
  if (!instructorId) {
    throw new Error("instructorId is required");
  }

  const courses = await Course.find({ instructorId })
    .populate({
      path: "lessonIds",
      options: { sort: { order: 1, createdAt: 1 } },
    })
    .sort({ createdAt: -1 })
    .lean();

  const courseIds = courses.map((item) => item._id);

  const [
    enrollments,
    quizzes,
    attempts,
    assignments,
    submissions,
    conversations,
  ] = await Promise.all([
    Enrollment.find({ courseId: { $in: courseIds } }).lean(),
    Quiz.find({ courseId: { $in: courseIds } }).lean(),
    QuizAttempt.find({ courseId: { $in: courseIds } }).lean(),
    Assignment.find({ courseId: { $in: courseIds } }).lean(),
    AssignmentSubmission.find({ courseId: { $in: courseIds } }).lean(),
    ChatConversation.find({ instructorId }).lean(),
  ]);

  const totalCourses = courses.length;

  const totalStudents = new Set(
    enrollments.map((item) => String(item.studentId))
  ).size;

  const enrollmentCountByCourse = new Map();

  enrollments.forEach((item) => {
    const key = String(item.courseId);
    enrollmentCountByCourse.set(
      key,
      (enrollmentCountByCourse.get(key) || 0) + 1
    );
  });

  const pendingQuizReviewCount = quizzes.reduce((sum, quiz) => {
    const hasAttempt = attempts.some(
      (attempt) => String(attempt.quizId) === String(quiz._id)
    );
    return sum + (hasAttempt ? 1 : 0);
  }, 0);

  const pendingAssignmentGradingCount = submissions.filter(
    (item) => item.status !== "graded"
  ).length;

  const unreadConversationCount = conversations.filter(
    (item) => Number(item.instructorUnreadCount || 0) > 0
  ).length;

  return {
    totalCourses,
    totalStudents,
    latestCourses: courses.slice(0, 5).map((course) => ({
      _id: course._id,
      title: course.title,
      thumbnail: course.thumbnail || "",
      category: course.category || "",
      createdAt: course.createdAt,
      totalLessons: Array.isArray(course.lessonIds)
        ? course.lessonIds.length
        : 0,
      totalEnrollments: enrollmentCountByCourse.get(String(course._id)) || 0,
    })),
    pendingQuizReviewCount,
    pendingAssignmentGradingCount,
    unreadConversationCount,
  };
};

export const getMyCourses = async (studentId) => {
  const enrollments = await Enrollment.find({ studentId })
    .populate({
      path: "courseId",
      populate: [{ path: "instructorId" }, lessonPopulateConfig],
    })
    .sort({ createdAt: -1 });

  return enrollments.filter((item) => item.courseId);
};

export const getInstructorCourses = async (instructorId) => {
  return Course.find({ instructorId })
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      options: { sort: { order: 1, createdAt: 1 } },
    })
    .sort({ createdAt: -1 });
};

export const getEnrollmentByStudentAndCourse = async (studentId, courseId) => {
  return Enrollment.findOne({ studentId, courseId }).populate({
    path: "courseId",
    populate: [{ path: "instructorId" }, lessonPopulateConfig],
  });
};

export const setCurrentLesson = async ({ studentId, courseId, lessonId }) => {
  if (!studentId || !courseId || !lessonId) {
    throw new Error("studentId, courseId and lessonId are required");
  }

  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  const course = await getPublishedCourseWithLessons(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  const lessonExists = Array.isArray(course.lessonIds)
    ? course.lessonIds.some(
        (lesson) => String(lesson._id) === String(lessonId)
      )
    : false;

  if (!lessonExists) {
    throw new Error("Lesson not found in this course");
  }

  enrollment.lastLessonId = lessonId;
  await enrollment.save();

  return Enrollment.findById(enrollment._id).populate({
    path: "courseId",
    populate: [{ path: "instructorId" }, lessonPopulateConfig],
  });
};

export const completeLesson = async ({ studentId, courseId, lessonId }) => {
  if (!studentId || !courseId || !lessonId) {
    throw new Error("studentId, courseId and lessonId are required");
  }

  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  const course = await getPublishedCourseWithLessons(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  const publishedLessons = Array.isArray(course.lessonIds)
    ? course.lessonIds
    : [];

  const lessonExists = publishedLessons.some(
    (lesson) => String(lesson._id) === String(lessonId)
  );

  if (!lessonExists) {
    throw new Error("Lesson not found in this course");
  }

  const lessonIdStr = String(lessonId);

  const existingCompletedIds = Array.isArray(enrollment.completedLessons)
    ? enrollment.completedLessons.map((item) => toStringId(item))
    : [];

  if (!existingCompletedIds.includes(lessonIdStr)) {
    enrollment.completedLessons.push(lessonId);
  }

  enrollment.lastLessonId = lessonId;

  const completedUniqueCount = new Set(
    enrollment.completedLessons.map((item) => toStringId(item))
  ).size;

  const totalLessons = publishedLessons.length;
  const progress = calcProgress(totalLessons, completedUniqueCount);

  enrollment.progress = progress;
  enrollment.completed =
    totalLessons > 0 && completedUniqueCount >= totalLessons;

  if (enrollment.completed && !enrollment.completedAt) {
    enrollment.completedAt = new Date();
  }

  if (!enrollment.completed) {
    enrollment.completedAt = null;
  }

  await enrollment.save();

  return Enrollment.findById(enrollment._id).populate({
    path: "courseId",
    populate: [{ path: "instructorId" }, lessonPopulateConfig],
  });
};

export const getStudentsByCourse = async (
  courseId,
  { requesterId, requesterRole } = {}
) => {
  if (!courseId) {
    throw new Error("courseId is required");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    throw new Error("Course not found");
  }

  if (
    requesterRole !== "admin" &&
    String(course.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to view students of this course");
  }

  return Enrollment.find({ courseId })
    .populate("studentId")
    .populate({
      path: "courseId",
      populate: [{ path: "instructorId" }, lessonPopulateConfig],
    })
    .sort({ createdAt: -1 });
};

export const getStudentProgressDetail = async (
  courseId,
  studentId,
  { requesterId, requesterRole } = {}
) => {
  if (!courseId || !studentId) {
    throw new Error("courseId and studentId are required");
  }

  const course = await Course.findById(courseId).populate(lessonPopulateConfig);
  if (!course) {
    throw new Error("Course not found");
  }

  if (
    requesterRole !== "admin" &&
    String(course.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to view student progress of this course");
  }

  const enrollment = await Enrollment.findOne({ courseId, studentId })
    .populate("studentId")
    .populate({
      path: "courseId",
      populate: [{ path: "instructorId" }, lessonPopulateConfig],
    });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  const quizAttempts = await QuizAttempt.find({ courseId, studentId })
    .populate("quizId")
    .sort({ createdAt: -1 });

  const assignmentSubmissions = await AssignmentSubmission.find({
    courseId,
    studentId,
  })
    .populate("assignmentId")
    .sort({ createdAt: -1 });

  const totalLessons = Array.isArray(course.lessonIds)
    ? course.lessonIds.length
    : 0;

  const completedLessonsCount = new Set(
    (enrollment.completedLessons || []).map((item) => toStringId(item))
  ).size;

  return {
    enrollment,
    totalLessons,
    completedLessonsCount,
    progressPercent: calcProgress(totalLessons, completedLessonsCount),
    isCompleted: totalLessons > 0 && completedLessonsCount >= totalLessons,
    quizAttempts,
    assignmentSubmissions,
  };
};