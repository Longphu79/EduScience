import * as lessonCommentService from "../services/lessonComment.service.js";

export const getLessonComments = async (req, res) => {
  try {
    const comments = await lessonCommentService.listLessonComments(
      req.params.lessonId,
      req.actor,
    );
    res.status(200).json(comments);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};

export const createLessonComment = async (req, res) => {
  try {
    const comment = await lessonCommentService.createLessonComment(
      req.params.lessonId,
      req.body,
      req.actor,
    );
    res.status(201).json(comment);
  } catch (err) {
    res.status(err.statusCode || 400).json({ message: err.message });
  }
};
