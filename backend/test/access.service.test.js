import assert from "node:assert/strict";
import { afterEach, test, mock } from "node:test";

import Course from "../src/models/Course.js";
import Enrollment from "../src/models/Enrollment.js";
import Instructor from "../src/models/Instructor.js";
import Lesson from "../src/models/Lesson.js";
import Order from "../src/models/Order.js";
import Student from "../src/models/Student.js";
import {
  assertCourseOwnership,
  assertEnrollmentAccess,
  assertLessonOwnership,
  assertOrderAccess,
  canManageCourse,
  findStudentProfileForActor,
  getEnrollmentForActor,
  getEnrollmentMapForActor,
  getInstructorProfileForActor,
  getStudentProfileForActor,
} from "../src/services/access.service.js";
import { makeQuery } from "./helpers/query.js";

afterEach(() => {
  mock.restoreAll();
});

test("getInstructorProfileForActor rejects unauthenticated actors", async () => {
  await assert.rejects(() => getInstructorProfileForActor(null), {
    message: "Unauthorized",
    statusCode: 401,
  });
});

test("getInstructorProfileForActor requires an instructor id for admin actors", async () => {
  await assert.rejects(
    () => getInstructorProfileForActor({ userId: "admin-1", role: "admin" }),
    {
      message: "instructorId is required",
      statusCode: 400,
    },
  );
});

test("getInstructorProfileForActor rejects missing admin target profiles", async () => {
  mock.method(Instructor, "findById", async () => null);

  await assert.rejects(
    () =>
      getInstructorProfileForActor(
        { userId: "admin-1", role: "admin" },
        "instructor-1",
      ),
    {
      message: "Instructor profile not found",
      statusCode: 404,
    },
  );
});

test("getInstructorProfileForActor returns the targeted profile for admins", async () => {
  const instructor = { _id: "instructor-1" };
  mock.method(Instructor, "findById", async () => instructor);

  const result = await getInstructorProfileForActor(
    { userId: "admin-1", role: "admin" },
    "instructor-1",
  );

  assert.equal(result, instructor);
});

test("getInstructorProfileForActor rejects non-instructor non-admin actors", async () => {
  await assert.rejects(
    () => getInstructorProfileForActor({ userId: "user-1", role: "student" }),
    {
      message: "Instructor access required",
      statusCode: 403,
    },
  );
});

test("getInstructorProfileForActor rejects instructors without profiles", async () => {
  mock.method(Instructor, "findOne", async () => null);

  await assert.rejects(
    () =>
      getInstructorProfileForActor({
        userId: "user-1",
        role: "instructor",
      }),
    {
      message: "Instructor profile not found",
      statusCode: 403,
    },
  );
});

test("getInstructorProfileForActor returns the current instructor profile", async () => {
  const instructor = { _id: "instructor-1" };
  mock.method(Instructor, "findOne", async () => instructor);

  const result = await getInstructorProfileForActor({
    userId: "user-1",
    role: "instructor",
  });

  assert.equal(result, instructor);
});

test("findStudentProfileForActor short-circuits for non-student actors", async () => {
  mock.method(Student, "findOne", () => {
    throw new Error("should not query student profiles");
  });

  const result = await findStudentProfileForActor({
    userId: "user-1",
    role: "instructor",
  });

  assert.equal(result, null);
});

test("findStudentProfileForActor returns the current student profile", async () => {
  const student = { _id: "student-1" };
  mock.method(Student, "findOne", () => makeQuery(student));

  const result = await findStudentProfileForActor({
    userId: "user-1",
    role: "student",
  });

  assert.equal(result, student);
});

test("getStudentProfileForActor rejects unauthenticated actors", async () => {
  await assert.rejects(() => getStudentProfileForActor(null), {
    message: "Unauthorized",
    statusCode: 401,
  });
});

