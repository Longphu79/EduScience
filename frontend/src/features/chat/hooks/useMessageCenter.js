import { useCallback, useEffect, useMemo, useState } from "react";
import {
  chatUnwrap,
  getChatSocket,
  listMyConversations,
} from "../services/chat.service";
import {
  getConversationId,
  getLastMessageText,
  getUserId,
  mergeConversation,
  normalizeConversationForCurrentUser,
  sortConversations,
} from "../utils/chat.helpers";

export default function useMessageCenter({
  open,
  isChatAllowed,
  currentUserId,
}) {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [keyword, setKeyword] = useState("");

  const loadConversations = useCallback(async () => {
    if (!isChatAllowed) {
      setConversations([]);
      return;
    }

    try {
      setLoading(true);
      const response = await listMyConversations();
      const data = chatUnwrap(response);

      setConversations(sortConversations(Array.isArray(data) ? data : []));
    } catch {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [isChatAllowed]);

  useEffect(() => {
    if (!open || !isChatAllowed) return;
    loadConversations();
  }, [open, isChatAllowed, loadConversations]);

  useEffect(() => {
    if (!open || !isChatAllowed) return;

    const socket = getChatSocket();
    if (!socket) return; // 🔥 FIX: chưa login thì không connect

    const handleConversationUpdated = (updatedConversation) => {
      const updatedConversationId = getConversationId(updatedConversation);
      if (!updatedConversationId) return;

      setConversations((prev) => {
        const existed = prev.find(
          (item) => getConversationId(item) === updatedConversationId
        );

        if (!existed) {
          return sortConversations([updatedConversation, ...prev]);
        }

        const merged = prev.map((item) =>
          getConversationId(item) === updatedConversationId
            ? mergeConversation(item, updatedConversation)
            : item
        );

        return sortConversations(merged);
      });
    };

    socket.on("chat:conversation-updated", handleConversationUpdated);

    return () => {
      socket.off("chat:conversation-updated", handleConversationUpdated);
    };
  }, [open, isChatAllowed]);

  const filteredConversations = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return conversations;

    return conversations.filter((item) => {
      const studentName =
        item?.studentId?.name ||
        item?.studentId?.fullName ||
        item?.studentId?.username ||
        item?.studentId?.email ||
        "";

      const instructorName =
        item?.instructorId?.name ||
        item?.instructorId?.fullName ||
        item?.instructorId?.username ||
        item?.instructorId?.email ||
        "";

      const courseTitle = item?.courseId?.title || "";
      const lastMessage = getLastMessageText(item);

      const haystack = [
        studentName,
        instructorName,
        courseTitle,
        lastMessage,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedKeyword);
    });
  }, [conversations, keyword]);

  function markConversationReadLocally(conversation) {
    const conversationId = getConversationId(conversation);

    setConversations((prev) =>
      prev.map((item) => {
        if (getConversationId(item) !== conversationId) return item;

        const normalized = normalizeConversationForCurrentUser(
          item,
          currentUserId
        );

        const isCurrentUserStudent =
          String(getUserId(item?.studentId)) === String(currentUserId);

        return {
          ...normalized,
          studentUnreadCount: isCurrentUserStudent
            ? 0
            : Number(item?.studentUnreadCount || 0),
          instructorUnreadCount: isCurrentUserStudent
            ? Number(item?.instructorUnreadCount || 0)
            : 0,
        };
      })
    );
  }

  return {
    loading,
    keyword,
    conversations,
    filteredConversations,
    setKeyword,
    loadConversations,
    markConversationReadLocally,
  };
}