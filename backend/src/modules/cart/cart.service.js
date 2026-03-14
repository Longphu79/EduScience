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
  return await Cart.findById(cartId).populate(cartPopulateOptions);
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

    return await getPopulatedCartById(cart._id);
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

  return await getPopulatedCartById(cart._id);
};

export const removeCourseFromCart = async (userId, courseId) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  if (!isValidObjectId(courseId)) {
    throw new Error("Invalid courseId");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  cart.items = cart.items.filter(
    (item) => String(item.course) !== String(courseId)
  );

  await cart.save();

  return await getPopulatedCartById(cart._id);
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

  return await getPopulatedCartById(cart._id);
};

export const clearCart = async (userId) => {
  if (!isValidObjectId(userId)) {
    throw new Error("Invalid userId");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  } else {
    cart.items = [];
    await cart.save();
  }

  return await getPopulatedCartById(cart._id);
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

  for (const item of cart.items) {
    const courseDoc = item?.course;
    const courseId = courseDoc?._id || item?.course;

    if (!courseDoc || !courseId) {
      skippedCourses.push({
        courseId: String(courseId || ""),
        reason: "Course not found",
      });
      continue;
    }

    const isFreeCourse =
      courseDoc.isFree === true || Number(courseDoc.price || 0) === 0;

    if (courseDoc.status !== "published") {
      skippedCourses.push({
        courseId: String(courseId),
        title: courseDoc.title,
        reason: "Course not available",
      });
      continue;
    }

    if (isFreeCourse) {
      skippedCourses.push({
        courseId: String(courseId),
        title: courseDoc.title,
        reason: "Free course should be enrolled directly",
      });
      continue;
    }

    const existingEnrollment = await Enrollment.findOne({
      studentId: userId,
      courseId,
    });

    if (existingEnrollment) {
      skippedCourses.push({
        courseId: String(courseId),
        title: courseDoc.title,
        reason: "Already enrolled",
      });
      continue;
    }

    await createEnrollmentRecord({
      studentId: userId,
      courseId,
    });

    purchasedCourses.push({
      courseId: String(courseId),
      title: courseDoc.title,
      pricePaid:
        Number(courseDoc.salePrice) > 0
          ? Number(courseDoc.salePrice)
          : Number(courseDoc.price || 0),
      quantity: Number(item.quantity || 1),
    });
  }

  cart.items = [];
  await cart.save();

  const refreshedCart = await getPopulatedCartById(cart._id);

  return {
    cart: refreshedCart,
    purchasedCourses,
    skippedCourses,
    totalPurchased: purchasedCourses.length,
  };
};