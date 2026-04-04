import assert from "node:assert/strict";
import { afterEach, test, mock } from "node:test";
import bcrypt from "bcryptjs";

import Instructor from "../src/models/Instructor.js";
import Student from "../src/models/Student.js";
import User from "../src/models/User.js";
import {
  changePassword,
  deactivateAccount,
  getProfile,
  getUserById,
  updateInstructorProfile,
  updateProfile,
  updateStudentProfile,
} from "../src/services/user.service.js";
import { makeQuery } from "./helpers/query.js";

afterEach(() => {
  mock.restoreAll();
});

test("getUserById returns the matching user", async () => {
  const user = { _id: "user-1" };
  mock.method(User, "findById", async () => user);

  const result = await getUserById("user-1");

  assert.equal(result, user);
});

test("getProfile rejects missing users", async () => {
  mock.method(User, "findById", () => makeQuery(null));

  await assert.rejects(() => getProfile("user-1"), {
    message: "User not found",
    statusCode: 404,
  });
});

test("getProfile returns student profile data for student users", async () => {
  mock.method(User, "findById", () =>
    makeQuery({
      _id: "user-1",
      role: "student",
      email: "student@example.com",
    }),
  );
  mock.method(Student, "findOne", () =>
    makeQuery({
      userId: "user-1",
      fullName: "Student Name",
    }),
  );

  const result = await getProfile("user-1");

  assert.equal(result.role, "student");
  assert.equal(result.profileData.fullName, "Student Name");
});

test("getProfile returns instructor profile data for instructor users", async () => {
  mock.method(User, "findById", () =>
    makeQuery({
      _id: "user-1",
      role: "instructor",
    }),
  );
  mock.method(Instructor, "findOne", () =>
    makeQuery({
      userId: "user-1",
      name: "Instructor Name",
    }),
  );

  const result = await getProfile("user-1");

  assert.equal(result.role, "instructor");
  assert.equal(result.profileData.name, "Instructor Name");
});

test("getProfile returns null profile data for admin users", async () => {
  mock.method(User, "findById", () =>
    makeQuery({
      _id: "user-1",
      role: "admin",
    }),
  );
  const studentFindOneMock = mock.method(Student, "findOne", () => makeQuery(null));
  const instructorFindOneMock = mock.method(
    Instructor,
    "findOne",
    () => makeQuery(null),
  );

  const result = await getProfile("user-1");

  assert.equal(result.profileData, null);
  assert.equal(studentFindOneMock.mock.calls.length, 0);
  assert.equal(instructorFindOneMock.mock.calls.length, 0);
});

test("updateProfile only persists allowed fields", async () => {
  let updatePayload;

  mock.method(User, "findByIdAndUpdate", async (_userId, payload) => {
    updatePayload = payload;
    return { _id: "user-1", ...payload };
  });

  const result = await updateProfile("user-1", {
    email: "updated@example.com",
    avatarUrl: "https://example.com/avatar.png",
    password: "should-be-ignored",
  });

  assert.deepEqual(updatePayload, {
    email: "updated@example.com",
    avatarUrl: "https://example.com/avatar.png",
  });
  assert.equal(result.email, "updated@example.com");
});

test("updateProfile rejects missing users", async () => {
  mock.method(User, "findByIdAndUpdate", async () => null);

  await assert.rejects(
    () => updateProfile("user-1", { email: "missing@example.com" }),
    {
      message: "User not found",
      statusCode: 404,
    },
  );
});

test("changePassword rejects missing users", async () => {
  mock.method(User, "findById", () => makeQuery(null));

  await assert.rejects(
    () => changePassword("user-1", "old-password", "new-password"),
    {
      message: "User not found",
      statusCode: 404,
    },
  );
});

test("changePassword rejects incorrect current passwords", async () => {
  const passwordHash = await bcrypt.hash("old-password", 4);

  mock.method(User, "findById", () =>
    makeQuery({
      _id: "user-1",
      password: passwordHash,
      save: async () => undefined,
    }),
  );

  await assert.rejects(
    () => changePassword("user-1", "wrong-password", "new-password"),
    {
      message: "Old password is incorrect",
      statusCode: 400,
    },
  );
});

test("changePassword hashes the new password and saves the user", async () => {
  const passwordHash = await bcrypt.hash("old-password", 4);
  let saveCalls = 0;
  const userDoc = {
    _id: "user-1",
    password: passwordHash,
    async save() {
      saveCalls += 1;
    },
  };

  mock.method(User, "findById", () => makeQuery(userDoc));

  const result = await changePassword("user-1", "old-password", "new-password");

  assert.equal(result, true);
  assert.equal(saveCalls, 1);
  assert.equal(await bcrypt.compare("new-password", userDoc.password), true);
});

test("deactivateAccount rejects missing users", async () => {
  mock.method(User, "findByIdAndUpdate", async () => null);

  await assert.rejects(() => deactivateAccount("user-1"), {
    message: "User not found",
    statusCode: 404,
  });
});

test("deactivateAccount sets isActive to false", async () => {
  let updatePayload;

  mock.method(User, "findByIdAndUpdate", async (_userId, payload) => {
    updatePayload = payload;
    return { _id: "user-1", isActive: false };
  });

  const result = await deactivateAccount("user-1");

  assert.deepEqual(updatePayload, { isActive: false });
  assert.equal(result.isActive, false);
});

test("updateStudentProfile only persists allowed student fields", async () => {
  const userId = "507f1f77bcf86cd799439011";
  let filterPayload;
  let updatePayload;

  mock.method(Student, "findOneAndUpdate", async (filter, update) => {
    filterPayload = filter;
    updatePayload = update;
    return { _id: "student-1", ...update.$set };
  });

  const result = await updateStudentProfile(userId, {
    fullName: "Student Name",
    phone: "0909000000",
    address: "HCM",
    balance: 999,
  });

  assert.equal(filterPayload.userId.toString(), userId);
  assert.deepEqual(updatePayload, {
    $set: {
      fullName: "Student Name",
      phone: "0909000000",
      address: "HCM",
    },
  });
  assert.equal(result.fullName, "Student Name");
});

test("updateInstructorProfile only persists allowed instructor fields", async () => {
  const userId = "507f1f77bcf86cd799439012";
  let filterPayload;
  let updatePayload;

  mock.method(Instructor, "findOneAndUpdate", async (filter, update) => {
    filterPayload = filter;
    updatePayload = update;
    return { _id: "instructor-1", ...update.$set };
  });

  const result = await updateInstructorProfile(userId, {
    name: "Instructor Name",
    bio: "Bio",
    expertise: ["math"],
    revenue: 1000,
  });

  assert.equal(filterPayload.userId.toString(), userId);
  assert.deepEqual(updatePayload, {
    $set: {
      name: "Instructor Name",
      bio: "Bio",
      expertise: ["math"],
    },
  });
  assert.equal(result.name, "Instructor Name");
});
