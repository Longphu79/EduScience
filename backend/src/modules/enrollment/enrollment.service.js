import Enrollment from "./enrollment.model.js";
import Course from "../course/course.model.js";
import QuizAttempt from "../quiz/quizAttempt.model.js";
import AssignmentSubmission from "../assignment/assignmentSubmission.model.js";

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
    Math.round((Number(completedLessonsCount || 0) / Number(totalLessons)) * 100)
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

  const isFreeCourse =
    course.isFree === true || Number(course.price || 0) === 0;

  if (!isFreeCourse) {
    throw new Error(
      "Paid course must be purchased through cart checkout before enrollment"
    );
  }

  return await createEnrollmentRecord({ studentId, courseId });
};

export const getMyCourses = async (studentId) => {
  return Enrollment.find({ studentId })
    .populate({
      path: "courseId",
      populate: [{ path: "instructorId" }, lessonPopulateConfig],
    })
    .sort({ createdAt: -1 });
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

  const publishedLessons = Array.isArray(course.lessonIds) ? course.lessonIds : [];
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
  enrollment.completed = totalLessons > 0 && completedUniqueCount >= totalLessons;

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

  const totalLessons = Array.isArray(course.lessonIds) ? course.lessonIds.length : 0;
  const completedLessonsCount = new Set(
    (enrollment.completedLessons || []).map((item) => toStringId(item))
  ).size;

  return {
    enrollment,
    totalLessons,
    completedLessonsCount,
    progressPercent: calcProgress(totalLessons, completedLessonsCount),
    isCompleted:
      totalLessons > 0 && completedLessonsCount >= totalLessons,
    quizAttempts,
    assignmentSubmissions,
  };
};