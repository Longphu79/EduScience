import assert from "node:assert/strict";
import { afterEach, test, mock } from "node:test";

import Cart from "../src/models/Cart.js";
import Course from "../src/models/Course.js";
import Order from "../src/models/Order.js";
import Student from "../src/models/Student.js";
import {
  createOrder,
  getCheckoutInfo,
  getOrderById,
  getOrderStatus,
  listOrders,
  retryOrder,
} from "../src/services/checkout.service.js";
import { makeQuery } from "./helpers/query.js";

afterEach(() => {
  mock.restoreAll();
});

test("createOrder rejects when the current user does not have a student profile", async () => {
  mock.method(Student, "findOne", () => makeQuery(null));

  await assert.rejects(() => createOrder("user-1"), {
    message: "Student profile not found",
    statusCode: 403,
  });
});

test("createOrder rejects when cart is empty", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Cart, "findOne", () => makeQuery(null));

  await assert.rejects(() => createOrder("user-1"), {
    message: "Cart is empty",
    statusCode: 400,
  });
});

test("createOrder rejects when cart exists but has no items", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Cart, "findOne", () => makeQuery({ items: [] }));

  await assert.rejects(() => createOrder("user-1"), {
    message: "Cart is empty",
    statusCode: 400,
  });
});

test("createOrder rejects when cart contains unavailable courses", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Cart, "findOne", () =>
    makeQuery({
      items: [
        {
          course: {
            _id: "course-1",
            title: "Unavailable",
            price: 100,
            status: "draft",
          },
          quantity: 1,
        },
      ],
    }),
  );

  await assert.rejects(() => createOrder("user-1"), {
    message: "Cart contains unavailable courses",
    statusCode: 400,
  });
});

test("createOrder rejects when a cart item cannot populate its course", async () => {
  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Cart, "findOne", () =>
    makeQuery({
      items: [
        {
          course: null,
          quantity: 1,
        },
      ],
    }),
  );

  await assert.rejects(() => createOrder("user-1"), {
    message: "Cart contains unavailable courses",
    statusCode: 400,
  });
});

test("createOrder reuses an active pending order with the same cart snapshot", async () => {
  const existingOrder = {
    _id: "order-1",
    orderCode: "EDACTIVE",
    totalAmount: 100,
    status: "pending",
    fulfillmentStatus: "pending",
    expiredAt: new Date(Date.now() + 60_000),
    items: [],
  };

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Cart, "findOne", () =>
    makeQuery({
      items: [
        {
          course: {
            _id: "course-1",
            title: "Physics 101",
            price: 100,
            status: "published",
          },
          quantity: 1,
        },
      ],
    }),
  );
  mock.method(Order, "updateMany", async () => ({ acknowledged: true }));
  mock.method(Order, "findOne", () => makeQuery(existingOrder));
  const createOrderMock = mock.method(Order, "create", async () => {
    throw new Error("should not create a duplicate order");
  });

  const result = await createOrder("user-1");

  assert.equal(result.orderId, "order-1");
  assert.equal(result.orderCode, "EDACTIVE");
  assert.equal(result.status, "pending");
  assert.equal(result.fulfillmentStatus, "pending");
  assert.equal(createOrderMock.mock.calls.length, 0);
});

test("createOrder creates a fresh order when no reusable pending order exists", async () => {
  let createdPayload;

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Cart, "findOne", () =>
    makeQuery({
      items: [
        {
          course: {
            _id: "course-2",
            title: "Chemistry",
            price: 50,
            status: "published",
          },
          quantity: 2,
        },
        {
          course: {
            _id: "course-1",
            title: "Biology",
            price: 100,
            status: "published",
          },
          quantity: 1,
        },
      ],
    }),
  );
  mock.method(Order, "updateMany", async () => ({ acknowledged: true }));
  mock.method(Order, "findOne", () => makeQuery(null));
  mock.method(Order, "create", async (payload) => {
    createdPayload = payload;
    return {
      _id: "order-2",
      status: "pending",
      fulfillmentStatus: "pending",
      ...payload,
    };
  });

  const result = await createOrder("user-1");

  assert.equal(result.orderId, "order-2");
  assert.match(result.orderCode, /^ED/);
  assert.equal(result.totalAmount, 200);
  assert.equal(result.status, "pending");
  assert.equal(result.fulfillmentStatus, "pending");
  assert.equal(createdPayload.itemsSignature, "course-1:1|course-2:2");
  assert.equal(createdPayload.items[0].quantity, 2);
});

