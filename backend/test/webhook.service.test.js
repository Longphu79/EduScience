import assert from "node:assert/strict";
import { afterEach, test, mock } from "node:test";

import Cart from "../src/models/Cart.js";
import Course from "../src/models/Course.js";
import Enrollment from "../src/models/Enrollment.js";
import Instructor from "../src/models/Instructor.js";
import Order from "../src/models/Order.js";
import Student from "../src/models/Student.js";
import { parseOrderCode, processWebhook } from "../src/services/webhook.service.js";

afterEach(() => {
  mock.restoreAll();
});

test("parseOrderCode extracts the EduScience order code from transfer content", () => {
  assert.equal(parseOrderCode("Thanh toan EDABC123XYZ khoa hoc"), "EDABC123XYZ");
  assert.equal(parseOrderCode("no order code here"), null);
});

test("processWebhook ignores unsupported transfer types", async () => {
  const result = await processWebhook({
    id: 1,
    transferType: "out",
    transferAmount: 100,
    content: "EDIGNORED",
  });

  assert.deepEqual(result, {
    ignored: true,
    reason: "unsupported-transfer-type",
  });
});

test("processWebhook ignores payloads without an order code", async () => {
  const result = await processWebhook({
    id: 1,
    transferType: "in",
    transferAmount: 100,
    content: "khong co ma don",
  });

  assert.deepEqual(result, {
    ignored: true,
    reason: "missing-order-code",
  });
});

test("processWebhook ignores unknown orders", async () => {
  mock.method(Order, "findOne", async () => null);

  const result = await processWebhook({
    id: 1,
    transferType: "in",
    transferAmount: 100,
    content: "EDUNKNOWN",
  });

  assert.deepEqual(result, {
    ignored: true,
    reason: "order-not-found",
  });
});

test("processWebhook ignores amount mismatches", async () => {
  mock.method(Order, "findOne", async () => ({
    _id: "order-1",
    orderCode: "EDLOW",
    totalAmount: 300,
  }));

  const result = await processWebhook({
    id: 1,
    transferType: "in",
    transferAmount: 200,
    content: "EDLOW",
  });

  assert.deepEqual(result, {
    ignored: true,
    reason: "amount-mismatch",
  });
});

test("processWebhook treats duplicate completed webhooks as a no-op", async () => {
  mock.method(Order, "findOne", async () => ({
    _id: "order-1",
    orderCode: "EDDONE",
    totalAmount: 100,
    status: "paid",
    fulfillmentStatus: "completed",
    sepayTransactionId: "99",
  }));

  const result = await processWebhook({
    id: 99,
    transferType: "in",
    transferAmount: 100,
    content: "EDDONE",
  });

  assert.deepEqual(result, {
    ignored: true,
    reason: "already-completed",
  });
});

test("processWebhook ignores a different transaction once an order is already paid", async () => {
  mock.method(Order, "findOne", async () => ({
    _id: "order-1",
    orderCode: "EDPAID",
    totalAmount: 100,
    status: "paid",
    fulfillmentStatus: "processing",
    sepayTransactionId: "old-transaction",
  }));

  const result = await processWebhook({
    id: "new-transaction",
    transferType: "in",
    transferAmount: 100,
    content: "EDPAID",
  });

  assert.deepEqual(result, {
    ignored: true,
    reason: "different-transaction-already-processed",
  });
});

