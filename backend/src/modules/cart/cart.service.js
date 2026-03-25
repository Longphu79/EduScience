import mongoose from "mongoose";
import Cart from "./cart.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import { createEnrollmentRecord } from "../enrollment/enrollment.service.js";

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

const cartPopulateOptions = {
  path: "items.course",
  select:
    "title slug shortDescription description category thumbnail previewVideo level language duration price salePrice isFree instructorId rating totalReviews totalEnrollments isPopular status totalLessons",
};

async function getPopulatedCartById(cartId) {
  return Cart.findById(cartId).populate(cartPopulateOptions);
}

async function ensureCart(userId) {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
}

function getEffectiveCoursePrice(courseDoc) {
  if (!courseDoc) return 0;
  if (courseDoc.isFree === true || Number(courseDoc.price || 0) === 0) return 0;

  if (Number(courseDoc.salePrice) > 0) {
    return Number(courseDoc.salePrice);
  }

  return Number(courseDoc.price || 0);
}

function buildSkippedCourse(courseId, courseDoc, reason) {
  return {
    courseId: String(courseId || ""),
    title: courseDoc?.title || "",
    reason,
  };
}

export const getCart = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  let cart = await Cart.findOne({ user: userId }).populate(cartPopulateOptions);

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });

    cart = await getPopulatedCartById(cart._id);
  }

  return cart;
};

export const addCourseToCart = async (userId, courseId, quantity = 1) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  if (!isValidObjectId(courseId)) {
    throw new Error("Invalid courseId");
  }

  const normalizedQty = Number(quantity);
  const nextQuantity =
    !Number.isNaN(normalizedQty) && normalizedQty > 0 ? normalizedQty : 1;

  const course = await Course.findById(courseId);

  if (!course || course.status !== "published") {
    throw new Error("Course not available");
  }

  if (String(course.instructorId) === String(userId)) {
    throw new Error("Instructor cannot add own course to cart");
  }

  const isFreeCourse =
    course.isFree === true || Number(course.price || 0) === 0;

  if (isFreeCourse) {
    throw new Error("Free course does not need cart, please enroll directly");
  }

  const existingEnrollment = await Enrollment.findOne({
    studentId: userId,
    courseId,
  });

  if (existingEnrollment) {
    throw new Error("You already enrolled in this course");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ course: courseId, quantity: nextQuantity }],
    });

    return getPopulatedCartById(cart._id);
  }

  const existingItem = cart.items.find(
    (item) => String(item.course) === String(courseId)
  );

  if (existingItem) {
    existingItem.quantity += nextQuantity;
  } else {
    cart.items.push({
      course: courseId,
      quantity: nextQuantity,
    });
  }

  await cart.save();

  return getPopulatedCartById(cart._id);
};

export const removeCourseFromCart = async (userId, courseId) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  if (!isValidObjectId(courseId)) {
    throw new Error("Invalid courseId");
  }

  const cart = await ensureCart(userId);

  cart.items = cart.items.filter(
    (item) => String(item.course) !== String(courseId)
  );

  await cart.save();

  return getPopulatedCartById(cart._id);
};

export const updateCartItemQuantity = async (userId, courseId, quantity) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  if (!isValidObjectId(courseId)) {
    throw new Error("Invalid courseId");
  }

  const normalizedQty = Number(quantity);

  if (Number.isNaN(normalizedQty) || normalizedQty < 1) {
    throw new Error("Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const existingItem = cart.items.find(
    (item) => String(item.course) === String(courseId)
  );

  if (!existingItem) {
    throw new Error("Cart item not found");
  }

  existingItem.quantity = normalizedQty;

  await cart.save();

  return getPopulatedCartById(cart._id);
};

export const clearCart = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  const cart = await ensureCart(userId);
  cart.items = [];
  await cart.save();

  return getPopulatedCartById(cart._id);
};

export const checkoutCart = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  const cart = await Cart.findOne({ user: userId }).populate(cartPopulateOptions);

  if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  const purchasedCourses = [];
  const skippedCourses = [];
  const processedCourseIds = new Set();

  for (const item of cart.items) {
    const courseDoc = item?.course;
    const courseId = courseDoc?._id || item?.course;

    if (!courseDoc || !courseId) {
      skippedCourses.push(
        buildSkippedCourse(courseId, null, "Course not found")
      );
      if (courseId) processedCourseIds.add(String(courseId));
      continue;
    }

    const isFreeCourse =
      courseDoc.isFree === true || Number(courseDoc.price || 0) === 0;

    if (courseDoc.status !== "published") {
      skippedCourses.push(
        buildSkippedCourse(courseId, courseDoc, "Course not available")
      );
      processedCourseIds.add(String(courseId));
      continue;
    }

    if (String(courseDoc.instructorId) === String(userId)) {
      skippedCourses.push(
        buildSkippedCourse(courseId, courseDoc, "Instructor cannot purchase own course")
      );
      processedCourseIds.add(String(courseId));
      continue;
    }

    if (isFreeCourse) {
      skippedCourses.push(
        buildSkippedCourse(courseId, courseDoc, "Free course should be enrolled directly")
      );
      processedCourseIds.add(String(courseId));
      continue;
    }

    const existingEnrollment = await Enrollment.findOne({
      studentId: userId,
      courseId,
    });

    if (existingEnrollment) {
      skippedCourses.push(
        buildSkippedCourse(courseId, courseDoc, "Already enrolled")
      );
      processedCourseIds.add(String(courseId));
      continue;
    }

    await createEnrollmentRecord({
      studentId: userId,
      courseId,
    });

    purchasedCourses.push({
      courseId: String(courseId),
      title: courseDoc.title,
      pricePaid: getEffectiveCoursePrice(courseDoc),
      quantity: Number(item.quantity || 1),
    });

    processedCourseIds.add(String(courseId));
  }

  cart.items = cart.items.filter((item) => {
    const rawCourseId = item?.course?._id || item?.course;
    return !processedCourseIds.has(String(rawCourseId));
  });

  await cart.save();

  const refreshedCart = await getPopulatedCartById(cart._id);

  return {
    cart: refreshedCart,
    purchasedCourses,
    skippedCourses,
    totalPurchased: purchasedCourses.length,
  };
};