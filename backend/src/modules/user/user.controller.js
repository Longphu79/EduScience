import * as userService from "./user.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getRequesterId(req) {
  return req.user?._id || req.user?.id || req.user?.userId || null;
}

function getRequesterRole(req) {
  return req.user?.role || null;
}

function isAdmin(req) {
  return getRequesterRole(req) === "admin";
}

function canManageUser(req, targetUserId) {
  const requesterId = getRequesterId(req);
  if (!requesterId) return false;
  return isAdmin(req) || String(requesterId) === String(targetUserId);
}

function buildFileUrl(req, file) {
  if (!file) return "";
  return `${req.protocol}://${req.get("host")}/uploads/profile/${file.filename}`;
}

function getErrorStatus(err) {
  if (!err?.message) return 400;

  if (
    err.message === "User not found" ||
    err.message === "Student profile not found" ||
    err.message === "Instructor profile not found"
  ) {
    return 404;
  }

  if (err.message.includes("not allowed")) return 403;

  return 400;
}

export const getProfile = async (req, res) => {
  try {
    const requesterId = getRequesterId(req);
    const requesterRole = getRequesterRole(req);

    const user = await userService.getProfile(req.params.userId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Get profile successfully",
      data: user,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to get profile",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (!canManageUser(req, req.params.userId)) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to update this profile",
      });
    }

    const user = await userService.updateProfile(req.params.userId, req.body);

    return sendSuccess(res, {
      message: "Profile updated successfully",
      data: user,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to update profile",
    });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!canManageUser(req, req.params.userId)) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to upload avatar for this profile",
      });
    }

    if (!req.file) {
      return sendError(res, {
        statusCode: 400,
        message: "Avatar file is required",
      });
    }

    const avatarUrl = buildFileUrl(req, req.file);
    const user = await userService.updateProfileAvatar(
      req.params.userId,
      avatarUrl
    );

    return sendSuccess(res, {
      message: "Avatar uploaded successfully",
      data: user,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to upload avatar",
    });
  }
};

export const uploadCover = async (req, res) => {
  try {
    if (!canManageUser(req, req.params.userId)) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to upload cover image for this profile",
      });
    }

    if (!req.file) {
      return sendError(res, {
        statusCode: 400,
        message: "Cover image file is required",
      });
    }

    const coverImageUrl = buildFileUrl(req, req.file);
    const user = await userService.updateProfileCover(
      req.params.userId,
      coverImageUrl
    );

    return sendSuccess(res, {
      message: "Cover image uploaded successfully",
      data: user,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to upload cover image",
    });
  }
};

export const deactivateAccount = async (req, res) => {
  try {
    if (!canManageUser(req, req.params.userId)) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to deactivate this account",
      });
    }

    const user = await userService.deactivateAccount(req.params.userId);

    return sendSuccess(res, {
      message: "Account deactivated successfully",
      data: user,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to deactivate account",
    });
  }
};

export const updateStudentProfile = async (req, res) => {
  try {
    if (!canManageUser(req, req.params.userId)) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to update this student profile",
      });
    }

    const user = await userService.updateStudentProfile(
      req.params.userId,
      req.body
    );

    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: "Student profile not found",
      });
    }

    return sendSuccess(res, {
      message: "Student profile updated successfully",
      data: user,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to update student profile",
    });
  }
};

export const updateInstructorProfile = async (req, res) => {
  try {
    if (!canManageUser(req, req.params.userId)) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to update this instructor profile",
      });
    }

    const user = await userService.updateInstructorProfile(
      req.params.userId,
      req.body
    );

    if (!user) {
      return sendError(res, {
        statusCode: 404,
        message: "Instructor profile not found",
      });
    }

    return sendSuccess(res, {
      message: "Instructor profile updated successfully",
      data: user,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to update instructor profile",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    if (!canManageUser(req, req.params.userId)) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to change this password",
      });
    }

    const { oldPassword, newPassword } = req.body;

    const result = await userService.changePassword(
      req.params.userId,
      oldPassword,
      newPassword
    );

    return sendSuccess(res, {
      message: result.message || "Password updated successfully",
      data: null,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getErrorStatus(err),
      message: err.message || "Failed to change password",
    });
  }
};