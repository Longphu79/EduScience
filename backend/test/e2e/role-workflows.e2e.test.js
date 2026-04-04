import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import { QA_ACCOUNTS, QA_PASSWORD, seedQaData } from "../../src/qa/seedQaData.js";
import { loginViaApi, requestJson, startTestServer, stopTestServer } from "../helpers/http.js";
import {
  clearDatabase,
  connectTestDatabase,
  disconnectTestDatabase,
} from "../helpers/testDb.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";
process.env.SEPAY_WEBHOOK_KEY = "";

let server;
let baseUrl;
let seedSummary;

before(async () => {
  await connectTestDatabase("edu_science_role_workflows_e2e");
  ({ server, baseUrl } = await startTestServer());
});

after(async () => {
  await stopTestServer(server);
  await disconnectTestDatabase();
});

beforeEach(async () => {
  await clearDatabase();
  seedSummary = await seedQaData();
});

test("guest workflow covers public discovery and protected route denial", async () => {
  const catalogResponse = await requestJson(baseUrl, "/course");
  const detailResponse = await requestJson(
    baseUrl,
    `/course/slug/${seedSummary.courses.inProgress.slug}`,
  );
  const cartResponse = await requestJson(baseUrl, "/api/cart");

  assert.equal(catalogResponse.status, 200);
  assert.equal(catalogResponse.data.items.length >= 6, true);
  assert.equal(
    catalogResponse.data.items.every((course) => course.status === "published"),
    true,
  );
  assert.equal(detailResponse.status, 200);
  assert.equal(detailResponse.data.slug, seedSummary.courses.inProgress.slug);
  assert.equal(detailResponse.data.viewerEnrollment.isEnrolled, false);
  assert.equal(detailResponse.data.lessons.length > 0, true);
  assert.equal(cartResponse.status, 401);
});

test("instructor workflow can author a published course and lessons", async () => {
  const instructorLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.instructor.username,
    password: QA_PASSWORD,
  });

  const createCourseResponse = await requestJson(baseUrl, "/course", {
    method: "POST",
    token: instructorLogin.token,
    body: {
      title: "E2E Instructor Course",
      slug: "qa-e2e-instructor-course",
      shortDescription: "Created during the instructor E2E workflow.",
      description: "Verifies course creation and public discovery.",
      category: "Testing",
      level: "beginner",
      language: "en",
      price: 69000,
      status: "published",
    },
  });

  assert.equal(createCourseResponse.status, 201);

  const courseId = createCourseResponse.data._id;

  const createPreviewLessonResponse = await requestJson(baseUrl, "/api/lesson", {
    method: "POST",
    token: instructorLogin.token,
    body: {
      courseId,
      title: "E2E Preview Lesson",
      description: "Preview lesson for discovery checks.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: 10,
      order: 1,
      isPreview: true,
      isPublished: true,
    },
  });
  const createFullLessonResponse = await requestJson(baseUrl, "/api/lesson", {
    method: "POST",
    token: instructorLogin.token,
    body: {
      courseId,
      title: "E2E Full Lesson",
      description: "Full lesson for enrolled students.",
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
      duration: 15,
      order: 2,
      isPreview: false,
      isPublished: true,
    },
  });
  const lessonListResponse = await requestJson(
    baseUrl,
    `/api/lesson/course/${courseId}`,
    {
      token: instructorLogin.token,
    },
  );

  assert.equal(createPreviewLessonResponse.status, 201);
  assert.equal(createFullLessonResponse.status, 201);
  assert.equal(lessonListResponse.status, 200);
  assert.equal(lessonListResponse.data.length, 2);

  const publicCourseResponse = await requestJson(
    baseUrl,
    "/course?sort=newest&q=E2E Instructor Course",
  );

  assert.equal(publicCourseResponse.status, 200);
  assert.equal(
    publicCourseResponse.data.items.some(
      (course) => course.slug === "qa-e2e-instructor-course",
    ),
    true,
  );
});