test("createOrder defaults a missing cart quantity to one before computing totals and signatures", async () => {
  let createdPayload;

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Cart, "findOne", () =>
    makeQuery({
      items: [
        {
          course: {
            _id: "course-1",
            title: "Physics 101",
            price: 100,
            status: "published",
          },
          quantity: null,
        },
      ],
    }),
  );
  mock.method(Order, "updateMany", async () => ({ acknowledged: true }));
  mock.method(Order, "findOne", () => makeQuery(null));
  mock.method(Order, "create", async (payload) => {
    createdPayload = payload;
    return {
      _id: "order-default-qty",
      status: "pending",
      fulfillmentStatus: "pending",
      ...payload,
    };
  });

  const result = await createOrder("user-1");

  assert.equal(createdPayload.items[0].quantity, 1);
  assert.equal(createdPayload.items[0].price, 100);
  assert.equal(createdPayload.itemsSignature, "course-1:1");
  assert.equal(result.totalAmount, 100);
});

test("createOrder prefers salePrice when cart items have an active discount", async () => {
  let createdPayload;

  mock.method(Student, "findOne", () => makeQuery({ _id: "student-1" }));
  mock.method(Cart, "findOne", () =>
    makeQuery({
      items: [
        {
          course: {
            _id: "course-sale",
            title: "Discounted Chemistry",
            price: 200,
            salePrice: 150,
            status: "published",
          },
          quantity: 2,
        },
      ],
    }),
  );
  mock.method(Order, "updateMany", async () => ({ acknowledged: true }));
  mock.method(Order, "findOne", () => makeQuery(null));
  mock.method(Order, "create", async (payload) => {
    createdPayload = payload;
    return {
      _id: "order-sale",
      status: "pending",
      fulfillmentStatus: "pending",
      ...payload,
    };
  });

  const result = await createOrder("user-1");

  assert.equal(createdPayload.items[0].price, 300);
  assert.equal(result.totalAmount, 300);
});

test("getOrderById returns an order when it exists", async () => {
  const order = { _id: "order-1" };
  mock.method(Order, "findById", async () => order);

  const result = await getOrderById("order-1");

  assert.equal(result, order);
});

test("getOrderById throws when the order does not exist", async () => {
  mock.method(Order, "findById", async () => null);

  await assert.rejects(() => getOrderById("missing-order"), {
    message: "Order not found",
  });
});

test("getCheckoutInfo serializes course slugs and treats legacy paid orders as fulfilled", async () => {
  const order = {
    _id: "order-legacy",
    orderCode: "EDLEGACY",
    userId: "user-1",
    items: [
      {
        courseId: "course-1",
        title: "Physics",
        price: 120,
        quantity: 2,
      },
    ],
    totalAmount: 120,
    status: "paid",
    paidAt: new Date("2026-04-04T10:00:00Z"),
    expiredAt: new Date("2026-04-04T11:00:00Z"),
  };

  mock.method(Order, "findById", async () => order);
  mock.method(Course, "find", () =>
    makeQuery([{ _id: "course-1", slug: "physics" }]),
  );

  const result = await getCheckoutInfo("order-legacy", {
    userId: "user-1",
    role: "student",
  });

  assert.equal(result.fulfillmentStatus, "completed");
  assert.equal(result.isReadyToLearn, true);
  assert.equal(result.canRetry, false);
  assert.equal(result.items[0].courseSlug, "physics");
  assert.equal(result.items[0].quantity, 2);
  assert.match(result.qrUrl, /EDLEGACY/);
});

test("getCheckoutInfo defaults quantity and missing course slug during serialization", async () => {
  const order = {
    _id: "order-serialize",
    orderCode: "EDSERIALIZE",
    userId: "user-1",
    items: [
      {
        toObject() {
          return {
            courseId: "course-missing",
            title: "Unmapped Course",
            price: 75,
          };
        },
      },
    ],
    totalAmount: 75,
    status: "pending",
    expiredAt: new Date("2026-04-04T11:00:00Z"),
  };

  mock.method(Order, "findById", async () => order);
  mock.method(Course, "find", () => makeQuery([]));

  const result = await getCheckoutInfo("order-serialize", {
    userId: "user-1",
    role: "student",
  });

  assert.equal(result.items[0].quantity, 1);
  assert.equal(result.items[0].courseSlug, null);
  assert.equal(result.isReadyToLearn, false);
});

test("getCheckoutInfo keeps active pending orders pending when they have not expired yet", async () => {
  let saved = false;
  const order = {
    _id: "order-active",
    orderCode: "EDACTIVEPENDING",
    userId: "user-1",
    items: [],
    totalAmount: 0,
    status: "pending",
    expiredAt: new Date(Date.now() + 60_000),
    async save() {
      saved = true;
      return this;
    },
  };

  mock.method(Order, "findById", async () => order);

  const result = await getCheckoutInfo("order-active", {
    userId: "user-1",
    role: "student",
  });

  assert.equal(saved, false);
  assert.equal(result.status, "pending");
  assert.equal(result.fulfillmentStatus, "pending");
});

