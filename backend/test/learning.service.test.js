import assert from "node:assert/strict";
import { afterEach, test, mock } from "node:test";

import Course from "../src/models/Course.js";
import Enrollment from "../src/models/Enrollment.js";
import Lesson from "../src/models/Lesson.js";
import LessonNotebook from "../src/models/LessonNotebook.js";
import LessonProgress from "../src/models/LessonProgress.js";
import Review from "../src/models/Review.js";
import Student from "../src/models/Student.js";
import {
  getLearningCourseBySlug,
  getMyCourses,
  updateLessonProgress,
  upsertCourseReview,
  upsertLessonNotebook,
} from "../src/services/learning.service.js";
import { makeQuery } from "./helpers/query.js";

afterEach(() => {
  mock.restoreAll();
});

test("getMyCourses returns an empty list when the student has no enrollments", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "find", () => makeQuery([]));

  const result = await getMyCourses({
    userId: "user-1",
    role: "student",
  });

  assert.deepEqual(result, []);
});

test("getMyCourses returns zero progress when a published course has no lessons yet", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "find", () =>
    makeQuery([
      {
        _id: "enrollment-1",
        courseId: "course-1",
        updatedAt: new Date("2026-04-04T08:00:00Z"),
      },
    ]),
  );
  mock.method(Course, "find", () =>
    makeQuery([
      {
        _id: "course-1",
        title: "Physics",
      },
    ]),
  );
  mock.method(Lesson, "find", () => makeQuery([]));
  mock.method(LessonProgress, "find", () => makeQuery([]));
  mock.method(LessonNotebook, "find", () => makeQuery([]));
  mock.method(Review, "find", () => makeQuery([]));

  const [result] = await getMyCourses({
    userId: "user-1",
    role: "student",
  });

  assert.equal(result.progress, 0);
  assert.equal(result.completed, false);
  assert.equal(result.completedLessons, 0);
  assert.equal(result.totalLessons, 0);
  assert.equal(result.currentLessonId, null);
});

test("getMyCourses computes progress and skips enrollments whose courses are no longer published", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "find", () =>
    makeQuery([
      {
        _id: "enrollment-1",
        courseId: "course-1",
        updatedAt: new Date("2026-04-04T10:00:00Z"),
      },
      {
        _id: "enrollment-2",
        courseId: "course-2",
        updatedAt: new Date("2026-04-03T10:00:00Z"),
      },
    ]),
  );
  mock.method(Course, "find", () =>
    makeQuery([
      {
        _id: "course-1",
        title: "Physics",
      },
    ]),
  );
  mock.method(Lesson, "find", () =>
    makeQuery([
      {
        _id: "lesson-1",
        courseId: "course-1",
        order: 1,
        title: "Intro",
      },
      {
        _id: "lesson-2",
        courseId: "course-1",
        order: 2,
        title: "Deep Dive",
      },
    ]),
  );
  mock.method(LessonProgress, "find", () =>
    makeQuery([
      {
        courseId: "course-1",
        lessonId: "lesson-1",
      },
    ]),
  );
  mock.method(LessonNotebook, "find", () =>
    makeQuery([{ courseId: "course-1", lessonId: "lesson-2" }]),
  );
  mock.method(Review, "find", () =>
    makeQuery([
      {
        courseId: "course-1",
        rating: 4,
        comment: "Good course",
      },
    ]),
  );

  const result = await getMyCourses({
    userId: "user-1",
    role: "student",
  });

  assert.equal(result.length, 1);
  assert.equal(result[0].progress, 50);
  assert.equal(result[0].completed, false);
  assert.equal(result[0].completedLessons, 1);
  assert.equal(result[0].totalLessons, 2);
  assert.equal(result[0].currentLessonId, "lesson-2");
  assert.equal(result[0].nextLessonTitle, "Deep Dive");
  assert.equal(result[0].bookmarkedLessons, 1);
  assert.equal(result[0].review.rating, 4);
  assert.equal(result[0].certificate, null);
});

test("getLearningCourseBySlug rejects missing published courses", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Course, "findOne", () => makeQuery(null));
  mock.method(LessonNotebook, "find", () => makeQuery([]));
  mock.method(Review, "findOne", () => makeQuery(null));

  await assert.rejects(
    () =>
      getLearningCourseBySlug("missing-course", {
        userId: "user-1",
        role: "student",
      }),
    {
      message: "Course not found",
      statusCode: 404,
    },
  );
});

