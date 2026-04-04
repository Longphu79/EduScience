import assert from "node:assert/strict";
import { test } from "node:test";

import { signToken } from "../src/config/jwt.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireRoles,
} from "../src/middleware/authMiddleware.js";

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-secret";

const createResponse = () => ({
  statusCode: null,
  body: null,
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(payload) {
    this.body = payload;
    return this;
  },
});

test("authMiddleware rejects missing bearer tokens", () => {
  const req = { headers: {} };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Unauthorized" });
});

test("authMiddleware rejects invalid tokens", () => {
  const req = {
    headers: {
      authorization: "Bearer invalid-token",
    },
  };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Invalid token" });
});

test("authMiddleware attaches req.user and req.actor for valid tokens", () => {
  const token = signToken({ userId: "user-1", role: "student" });
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  const res = createResponse();
  let nextCalled = false;

  authMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.user.userId, "user-1");
  assert.equal(req.user.role, "student");
  assert.deepEqual(req.actor, {
    userId: "user-1",
    role: "student",
  });
});

test("optionalAuthMiddleware falls through when no token is provided", () => {
  const req = { headers: {} };
  let nextCalled = false;

  optionalAuthMiddleware(req, createResponse(), () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.actor, undefined);
});

test("optionalAuthMiddleware ignores invalid tokens on public routes", () => {
  const req = {
    headers: {
      authorization: "Bearer invalid-token",
    },
  };
  let nextCalled = false;

  optionalAuthMiddleware(req, createResponse(), () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.actor, undefined);
});

test("optionalAuthMiddleware attaches actor when the token is valid", () => {
  const token = signToken({ userId: "user-2", role: "instructor" });
  const req = {
    headers: {
      authorization: `Bearer ${token}`,
    },
  };
  let nextCalled = false;

  optionalAuthMiddleware(req, createResponse(), () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.deepEqual(req.actor, {
    userId: "user-2",
    role: "instructor",
  });
});

test("requireRoles rejects unauthenticated actors", () => {
  const middleware = requireRoles("student");
  const req = {};
  const res = createResponse();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.deepEqual(res.body, { message: "Unauthorized" });
});

test("requireRoles rejects actors outside the allowed role list", () => {
  const middleware = requireRoles("student");
  const req = {
    actor: {
      userId: "user-1",
      role: "instructor",
    },
  };
  const res = createResponse();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.deepEqual(res.body, { message: "Forbidden" });
});

test("requireRoles allows authorized actors through", () => {
  const middleware = requireRoles("student", "admin");
  const req = {
    actor: {
      userId: "user-1",
      role: "student",
    },
  };
  let nextCalled = false;

  middleware(req, createResponse(), () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
});
