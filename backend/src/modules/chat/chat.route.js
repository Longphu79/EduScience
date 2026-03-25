import express from "express";
import {
  ensureConversation,
  getInstructorConversationsByCourse,
  getMyConversations,
  getMyUnreadSummary,
  getConversationMessages,
  createMessageByConversation,
  markConversationAsRead,
} from "./chat.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/conversations/my", verifyToken, getMyConversations);
router.get("/conversations/unread-summary", verifyToken, getMyUnreadSummary);

router.post("/course/:courseId/conversation", verifyToken, ensureConversation);

router.get(
  "/course/:courseId/conversations",
  verifyToken,
  getInstructorConversationsByCourse
);

router.get(
  "/conversation/:conversationId/messages",
  verifyToken,
  getConversationMessages
);

router.post(
  "/conversation/:conversationId/messages",
  verifyToken,
  createMessageByConversation
);

router.post(
  "/conversation/:conversationId/read",
  verifyToken,
  markConversationAsRead
);

export default router;