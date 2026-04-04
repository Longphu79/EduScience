import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Instructor from "../models/Instructor.js";
import Student from "../models/Student.js";
import { signToken } from "../config/jwt.js";

const sanitizeUser = (user) => {
  const plainUser = typeof user?.toObject === "function" ? user.toObject() : { ...user };
  delete plainUser.password;
  return plainUser;
};

//register service
export const register = async ({ username, email, password, role }) => {
    const normalizedUsername = username?.trim().toLowerCase();
    const normalizedEmail = email?.trim().toLowerCase();

    const existingUser = await User.findOne({
    $or: [
      { username: normalizedUsername},
      { email: normalizedEmail},
    ],
  });
    if (existingUser) {
        throw new Error("Username or email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashedPassword,
    role,
  });

    if (role === "instructor") {
        await Instructor.create({ userId: user._id, name: username });
    }

    if (role === "student") {
        await Student.create({ userId: user._id });
    }

    if (role === "admin") {
        await Admin.create({ userId: user._id, name: username });
    } 

    const token = signToken({ userId: user._id, role: user.role });
    return { user: sanitizeUser(user), token };
}

//login service
export const login = async ({ username, password }) => {
 if (!username || !password) {
    throw new Error("Username and password are required");
  }

 const user = await User.findOne({
  username: username?.trim().toLowerCase(),
 }).select("+password");




  if (!user) {
    throw new Error("Username or password is invalid");
  }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Username or password is invalid");
    }

    const token = signToken({ userId: user._id, role: user.role });
    return { user: sanitizeUser(user), token };
}
