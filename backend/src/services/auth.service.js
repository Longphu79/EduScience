import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Instructor from '../models/Instructor.js';
import Student from '../models/Student.js';
import { signToken } from '../config/jwt.js';

//register service
export const register = async ({ username, email, password, role }) => {
    const existingUser = await User.findOne({
    $or: [
      { username: username.toLowerCase() },
      { email: email?.toLowerCase() },
    ],
  });
    if (existingUser) {
        throw new Error('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

const user = await User.create({
    username: username.toLowerCase(),
    email: email?.toLowerCase(),
    password: hashedPassword,
    role,
  });

    if (role === 'instructor') {
        await Instructor.create({ userId: user._id });
    }

    if (role === 'student') {
        await Student.create({ userId: user._id });
    }

    const token = signToken({ userId: user._id, role: user.role });
    return { user, token };
}

//login service
export const login = async ({ username, password }) => {
 if (!username || !password) {
    throw new Error("Username and password are required");
  }

const user = await User.findOne({
  username: username.toLowerCase(),
}).select("+password");


  if (!user) {
    throw new Error("Username or password is invalid");
  }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Username or password are Invalid!');
    }

    const token = signToken({ userId: user._id, role: user.role });
    return { user, token };
}