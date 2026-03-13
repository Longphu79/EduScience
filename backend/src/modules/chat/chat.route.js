import express from "express";
import { getMessages, createMessage } from "./chat.controller.js";

const router = express.Router();

router.get("/course/:courseId/messages", getMessages);
router.post("/course/:courseId/messages", createMessage);

export default router;