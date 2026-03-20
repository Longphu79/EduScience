import * as chatService from "./chat.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
  };
}

function getChatErrorStatus(err) {
  if (!err?.message) return 400;

  if (
    err.message === "Course not found" ||
    err.message === "Conversation not found"
  ) {
    return 404;
  }

  if (
    err.message.includes("not allowed") ||
    err.message === "Student is not enrolled in this course"
  ) {
    return 403;
  }

  if (err.message === "Unauthorized") return 401;

  return 400;
}

export const ensureConversation = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { courseId } = req.params;
    const targetStudentId = req.body?.studentId || req.query?.studentId || null;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await chatService.ensureConversation(courseId, {
      requesterId,
      requesterRole,
      targetStudentId,
    });

    return sendSuccess(res, {
      message: "Ensure conversation successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getChatErrorStatus(err),
      message: err.message || "Failed to ensure conversation",
    });
  }
};

export const getInstructorConversationsByCourse = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { courseId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await chatService.getInstructorConversationsByCourse(courseId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Get instructor conversations successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getChatErrorStatus(err),
      message: err.message || "Failed to get instructor conversations",
    });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await chatService.getMyConversations({
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Get my conversations successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getChatErrorStatus(err),
      message: err.message || "Failed to get my conversations",
    });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { conversationId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await chatService.getConversationMessages(conversationId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Get conversation messages successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getChatErrorStatus(err),
      message: err.message || "Failed to get conversation messages",
    });
  }
};

export const createMessageByConversation = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { conversationId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await chatService.createMessageByConversation(conversationId, {
      requesterId,
      requesterRole,
      message: req.body?.message || req.body?.content,
    });

    return sendSuccess(res, {
      statusCode: 201,
      message: "Create message successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getChatErrorStatus(err),
      message: err.message || "Failed to create message",
    });
  }
};

export const markConversationAsRead = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { conversationId } = req.params;

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await chatService.markConversationAsRead(conversationId, {
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Mark conversation as read successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getChatErrorStatus(err),
      message: err.message || "Failed to mark conversation as read",
    });
  }
};

export const getMyUnreadSummary = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return sendError(res, {
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    const data = await chatService.getMyUnreadSummary({
      requesterId,
      requesterRole,
    });

    return sendSuccess(res, {
      message: "Get unread summary successfully",
      data,
    });
  } catch (err) {
    return sendError(res, {
      statusCode: getChatErrorStatus(err),
      message: err.message || "Failed to get unread summary",
    });
  }
};