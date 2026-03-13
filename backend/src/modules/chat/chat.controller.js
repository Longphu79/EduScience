import * as chatService from "./chat.service.js";

export const getMessages = async (req, res) => {
  try {
    const data = await chatService.getMessages(
      req.params.courseId,
      req.user?._id || req.query.userId || null
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const data = await chatService.createMessage(req.params.courseId, {
      userId: req.user?._id || req.body.userId,
      message: req.body.message || req.body.content,
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(403).json({ success: false, message: err.message });
  }
};