test("getStudentProfileForActor rejects non-student roles", async () => {
  await assert.rejects(
    () => getStudentProfileForActor({ userId: "user-1", role: "admin" }),
    {
      message: "Student access required",
      statusCode: 403,
    },
  );
});

test("getStudentProfileForActor rejects missing student profiles", async () => {
  mock.method(Student, "findOne", () => makeQuery(null));

  await assert.rejects(
    () => getStudentProfileForActor({ userId: "user-1", role: "student" }),
    {
      message: "Student profile not found",
      statusCode: 403,
    },
  );
});

test("getStudentProfileForActor returns the student profile", async () => {
  const student = { _id: "student-1" };
  mock.method(Student, "findOne", () => makeQuery(student));

  const result = await getStudentProfileForActor({
    userId: "user-1",
    role: "student",
  });

  assert.equal(result, student);
});

test("getEnrollmentForActor returns null for non-student actors", async () => {
  mock.method(Student, "findOne", () => {
    throw new Error("should not query student profiles");
  });

  const result = await getEnrollmentForActor("course-1", {
    userId: "user-1",
    role: "admin",
  });

  assert.equal(result, null);
});

test("getEnrollmentForActor returns the current enrollment for students", async () => {
  const enrollment = { _id: "enrollment-1" };

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => enrollment);

  const result = await getEnrollmentForActor("course-1", {
    userId: "user-1",
    role: "student",
  });

  assert.equal(result, enrollment);
});

test("getEnrollmentMapForActor returns an empty map when no course ids are provided", async () => {
  const result = await getEnrollmentMapForActor([], {
    userId: "user-1",
    role: "student",
  });

  assert.equal(result.size, 0);
});

test("getEnrollmentMapForActor returns an empty map for non-student actors", async () => {
  mock.method(Student, "findOne", () => {
    throw new Error("should not query student profiles");
  });

  const result = await getEnrollmentMapForActor(["course-1"], {
    userId: "user-1",
    role: "admin",
  });

  assert.equal(result.size, 0);
});

test("getEnrollmentMapForActor indexes enrollments by course id", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "find", () =>
    makeQuery([
      {
        courseId: "course-1",
        progress: 50,
        completed: false,
      },
      {
        courseId: "course-2",
        progress: 100,
        completed: true,
      },
    ]),
  );

  const result = await getEnrollmentMapForActor(["course-1", "course-2"], {
    userId: "user-1",
    role: "student",
  });

  assert.equal(result.get("course-1").progress, 50);
  assert.equal(result.get("course-2").completed, true);
});

test("canManageCourse returns false when actor or course is missing", async () => {
  assert.equal(await canManageCourse(null, { userId: "user-1" }), false);
  assert.equal(await canManageCourse({ _id: "course-1" }, null), false);
});

test("canManageCourse allows admins to manage any course", async () => {
  const result = await canManageCourse(
    { _id: "course-1" },
    { userId: "admin-1", role: "admin" },
  );

  assert.equal(result, true);
});

test("canManageCourse rejects non-instructor non-admin actors", async () => {
  const result = await canManageCourse(
    { _id: "course-1" },
    { userId: "user-1", role: "student" },
  );

  assert.equal(result, false);
});

test("canManageCourse returns false when the instructor profile is missing", async () => {
  mock.method(Instructor, "findOne", () => makeQuery(null));

  const result = await canManageCourse(
    { _id: "course-1", instructorId: "instructor-1" },
    { userId: "user-1", role: "instructor" },
  );

  assert.equal(result, false);
});

test("canManageCourse matches populated instructor ids", async () => {
  mock.method(Instructor, "findOne", () => makeQuery({ _id: "instructor-1" }));

  const result = await canManageCourse(
    {
      _id: "course-1",
      instructorId: { _id: "instructor-1" },
    },
    { userId: "user-1", role: "instructor" },
  );

  assert.equal(result, true);
});

test("assertCourseOwnership rejects missing courses", async () => {
  mock.method(Course, "findById", async () => null);

  await assert.rejects(
    () =>
      assertCourseOwnership("course-1", {
        userId: "user-1",
        role: "instructor",
      }),
    {
      message: "Course not found",
      statusCode: 404,
    },
  );
});

