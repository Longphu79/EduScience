import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Instructor from "../models/Instructor.js";
import Student from "../models/Student.js";
import { signToken } from "../config/jwt.js";

export const register = async ({ username, email, password, role }) => {
  const normalizedUsername = username?.trim().toLowerCase();
  const normalizedEmail = email?.trim()?.toLowerCase() || undefined;

  if (!normalizedUsername || !password || !role) {
    throw new Error("Username, password and role are required");
  }

  const existingUsername = await User.findOne({ username: normalizedUsername });
  if (existingUsername) {
    throw new Error("Username already exists");
  }

  if (normalizedEmail) {
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      throw new Error("Email already exists");
    }
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });

  if (role === "instructor") {
    await Instructor.create({
      userId: user._id,
      name: normalizedUsername,
    });
  }

  if (role === "student") {
    await Student.create({
      userId: user._id,
      fullName: normalizedUsername,
    });
  }

  const token = signToken({
    userId: user._id,
    role: user.role,
  });

  const safeUser = await User.findById(user._id);

  return { user: safeUser, token };
};

export const login = async ({ username, password }) => {
  const normalizedUsername = username?.trim().toLowerCase();

  if (!normalizedUsername || !password) {
    throw new Error("Username and password are required");
  }

  const user = await User.findOne({
    username: normalizedUsername,
  }).select("+password");

  if (!user) {
    throw new Error("Username or password is invalid");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Username or password is invalid");
  }

  const token = signToken({
    userId: user._id,
    role: user.role,
  });

  const safeUser = await User.findById(user._id);

  return { user: safeUser, token };
};