test("processWebhook fulfills a claimed order and only increments side effects for newly created enrollments", async () => {
  const claimedOrder = {
    _id: "order-fulfilled",
    userId: "user-1",
    orderCode: "EDSUCCESS",
    items: [
      { courseId: "course-1", title: "Physics", price: 120, quantity: 1 },
      { courseId: "course-2", title: "Math", price: 80, quantity: 1 },
    ],
  };
  const enrollmentCalls = [];
  const courseUpdates = [];
  const revenueUpdates = [];
  const orderUpdates = [];
  const cartUpdates = [];

  mock.method(Order, "findOne", async () => ({
    _id: "order-fulfilled",
    orderCode: "EDSUCCESS",
    totalAmount: 200,
    status: "pending",
  }));
  mock.method(Order, "findOneAndUpdate", async () => claimedOrder);
  mock.method(Student, "findOne", () => ({
    select: async () => ({ _id: "student-1" }),
  }));
  mock.method(Enrollment, "updateOne", async (filter) => {
    enrollmentCalls.push(filter.courseId);
    return { upsertedCount: filter.courseId === "course-1" ? 1 : 0 };
  });
  mock.method(Course, "findByIdAndUpdate", (courseId, update) => {
    courseUpdates.push({ courseId, update });
    return {
      select: async () => ({ instructorId: "instructor-1" }),
    };
  });
  mock.method(Instructor, "findByIdAndUpdate", async (instructorId, update) => {
    revenueUpdates.push({ instructorId, update });
    return { _id: instructorId };
  });
  mock.method(Cart, "findOneAndUpdate", async (filter, update) => {
    cartUpdates.push({ filter, update });
    return { _id: "cart-1" };
  });
  mock.method(Order, "findByIdAndUpdate", async (orderId, update) => {
    orderUpdates.push({ orderId, update });
    return { _id: orderId };
  });

  const result = await processWebhook({
    id: 999,
    transferType: "in",
    transferAmount: 200,
    content: "EDSUCCESS",
  });

  assert.deepEqual(result, {
    ignored: false,
    orderCode: "EDSUCCESS",
  });
  assert.deepEqual(enrollmentCalls, ["course-1", "course-2"]);
  assert.deepEqual(courseUpdates, [
    { courseId: "course-1", update: { $inc: { totalEnrollments: 1 } } },
  ]);
  assert.deepEqual(revenueUpdates, [
    { instructorId: "instructor-1", update: { $inc: { revenue: 120 } } },
  ]);
  assert.equal(cartUpdates.length, 1);
  assert.deepEqual(cartUpdates[0].update, {
    $pull: {
      items: {
        course: { $in: ["course-1", "course-2"] },
      },
    },
  });
  assert.deepEqual(orderUpdates[0], {
    orderId: "order-fulfilled",
    update: {
      $set: {
        fulfillmentStatus: "completed",
        fulfilledAt: orderUpdates[0].update.$set.fulfilledAt,
        lastProcessingError: null,
      },
    },
  });
});

test("processWebhook marks the order as failed and throws when fulfillment cannot complete", async () => {
  const failureUpdates = [];

  mock.method(Order, "findOne", async () => ({
    _id: "order-failed",
    orderCode: "EDFAIL",
    totalAmount: 200,
    status: "pending",
  }));
  mock.method(Order, "findOneAndUpdate", async () => ({
    _id: "order-failed",
    userId: "user-1",
    orderCode: "EDFAIL",
    items: [{ courseId: "course-1", title: "Physics", price: 200 }],
  }));
  mock.method(Student, "findOne", () => ({
    select: async () => null,
  }));
  mock.method(Order, "findByIdAndUpdate", async (orderId, update) => {
    failureUpdates.push({ orderId, update });
    return { _id: orderId };
  });

  await assert.rejects(
    () =>
      processWebhook({
        id: 123,
        transferType: "in",
        transferAmount: 200,
        content: "EDFAIL",
      }),
    {
      message: "Student profile not found for order",
      statusCode: 500,
    },
  );

  assert.deepEqual(failureUpdates[0], {
    orderId: "order-failed",
    update: {
      $set: {
        fulfillmentStatus: "failed",
        lastProcessingError: "Student profile not found for order",
      },
    },
  });
});

