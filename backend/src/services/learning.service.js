import mongoose from "mongoose";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";
import LessonNotebook from "../models/LessonNotebook.js";
import LessonProgress from "../models/LessonProgress.js";
import Review from "../models/Review.js";
import LearningReminder from "../models/LearningReminder.js";
import {
  assertEnrollmentAccess,
  getStudentProfileForActor,
} from "./access.service.js";
import {
  publicCourseSelect,
  publicInstructorPopulate,
} from "./course.public.js";
import { createHttpError } from "../utils/httpError.js";

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

const getValidObjectIds = (values = []) =>
  values.filter(isValidObjectId).map(toObjectId);

const buildProgressSummary = (lessons, completedLessonIds) => {
  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((lesson) =>
    completedLessonIds.has(lesson._id.toString()),
  ).length;
  const progress =
    totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const completed = totalLessons > 0 && completedLessons === totalLessons;
  const nextLesson = completed
    ? null
    : lessons.find((lesson) => !completedLessonIds.has(lesson._id.toString())) ??
      lessons[0] ??
      null;

  return {
    progress,
    completed,
    completedLessons,
    totalLessons,
    currentLessonId: nextLesson?._id ?? null,
  };
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

const buildCompletedLessonMap = (progressDocs) =>
  progressDocs.reduce((map, progress) => {
    const courseId = progress.courseId.toString();
    const lessonIds = map.get(courseId) ?? new Set();

    lessonIds.add(progress.lessonId.toString());
    map.set(courseId, lessonIds);

    return map;
  }, new Map());

const buildLessonsByCourseMap = (lessons) =>
  lessons.reduce((map, lesson) => {
    const courseId = lesson.courseId.toString();
    const courseLessons = map.get(courseId) ?? [];

    courseLessons.push(lesson);
    map.set(courseId, courseLessons);

    return map;
  }, new Map());

const buildNotebookMap = (docs) =>
  docs.reduce((map, notebook) => {
    map.set(notebook.lessonId.toString(), notebook);
    return map;
  }, new Map());

const buildBookmarkedLessonCounts = (docs) =>
  docs.reduce((map, notebook) => {
    const courseId = notebook.courseId.toString();
    map.set(courseId, (map.get(courseId) || 0) + 1);
    return map;
  }, new Map());

const buildReviewMap = (docs) =>
  docs.reduce((map, review) => {
    map.set(review.courseId.toString(), review);
    return map;
  }, new Map());

const buildCertificate = ({ course, enrollment, completedAt, student }) => {
  if (!enrollment?.completed) {
    return null;
  }

  const issuedAt = completedAt || enrollment.updatedAt || enrollment.enrolledAt || new Date();

  return {
    code: `EDU-${course._id.toString().slice(-6).toUpperCase()}-${student._id
      .toString()
      .slice(-6)
      .toUpperCase()}`,
    issuedAt,
    learnerName: student.name,
    courseTitle: course.title,
  };
};

const syncCourseReviewStats = async (courseId) => {
  const objectCourseId = new mongoose.Types.ObjectId(courseId);
  const [stats] = await Review.aggregate([
    { $match: { courseId: objectCourseId } },
    {
      $group: {
        _id: "$courseId",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  await Course.findByIdAndUpdate(courseId, {
    rating: Number((stats?.averageRating ?? 0).toFixed(1)),
    totalReviews: stats?.totalReviews ?? 0,
  });
};

export const getMyCourses = async (actor) => {
  const student = await getStudentProfileForActor(actor);
  const enrollments = await Enrollment.find({ studentId: student._id })
    .sort({ updatedAt: -1 })
    .lean();

  if (enrollments.length === 0) {
    return [];
  }

  const courseIds = enrollments.map((enrollment) => enrollment.courseId);
  const reminderCourseIds = getValidObjectIds(courseIds);
  const [courses, lessons, progressDocs, bookmarkedNotebooks, reviews, reminders] =
    await Promise.all([
      Course.find({
        _id: { $in: courseIds },
        status: "published",
      })
        .select(publicCourseSelect)
        .populate(publicInstructorPopulate)
        .lean(),
      Lesson.find({
        courseId: { $in: courseIds },
        isPublished: true,
      })
        .select("_id courseId order title")
        .sort({ courseId: 1, order: 1 })
        .lean(),
      LessonProgress.find({
        studentId: student._id,
        courseId: { $in: courseIds },
      })
        .select("courseId lessonId")
        .lean(),
      LessonNotebook.find({
        studentId: student._id,
        courseId: { $in: courseIds },
        isBookmarked: true,
      })
        .select("courseId lessonId")
        .lean(),
      Review.find({
        studentId: student._id,
        courseId: { $in: courseIds },
      })
        .select("courseId rating comment updatedAt")
        .lean(),
      reminderCourseIds.length === 0
        ? Promise.resolve([])
        : LearningReminder.find({
            studentId: student._id,
            courseId: { $in: reminderCourseIds },
          })
            .select("courseId remindAt message acknowledged")
            .lean(),
    ]);

  const courseMap = new Map(
    courses.map((course) => [course._id.toString(), course]),
  );
  const lessonsByCourse = buildLessonsByCourseMap(lessons);
  const completedLessonsByCourse = buildCompletedLessonMap(progressDocs);
  const bookmarkedLessonsByCourse = buildBookmarkedLessonCounts(bookmarkedNotebooks);
  const reviewMap = buildReviewMap(reviews);

  const reminderMap = reminders.reduce((map, reminder) => {
    const key = reminder.courseId.toString();
    const existing = map.get(key);
    if (!existing || reminder.remindAt < existing.remindAt) {
      map.set(key, reminder);
    }

    return map;
  }, new Map());

  return enrollments
    .map((enrollment) => {
      const course = courseMap.get(enrollment.courseId.toString());

      if (!course) {
        return null;
      }

      const publishedLessons =
        lessonsByCourse.get(enrollment.courseId.toString()) ?? [];
      const completedLessonIds =
        completedLessonsByCourse.get(enrollment.courseId.toString()) ??
        new Set();
      const summary = buildProgressSummary(
        publishedLessons,
        completedLessonIds,
      );
      const nextLesson = publishedLessons.find(
        (lesson) => lesson._id.toString() === summary.currentLessonId?.toString(),
      );
      const review = reviewMap.get(enrollment.courseId.toString()) || null;

      return {
        enrollmentId: enrollment._id,
        progress: summary.progress,
        completed: summary.completed,
        completedLessons: summary.completedLessons,
        totalLessons: summary.totalLessons,
        currentLessonId: summary.currentLessonId,
        lastActivityAt: enrollment.updatedAt,
        nextLessonTitle: nextLesson?.title ?? null,
        bookmarkedLessons:
          bookmarkedLessonsByCourse.get(enrollment.courseId.toString()) ?? 0,
        review,
        certificate: buildCertificate({
          course,
          enrollment: {
            ...enrollment,
            completed: summary.completed,
          },
          completedAt: enrollment.updatedAt,
          student,
        }),
        reminder: reminderMap.get(enrollment.courseId.toString()) ?? null,
        course,
      };
    })
    .filter(Boolean);
};

export const getLearningCourseBySlug = async (slug, actor) => {
  const student = await getStudentProfileForActor(actor);
  const course = await Course.findOne({
    slug,
    status: "published",
  })
    .select(publicCourseSelect)
    .populate(publicInstructorPopulate)
    .lean();

  if (!course) {
    throw createHttpError(404, "Course not found");
  }

  const enrollment = await Enrollment.findOne({
    studentId: student._id,
    courseId: course._id,
  }).lean();

  if (!enrollment) {
    throw createHttpError(403, "Enrollment required");
  }

  const [lessons, progressDocs, notebooks, review, reminder] = await Promise.all([
    Lesson.find({
      courseId: course._id,
      isPublished: true,
    })
      .select(
        "title description videoUrl duration estimatedCompletionMinutes objectives notes resources order isPreview courseId",
      )
      .sort({ order: 1 })
      .lean(),
    LessonProgress.find({
      studentId: student._id,
      courseId: course._id,
    })
      .select("lessonId completedAt")
      .lean(),
    LessonNotebook.find({
      studentId: student._id,
      courseId: course._id,
    })
      .select("lessonId note isBookmarked updatedAt")
      .lean(),
    Review.findOne({
      studentId: student._id,
      courseId: course._id,
    })
      .select("rating comment updatedAt")
      .lean(),
    isValidObjectId(course._id)
      ? LearningReminder.findOne({
          studentId: student._id,
          courseId: toObjectId(course._id),
        })
          .select("remindAt message acknowledged")
          .sort({ remindAt: 1 })
          .lean()
      : Promise.resolve(null),
  ]);

  const completedLessonIds = new Set(
    progressDocs.map((progress) => progress.lessonId.toString()),
  );
  const summary = buildProgressSummary(lessons, completedLessonIds);
  const notebookMap = buildNotebookMap(notebooks);
  const unlockedLessonIds = buildUnlockedLessonIds(lessons, completedLessonIds);
  const completedAt = progressDocs
    .map((progress) => progress.completedAt)
    .filter(Boolean)
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return {
    course: {
      ...course,
      viewerEnrollment: {
        isEnrolled: true,
        progress: summary.progress,
        completed: summary.completed,
      },
    },
    enrollment: summary,
    review,
    certificate: buildCertificate({
      course,
      enrollment: {
        ...enrollment,
        completed: summary.completed,
      },
      completedAt,
      student,
    }),
    reminder: reminder ?? null,
    retention: {
      bookmarkedLessons: notebooks.filter((item) => item.isBookmarked).length,
      canReview: summary.completed,
    },
    lessons: lessons.map((lesson) => ({
      ...lesson,
      isCompleted: completedLessonIds.has(lesson._id.toString()),
      isUnlocked: unlockedLessonIds.has(lesson._id.toString()),
      studentNote: notebookMap.get(lesson._id.toString())?.note ?? "",
      isBookmarked: Boolean(
        notebookMap.get(lesson._id.toString())?.isBookmarked,
      ),
      noteUpdatedAt: notebookMap.get(lesson._id.toString())?.updatedAt ?? null,
    })),
  };
};

export const updateLessonProgress = async (
  courseId,
  lessonId,
  actor,
  completedValue = true,
) => {
  const { student, enrollment } = await assertEnrollmentAccess(courseId, actor);
  const lesson = await Lesson.findOne({
    _id: lessonId,
    courseId,
    isPublished: true,
  })
    .select("_id")
    .lean();

  if (!lesson) {
    throw createHttpError(404, "Lesson not found");
  }

  const publishedLessons = await Lesson.find({
    courseId,
    isPublished: true,
  })
    .select("_id order")
    .sort({ order: 1 })
    .lean();

  const existingProgressDocs = await LessonProgress.find({
    studentId: student._id,
    courseId,
  })
    .select("lessonId")
    .lean();
  const existingCompletedLessonIds = new Set(
    existingProgressDocs.map((progress) => progress.lessonId.toString()),
  );
  const unlockedLessonIds = buildUnlockedLessonIds(
    publishedLessons,
    existingCompletedLessonIds,
  );

  if (completedValue && !unlockedLessonIds.has(lessonId.toString())) {
    throw createHttpError(403, "Complete the previous lesson first");
  }

  if (completedValue) {
    await LessonProgress.findOneAndUpdate(
      {
        studentId: student._id,
        courseId,
        lessonId,
      },
      {
        studentId: student._id,
        courseId,
        lessonId,
        completedAt: new Date(),
        lastViewedAt: new Date(),
      },
      { upsert: true, new: true },
    );
  } else {
    await LessonProgress.findOneAndDelete({
      studentId: student._id,
      courseId,
      lessonId,
    });
  }

  const progressDocs = await LessonProgress.find({
    studentId: student._id,
    courseId,
  })
    .select("lessonId")
    .lean();
  const completedLessonIds = new Set(
    progressDocs.map((progress) => progress.lessonId.toString()),
  );
  const summary = buildProgressSummary(publishedLessons, completedLessonIds);

  await Enrollment.findByIdAndUpdate(enrollment._id, {
    progress: summary.progress,
    completed: summary.completed,
  });

  return {
    courseId,
    lessonId,
    completed: completedLessonIds.has(lessonId.toString()),
    progress: summary.progress,
    completedLessons: summary.completedLessons,
    totalLessons: summary.totalLessons,
    courseCompleted: summary.completed,
    currentLessonId: summary.currentLessonId,
  };
};

export const upsertLessonNotebook = async (
  courseId,
  lessonId,
  actor,
  notebookData = {},
) => {
  const { student } = await assertEnrollmentAccess(courseId, actor);
  const lesson = await Lesson.findOne({
    _id: lessonId,
    courseId,
    isPublished: true,
  })
    .select("_id title")
    .lean();

  if (!lesson) {
    throw createHttpError(404, "Lesson not found");
  }

  const note = typeof notebookData.note === "string" ? notebookData.note.trim() : "";
  const isBookmarked = Boolean(notebookData.isBookmarked);

  if (!note && !isBookmarked) {
    await LessonNotebook.findOneAndDelete({
      studentId: student._id,
      courseId,
      lessonId,
    });

    return {
      lessonId,
      note: "",
      isBookmarked: false,
      noteUpdatedAt: null,
    };
  }

  const notebook = await LessonNotebook.findOneAndUpdate(
    {
      studentId: student._id,
      courseId,
      lessonId,
    },
    {
      studentId: student._id,
      courseId,
      lessonId,
      note,
      isBookmarked,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  return {
    lessonId,
    note: notebook.note,
    isBookmarked: notebook.isBookmarked,
    noteUpdatedAt: notebook.updatedAt,
  };
};

export const upsertCourseReview = async (courseId, actor, reviewData = {}) => {
  const { student, enrollment } = await assertEnrollmentAccess(courseId, actor);

  if (!enrollment.completed) {
    throw createHttpError(403, "Complete the course before reviewing it");
  }

  const rating = Number.parseInt(reviewData.rating, 10);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createHttpError(400, "Rating must be between 1 and 5");
  }

  const comment =
    typeof reviewData.comment === "string" ? reviewData.comment.trim() : "";

  const review = await Review.findOneAndUpdate(
    {
      studentId: student._id,
      courseId,
    },
    {
      studentId: student._id,
      courseId,
      rating,
      comment,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();

  await syncCourseReviewStats(courseId);

  return {
    rating: review.rating,
    comment: review.comment,
    updatedAt: review.updatedAt,
  };
};
