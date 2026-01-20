import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Instructor from "../models/Instructor.js";
import Student from "../models/Student.js";
import { signToken } from "../config/jwt.js";

export const register = async ({ username, email, password, role }) => {
  if (!username || !password) throw new Error("Username and password are required");
  const normalizedUsername = username.toLowerCase().trim();
  const normalizedEmail = email ? email.toLowerCase().trim() : undefined;

  const existed = await User.findOne({
    $or: [
      { username: normalizedUsername },
      ...(normalizedEmail ? [{ email: normalizedEmail }] : []),
    ],
  });

  if (existed) {
    if (existed.username === normalizedUsername) throw new Error("Username already exists");
    if (normalizedEmail && existed.email === normalizedEmail) throw new Error("Email already exists");
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });

  if (role === "instructor") await Instructor.create({ userId: user._id });
  if (role === "student") await Student.create({ userId: user._id });

  const token = signToken({ userId: user._id, role: user.role });

  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, token };
};

export const login = async ({ username, password }) => {
  if (!username || !password) throw new Error("Username and password are required");
  const normalizedUsername = username.toLowerCase().trim();

  const user = await User.findOne({ username: normalizedUsername }).select("+password");
  if (!user) throw new Error("Username or password is invalid");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Username or password is invalid");

  const token = signToken({ userId: user._id, role: user.role });

  const safeUser = user.toObject();
  delete safeUser.password;

  return { user: safeUser, token };
};
