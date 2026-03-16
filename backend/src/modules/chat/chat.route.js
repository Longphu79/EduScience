import express from "express";
import {
  ensureConversation,
  getInstructorConversationsByCourse,
  getMyConversations,
  getConversationMessages,
  createMessageByConversation,
} from "./chat.controller.js";
import { verifyToken } from "../../config/jwt.js";

const router = express.Router();

router.get("/conversations/my", verifyToken, getMyConversations);

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

export default router;