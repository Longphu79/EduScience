import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../auth/state/useAuth";
import {
  chatUnwrap,
  ensureConversation,
  getChatSocket,
} from "../services/chat.service";
import {
  getConversationId,
  mergeConversation,
  normalizeConversationForCurrentUser,
  sortBoxes,
} from "../utils/chat.helpers";

const ChatDockContext = createContext(null);
const MAX_BOXES = 3;

export function ChatDockProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const currentUserId = user?._id || user?.id || user?.userId || null;
  const currentRole = user?.role || null;
  const isChatAllowed =
    currentRole === "student" || currentRole === "instructor";

  const [openChatBoxes, setOpenChatBoxes] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !isChatAllowed) {
      setOpenChatBoxes([]);
    }
  }, [isAuthenticated, isChatAllowed]);

  const openConversation = useCallback(
    (conversation) => {
      if (!isChatAllowed) return;

      const conversationId = getConversationId(conversation);
      if (!conversationId) return;

      const normalizedConversation = normalizeConversationForCurrentUser(
        conversation,
        currentUserId
      );

      setOpenChatBoxes((prev) => {
        const existed = prev.find(
          (item) => getConversationId(item) === conversationId
        );

        let next = existed
          ? prev.map((item) =>
              getConversationId(item) === conversationId
                ? {
                    ...mergeConversation(item, normalizedConversation),
                    minimized: false,
                    focused: true,
                  }
                : { ...item, focused: false }
            )
          : [
              {
                ...normalizedConversation,
                minimized: false,
                focused: true,
              },
              ...prev.map((item) => ({ ...item, focused: false })),
            ];

        return sortBoxes(next).slice(0, MAX_BOXES);
      });
    },
    [currentUserId, isChatAllowed]
  );

  const openCourseConversation = useCallback(
    async (courseId) => {
      if (!isChatAllowed) return;
      if (!courseId) return;

      const response = await ensureConversation(courseId);
      const conversation = chatUnwrap(response);

      if (!getConversationId(conversation)) return;
      openConversation(conversation);
    },
    [openConversation, isChatAllowed]
  );

  const closeConversation = useCallback((conversationId) => {
    setOpenChatBoxes((prev) =>
      prev.filter((item) => getConversationId(item) !== String(conversationId))
    );
  }, []);

  const toggleMinimizeConversation = useCallback(
    (conversationId) => {
      if (!isChatAllowed) return;

      setOpenChatBoxes((prev) =>
        sortBoxes(
          prev.map((item) =>
            getConversationId(item) === String(conversationId)
              ? {
                  ...item,
                  minimized: !item.minimized,
                  focused: true,
                }
              : {
                  ...item,
                  focused: false,
                }
          )
        )
      );
    },
    [isChatAllowed]
  );

  const focusConversation = useCallback(
    (conversationId) => {
      if (!isChatAllowed) return;
      if (!conversationId) return;

      setOpenChatBoxes((prev) =>
        sortBoxes(
          prev.map((item) =>
            getConversationId(item) === String(conversationId)
              ? {
                  ...normalizeConversationForCurrentUser(item, currentUserId),
                  focused: true,
                  minimized: false,
                }
              : { ...item, focused: false }
          )
        )
      );
    },
    [currentUserId, isChatAllowed]
  );

  useEffect(() => {
    if (!isAuthenticated || !isChatAllowed) return;

    const socket = getChatSocket();

    const handleConversationUpdated = (updatedConversation) => {
      const updatedConversationId = getConversationId(updatedConversation);
      if (!updatedConversationId) return;

      setOpenChatBoxes((prev) => {
        const existed = prev.find(
          (item) => getConversationId(item) === updatedConversationId
        );

        if (!existed) return prev;

        return sortBoxes(
          prev.map((item) =>
            getConversationId(item) === updatedConversationId
              ? {
                  ...mergeConversation(item, updatedConversation),
                  minimized: item.minimized,
                  focused: item.focused,
                }
              : item
          )
        );
      });
    };

    socket.on("chat:conversation-updated", handleConversationUpdated);

    return () => {
      socket.off("chat:conversation-updated", handleConversationUpdated);
    };
  }, [isAuthenticated, isChatAllowed]);

  useEffect(() => {
    if (!isChatAllowed) return;

    async function handleOpenDockChat(event) {
      try {
        const courseId = event?.detail?.courseId;
        if (!courseId) return;
        await openCourseConversation(courseId);
      } catch (error) {
        console.error("open dock chat error:", error);
      }
    }

    function handleOpenConversationDock(event) {
      const conversation = event?.detail?.conversation;
      if (!getConversationId(conversation)) return;
      openConversation(conversation);
    }

    window.addEventListener("open-instructor-chat-dock", handleOpenDockChat);
    window.addEventListener(
      "open-chat-conversation-dock",
      handleOpenConversationDock
    );

    return () => {
      window.removeEventListener("open-instructor-chat-dock", handleOpenDockChat);
      window.removeEventListener(
        "open-chat-conversation-dock",
        handleOpenConversationDock
      );
    };
  }, [openConversation, openCourseConversation, isChatAllowed]);

  const value = useMemo(
    () => ({
      openChatBoxes,
      openConversation,
      openCourseConversation,
      closeConversation,
      toggleMinimizeConversation,
      focusConversation,
    }),
    [
      openChatBoxes,
      openConversation,
      openCourseConversation,
      closeConversation,
      toggleMinimizeConversation,
      focusConversation,
    ]
  );

  return (
    <ChatDockContext.Provider value={value}>
      {children}
    </ChatDockContext.Provider>
  );
}

export function useChatDock() {
  const context = useContext(ChatDockContext);

  if (!context) {
    throw new Error("useChatDock must be used within ChatDockProvider");
  }

  return context;
}