test("getLearningCourseBySlug rejects students who are not enrolled", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Course, "findOne", () =>
    makeQuery({
      _id: "course-1",
      slug: "physics",
      title: "Physics",
    }),
  );
  mock.method(Enrollment, "findOne", () => makeQuery(null));
  mock.method(LessonNotebook, "find", () => makeQuery([]));
  mock.method(Review, "findOne", () => makeQuery(null));

  await assert.rejects(
    () =>
      getLearningCourseBySlug("physics", {
        userId: "user-1",
        role: "student",
      }),
    {
      message: "Enrollment required",
      statusCode: 403,
    },
  );
});

test("getLearningCourseBySlug returns completed state with no current lesson once all lessons are done", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Course, "findOne", () =>
    makeQuery({
      _id: "course-1",
      slug: "physics",
      title: "Physics",
    }),
  );
  mock.method(Enrollment, "findOne", () =>
    makeQuery({
      _id: "enrollment-1",
      completed: true,
      updatedAt: new Date("2026-04-04T09:30:00Z"),
    }),
  );
  mock.method(Lesson, "find", () =>
    makeQuery([
      {
        _id: "lesson-1",
        courseId: "course-1",
        order: 1,
        title: "Intro",
      },
      {
        _id: "lesson-2",
        courseId: "course-1",
        order: 2,
        title: "Summary",
      },
    ]),
  );
  mock.method(LessonProgress, "find", () =>
    makeQuery([
      {
        lessonId: "lesson-1",
        completedAt: new Date("2026-04-04T08:00:00Z"),
      },
      {
        lessonId: "lesson-2",
        completedAt: new Date("2026-04-04T09:00:00Z"),
      },
    ]),
  );
  mock.method(LessonNotebook, "find", () =>
    makeQuery([
      {
        lessonId: "lesson-1",
        note: "Revisit the intro summary.",
        isBookmarked: true,
        updatedAt: new Date("2026-04-04T08:15:00Z"),
      },
    ]),
  );
  mock.method(Review, "findOne", () =>
    makeQuery({
      rating: 5,
      comment: "Excellent finished course",
    }),
  );

  const result = await getLearningCourseBySlug("physics", {
    userId: "user-1",
    role: "student",
  });

  assert.equal(result.course.viewerEnrollment.isEnrolled, true);
  assert.equal(result.course.viewerEnrollment.progress, 100);
  assert.equal(result.course.viewerEnrollment.completed, true);
  assert.equal(result.enrollment.progress, 100);
  assert.equal(result.enrollment.completed, true);
  assert.equal(result.enrollment.currentLessonId, null);
  assert.equal(result.lessons.every((lesson) => lesson.isCompleted), true);
  assert.equal(result.lessons.every((lesson) => lesson.isUnlocked), true);
  assert.equal(result.lessons[0].studentNote, "Revisit the intro summary.");
  assert.equal(result.lessons[0].isBookmarked, true);
  assert.equal(result.retention.bookmarkedLessons, 1);
  assert.equal(result.retention.canReview, true);
  assert.equal(result.review.rating, 5);
  assert.equal(result.certificate.courseTitle, "Physics");
  assert.match(result.certificate.code, /^EDU-/);
});

test("getLearningCourseBySlug only unlocks the next lesson in sequence", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Course, "findOne", () =>
    makeQuery({
      _id: "course-1",
      slug: "physics",
      title: "Physics",
    }),
  );
  mock.method(Enrollment, "findOne", () =>
    makeQuery({
      _id: "enrollment-1",
      completed: false,
      updatedAt: new Date("2026-04-04T09:30:00Z"),
    }),
  );
  mock.method(Lesson, "find", () =>
    makeQuery([
      { _id: "lesson-1", courseId: "course-1", order: 1, title: "Intro" },
      { _id: "lesson-2", courseId: "course-1", order: 2, title: "Motion" },
      { _id: "lesson-3", courseId: "course-1", order: 3, title: "Energy" },
    ]),
  );
  mock.method(LessonProgress, "find", () =>
    makeQuery([{ lessonId: "lesson-1", completedAt: new Date("2026-04-04T08:00:00Z") }]),
  );
  mock.method(LessonNotebook, "find", () => makeQuery([]));
  mock.method(Review, "findOne", () => makeQuery(null));

  const result = await getLearningCourseBySlug("physics", {
    userId: "user-1",
    role: "student",
  });

  assert.equal(result.enrollment.currentLessonId, "lesson-2");
  assert.equal(result.lessons[0].isUnlocked, true);
  assert.equal(result.lessons[1].isUnlocked, true);
  assert.equal(result.lessons[2].isUnlocked, false);
});