test("assertCourseOwnership returns owned courses", async () => {
  const course = {
    _id: "course-1",
    instructorId: "instructor-1",
  };

  mock.method(Course, "findById", async () => course);
  mock.method(Instructor, "findOne", () => makeQuery({ _id: "instructor-1" }));

  const result = await assertCourseOwnership("course-1", {
    userId: "user-1",
    role: "instructor",
  });

  assert.equal(result, course);
});

test("assertCourseOwnership rejects actors who do not own the course", async () => {
  mock.method(Course, "findById", async () => ({
    _id: "course-1",
    instructorId: "other-instructor",
  }));
  mock.method(Instructor, "findOne", () => makeQuery({ _id: "instructor-1" }));

  await assert.rejects(
    () =>
      assertCourseOwnership("course-1", {
        userId: "user-1",
        role: "instructor",
      }),
    {
      message: "Forbidden",
      statusCode: 403,
    },
  );
});

test("assertLessonOwnership rejects missing lessons", async () => {
  mock.method(Lesson, "findById", async () => null);

  await assert.rejects(
    () =>
      assertLessonOwnership("lesson-1", {
        userId: "user-1",
        role: "instructor",
      }),
    {
      message: "Lesson not found",
      statusCode: 404,
    },
  );
});

test("assertLessonOwnership returns lessons belonging to owned courses", async () => {
  const lesson = {
    _id: "lesson-1",
    courseId: "course-1",
  };

  mock.method(Lesson, "findById", async () => lesson);
  mock.method(Course, "findById", async () => ({
    _id: "course-1",
    instructorId: "instructor-1",
  }));
  mock.method(Instructor, "findOne", () => makeQuery({ _id: "instructor-1" }));

  const result = await assertLessonOwnership("lesson-1", {
    userId: "user-1",
    role: "instructor",
  });

  assert.equal(result, lesson);
});

test("assertOrderAccess rejects missing orders", async () => {
  mock.method(Order, "findById", async () => null);

  await assert.rejects(() => assertOrderAccess("order-1", { userId: "user-1" }), {
    message: "Order not found",
    statusCode: 404,
  });
});

test("assertOrderAccess allows owners and admins", async () => {
  const order = { _id: "order-1", userId: "user-1" };
  mock.method(Order, "findById", async () => order);

  const ownerResult = await assertOrderAccess("order-1", {
    userId: "user-1",
    role: "student",
  });
  const adminResult = await assertOrderAccess("order-1", {
    userId: "admin-1",
    role: "admin",
  });

  assert.equal(ownerResult, order);
  assert.equal(adminResult, order);
});

test("assertOrderAccess rejects non-owner non-admin actors", async () => {
  mock.method(Order, "findById", async () => ({
    _id: "order-1",
    userId: "owner-1",
  }));

  await assert.rejects(
    () =>
      assertOrderAccess("order-1", {
        userId: "user-1",
        role: "student",
      }),
    {
      message: "Forbidden",
      statusCode: 403,
    },
  );
});

test("assertEnrollmentAccess rejects missing enrollments", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Enrollment, "findOne", async () => null);

  await assert.rejects(
    () =>
      assertEnrollmentAccess("course-1", {
        userId: "user-1",
        role: "student",
      }),
    {
      message: "Enrollment required",
      statusCode: 403,
    },
  );
});

test("assertEnrollmentAccess returns the student and enrollment", async () => {
  const student = { _id: "student-1" };
  const enrollment = { _id: "enrollment-1" };

  mock.method(Student, "findOne", () => makeQuery(student));
  mock.method(Enrollment, "findOne", async () => enrollment);

  const result = await assertEnrollmentAccess("course-1", {
    userId: "user-1",
    role: "student",
  });

  assert.deepEqual(result, { student, enrollment });
});
