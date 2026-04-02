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
  const normalizedEmail = email?.trim()?.toLowerCase();
  const normalizedRole = role?.trim().toLowerCase();

  if (!normalizedUsername || !normalizedEmail || !password || !normalizedRole) {
    throw new Error("Username, email, password and role are required");
  }

  if (String(password).trim().length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (!["student", "instructor", "admin"].includes(normalizedRole)) {
    throw new Error("Role is invalid");
  }

  if (!validateEmail(normalizedEmail)) {
    throw new Error("Email is invalid");
  }

  const existingUsername = await User.findOne({
    username: normalizedUsername,
  });

  if (existingUsername) {
    throw new Error("Username already exists");
  }

  const existingEmail = await User.findOne({
    email: normalizedEmail,
  });

  if (existingEmail) {
    throw new Error("Email already exists");
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

export const login = async ({ email, password }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail || !password) {
    throw new Error("Email and password are required");
  }

  if (!validateEmail(normalizedEmail)) {
    throw new Error("Email is invalid");
  }

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user) {
    throw new Error("Email or password is invalid");
  }

  if (!user.isActive) {
    throw new Error("Your account has been deactivated");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Email or password is invalid");
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

  if (!user) {
    throw new Error("Your email is not registered in the system.");
  }

  if (!user.isActive) {
    throw new Error("Your account is currently deactivated.");
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save({ validateBeforeSave: false });

  const verifyUser = await User.findById(user._id).lean();

  console.log("[forgotPassword] verify saved token:", {
    userId: verifyUser?._id?.toString(),
    email: verifyUser?.email,
    hasResetPasswordToken: !!verifyUser?.resetPasswordToken,
    resetPasswordExpires: verifyUser?.resetPasswordExpires,
    now: new Date(),
  });

  if (!verifyUser?.resetPasswordToken || !verifyUser?.resetPasswordExpires) {
    throw new Error("Reset token could not be saved. Please try again.");
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const resetLink = `${frontendUrl}/auth/reset-password?token=${rawToken}`;

  console.log("[forgotPassword] reset link:", resetLink);

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

  const mailResult = await sendMail({
    to: normalizedEmail,
    subject,
    text,
    html,
  });

  console.log("[forgotPassword] mail result:", {
    accepted: mailResult?.accepted,
    rejected: mailResult?.rejected,
    messageId: mailResult?.messageId,
  });

  return {
    message: "A password reset email has been sent. Please check your inbox.",
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

  console.log("[resetPassword] incoming token preview:", `${String(token).slice(0, 12)}...`);
  console.log("[resetPassword] hashed token:", hashedToken);
  console.log("[resetPassword] current time:", new Date());

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  }).select("+password");

  if (!user) {
    console.log("[resetPassword] no user matched this token");
    throw new Error("Reset token is invalid or expired");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;

  await user.save({ validateBeforeSave: false });

  console.log("[resetPassword] password reset successful for user:", user._id.toString());

  return {
    message: "Password reset successfully",
  };
};