test("updateLessonProgress rejects missing published lessons", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => ({ _id: "enrollment-1" }));
  mock.method(Lesson, "findOne", () => makeQuery(null));

  await assert.rejects(
    () =>
      updateLessonProgress(
        "course-1",
        "lesson-1",
        { userId: "user-1", role: "student" },
        true,
      ),
    {
      message: "Lesson not found",
      statusCode: 404,
    },
  );
});

test("updateLessonProgress marks a lesson complete and syncs enrollment progress", async () => {
  const lessonProgressUpdates = [];
  const enrollmentUpdates = [];

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => ({ _id: "enrollment-1" }));
  mock.method(Lesson, "findOne", () => makeQuery({ _id: "lesson-1" }));
  mock.method(LessonProgress, "findOneAndUpdate", async (filter, update) => {
    lessonProgressUpdates.push({ filter, update });
    return { _id: "progress-1" };
  });
  mock.method(Lesson, "find", () =>
    makeQuery([{ _id: "lesson-1" }, { _id: "lesson-2" }]),
  );
  mock.method(LessonProgress, "find", () => makeQuery([{ lessonId: "lesson-1" }]));
  mock.method(Enrollment, "findByIdAndUpdate", async (enrollmentId, update) => {
    enrollmentUpdates.push({ enrollmentId, update });
    return { _id: enrollmentId, ...update };
  });

  const result = await updateLessonProgress(
    "course-1",
    "lesson-1",
    { userId: "user-1", role: "student" },
    true,
  );

  assert.equal(lessonProgressUpdates.length, 1);
  assert.deepEqual(lessonProgressUpdates[0].filter, {
    studentId: "student-1",
    courseId: "course-1",
    lessonId: "lesson-1",
  });
  assert.deepEqual(enrollmentUpdates[0], {
    enrollmentId: "enrollment-1",
    update: {
      progress: 50,
      completed: false,
    },
  });
  assert.equal(result.completed, true);
  assert.equal(result.progress, 50);
  assert.equal(result.completedLessons, 1);
  assert.equal(result.totalLessons, 2);
  assert.equal(result.courseCompleted, false);
  assert.equal(result.currentLessonId, "lesson-2");
});

test("updateLessonProgress rejects lessons that are still locked", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => ({ _id: "enrollment-1" }));
  mock.method(Lesson, "findOne", () => makeQuery({ _id: "lesson-2" }));
  mock.method(Lesson, "find", () =>
    makeQuery([
      { _id: "lesson-1", order: 1 },
      { _id: "lesson-2", order: 2 },
    ]),
  );
  mock.method(LessonProgress, "find", () => makeQuery([]));

  await assert.rejects(
    () =>
      updateLessonProgress(
        "course-1",
        "lesson-2",
        { userId: "user-1", role: "student" },
        true,
      ),
    {
      message: "Complete the previous lesson first",
      statusCode: 403,
    },
  );
});

test("updateLessonProgress deletes completion state when a lesson is unmarked", async () => {
  const lessonProgressDeletes = [];
  const enrollmentUpdates = [];

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => ({ _id: "enrollment-1" }));
  mock.method(Lesson, "findOne", () => makeQuery({ _id: "lesson-1" }));
  mock.method(LessonProgress, "findOneAndDelete", async (filter) => {
    lessonProgressDeletes.push(filter);
    return { _id: "deleted-progress" };
  });
  mock.method(Lesson, "find", () => makeQuery([{ _id: "lesson-1" }]));
  mock.method(LessonProgress, "find", () => makeQuery([]));
  mock.method(Enrollment, "findByIdAndUpdate", async (enrollmentId, update) => {
    enrollmentUpdates.push({ enrollmentId, update });
    return { _id: enrollmentId, ...update };
  });

  const result = await updateLessonProgress(
    "course-1",
    "lesson-1",
    { userId: "user-1", role: "student" },
    false,
  );

  assert.deepEqual(lessonProgressDeletes[0], {
    studentId: "student-1",
    courseId: "course-1",
    lessonId: "lesson-1",
  });
  assert.deepEqual(enrollmentUpdates[0], {
    enrollmentId: "enrollment-1",
    update: {
      progress: 0,
      completed: false,
    },
  });
  assert.equal(result.completed, false);
  assert.equal(result.progress, 0);
  assert.equal(result.completedLessons, 0);
  assert.equal(result.totalLessons, 1);
  assert.equal(result.courseCompleted, false);
  assert.equal(result.currentLessonId, "lesson-1");
});

