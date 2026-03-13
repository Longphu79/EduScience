const { Server } = require("socket.io");
const chatService = require("../services/chat.service");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join_course_room", async ({ courseId }) => {
      if (!courseId) return;
      socket.join(`course_${courseId}`);
    });

    socket.on("send_message", async (payload) => {
      try {
        const { courseId, user, message } = payload;
        if (!courseId || !user || !message) return;

        const saved = await chatService.createMessage(courseId, user, message);

        io.to(`course_${courseId}`).emit("receive_message", saved);
      } catch (error) {
        socket.emit("chat_error", { message: error.message });
      }
    });
  });

  return io;
}

module.exports = initSocket;