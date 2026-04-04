import assert from "node:assert/strict";
import { afterEach, test, mock } from "node:test";
import bcrypt from "bcryptjs";

import Admin from "../src/models/Admin.js";
import Instructor from "../src/models/Instructor.js";
import Student from "../src/models/Student.js";
import User from "../src/models/User.js";
import { login, register } from "../src/services/auth.service.js";
import { makeQuery } from "./helpers/query.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

afterEach(() => {
  mock.restoreAll();
});

test("register normalizes username/email before duplicate lookup", async () => {
  let duplicateFilter;

  mock.method(User, "findOne", async (filter) => {
    duplicateFilter = filter;
    return { _id: "existing-user" };
  });

  await assert.rejects(
    () =>
      register({
        username: " Alice ",
        email: "Alice@Example.COM ",
        password: "secret",
        role: "student",
      }),
    {
      message: "Username or email already exists",
    },
  );

  assert.deepEqual(duplicateFilter, {
    $or: [{ username: "alice" }, { email: "alice@example.com" }],
  });
});

test("register creates a student user, hashes the password, and issues a token", async () => {
  let createdUserPayload;
  let createdStudentPayload;

  mock.method(User, "findOne", async () => null);
  mock.method(User, "create", async (payload) => {
    createdUserPayload = payload;

    return {
      _id: "user-student",
      role: payload.role,
      username: payload.username,
      email: payload.email,
    };
  });
  mock.method(Student, "create", async (payload) => {
    createdStudentPayload = payload;
    return payload;
  });
  const instructorCreateMock = mock.method(
    Instructor,
    "create",
    async () => undefined,
  );
  const adminCreateMock = mock.method(Admin, "create", async () => undefined);

  const result = await register({
    username: " StudentUser ",
    email: "Student@Example.com ",
    password: "secret",
    role: "student",
  });

  assert.equal(createdUserPayload.username, "studentuser");
  assert.equal(createdUserPayload.email, "student@example.com");
  assert.notEqual(createdUserPayload.password, "secret");
  assert.equal(await bcrypt.compare("secret", createdUserPayload.password), true);
  assert.deepEqual(createdStudentPayload, { userId: "user-student" });
  assert.equal(result.user._id, "user-student");
  assert.equal("password" in result.user, false);
  assert.equal(typeof result.token, "string");
  assert.equal(instructorCreateMock.mock.calls.length, 0);
  assert.equal(adminCreateMock.mock.calls.length, 0);
});

test("register creates an instructor profile for instructor users", async () => {
  let createdInstructorPayload;

  mock.method(User, "findOne", async () => null);
  mock.method(User, "create", async (payload) => ({
    _id: "user-instructor",
    role: payload.role,
  }));
  mock.method(Instructor, "create", async (payload) => {
    createdInstructorPayload = payload;
    return payload;
  });
  mock.method(Student, "create", async () => undefined);
  mock.method(Admin, "create", async () => undefined);

  const result = await register({
    username: "Teacher",
    email: "teacher@example.com",
    password: "secret",
    role: "instructor",
  });

  assert.deepEqual(createdInstructorPayload, {
    userId: "user-instructor",
    name: "Teacher",
  });
  assert.equal(result.user.role, "instructor");
  assert.equal(typeof result.token, "string");
});

test("register creates an admin profile for admin users", async () => {
  let createdAdminPayload;

  mock.method(User, "findOne", async () => null);
  mock.method(User, "create", async (payload) => ({
    _id: "user-admin",
    role: payload.role,
  }));
  mock.method(Admin, "create", async (payload) => {
    createdAdminPayload = payload;
    return payload;
  });
  mock.method(Student, "create", async () => undefined);
  mock.method(Instructor, "create", async () => undefined);

  const result = await register({
    username: "Root",
    email: "root@example.com",
    password: "secret",
    role: "admin",
  });

  assert.deepEqual(createdAdminPayload, {
    userId: "user-admin",
    name: "Root",
  });
  assert.equal(result.user.role, "admin");
  assert.equal(typeof result.token, "string");
});

test("login rejects missing credentials", async () => {
  await assert.rejects(() => login({ username: "", password: "" }), {
    message: "Username and password are required",
  });
});

test("login rejects unknown users", async () => {
  mock.method(User, "findOne", () => makeQuery(null));

  await assert.rejects(() => login({ username: "alice", password: "secret" }), {
    message: "Username or password is invalid",
  });
});

test("login rejects incorrect passwords", async () => {
  const passwordHash = await bcrypt.hash("correct-password", 4);

  mock.method(User, "findOne", () =>
    makeQuery({
      _id: "user-1",
      role: "student",
      password: passwordHash,
    }),
  );

  await assert.rejects(
    () => login({ username: "alice", password: "wrong-password" }),
    {
      message: "Username or password is invalid",
    },
  );
});

test("login trims and lowercases the username before lookup and returns a token", async () => {
  const passwordHash = await bcrypt.hash("secret", 4);
  let loginFilter;

  mock.method(User, "findOne", (filter) => {
    loginFilter = filter;

    return makeQuery({
      _id: "user-1",
      role: "student",
      username: "alice",
      password: passwordHash,
    });
  });

  const result = await login({
    username: " Alice ",
    password: "secret",
  });

  assert.deepEqual(loginFilter, { username: "alice" });
  assert.equal(result.user.username, "alice");
  assert.equal("password" in result.user, false);
  assert.equal(typeof result.token, "string");
});
