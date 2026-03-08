import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import "../models/Lesson.js";

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

export const getMyCourses = async (studentId) => {
  return await Enrollment.find({ studentId })
    .populate({
      path: "courseId",
      populate: [
        {
          path: "instructorId",
        },
        {
          path: "lessonIds",
          match: { isPublished: true },
          options: { sort: { order: 1, createdAt: 1 } },
        },
      ],
    })
    .sort({ createdAt: -1 });
};

export const getInstructorCourses = async (instructorId) => {
  return await Course.find({ instructorId })
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      options: { sort: { order: 1, createdAt: 1 } },
    })
    .sort({ createdAt: -1 });
};

export const getEnrollmentByStudentAndCourse = async (studentId, courseId) => {
  return await Enrollment.findOne({ studentId, courseId }).populate({
    path: "courseId",
    populate: [
      { path: "instructorId" },
      {
        path: "lessonIds",
        match: { isPublished: true },
        options: { sort: { order: 1, createdAt: 1 } },
      },
    ],
  });
};

export const setCurrentLesson = async ({ studentId, courseId, lessonId }) => {
  const enrollment = await Enrollment.findOne({ studentId, courseId });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  enrollment.lastLessonId = lessonId;
  await enrollment.save();

  return enrollment;
};

export const completeLesson = async ({ studentId, courseId, lessonId }) => {
  const enrollment = await Enrollment.findOne({ studentId, courseId }).populate({
    path: "courseId",
    populate: {
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  const lessonIdStr = String(lessonId);

  const existingCompletedIds = Array.isArray(enrollment.completedLessons)
    ? enrollment.completedLessons.map((item) => String(item))
    : [];

  if (!existingCompletedIds.includes(lessonIdStr)) {
    enrollment.completedLessons.push(lessonId);
  }

  enrollment.lastLessonId = lessonId;

  const totalLessons = enrollment.courseId?.lessonIds?.length || 0;
  const completedLessonsCount = enrollment.completedLessons.length;

  enrollment.progress =
    totalLessons > 0
      ? Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100))
      : 0;

  enrollment.completed =
    totalLessons > 0 && completedLessonsCount >= totalLessons;

  await enrollment.save();

  return await Enrollment.findById(enrollment._id).populate({
    path: "courseId",
    populate: [
      { path: "instructorId" },
      {
        path: "lessonIds",
        match: { isPublished: true },
        options: { sort: { order: 1, createdAt: 1 } },
      },
    ],
  });
};