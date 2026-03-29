import * as gamificationService from "./gamification.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getUserId(req) {
  return req.user?._id || req.user?.id || req.user?.userId || null;
}

function getUserRole(req) {
  return req.user?.role || null;
}

export const getStudentGamification = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { studentId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view this gamification profile",
      });
    }

    const data = await gamificationService.getStudentGamification(studentId);

    return sendSuccess(res, {
      message: "Get student gamification successfully",
      data,
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: error.message || "Failed to get student gamification",
    });
  }
};

export const getStudentGamificationEvents = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { studentId } = req.params;
    const { limit = 20 } = req.query;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view these gamification events",
      });
    }

    const data = await gamificationService.getStudentGamificationEvents(
      studentId,
      limit
    );

    return sendSuccess(res, {
      message: "Get student gamification events successfully",
      data,
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: error.message || "Failed to get student gamification events",
    });
  }
};

export const getStudentBadges = async (req, res) => {
  try {
    const requesterId = getUserId(req);
    const requesterRole = getUserRole(req);
    const { studentId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    if (
      requesterRole !== "admin" &&
      String(requesterId) !== String(studentId)
    ) {
      return sendError(res, {
        statusCode: 403,
        message: "You are not allowed to view these badges",
      });
    }

    const data = await gamificationService.getStudentBadges(studentId);

    return sendSuccess(res, {
      message: "Get student badges successfully",
      data,
    });
  } catch (error) {
    return sendError(res, {
      statusCode: 500,
      message: error.message || "Failed to get student badges",
    });
  }
};