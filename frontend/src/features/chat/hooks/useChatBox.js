import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../auth/state/useAuth";
import {
  chatUnwrap,
  ensureConversation,
  getChatSocket,
  getConversationMessages,
  markConversationAsRead,
  sendConversationMessage,
} from "../services/chat.service";
import {
  formatHeaderStatus,
  getConversationId,
  getConversationOtherParty,
  getParticipantName,
  getUserId,
  mergeConversation,
} from "../utils/chat.helpers";

export default function useChatBox({
  courseId,
  targetStudentId = null,
  externalConversationId = null,
}) {
  const { user } = useAuth();

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const readSyncTimeoutRef = useRef(null);

  const currentUserId = user?._id || user?.id || user?.userId || null;
  const currentRole = user?.role || null;
  const isChatAllowed =
    currentRole === "student" || currentRole === "instructor";

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const conversationId = useMemo(() => {
    return externalConversationId || getConversationId(conversation) || null;
  }, [externalConversationId, conversation]);

  const otherParty = useMemo(() => {
    return getConversationOtherParty(conversation, currentUserId);
  }, [conversation, currentUserId]);

  const title = useMemo(() => {
    if (currentRole === "student") {
      return (
        getParticipantName(otherParty || conversation?.instructorId) ||
        "Instructor"
      );
    }

    return getParticipantName(otherParty) || "Student";
  }, [currentRole, otherParty, conversation]);

  const subtitle = useMemo(() => {
    return formatHeaderStatus(conversation);
  }, [conversation]);

  const scrollToBottom = useCallback((behavior = "auto") => {
    const container = chatContainerRef.current;
    if (!container) return;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior,
        });
      });
    });
  }, []);

  const syncReadState = useCallback(async (resolvedConversationId) => {
    if (!resolvedConversationId) return;

    try {
      await markConversationAsRead(resolvedConversationId).catch(() => {});
      const socket = getChatSocket();
      socket.emit("chat:mark-read", { conversationId: resolvedConversationId });
    } catch (error) {
      console.error("syncReadState error:", error);
    }
  }, []);

  const queueReadSync = useCallback(
    (resolvedConversationId) => {
      if (!resolvedConversationId) return;

      if (readSyncTimeoutRef.current) {
        clearTimeout(readSyncTimeoutRef.current);
      }

      readSyncTimeoutRef.current = setTimeout(() => {
        syncReadState(resolvedConversationId);
      }, 180);
    },
    [syncReadState]
  );

  const bootstrapConversation = useCallback(async () => {
    if (!isChatAllowed) {
      setLoading(false);
      setConversation(null);
      setMessages([]);
      return;
    }

    if (!courseId || !currentUserId) {
      setLoading(false);
      return;
    }

    if (
      currentRole === "instructor" &&
      !targetStudentId &&
      !externalConversationId
    ) {
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
        await syncReadState(resolvedConversationId);
        setTimeout(() => scrollToBottom("auto"), 0);
        return;
      }

      const ensuredRes = await ensureConversation(courseId, targetStudentId);
      const ensuredConversation = chatUnwrap(ensuredRes);
      resolvedConversationId = getConversationId(ensuredConversation) || null;

      setConversation(ensuredConversation || null);

      if (resolvedConversationId) {
        const historyRes = await getConversationMessages(resolvedConversationId);
        const history = chatUnwrap(historyRes);

        setMessages(Array.isArray(history?.messages) ? history.messages : []);
        await syncReadState(resolvedConversationId);
        setTimeout(() => scrollToBottom("auto"), 0);
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
  }, [
    courseId,
    currentUserId,
    currentRole,
    targetStudentId,
    externalConversationId,
    scrollToBottom,
    syncReadState,
    isChatAllowed,
  ]);

  useEffect(() => {
    bootstrapConversation();
  }, [bootstrapConversation]);

  useEffect(() => {
    if (!messages.length && !isOtherTyping) return;
    scrollToBottom("smooth");
  }, [messages, isOtherTyping, scrollToBottom]);

  useEffect(() => {
    if (!isChatAllowed || !conversationId) return;

    const socket = getChatSocket();

    const handleConnect = () => {
      socket.emit("chat:join", { conversationId });
    };

    const handleMessage = (message) => {
      setMessages((prev) => {
        const existed = prev.some(
          (item) => String(item?._id) === String(message?._id)
        );
        if (existed) return prev;
        return [...prev, message];
      });

      setIsOtherTyping(false);
      setTimeout(() => scrollToBottom("smooth"), 0);

      const senderId = getUserId(message?.senderId);
      const isMine = String(senderId) === String(currentUserId);

      if (!isMine) {
        queueReadSync(conversationId);
      }
    };

    const handleConversationUpdated = (updatedConversation) => {
      if (
        String(getConversationId(updatedConversation)) !== String(conversationId)
      ) {
        return;
      }

      setConversation((prev) => mergeConversation(prev, updatedConversation));
    };

    const handleTyping = (payload) => {
      if (String(payload?.conversationId) !== String(conversationId)) return;
      if (String(payload?.userId) === String(currentUserId)) return;
      setIsOtherTyping(true);
    };

    const handleStopTyping = (payload) => {
      if (String(payload?.conversationId) !== String(conversationId)) return;
      if (String(payload?.userId) === String(currentUserId)) return;
      setIsOtherTyping(false);
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
    socket.on("chat:conversation-updated", handleConversationUpdated);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:stop-typing", handleStopTyping);
    socket.on("chat:error", handleError);

    return () => {
      socket.emit("chat:leave", { conversationId });
      socket.off("connect", handleConnect);
      socket.off("chat:message", handleMessage);
      socket.off("chat:conversation-updated", handleConversationUpdated);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:stop-typing", handleStopTyping);
      socket.off("chat:error", handleError);
    };
  }, [conversationId, currentUserId, queueReadSync, scrollToBottom, isChatAllowed]);

  useEffect(() => {
    const handleWindowFocus = () => {
      if (conversationId) {
        queueReadSync(conversationId);
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    return () => {
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [conversationId, queueReadSync]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (readSyncTimeoutRef.current) clearTimeout(readSyncTimeoutRef.current);
    };
  }, []);

  const emitStopTyping = useCallback(() => {
    if (!conversationId) return;
    const socket = getChatSocket();
    socket.emit("chat:stop-typing", { conversationId });
  }, [conversationId]);

  const emitTyping = useCallback(() => {
    if (!conversationId) return;

    const socket = getChatSocket();
    socket.emit("chat:typing", { conversationId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("chat:stop-typing", { conversationId });
    }, 1200);
  }, [conversationId]);

  async function handleSendMessage(event) {
    event.preventDefault();

    if (!isChatAllowed) return;
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
      setIsOtherTyping(false);

      emitStopTyping();
      setTimeout(() => scrollToBottom("smooth"), 0);

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

            setTimeout(() => scrollToBottom("smooth"), 0);
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

        setTimeout(() => scrollToBottom("smooth"), 0);
      }
    } catch (error) {
      setMessages((prev) => prev.filter((item) => item._id !== tempId));
      setToast({
        message: error?.message || "Không thể gửi tin nhắn",
        kind: "error",
      });
    } finally {
      setSending(false);
      setTimeout(() => {
        inputRef.current?.focus?.();
      }, 0);
    }
  }

  return {
    user,
    currentRole,
    currentUserId,
    isChatAllowed,
    conversation,
    conversationId,
    otherParty,
    title,
    subtitle,
    messages,
    content,
    loading,
    sending,
    isOtherTyping,
    toast,
    chatContainerRef,
    inputRef,
    setToast,
    setContent,
    emitTyping,
    emitStopTyping,
    handleSendMessage,
  };
}