test("processWebhook completes fulfillment without revenue updates when the course has no instructor", async () => {
  const instructorUpdates = [];

  mock.method(Order, "findOne", async () => ({
    _id: "order-no-instructor",
    orderCode: "EDNOINSTRUCTOR",
    totalAmount: 90,
    status: "pending",
  }));
  mock.method(Order, "findOneAndUpdate", async () => ({
    _id: "order-no-instructor",
    userId: "user-1",
    orderCode: "EDNOINSTRUCTOR",
    items: [{ courseId: "course-1", title: "Physics", price: 90 }],
  }));
  mock.method(Student, "findOne", () => ({
    select: async () => ({ _id: "student-1" }),
  }));
  mock.method(Enrollment, "updateOne", async () => ({ upsertedCount: 1 }));
  mock.method(Course, "findByIdAndUpdate", () => ({
    select: async () => ({ instructorId: null }),
  }));
  mock.method(Instructor, "findByIdAndUpdate", async (...args) => {
    instructorUpdates.push(args);
    return null;
  });
  mock.method(Cart, "findOneAndUpdate", async () => ({ _id: "cart-1" }));
  mock.method(Order, "findByIdAndUpdate", async () => ({ _id: "order-no-instructor" }));

  const result = await processWebhook({
    id: 456,
    transferType: "in",
    transferAmount: 90,
    content: "EDNOINSTRUCTOR",
  });

  assert.deepEqual(result, {
    ignored: false,
    orderCode: "EDNOINSTRUCTOR",
  });
  assert.equal(instructorUpdates.length, 0);
});

test("processWebhook falls back to a default error message when fulfillment throws a non-Error value", async () => {
  const failureUpdates = [];

  mock.method(Order, "findOne", async () => ({
    _id: "order-weird-error",
    orderCode: "EDWEIRD",
    totalAmount: 110,
    status: "pending",
  }));
  mock.method(Order, "findOneAndUpdate", async () => ({
    _id: "order-weird-error",
    userId: "user-1",
    orderCode: "EDWEIRD",
    items: [{ courseId: "course-1", title: "Physics", price: 110 }],
  }));
  mock.method(Student, "findOne", () => ({
    select: async () => ({ _id: "student-1" }),
  }));
  mock.method(Enrollment, "updateOne", async () => {
    throw {};
  });
  mock.method(Order, "findByIdAndUpdate", async (orderId, update) => {
    failureUpdates.push({ orderId, update });
    return { _id: orderId };
  });

  await assert.rejects(
    () =>
      processWebhook({
        id: 789,
        transferType: "in",
        transferAmount: 110,
        content: "EDWEIRD",
      }),
    {
      message: "Webhook fulfillment failed",
      statusCode: 500,
    },
  );

  assert.equal(failureUpdates[0].orderId, "order-weird-error");
  assert.deepEqual(failureUpdates[0].update, {
    $set: {
      fulfillmentStatus: "failed",
      lastProcessingError: undefined,
    },
  });
});

test("processWebhook returns a no-op when a paid order cannot be claimed anymore", async () => {
  mock.method(Order, "findOne", async () => ({
    _id: "order-locked",
    orderCode: "EDLOCK",
    totalAmount: 100,
    status: "paid",
    fulfillmentStatus: "failed",
    sepayTransactionId: "tx-1",
  }));
  mock.method(Order, "findOneAndUpdate", async () => null);
  mock.method(Order, "findById", async () => ({
    _id: "order-locked",
    status: "paid",
    fulfillmentStatus: "failed",
    sepayTransactionId: "tx-1",
  }));

  const result = await processWebhook({
    id: "tx-1",
    transferType: "in",
    transferAmount: 100,
    content: "EDLOCK",
  });

  assert.deepEqual(result, {
    ignored: true,
    reason: "order-not-claimable",
  });
});

test("processWebhook returns already-completed when claim fails but the latest order is already completed", async () => {
  mock.method(Order, "findOne", async () => ({
    _id: "order-race",
    orderCode: "EDRACE",
    totalAmount: 100,
    status: "paid",
    fulfillmentStatus: "processing",
    sepayTransactionId: "tx-race",
  }));
  mock.method(Order, "findOneAndUpdate", async () => null);
  mock.method(Order, "findById", async () => ({
    _id: "order-race",
    status: "paid",
    fulfillmentStatus: "completed",
    sepayTransactionId: "tx-race",
  }));

  const result = await processWebhook({
    id: "tx-race",
    transferType: "in",
    transferAmount: 100,
    content: "EDRACE",
  });

  assert.deepEqual(result, {
    ignored: true,
    reason: "already-completed",
  });
});
