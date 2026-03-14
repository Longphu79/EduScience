import { useEffect, useMemo, useRef, useState } from "react";
import {
  ensureConversation,
  getConversationMessages,
  sendConversationMessage,
  getChatSocket,
  chatUnwrap,
  getConversationOtherParty,
  getParticipantName,
} from "../services/chat.service";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/state/useAuth";

function formatMessageTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export default function ChatBox({
  courseId,
  targetStudentId = null,
  conversationId: externalConversationId = null,
  compact = false,
  hideHeader = false,
  dockMode = false,
}) {
  const { user } = useAuth();
  const chatContainerRef = useRef(null);

  const currentUserId = user?._id || user?.id || user?.userId;
  const currentRole = user?.role || null;

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const conversationId = useMemo(
    () => externalConversationId || conversation?._id || null,
    [externalConversationId, conversation]
  );

  const otherParty = useMemo(() => {
    return getConversationOtherParty(conversation, currentUserId);
  }, [conversation, currentUserId]);

  const title = useMemo(() => {
    if (currentRole === "student") {
      return getParticipantName(otherParty || conversation?.instructorId) || "Instructor";
    }

    return getParticipantName(otherParty) || "Student";
  }, [currentRole, otherParty, conversation]);

  async function bootstrapConversation() {
    if (!courseId || !currentUserId) {
      setLoading(false);
      return;
    }

    if (currentRole === "instructor" && !targetStudentId && !externalConversationId) {
      setLoading(false);
      setMessages([]);
      return;
    }

    try {
      setLoading(true);

      let resolvedConversationId = externalConversationId;

      if (resolvedConversationId) {
        const historyRes = await getConversationMessages(resolvedConversationId);
        const history = chatUnwrap(historyRes);

        setConversation(history?.conversation || null);
        setMessages(Array.isArray(history?.messages) ? history.messages : []);
        return;
      }

      const ensuredRes = await ensureConversation(courseId, targetStudentId);
      const ensuredConversation = chatUnwrap(ensuredRes);
      resolvedConversationId = ensuredConversation?._id || null;

      setConversation(ensuredConversation);

      if (resolvedConversationId) {
        const historyRes = await getConversationMessages(resolvedConversationId);
        const history = chatUnwrap(historyRes);

        setMessages(Array.isArray(history?.messages) ? history.messages : []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      setToast({
        message: error?.message || "Không tải được cuộc trò chuyện",
        kind: "error",
      });
      setMessages([]);
      setConversation(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrapConversation();
  }, [courseId, currentUserId, currentRole, targetStudentId, externalConversationId]);

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (!conversationId) return;

    const socket = getChatSocket();

    const handleConnect = () => {
      socket.emit("chat:join", { conversationId });
    };

    const handleMessage = (message) => {
      setMessages((prev) => {
        const existed = prev.some((item) => String(item._id) === String(message._id));
        if (existed) return prev;
        return [...prev, message];
      });
    };

    const handleError = (payload) => {
      setToast({
        message: payload?.message || "Chat realtime error",
        kind: "error",
      });
    };

    if (socket.connected) {
      handleConnect();
    }

    socket.on("connect", handleConnect);
    socket.on("chat:message", handleMessage);
    socket.on("chat:error", handleError);

    return () => {
      socket.emit("chat:leave", { conversationId });
      socket.off("connect", handleConnect);
      socket.off("chat:message", handleMessage);
      socket.off("chat:error", handleError);
    };
  }, [conversationId]);

  async function handleSendMessage(e) {
    e.preventDefault();

    if (!conversationId || !content.trim()) return;

    const trimmed = content.trim();
    const tempId = `temp-${Date.now()}`;

    try {
      setSending(true);

      const socket = getChatSocket();

      const optimisticMessage = {
        _id: tempId,
        message: trimmed,
        createdAt: new Date().toISOString(),
        senderId: {
          _id: currentUserId,
          username: user?.username,
          email: user?.email,
          fullName: user?.fullName,
          name: user?.name,
          avatarUrl: user?.avatarUrl,
        },
        isPending: true,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      setContent("");

      if (socket?.connected) {
        socket.emit(
          "chat:send",
          {
            conversationId,
            message: trimmed,
            tempId,
          },
          (ack) => {
            if (!ack?.success) {
              setMessages((prev) => prev.filter((item) => item._id !== tempId));
              setToast({
                message: ack?.message || "Không thể gửi tin nhắn",
                kind: "error",
              });
              return;
            }

            const actualMessage = ack?.data;

            setMessages((prev) =>
              prev.map((item) => (item._id === tempId ? actualMessage : item))
            );
          }
        );
      } else {
        const response = await sendConversationMessage(conversationId, {
          message: trimmed,
        });

        const newMessage = chatUnwrap(response);

        setMessages((prev) =>
          prev.map((item) => (item._id === tempId ? newMessage : item))
        );
      }
    } catch (error) {
      setMessages((prev) => prev.filter((item) => item._id !== tempId));
      setToast({
        message: error?.message || "Không thể gửi tin nhắn",
        kind: "error",
      });
    } finally {
      setSending(false);
    }
  }

  if (currentRole === "instructor" && !targetStudentId && !externalConversationId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
        Chọn một học viên để bắt đầu trò chuyện.
      </div>
    );
  }

  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden ${
        dockMode ? "bg-white" : "rounded-2xl border border-slate-200 bg-white"
      }`}
    >
      {toast.message ? (
        <div className="p-4">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      {!hideHeader ? (
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <img
              src={
                otherParty?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  title || "User"
                )}&background=111827&color=fff`
              }
              alt={title}
              className="h-11 w-11 rounded-full object-cover"
            />

            <div className="min-w-0">
              <div className="truncate font-semibold text-slate-900">{title}</div>
              <div className="truncate text-sm text-slate-500">
                {conversation?.courseId?.title || "Course chat"}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        ref={chatContainerRef}
        className={`min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4 ${
          compact ? "h-[340px]" : "h-full"
        }`}
      >
        {loading ? (
          <div className="text-sm text-slate-500">Đang tải tin nhắn...</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-slate-500">
            Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện.
          </div>
        ) : (
          messages.map((message) => {
            const sender = message.senderId || {};
            const senderId = sender?._id || message.senderId;
            const isMine = String(senderId) === String(currentUserId);

            return (
              <div
                key={message._id || `${senderId}-${message.createdAt}`}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
                    isMine
                      ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white"
                      : "border border-slate-200 bg-white text-slate-900"
                  } ${message?.isPending ? "opacity-70" : ""}`}
                >
                  {!dockMode ? (
                    <div
                      className={`mb-1 text-xs ${
                        isMine ? "text-violet-100" : "text-slate-500"
                      }`}
                    >
                      {sender?.name ||
                        sender?.fullName ||
                        sender?.username ||
                        sender?.email ||
                        "User"}
                    </div>
                  ) : null}

                  <div className="whitespace-pre-wrap text-sm">
                    {message.message || ""}
                  </div>

                  <div
                    className={`mt-2 text-[11px] ${
                      isMine ? "text-violet-100" : "text-slate-400"
                    }`}
                  >
                    {message?.isPending
                      ? "Đang gửi..."
                      : formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-3">
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-2xl border border-slate-300 px-4 py-2.5 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            placeholder="Nhập tin nhắn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !content.trim()}>
            {sending ? "..." : "Gửi"}
          </Button>
        </div>
      </form>
    </div>
  );
}