test("getOrderStatus expires stale pending orders and exposes retry metadata", async () => {
  let saved = false;
  const order = {
    _id: "order-expired",
    userId: "user-1",
    items: [],
    totalAmount: 0,
    status: "pending",
    expiredAt: new Date(Date.now() - 60_000),
    async save() {
      saved = true;
      return this;
    },
  };

  mock.method(Order, "findById", async () => order);

  const result = await getOrderStatus("order-expired", {
    userId: "user-1",
    role: "student",
  });

  assert.equal(saved, true);
  assert.equal(order.status, "expired");
  assert.deepEqual(result, {
    status: "expired",
    fulfillmentStatus: "pending",
    canRetry: true,
    isReadyToLearn: false,
  });
});

test("getOrderStatus reports ready-to-learn for paid and fulfilled orders", async () => {
  mock.method(Order, "findById", async () => ({
    _id: "order-paid",
    userId: "user-1",
    items: [],
    totalAmount: 0,
    status: "paid",
    fulfillmentStatus: "completed",
    expiredAt: new Date(Date.now() + 60_000),
  }));

  const result = await getOrderStatus("order-paid", {
    userId: "user-1",
    role: "student",
  });

  assert.deepEqual(result, {
    status: "paid",
    fulfillmentStatus: "completed",
    canRetry: false,
    isReadyToLearn: true,
  });
});

test("listOrders returns serialized order history even when some orders contain no items", async () => {
  const orders = [
    {
      _id: "order-empty",
      orderCode: "EDEMPTY",
      userId: "user-1",
      items: [],
      totalAmount: 0,
      status: "paid",
      expiredAt: new Date("2026-04-04T11:00:00Z"),
    },
  ];
  const courseFindMock = mock.method(Course, "find", () => {
    throw new Error("course lookup should be skipped when there are no items");
  });
  mock.method(Order, "find", () => makeQuery(orders));

  const result = await listOrders({ userId: "user-1" });

  assert.equal(result.length, 1);
  assert.equal(result[0].fulfillmentStatus, "completed");
  assert.equal(result[0].items.length, 0);
  assert.equal(courseFindMock.mock.calls.length, 0);
});

test("retryOrder rejects already paid orders", async () => {
  mock.method(Order, "findById", async () => ({
    _id: "order-paid",
    userId: "user-1",
    items: [],
    totalAmount: 0,
    status: "paid",
    expiredAt: new Date(Date.now() + 60_000),
  }));

  await assert.rejects(
    () => retryOrder("order-paid", { userId: "user-1", role: "student" }),
    {
      message: "Paid orders cannot be retried",
      statusCode: 400,
    },
  );
});

test("retryOrder creates a new pending order from an expired order snapshot", async () => {
  let saved = false;
  mock.method(Order, "findById", async () => ({
    _id: "order-expired",
    userId: "user-1",
    items: [
      {
        courseId: "course-1",
        title: "Physics",
        price: 120,
        quantity: 1,
      },
    ],
    totalAmount: 120,
    status: "pending",
    expiredAt: new Date(Date.now() - 10_000),
    async save() {
      saved = true;
      return this;
    },
  }));
  mock.method(Order, "updateMany", async () => ({ acknowledged: true }));
  mock.method(Order, "findOne", () => makeQuery(null));
  mock.method(Order, "create", async (payload) => ({
    _id: "order-retry",
    status: "pending",
    fulfillmentStatus: "pending",
    ...payload,
  }));

  const result = await retryOrder("order-expired", {
    userId: "user-1",
    role: "student",
  });

  assert.equal(saved, true);
  assert.equal(result.orderId, "order-retry");
  assert.equal(result.status, "pending");
  assert.equal(result.fulfillmentStatus, "pending");
  assert.match(result.qrUrl, /^https:\/\/qr\.sepay\.vn/);
});

test("retryOrder defaults missing item quantity to one when rebuilding the snapshot", async () => {
  let createdPayload;

  mock.method(Order, "findById", async () => ({
    _id: "order-expired-no-qty",
    userId: "user-1",
    items: [
      {
        courseId: "course-1",
        title: "Physics",
        price: 120,
      },
    ],
    totalAmount: 120,
    status: "expired",
    expiredAt: new Date(Date.now() - 10_000),
  }));
  mock.method(Order, "updateMany", async () => ({ acknowledged: true }));
  mock.method(Order, "findOne", () => makeQuery(null));
  mock.method(Order, "create", async (payload) => {
    createdPayload = payload;
    return {
      _id: "order-retry-qty",
      status: "pending",
      fulfillmentStatus: "pending",
      ...payload,
    };
  });

  const result = await retryOrder("order-expired-no-qty", {
    userId: "user-1",
    role: "student",
  });

  assert.equal(createdPayload.items[0].quantity, 1);
  assert.equal(createdPayload.itemsSignature, "course-1:1");
  assert.equal(result.orderId, "order-retry-qty");
});
