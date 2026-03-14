import * as chatService from "./chat.service.js";

function getRequester(req) {
  return {
    requesterId: req.user?._id || req.user?.userId || req.user?.id || null,
    requesterRole: req.user?.role || null,
  };
}

export const ensureConversation = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { courseId } = req.params;
    const targetStudentId = req.body?.studentId || req.query?.studentId || null;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await chatService.ensureConversation(courseId, {
      requesterId,
      requesterRole,
      targetStudentId,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Course not found" || err.message === "Conversation not found"
        ? 404
        : err.message.includes("not allowed") ||
          err.message === "Student is not enrolled in this course"
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getInstructorConversationsByCourse = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { courseId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await chatService.getInstructorConversationsByCourse(courseId, {
      requesterId,
      requesterRole,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Course not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getMyConversations = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await chatService.getMyConversations({
      requesterId,
      requesterRole,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status = err.message.includes("not allowed") ? 403 : 400;

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const getConversationMessages = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { conversationId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await chatService.getConversationMessages(conversationId, {
      requesterId,
      requesterRole,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Conversation not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : 400;

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};

export const createMessageByConversation = async (req, res) => {
  try {
    const { requesterId, requesterRole } = getRequester(req);
    const { conversationId } = req.params;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const data = await chatService.createMessageByConversation(conversationId, {
      requesterId,
      requesterRole,
      message: req.body?.message || req.body?.content,
    });

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (err) {
    const status =
      err.message === "Conversation not found"
        ? 404
        : err.message.includes("not allowed")
        ? 403
        : err.message === "Message is required"
        ? 400
        : 400;

    return res.status(status).json({
      success: false,
      message: err.message,
    });
  }
};