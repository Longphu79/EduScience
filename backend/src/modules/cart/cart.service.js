import mongoose from "mongoose";
import Cart from "./cart.model.js";
import Course from "../course/course.model.js";

export const getCart = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  let cart = await Cart.findOne({ user: userId }).populate("items.course");

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};

export const addCourseToCart = async (userId, courseId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new Error("Invalid courseId");
  }

  const course = await Course.findById(courseId);

  if (!course || course.status !== "published") {
    throw new Error("Course not available");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ course: courseId, quantity: 1 }],
    });

    return await cart.populate("items.course");
  }

  const existingItem = cart.items.find(
    (item) => String(item.course) === String(courseId)
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      course: courseId,
      quantity: 1,
    });
  }

  await cart.save();
  return await cart.populate("items.course");
};