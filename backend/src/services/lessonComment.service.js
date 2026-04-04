import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import Lesson from "../models/Lesson.js";
import LessonComment from "../models/LessonComment.js";
import LessonProgress from "../models/LessonProgress.js";
import Student from "../models/Student.js";
import User from "../models/User.js";
import {
  canManageCourse,
  findStudentProfileForActor,
  getEnrollmentForActor,
} from "./access.service.js";
import { createHttpError } from "../utils/httpError.js";

const getLessonCoursePair = async (lessonId) => {
  const lesson = await Lesson.findById(lessonId).lean();

  if (!lesson) {
    throw createHttpError(404, "Lesson not found");
  }

  const course = await Course.findById(lesson.courseId);

  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  return { lesson, course };
};

const buildUnlockedLessonIds = (lessons, completedLessonIds) => {
  const unlockedLessonIds = new Set();
  let allPreviousLessonsCompleted = true;

  [...lessons]
    .sort(
      (left, right) =>
        Number(left.order || 0) - Number(right.order || 0),
    )
    .forEach((lesson) => {
      const lessonId = lesson._id.toString();

      if (allPreviousLessonsCompleted) {
        unlockedLessonIds.add(lessonId);
      }

      if (!completedLessonIds.has(lessonId)) {
        allPreviousLessonsCompleted = false;
      }
    });

  return unlockedLessonIds;
};

const assertLessonDiscussionReadAccess = async (lessonId, actor) => {
  const { lesson, course } = await getLessonCoursePair(lessonId);

  if (await canManageCourse(course, actor)) {
    return { lesson, course };
  }

  if (!lesson.isPublished || course.status !== "published") {
    throw createHttpError(404, "Lesson not found");
  }

  const enrollment = await getEnrollmentForActor(course._id, actor);

  if (!enrollment && !lesson.isPreview) {
    throw createHttpError(403, "Enrollment required");
  }

  return { lesson, course };
};

const assertLessonDiscussionWriteAccess = async (lessonId, actor) => {
  const { lesson, course } = await assertLessonDiscussionReadAccess(lessonId, actor);

  if (await canManageCourse(course, actor)) {
    return { lesson, course };
  }

  const student = await findStudentProfileForActor(actor);

  if (!student) {
    throw createHttpError(401, "Unauthorized");
  }

  const [publishedLessons, progressDocs] = await Promise.all([
    Lesson.find({
      courseId: course._id,
      isPublished: true,
    })
      .select("_id order")
      .sort({ order: 1 })
      .lean(),
    LessonProgress.find({
      studentId: student._id,
      courseId: course._id,
    })
      .select("lessonId")
      .lean(),
  ]);

  const completedLessonIds = new Set(
    progressDocs.map((progress) => progress.lessonId.toString()),
  );
  const unlockedLessonIds = buildUnlockedLessonIds(
    publishedLessons,
    completedLessonIds,
  );

  if (!unlockedLessonIds.has(lesson._id.toString())) {
    throw createHttpError(403, "Complete the previous lesson first");
  }

  return { lesson, course };
};

const buildAuthorProfile = async (actor) => {
  const user = await User.findById(actor.userId).select("username avatarUrl role");

  if (!user) {
    throw createHttpError(401, "Unauthorized");
  }

  if (user.role === "student") {
    const student = await Student.findOne({ userId: user._id }).select("fullName");
    return {
      authorRole: "student",
      authorDisplayName: student?.fullName?.trim() || user.username,
      authorAvatarUrl: user.avatarUrl,
    };
  }

  if (user.role === "instructor") {
    const instructor = await Instructor.findOne({ userId: user._id }).select("name");
    return {
      authorRole: "instructor",
      authorDisplayName: instructor?.name?.trim() || user.username,
      authorAvatarUrl: user.avatarUrl,
    };
  }

  return {
    authorRole: "admin",
    authorDisplayName: user.username,
    authorAvatarUrl: user.avatarUrl,
  };
};

export const listLessonComments = async (lessonId, actor) => {
  const { lesson, course } = await assertLessonDiscussionReadAccess(lessonId, actor);
  const isManager = await canManageCourse(course, actor);

  const query = LessonComment.find({ lessonId })
    .sort({ createdAt: -1 })
    .select("authorRole authorDisplayName authorAvatarUrl body createdAt");

  if (!isManager && !actor?.userId) {
    query.limit(3);
  }

  if (!isManager && !lesson.isPreview) {
    query.limit(6);
  }

  return await query.lean();
};

export const createLessonComment = async (lessonId, commentData, actor) => {
  const { lesson } = await assertLessonDiscussionWriteAccess(lessonId, actor);
  const body = commentData.body?.trim();

  if (!body) {
    throw createHttpError(400, "Comment body is required");
  }

  const author = await buildAuthorProfile(actor);

  return await LessonComment.create({
    lessonId: lesson._id,
    courseId: lesson.courseId,
    authorUserId: actor.userId,
    authorRole: author.authorRole,
    authorDisplayName: author.authorDisplayName,
    authorAvatarUrl: author.authorAvatarUrl,
    body,
  });
};
