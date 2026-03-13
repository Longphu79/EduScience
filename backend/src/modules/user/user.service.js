import bcrypt from "bcryptjs";
import User from "./user.model.js";
import Student from "../../models/Student.js";
import Instructor from "../../models/Instructor.js";

export const getUserById = async (userId) => {
  return await User.findById(userId);
};

export const getProfile = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new Error("User not found");
  }

  let profileData = null;
  if (user.role === "student") {
    profileData = await Student.findOne({ userId });
  }

  if (user.role === "instructor") {
    profileData = await Instructor.findOne({ userId });
  }

  return { ...user, profileData };
};

export const updateProfile = async (userId, data) => {
  const allowedFields = ["email", "avatarUrl"];
  const updateData = {};

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  return user;
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw new Error("User not found");
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("Old password is incorrect");
  }
  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();
  return true;
};

export const deactivateAccount = async (userId) => {
  return await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });
};

export const updateStudentProfile = async (userId, data) => {
  return await Student.findOneAndUpdate({ userId }, data, { new: true });
};

export const updateInstructorProfile = async (userId, data) => {
  return await Instructor.findOneAndUpdate({ userId }, data, { new: true });
};