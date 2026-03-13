import CourseChatMessage from "./chatMessage.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import User from "../user/user.model.js";

export const ensureChatPermission = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) throw new Error("Course not found");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  if (
    user.role === "instructor" &&
    String(course.instructorId) === String(user._id)
  ) {
    return user;
  }

  if (user.role === "student") {
    const enrolled = await Enrollment.findOne({
      courseId,
      studentId: user._id,
    });
    if (!enrolled) throw new Error("You are not enrolled in this course");
    return user;
  }

  if (user.role === "admin") return user;

  throw new Error("No permission");
};

export const getMessages = async (courseId, userId) => {
  await ensureChatPermission(courseId, userId);

  return CourseChatMessage.find({ courseId })
    .populate("senderId", "username email avatarUrl role")
    .sort({ createdAt: 1 });
};

export const createMessage = async (courseId, { userId, message }) => {
  if (!message?.trim()) throw new Error("Message is required");

  const user = await ensureChatPermission(courseId, userId);

  const created = await CourseChatMessage.create({
    courseId,
    senderId: user._id,
    senderRole: user.role,
    message: message.trim(),
  });

  return CourseChatMessage.findById(created._id).populate(
    "senderId",
    "username email avatarUrl role"
  );
};