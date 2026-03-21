import { useAuth } from "../../auth/state/useAuth";
import { useChatDock } from "../context/ChatDockContext";
import ChatDockArea from "./ChatDockArea";

export default function ChatDockHost() {
  const { user, isAuthenticated } = useAuth();
  const {
    openChatBoxes,
    closeConversation,
    toggleMinimizeConversation,
    focusConversation,
  } = useChatDock();

  const currentUserId = user?._id || user?.id || user?.userId || null;
  const currentRole = user?.role || null;
  const isChatAllowed =
    currentRole === "student" || currentRole === "instructor";

  if (!isAuthenticated || !currentUserId || !isChatAllowed) return null;

  return (
    <ChatDockArea
      boxes={openChatBoxes}
      currentUserId={currentUserId}
      onCloseBox={closeConversation}
      onToggleMinimize={toggleMinimizeConversation}
      onFocusBox={focusConversation}
    />
  );
}