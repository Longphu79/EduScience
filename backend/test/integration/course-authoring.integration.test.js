import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";

import Course from "../../src/models/Course.js";
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
  await connectTestDatabase("edu_science_course_authoring_integration");
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

test("only admins can list instructor options for authoring", async () => {
  const adminLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.admin.username,
    password: QA_PASSWORD,
  });
  const instructorLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.instructor.username,
    password: QA_PASSWORD,
  });

  const adminResponse = await requestJson(baseUrl, "/user/instructors/options", {
    token: adminLogin.token,
  });
  const instructorResponse = await requestJson(
    baseUrl,
    "/user/instructors/options",
    {
      token: instructorLogin.token,
    },
  );

  assert.equal(adminResponse.status, 200);
  assert.equal(Array.isArray(adminResponse.data), true);
  assert.equal(adminResponse.data.length >= 2, true);
  assert.equal(
    adminResponse.data.some(
      (option) => option.username === QA_ACCOUNTS.instructor.username,
    ),
    true,
  );
  assert.equal(instructorResponse.status, 403);
  assert.equal(instructorResponse.data.message, "Forbidden");
});

test("admin can list course inventory for the authoring workspace", async () => {
  const adminLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.admin.username,
    password: QA_PASSWORD,
  });
  const instructorLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.instructor.username,
    password: QA_PASSWORD,
  });

  const adminResponse = await requestJson(baseUrl, "/api/admin/courses", {
    token: adminLogin.token,
  });
  const instructorResponse = await requestJson(baseUrl, "/api/admin/courses", {
    token: instructorLogin.token,
  });

  assert.equal(adminResponse.status, 200);
  assert.equal(Array.isArray(adminResponse.data), true);
  assert.equal(adminResponse.data.length >= 1, true);
  assert.equal(
    adminResponse.data.some((course) => course.slug === seedSummary.courses.inProgress.slug),
    true,
  );
  assert.equal(
    adminResponse.data.some((course) => course.instructorId?.name),
    true,
  );
  assert.equal(instructorResponse.status, 403);
  assert.equal(instructorResponse.data.message, "Forbidden");
});

test("admin course creation persists the selected instructor owner", async () => {
  const adminLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.admin.username,
    password: QA_PASSWORD,
  });
  const optionsResponse = await requestJson(baseUrl, "/user/instructors/options", {
    token: adminLogin.token,
  });
  const altInstructor = optionsResponse.data.find(
    (option) => option.username === QA_ACCOUNTS.instructorAlt.username,
  );

  const createResponse = await requestJson(baseUrl, "/course", {
    method: "POST",
    token: adminLogin.token,
    body: {
      title: "Integration Admin Course",
      slug: "qa-admin-integration-course",
      shortDescription: "Integration coverage for admin authoring ownership.",
      description: "Created by admin and assigned to the alternate instructor.",
      category: "Testing",
      level: "beginner",
      language: "en",
      price: 79000,
      status: "published",
      instructorId: altInstructor._id,
    },
  });

  assert.equal(createResponse.status, 201);

  const persistedCourse = await Course.findOne({
    slug: "qa-admin-integration-course",
  }).lean();

  assert.equal(persistedCourse.instructorId.toString(), altInstructor._id);
  assert.equal(persistedCourse.status, "published");
});

test("admin can reassign an existing course to a different instructor owner", async () => {
  const adminLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.admin.username,
    password: QA_PASSWORD,
  });
  const optionsResponse = await requestJson(baseUrl, "/user/instructors/options", {
    token: adminLogin.token,
  });
  const altInstructor = optionsResponse.data.find(
    (option) => option.username === QA_ACCOUNTS.instructorAlt.username,
  );

  const updateResponse = await requestJson(
    baseUrl,
    `/course/${seedSummary.courses.draft.id}`,
    {
      method: "PUT",
      token: adminLogin.token,
      body: {
        instructorId: altInstructor._id,
        status: "draft",
      },
    },
  );

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.data.instructorId._id, altInstructor._id);

  const persistedCourse = await Course.findById(seedSummary.courses.draft.id).lean();

  assert.equal(persistedCourse.instructorId.toString(), altInstructor._id);
});

test("instructor can create and update a self-owned course that becomes publicly visible", async () => {
  const instructorLogin = await loginViaApi(baseUrl, {
    username: QA_ACCOUNTS.instructor.username,
    password: QA_PASSWORD,
  });

  const createResponse = await requestJson(baseUrl, "/course", {
    method: "POST",
    token: instructorLogin.token,
    body: {
      title: "Integration Instructor Course",
      slug: "qa-instructor-integration-course",
      shortDescription: "Instructor create/update regression coverage.",
      description: "Created by instructor and then updated to verify public detail visibility.",
      category: "Testing",
      level: "beginner",
      language: "en",
      price: 109000,
      salePrice: 89000,
      status: "draft",
    },
  });

  assert.equal(createResponse.status, 201);

  const createdCourse = await Course.findOne({
    slug: "qa-instructor-integration-course",
  }).lean();

  assert.ok(createdCourse);
  assert.equal(
    createdCourse.instructorId.toString(),
    seedSummary.profileIds.instructor,
  );
  assert.equal(createdCourse.status, "draft");

  const updateResponse = await requestJson(
    baseUrl,
    `/course/${createdCourse._id.toString()}`,
    {
      method: "PUT",
      token: instructorLogin.token,
      body: {
        title: "Integration Instructor Course Updated",
        slug: "qa-instructor-integration-course-updated",
        shortDescription: "Updated course ready for public QA.",
        description: "Updated by instructor and published for public detail verification.",
        category: "Testing",
        level: "intermediate",
        language: "en",
        price: 119000,
        salePrice: 99000,
        status: "published",
      },
    },
  );

  assert.equal(updateResponse.status, 200);
  assert.equal(updateResponse.data.slug, "qa-instructor-integration-course-updated");
  assert.equal(updateResponse.data.status, "published");

  const publicResponse = await requestJson(
    baseUrl,
    "/course/slug/qa-instructor-integration-course-updated",
  );

  assert.equal(publicResponse.status, 200);
  assert.equal(publicResponse.data.slug, "qa-instructor-integration-course-updated");
  assert.equal(publicResponse.data.title, "Integration Instructor Course Updated");
});
