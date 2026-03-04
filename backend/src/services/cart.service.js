import Cart from "../models/Cart.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

/**
 * Lấy cart theo user
 */
export const getCart = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  let cart = await Cart.findOne({ user: userId })
    .populate("items.course");

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  return cart;
};


/**
 * Thêm course vào cart
 */
export const addCourseToCart = async (userId, courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new Error("Invalid courseId");
  }

  const course = await Course.findById(courseId);

  if (!course || course.status !== "published") {
    throw new Error("Course not available");
  }

  let cart = await Cart.findOne({ user: new mongoose.Types.ObjectId(userId) });

  // Nếu chưa có cart → tạo mới
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{ course: courseId, quantity: 1 }],
    });

    return await cart.populate("items.course");
  }

  // Kiểm tra course đã tồn tại chưa
  const existingItem = cart.items.find(
    (item) => item.course.toString() === courseId.toString()
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

export const removeCourseFromCart = async (userId, courseId) => {
  if (!mongoose.Types.ObjectId.isValid(courseId)) {
    throw new Error("Invalid courseId");
  }

  const cart = await Cart.findOneAndUpdate(
    { user: new mongoose.Types.ObjectId(userId) },
    { $pull: { items: { course: courseId } } },
    { new: true }
  );

  if (!cart) {
    throw new Error("Cart not found");
  }

  return cart;
}