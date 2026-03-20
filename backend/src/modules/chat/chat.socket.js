import { Server } from "socket.io";
import { verifyAccessToken } from "../../config/jwt.js";
import {
  canAccessConversation,
  createMessageByConversation,
  getConversationRoom,
  getUserRoom,
  getMyUnreadSummary,
  markConversationAsRead,
} from "./chat.service.js";
import ChatConversation from "./chatConversation.model.js";

function extractSocketToken(socket) {
  const authToken = socket.handshake?.auth?.token;
  if (authToken) return authToken;

  const authHeader =
    socket.handshake?.headers?.authorization ||
    socket.handshake?.headers?.Authorization;

  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return null;
}

function getSocketUserId(user) {
  return user?._id || user?.userId || user?.id || null;
}

async function buildConversationPayload(conversationId) {
  return ChatConversation.findById(conversationId)
    .populate("studentId", "username email fullName name avatarUrl")
    .populate("instructorId", "username email fullName name avatarUrl")
    .populate("courseId", "title thumbnail");
}

export function initChatSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = extractSocketToken(socket);
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const user = verifyAccessToken(token);
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const currentUserId = getSocketUserId(socket.user);

    if (currentUserId) {
      socket.join(getUserRoom(currentUserId));
    }

    socket.on("chat:join", async ({ conversationId }) => {
      try {
        if (!conversationId) {
          socket.emit("chat:error", { message: "conversationId is required" });
          return;
        }

        await canAccessConversation(conversationId, {
          requesterId: currentUserId,
          requesterRole: socket.user?.role,
        });

        const room = getConversationRoom(conversationId);
        socket.join(room);

        socket.emit("chat:joined", {
          conversationId,
          room,
        });
      } catch (error) {
        socket.emit("chat:error", {
          message: error.message || "Failed to join chat room",
        });
      }
    });

    socket.on("chat:leave", ({ conversationId }) => {
      if (!conversationId) return;
      socket.leave(getConversationRoom(conversationId));
    });

    socket.on("chat:typing", async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        await canAccessConversation(conversationId, {
          requesterId: currentUserId,
          requesterRole: socket.user?.role,
        });

        socket.to(getConversationRoom(conversationId)).emit("chat:typing", {
          conversationId,
          userId: currentUserId,
        });
      } catch (error) {
        socket.emit("chat:error", {
          message: error.message || "Failed to send typing event",
        });
      }
    });

    socket.on("chat:stop-typing", async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        await canAccessConversation(conversationId, {
          requesterId: currentUserId,
          requesterRole: socket.user?.role,
        });

        socket.to(getConversationRoom(conversationId)).emit("chat:stop-typing", {
          conversationId,
          userId: currentUserId,
        });
      } catch (error) {
        socket.emit("chat:error", {
          message: error.message || "Failed to send stop typing event",
        });
      }
    });

    socket.on("chat:mark-read", async ({ conversationId }) => {
      try {
        if (!conversationId) return;

        const conversation = await canAccessConversation(conversationId, {
          requesterId: currentUserId,
          requesterRole: socket.user?.role,
        });

        await markConversationAsRead(conversationId, {
          requesterId: currentUserId,
          requesterRole: socket.user?.role,
        });

        const updatedConversation = await buildConversationPayload(conversationId);

        io.to(getUserRoom(conversation.studentId)).emit(
          "chat:conversation-updated",
          updatedConversation
        );

        io.to(getUserRoom(conversation.instructorId)).emit(
          "chat:conversation-updated",
          updatedConversation
        );

        const studentUnread = await getMyUnreadSummary({
          requesterId: conversation.studentId,
          requesterRole: "student",
        });

        const instructorUnread = await getMyUnreadSummary({
          requesterId: conversation.instructorId,
          requesterRole: "instructor",
        });

        io.to(getUserRoom(conversation.studentId)).emit("chat:unread-updated", {
          unreadMessages: Number(studentUnread?.unreadMessages || 0),
          unreadConversations: Number(studentUnread?.unreadConversations || 0),
        });

        io.to(getUserRoom(conversation.instructorId)).emit("chat:unread-updated", {
          unreadMessages: Number(instructorUnread?.unreadMessages || 0),
          unreadConversations: Number(instructorUnread?.unreadConversations || 0),
        });
      } catch (error) {
        socket.emit("chat:error", {
          message: error.message || "Failed to mark conversation as read",
        });
      }
    });

    socket.on("chat:send", async (payload = {}, ack) => {
      try {
        const { conversationId, message, tempId } = payload;

        const conversation = await canAccessConversation(conversationId, {
          requesterId: currentUserId,
          requesterRole: socket.user?.role,
        });

        const created = await createMessageByConversation(conversationId, {
          requesterId: currentUserId,
          requesterRole: socket.user?.role,
          message,
        });

        const updatedConversation = await buildConversationPayload(conversationId);

        socket.to(getConversationRoom(conversationId)).emit("chat:message", created);

        socket.to(getConversationRoom(conversationId)).emit("chat:stop-typing", {
          conversationId,
          userId: currentUserId,
        });

        io.to(getUserRoom(conversation.studentId)).emit(
          "chat:conversation-updated",
          updatedConversation
        );

        io.to(getUserRoom(conversation.instructorId)).emit(
          "chat:conversation-updated",
          updatedConversation
        );

        const studentUnread = await getMyUnreadSummary({
          requesterId: conversation.studentId,
          requesterRole: "student",
        });

        const instructorUnread = await getMyUnreadSummary({
          requesterId: conversation.instructorId,
          requesterRole: "instructor",
        });

        io.to(getUserRoom(conversation.studentId)).emit("chat:unread-updated", {
          unreadMessages: Number(studentUnread?.unreadMessages || 0),
          unreadConversations: Number(studentUnread?.unreadConversations || 0),
        });

        io.to(getUserRoom(conversation.instructorId)).emit("chat:unread-updated", {
          unreadMessages: Number(instructorUnread?.unreadMessages || 0),
          unreadConversations: Number(instructorUnread?.unreadConversations || 0),
        });

        if (typeof ack === "function") {
          ack({
            success: true,
            data: created,
            tempId: tempId || null,
          });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({
            success: false,
            message: error.message || "Failed to send message",
          });
        } else {
          socket.emit("chat:error", {
            message: error.message || "Failed to send message",
          });
        }
      }
    });
  });

  return io;
}