import bcrypt from "bcryptjs";
import crypto from "node:crypto";

import User from "../user/user.model.js";
import Instructor from "../../models/Instructor.js";
import Student from "../../models/Student.js";
import { signToken } from "../../config/jwt.js";
import { sendMail } from "../../config/mail.js";

function sanitizeUser(userDoc) {
  if (!userDoc) return null;

  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;

  return user;
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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

  if (normalizedEmail && !validateEmail(normalizedEmail)) {
    throw new Error("Email is invalid");
  }

  const existingUsername = await User.findOne({
    username: normalizedUsername,
  });

  if (existingUsername) {
    throw new Error("Username already exists");
  }

  if (normalizedEmail) {
    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

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
    fullName: normalizedUsername,
  });

  try {
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
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    throw new Error(error.message || "Register failed");
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

export const forgotPassword = async ({ email }) => {
  const normalizedEmail = email?.trim()?.toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required");
  }

  if (!validateEmail(normalizedEmail)) {
    throw new Error("Email is invalid");
  }

  const user = await User.findOne({ email: normalizedEmail });

  if (!user || !user.isActive) {
    return {
      message:
        "If that email exists in our system, a password reset link has been sent.",
    };
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/auth/reset-password?token=${rawToken}`;

  const subject = "Reset your EduScience password";
  const text = `You requested a password reset.

Reset link: ${resetLink}

This link will expire in 15 minutes.

If you did not request this, please ignore this email.`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
      <h2>EduScience Password Reset</h2>
      <p>You requested a password reset.</p>
      <p>Click the button below to create a new password:</p>
      <p>
        <a
          href="${resetLink}"
          style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;"
        >
          Reset Password
        </a>
      </p>
      <p>Or copy this link:</p>
      <p>${resetLink}</p>
      <p>This link will expire in <strong>15 minutes</strong>.</p>
      <p>If you did not request this, you can ignore this email.</p>
    </div>
  `;

  await sendMail({
    to: normalizedEmail,
    subject,
    text,
    html,
  });

  return {
    message:
      "If that email exists in our system, a password reset link has been sent.",
  };
};

export const resetPassword = async ({ token, password }) => {
  if (!token || !password) {
    throw new Error("Token and password are required");
  }

  if (String(password).trim().length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password");

  if (!user) {
    throw new Error("Reset token is invalid or expired");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save();

  return {
    message: "Password reset successfully",
  };
};