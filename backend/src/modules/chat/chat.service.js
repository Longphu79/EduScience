import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import ChatConversation from "./chatConversation.model.js";
import ChatMessage from "./chatMessage.model.js";

function normalizeId(value) {
  if (!value) return null;
  if (typeof value === "object") {
    return String(value._id || value.id || value.userId || "");
  }
  return String(value);
}

async function getCourseOrThrow(courseId) {
  if (!courseId) {
    throw new Error("courseId is required");
  }

  const course = await Course.findById(courseId).lean();
  if (!course) {
    throw new Error("Course not found");
  }

  return course;
}

async function ensureStudentEnrolled(courseId, studentId) {
  const enrollment = await Enrollment.findOne({
    courseId,
    studentId,
  }).lean();

  if (!enrollment) {
    throw new Error("Student is not enrolled in this course");
  }

  return enrollment;
}

async function resolveConversationParticipants(
  courseId,
  { requesterId, requesterRole, targetStudentId } = {}
) {
  if (!requesterId) {
    throw new Error("Unauthorized");
  }

  const normalizedRequesterId = normalizeId(requesterId);
  const normalizedTargetStudentId = normalizeId(targetStudentId);

  const course = await getCourseOrThrow(courseId);
  const instructorId = normalizeId(course.instructorId);

  if (requesterRole === "admin") {
    if (!normalizedTargetStudentId) {
      throw new Error("targetStudentId is required");
    }

    await ensureStudentEnrolled(courseId, normalizedTargetStudentId);

    return {
      course,
      courseId: normalizeId(course._id),
      instructorId,
      studentId: normalizedTargetStudentId,
    };
  }

  if (requesterRole === "student") {
    await ensureStudentEnrolled(courseId, normalizedRequesterId);

    return {
      course,
      courseId: normalizeId(course._id),
      instructorId,
      studentId: normalizedRequesterId,
    };
  }

  if (requesterRole === "instructor") {
    if (normalizeId(course.instructorId) !== normalizedRequesterId) {
      throw new Error("You are not allowed to access chat of this course");
    }

    if (!normalizedTargetStudentId) {
      throw new Error("targetStudentId is required");
    }

    await ensureStudentEnrolled(courseId, normalizedTargetStudentId);

    return {
      course,
      courseId: normalizeId(course._id),
      instructorId,
      studentId: normalizedTargetStudentId,
    };
  }

  throw new Error("You are not allowed to access chat of this course");
}

async function populateConversationById(conversationId) {
  return ChatConversation.findById(conversationId)
    .populate("studentId", "username email fullName name avatarUrl")
    .populate("instructorId", "username email fullName name avatarUrl")
    .populate("courseId", "title thumbnail");
}

export async function ensureConversation(
  courseId,
  { requesterId, requesterRole, targetStudentId } = {}
) {
  const { studentId, instructorId } = await resolveConversationParticipants(
    courseId,
    {
      requesterId,
      requesterRole,
      targetStudentId,
    }
  );

  const filter = {
    courseId,
    studentId,
    instructorId,
  };

  try {
    const conversation = await ChatConversation.findOneAndUpdate(
      filter,
      {
        $setOnInsert: {
          courseId,
          studentId,
          instructorId,
          lastMessage: "",
          lastMessageAt: null,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    return populateConversationById(conversation._id);
  } catch (error) {
    if (error?.code === 11000) {
      const existingConversation = await ChatConversation.findOne(filter);
      if (existingConversation) {
        return populateConversationById(existingConversation._id);
      }
    }

    throw error;
  }
}

export async function getInstructorConversationsByCourse(
  courseId,
  { requesterId, requesterRole } = {}
) {
  const course = await getCourseOrThrow(courseId);

  if (
    requesterRole !== "admin" &&
    normalizeId(course.instructorId) !== normalizeId(requesterId)
  ) {
    throw new Error("You are not allowed to access chat of this course");
  }

  return ChatConversation.find({ courseId })
    .populate("studentId", "username email fullName name avatarUrl")
    .populate("instructorId", "username email fullName name avatarUrl")
    .populate("courseId", "title thumbnail")
    .sort({ lastMessageAt: -1, updatedAt: -1 });
}

export async function getMyConversations({ requesterId, requesterRole } = {}) {
  if (!requesterId) {
    throw new Error("Unauthorized");
  }

  const normalizedRequesterId = normalizeId(requesterId);

  let filter = {};

  if (requesterRole === "student") {
    filter = { studentId: normalizedRequesterId };
  } else if (requesterRole === "instructor") {
    filter = { instructorId: normalizedRequesterId };
  } else if (requesterRole === "admin") {
    filter = {};
  } else {
    throw new Error("You are not allowed to access conversations");
  }

  return ChatConversation.find(filter)
    .populate("studentId", "username email fullName name avatarUrl")
    .populate("instructorId", "username email fullName name avatarUrl")
    .populate("courseId", "title thumbnail")
    .sort({ lastMessageAt: -1, updatedAt: -1 });
}

export async function canAccessConversation(
  conversationId,
  { requesterId, requesterRole } = {}
) {
  const conversation = await ChatConversation.findById(conversationId).lean();

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const normalizedRequesterId = normalizeId(requesterId);

  if (requesterRole === "admin") {
    return conversation;
  }

  if (normalizeId(conversation.studentId) === normalizedRequesterId) {
    return conversation;
  }

  if (normalizeId(conversation.instructorId) === normalizedRequesterId) {
    return conversation;
  }

  throw new Error("You are not allowed to access this conversation");
}

export async function getConversationMessages(
  conversationId,
  { requesterId, requesterRole } = {}
) {
  const conversation = await canAccessConversation(conversationId, {
    requesterId,
    requesterRole,
  });

  const messages = await ChatMessage.find({ conversationId })
    .populate("senderId", "username email fullName name avatarUrl")
    .sort({ createdAt: 1 });

  return {
    conversation,
    messages,
  };
}

export async function createMessageByConversation(
  conversationId,
  { requesterId, requesterRole, message } = {}
) {
  const conversation = await canAccessConversation(conversationId, {
    requesterId,
    requesterRole,
  });

  const normalizedMessage = String(message || "").trim();

  if (!normalizedMessage) {
    throw new Error("Message is required");
  }

  const created = await ChatMessage.create({
    conversationId: conversation._id,
    courseId: conversation.courseId,
    studentId: conversation.studentId,
    instructorId: conversation.instructorId,
    senderId: requesterId,
    senderRole: requesterRole,
    message: normalizedMessage,
  });

  await ChatConversation.findByIdAndUpdate(conversation._id, {
    lastMessage: normalizedMessage,
    lastMessageAt: new Date(),
  });

  return ChatMessage.findById(created._id).populate(
    "senderId",
    "username email fullName name avatarUrl"
  );
}

export function getConversationRoom(conversationId) {
  return `conversation:${conversationId}`;
}

export function getUserRoom(userId) {
  return `user:${normalizeId(userId)}`;
}