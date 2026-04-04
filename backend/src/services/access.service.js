import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Instructor from "../models/Instructor.js";
import Lesson from "../models/Lesson.js";
import Order from "../models/Order.js";
import Student from "../models/Student.js";
import { createHttpError } from "../utils/httpError.js";

export const getInstructorProfileForActor = async (
  actor,
  providedInstructorId,
) => {
  if (!actor?.userId) {
    throw createHttpError(401, "Unauthorized");
  }

  if (actor.role === "admin") {
    if (!providedInstructorId) {
      throw createHttpError(400, "instructorId is required");
    }

    const instructor = await Instructor.findById(providedInstructorId);

    if (!instructor) {
      throw createHttpError(404, "Instructor profile not found");
    }

    return instructor;
  }

  if (actor.role !== "instructor") {
    throw createHttpError(403, "Instructor access required");
  }

  const instructor = await Instructor.findOne({ userId: actor.userId });

  if (!instructor) {
    throw createHttpError(403, "Instructor profile not found");
  }

  return instructor;
};

export const findStudentProfileForActor = async (actor) => {
  if (!actor?.userId || actor.role !== "student") {
    return null;
  }

  return await Student.findOne({ userId: actor.userId });
};

export const getStudentProfileForActor = async (actor) => {
  if (!actor?.userId) {
    throw createHttpError(401, "Unauthorized");
  }

  if (actor.role !== "student") {
    throw createHttpError(403, "Student access required");
  }

  const student = await findStudentProfileForActor(actor);

  if (!student) {
    throw createHttpError(403, "Student profile not found");
  }

  return student;
};

export const getEnrollmentForActor = async (courseId, actor) => {
  const student = await findStudentProfileForActor(actor);

  if (!student) {
    return null;
  }

  return await Enrollment.findOne({
    studentId: student._id,
    courseId,
  });
};

export const getEnrollmentMapForActor = async (courseIds, actor) => {
  if (!Array.isArray(courseIds) || courseIds.length === 0) {
    return new Map();
  }

  const student = await findStudentProfileForActor(actor);

  if (!student) {
    return new Map();
  }

  const enrollments = await Enrollment.find({
    studentId: student._id,
    courseId: { $in: courseIds },
  })
    .select("courseId progress completed updatedAt")
    .lean();

  return new Map(
    enrollments.map((enrollment) => [
      enrollment.courseId.toString(),
      enrollment,
    ]),
  );
};

export const canManageCourse = async (course, actor) => {
  if (!actor?.userId || !course) {
    return false;
  }

  if (actor.role === "admin") {
    return true;
  }

  if (actor.role !== "instructor") {
    return false;
  }

  const instructor = await Instructor.findOne({ userId: actor.userId }).select(
    "_id",
  );

  const courseInstructorId =
    course?.instructorId?._id?.toString() ?? course?.instructorId?.toString();

  return Boolean(
    instructor &&
      courseInstructorId &&
      courseInstructorId === instructor._id.toString(),
  );
};

export const assertCourseOwnership = async (courseId, actor) => {
  const course = await Course.findById(courseId);

  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  if (await canManageCourse(course, actor)) {
    return course;
  }

  throw createHttpError(403, "Forbidden");
};

export const assertLessonOwnership = async (lessonId, actor) => {
  const lesson = await Lesson.findById(lessonId);

  if (!lesson) {
    throw createHttpError(404, "Lesson not found");
  }

  await assertCourseOwnership(lesson.courseId, actor);

  return lesson;
};

export const assertOrderAccess = async (orderId, actor) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw createHttpError(404, "Order not found");
  }

  if (actor?.role === "admin" || order.userId.toString() === actor?.userId) {
    return order;
  }

  throw createHttpError(403, "Forbidden");
};

export const assertEnrollmentAccess = async (courseId, actor) => {
  const student = await getStudentProfileForActor(actor);
  const enrollment = await Enrollment.findOne({
    studentId: student._id,
    courseId,
  });

  if (!enrollment) {
    throw createHttpError(403, "Enrollment required");
  }

  return { student, enrollment };
};
