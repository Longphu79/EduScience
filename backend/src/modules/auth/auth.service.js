import bcrypt from "bcryptjs";
import User from "../user/user.model.js";
import Instructor from "../../models/Instructor.js";
import Student from "../../models/Student.js";
import { signToken } from "../../config/jwt.js";

function sanitizeUser(userDoc) {
  if (!userDoc) return null;

  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.password;
  return user;
}

export const register = async ({ username, email, password, role }) => {
  const normalizedUsername = username?.trim().toLowerCase();
  const normalizedEmail = email?.trim()?.toLowerCase() || undefined;
  const normalizedRole = role?.trim().toLowerCase();

  if (!normalizedUsername || !password || !normalizedRole) {
    throw new Error("Username, password and role are required");
  }

  if (String(password).trim().length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (!["student", "instructor", "admin"].includes(normalizedRole)) {
    throw new Error("Role is invalid");
  }

  if (
    normalizedEmail &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
  ) {
    throw new Error("Email is invalid");
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
    role: normalizedRole,
  });

  if (normalizedRole === "instructor") {
    await Instructor.create({
      userId: user._id,
      name: normalizedUsername,
    });
  }

  if (normalizedRole === "student") {
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

  return {
    user: sanitizeUser(safeUser),
    token,
  };
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

  if (!user.isActive) {
    throw new Error("Your account has been deactivated");
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

  return {
    user: sanitizeUser(safeUser),
    token,
  };
};