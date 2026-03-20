import bcrypt from "bcryptjs";
import User from "./user.model.js";

function sanitizeUser(userDoc) {
  if (!userDoc) return null;

  const user = userDoc.toObject ? userDoc.toObject() : userDoc;
  delete user.password;

  return user;
}

function normalizeString(value = "") {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function pickAllowedFields(payload = {}, role = "student") {
  const common = {
    fullName: normalizeString(payload.fullName),
    avatarUrl: normalizeString(payload.avatarUrl),
    bio: normalizeString(payload.bio),
    phone: normalizeString(payload.phone),
  };

  if (role === "instructor") {
    return {
      ...common,
      coverImageUrl: normalizeString(payload.coverImageUrl),
      headline: normalizeString(payload.headline),
      expertise: normalizeStringArray(payload.expertise),
    };
  }

  if (role === "student") {
    return {
      ...common,
      headline: normalizeString(payload.headline),
      learningGoals: normalizeStringArray(payload.learningGoals),
    };
  }

  return {
    ...common,
    coverImageUrl: normalizeString(payload.coverImageUrl),
    headline: normalizeString(payload.headline),
    expertise: normalizeStringArray(payload.expertise),
    learningGoals: normalizeStringArray(payload.learningGoals),
  };
}

function toPublicProfile(user) {
  if (!user) return null;

  return {
    _id: user._id,
    username: user.username || "",
    role: user.role || "user",
    fullName: user.fullName || "",
    avatarUrl: user.avatarUrl || "",
    coverImageUrl: user.coverImageUrl || "",
    headline: user.headline || "",
    bio: user.bio || "",
    expertise: Array.isArray(user.expertise) ? user.expertise : [],
    learningGoals: Array.isArray(user.learningGoals) ? user.learningGoals : [],
    isActive: user.isActive !== false,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function toPrivateProfile(user) {
  const sanitized = sanitizeUser(user);
  if (!sanitized) return null;
  return sanitized;
}

export const getProfile = async (
  userId,
  { requesterId = null, requesterRole = null } = {}
) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId).lean();

  if (!user) {
    throw new Error("User not found");
  }

  const canSeePrivate =
    requesterRole === "admin" ||
    String(requesterId || "") === String(userId || "");

  return canSeePrivate ? toPrivateProfile(user) : toPublicProfile(user);
};

export const updateProfile = async (userId, payload) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  const updates = pickAllowedFields(payload, user.role);

  Object.entries(updates).forEach(([key, value]) => {
    user[key] = value;
  });

  await user.save();

  return sanitizeUser(user);
};

export const updateProfileAvatar = async (userId, avatarUrl) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.avatarUrl = normalizeString(avatarUrl);
  await user.save();

  return sanitizeUser(user);
};

export const updateProfileCover = async (userId, coverImageUrl) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  user.coverImageUrl = normalizeString(coverImageUrl);
  await user.save();

  return sanitizeUser(user);
};

export const deactivateAccount = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    throw new Error("User not found");
  }

  return sanitizeUser(user);
};

export const updateStudentProfile = async (userId, payload) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Student profile not found");
  }

  if (user.role !== "student" && user.role !== "admin") {
    throw new Error("Only student profile can be updated here");
  }

  const updates = {
    fullName: normalizeString(payload.fullName),
    avatarUrl: normalizeString(payload.avatarUrl),
    headline: normalizeString(payload.headline),
    bio: normalizeString(payload.bio),
    phone: normalizeString(payload.phone),
    learningGoals: normalizeStringArray(payload.learningGoals),
  };

  Object.entries(updates).forEach(([key, value]) => {
    user[key] = value;
  });

  await user.save();

  return sanitizeUser(user);
};

export const updateInstructorProfile = async (userId, payload) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Instructor profile not found");
  }

  if (user.role !== "instructor" && user.role !== "admin") {
    throw new Error("Only instructor profile can be updated here");
  }

  const updates = {
    fullName: normalizeString(payload.fullName),
    avatarUrl: normalizeString(payload.avatarUrl),
    coverImageUrl: normalizeString(payload.coverImageUrl),
    headline: normalizeString(payload.headline),
    bio: normalizeString(payload.bio),
    phone: normalizeString(payload.phone),
    expertise: normalizeStringArray(payload.expertise),
  };

  Object.entries(updates).forEach(([key, value]) => {
    user[key] = value;
  });

  await user.save();

  return sanitizeUser(user);
};

export const changePassword = async (userId, oldPassword, newPassword) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!oldPassword || !newPassword) {
    throw new Error("Old password and new password are required");
  }

  if (String(newPassword).trim().length < 6) {
    throw new Error("New password must be at least 6 characters");
  }

  const user = await User.findById(userId).select("+password");

  if (!user) {
    throw new Error("User not found");
  }

  const isMatched = await bcrypt.compare(oldPassword, user.password);

  if (!isMatched) {
    throw new Error("Old password is incorrect");
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  await user.save();

  return { message: "Password updated successfully" };
};