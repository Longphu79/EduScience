import { Server } from "socket.io";
import { verifyAccessToken } from "../../config/jwt.js";
import {
  canAccessConversation,
  createMessageByConversation,
  getConversationRoom,
  getUserRoom,
} from "./chat.service.js";

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

        const conversationPayload = {
          _id: String(conversation._id),
          courseId: String(conversation.courseId),
          studentId: String(conversation.studentId),
          instructorId: String(conversation.instructorId),
          lastMessage: created?.message || "",
          lastMessageAt: created?.createdAt || new Date(),
        };

        // Chỉ bắn cho người khác trong room, không bắn lại cho chính sender
        socket.to(getConversationRoom(conversationId)).emit("chat:message", created);

        io.to(getUserRoom(conversation.studentId)).emit(
          "chat:conversation-updated",
          conversationPayload
        );

        io.to(getUserRoom(conversation.instructorId)).emit(
          "chat:conversation-updated",
          conversationPayload
        );

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