test("student workflow covers wishlist, cart, checkout, webhook, and learning", async () => {
  const studentLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.student.username,
    password: QA_PASSWORD,
  });

  const wishlistResponse = await requestJson(baseUrl, "/wishlist/get", {
    token: studentLogin.token,
  });
  const cartResponse = await requestJson(baseUrl, "/api/cart", {
    token: studentLogin.token,
  });

  assert.equal(wishlistResponse.status, 200);
  assert.equal(wishlistResponse.data.courseIds.length >= 2, true);
  assert.equal(cartResponse.status, 200);
  assert.equal(cartResponse.data.items.length >= 1, true);

  const checkoutResponse = await requestJson(baseUrl, "/api/checkout", {
    method: "POST",
    token: studentLogin.token,
  });

  assert.equal(checkoutResponse.status, 201);

  const webhookResponse = await requestJson(baseUrl, "/api/webhook/sepay", {
    method: "POST",
    body: {
      id: "qa-e2e-payment-1",
      transferType: "in",
      transferAmount: checkoutResponse.data.totalAmount,
      content: checkoutResponse.data.orderCode,
    },
  });

  assert.equal(webhookResponse.status, 200);
  assert.equal(webhookResponse.data.success, true);
  assert.equal(webhookResponse.data.ignored, false);

  const orderStatusResponse = await requestJson(
    baseUrl,
    `/api/order/${checkoutResponse.data.orderId}/status`,
    {
      token: studentLogin.token,
    },
  );
  const myCoursesResponse = await requestJson(baseUrl, "/api/learning/courses", {
    token: studentLogin.token,
  });

  assert.equal(orderStatusResponse.status, 200);
  assert.equal(orderStatusResponse.data.status, "paid");
  assert.equal(orderStatusResponse.data.fulfillmentStatus, "completed");
  assert.equal(orderStatusResponse.data.isReadyToLearn, true);
  assert.equal(myCoursesResponse.status, 200);
  assert.equal(myCoursesResponse.data.length >= 3, true);

  const newCourse = myCoursesResponse.data.find(
    (course) => course.course.slug === seedSummary.courses.checkoutCandidate.slug,
  );

  assert.ok(newCourse);

  const learningResponse = await requestJson(
    baseUrl,
    `/api/learning/course/${newCourse.course.slug}`,
    {
      token: studentLogin.token,
    },
  );

  assert.equal(learningResponse.status, 200);
  assert.equal(learningResponse.data.course.viewerEnrollment.isEnrolled, true);

  const firstLessonId = learningResponse.data.lessons[0]._id;
  const progressResponse = await requestJson(
    baseUrl,
    `/api/learning/courses/${newCourse.course._id}/lessons/${firstLessonId}/progress`,
    {
      method: "PUT",
      token: studentLogin.token,
      body: { completed: true },
    },
  );

  assert.equal(progressResponse.status, 200);
  assert.equal(progressResponse.data.completed, true);
});

test("admin workflow covers instructor listing and managed ownership assignment", async () => {
  const adminLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.admin.username,
    password: QA_PASSWORD,
  });

  const optionsResponse = await requestJson(baseUrl, "/user/instructors/options", {
    token: adminLogin.token,
  });

  assert.equal(optionsResponse.status, 200);
  assert.equal(optionsResponse.data.length >= 2, true);

  const primaryInstructor = optionsResponse.data.find(
    (option) => option.username === QA_ACCOUNTS.instructor.username,
  );
  const alternateInstructor = optionsResponse.data.find(
    (option) => option.username === QA_ACCOUNTS.instructorAlt.username,
  );

  assert.ok(primaryInstructor);
  assert.ok(alternateInstructor);

  const createCourseResponse = await requestJson(baseUrl, "/course", {
    method: "POST",
    token: adminLogin.token,
    body: {
      title: "E2E Admin Managed Course",
      slug: "qa-e2e-admin-managed-course",
      shortDescription: "Created and assigned by admin in the E2E workflow.",
      description: "Validates admin ownership selection and reassignment.",
      category: "Administration",
      level: "advanced",
      language: "en",
      price: 49000,
      status: "draft",
      instructorId: primaryInstructor._id,
    },
  });

  assert.equal(createCourseResponse.status, 201);

  const reassignResponse = await requestJson(
    baseUrl,
    `/course/${createCourseResponse.data._id}`,
    {
      method: "PUT",
      token: adminLogin.token,
      body: {
        instructorId: alternateInstructor._id,
        status: "published",
      },
    },
  );

  assert.equal(reassignResponse.status, 200);
  assert.equal(reassignResponse.data.instructorId._id, alternateInstructor._id);

  const publicDetailResponse = await requestJson(
    baseUrl,
    "/course/slug/qa-e2e-admin-managed-course",
  );

  assert.equal(publicDetailResponse.status, 200);
  assert.equal(
    publicDetailResponse.data.instructorId._id,
    alternateInstructor._id,
  );
});
