import LearningReminder from "../models/LearningReminder.js";
import { getStudentProfileForActor } from "./access.service.js";
import { createHttpError } from "../utils/httpError.js";

export const listRemindersForStudent = async (actor) => {
  const student = await getStudentProfileForActor(actor);
  return await LearningReminder.find({ studentId: student._id })
    .sort({ remindAt: 1 })
    .lean();
};

export const createReminder = async (courseId, remindAt, message, actor) => {
  const student = await getStudentProfileForActor(actor);
  const parsedRemindAt = new Date(remindAt);
  if (Number.isNaN(parsedRemindAt.getTime())) {
    throw createHttpError(400, "Invalid remindAt value");
  }

  return await LearningReminder.create({
    studentId: student._id,
    courseId,
    message: message?.trim() ?? "Keep meeting your milestone.",
    remindAt: parsedRemindAt,
  });
};