test("updateLessonProgress marks the course completed when all lessons are done", async () => {
  const enrollmentUpdates = [];

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => ({ _id: "enrollment-1" }));
  mock.method(Lesson, "findOne", () => makeQuery({ _id: "lesson-2" }));
  mock.method(LessonProgress, "findOneAndUpdate", async () => ({
    _id: "progress-2",
  }));
  mock.method(Lesson, "find", () =>
    makeQuery([{ _id: "lesson-1" }, { _id: "lesson-2" }]),
  );
  mock.method(LessonProgress, "find", () =>
    makeQuery([{ lessonId: "lesson-1" }, { lessonId: "lesson-2" }]),
  );
  mock.method(Enrollment, "findByIdAndUpdate", async (enrollmentId, update) => {
    enrollmentUpdates.push({ enrollmentId, update });
    return { _id: enrollmentId, ...update };
  });

  const result = await updateLessonProgress(
    "course-1",
    "lesson-2",
    { userId: "user-1", role: "student" },
    true,
  );

  assert.deepEqual(enrollmentUpdates[0], {
    enrollmentId: "enrollment-1",
    update: {
      progress: 100,
      completed: true,
    },
  });
  assert.equal(result.completed, true);
  assert.equal(result.progress, 100);
  assert.equal(result.completedLessons, 2);
  assert.equal(result.totalLessons, 2);
  assert.equal(result.courseCompleted, true);
  assert.equal(result.currentLessonId, null);
});

test("upsertLessonNotebook saves the lesson note and bookmark state", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => ({ _id: "enrollment-1" }));
  mock.method(Lesson, "findOne", () => makeQuery({ _id: "lesson-1" }));
  mock.method(LessonNotebook, "findOneAndUpdate", () =>
    makeQuery({
      lessonId: "lesson-1",
      note: "Work this example again.",
      isBookmarked: true,
      updatedAt: new Date("2026-04-04T12:00:00Z"),
    }),
  );

  const result = await upsertLessonNotebook(
    "course-1",
    "lesson-1",
    { userId: "user-1", role: "student" },
    { note: "  Work this example again. ", isBookmarked: true },
  );

  assert.equal(result.note, "Work this example again.");
  assert.equal(result.isBookmarked, true);
});

test("upsertLessonNotebook clears notebook state when note and bookmark are removed", async () => {
  const deletedFilters = [];

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => ({ _id: "enrollment-1" }));
  mock.method(Lesson, "findOne", () => makeQuery({ _id: "lesson-1" }));
  mock.method(LessonNotebook, "findOneAndDelete", async (filter) => {
    deletedFilters.push(filter);
    return null;
  });

  const result = await upsertLessonNotebook(
    "course-1",
    "lesson-1",
    { userId: "user-1", role: "student" },
    { note: " ", isBookmarked: false },
  );

  assert.deepEqual(deletedFilters[0], {
    studentId: "student-1",
    courseId: "course-1",
    lessonId: "lesson-1",
  });
  assert.equal(result.note, "");
  assert.equal(result.isBookmarked, false);
});

test("upsertCourseReview rejects incomplete enrollments", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => ({
    _id: "enrollment-1",
    completed: false,
  }));

  await assert.rejects(
    () =>
      upsertCourseReview(
        "507f1f77bcf86cd799439011",
        { userId: "user-1", role: "student" },
        { rating: 5, comment: "Ready to review" },
      ),
    {
      message: "Complete the course before reviewing it",
      statusCode: 403,
    },
  );
});

test("upsertCourseReview stores the review and refreshes course aggregates", async () => {
  const updates = [];

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1", name: "QA Student" }));
  mock.method(Enrollment, "findOne", async () => ({
    _id: "enrollment-1",
    completed: true,
  }));
  mock.method(Review, "findOneAndUpdate", () =>
    makeQuery({
      rating: 5,
      comment: "Excellent completion flow",
      updatedAt: new Date("2026-04-04T12:30:00Z"),
    }),
  );
  mock.method(Review, "aggregate", async () => [
    {
      averageRating: 4.5,
      totalReviews: 6,
    },
  ]);
  mock.method(Course, "findByIdAndUpdate", async (courseId, update) => {
    updates.push({ courseId, update });
    return { _id: courseId, ...update };
  });

  const result = await upsertCourseReview(
    "507f1f77bcf86cd799439011",
    { userId: "user-1", role: "student" },
    { rating: 5, comment: "  Excellent completion flow " },
  );

  assert.equal(result.rating, 5);
  assert.equal(result.comment, "Excellent completion flow");
  assert.deepEqual(updates[0], {
    courseId: "507f1f77bcf86cd799439011",
    update: {
      rating: 4.5,
      totalReviews: 6,
    },
  });
});
