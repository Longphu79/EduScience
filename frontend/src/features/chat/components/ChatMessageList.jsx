import { CircleEllipsis } from "lucide-react";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatTypingIndicator from "./ChatTypingIndicator";
import "../styles/chat-box.css";

function MessageSkeleton({ align = "left" }) {
  return (
    <div
      className={`chat-message-skeleton ${
        align === "right"
          ? "chat-message-skeleton--right"
          : "chat-message-skeleton--left"
      }`}
    >
      <div className="chat-message-skeleton__item" />
    </div>
  );
}

export default function ChatMessageList({
  loading,
  messages,
  isOtherTyping,
  currentUserId,
  dockMode = false,
}) {
  if (loading) {
    return (
      <div className="chat-message-list">
        <MessageSkeleton align="left" />
        <MessageSkeleton align="right" />
        <MessageSkeleton align="left" />
      </div>
    );
  }

  if (!messages.length) {
    return (
      <div className="chat-message-list__empty-wrap">
        <div className="chat-message-list__empty-card">
          <div className="chat-message-list__empty-icon">
            <CircleEllipsis className="h-6 w-6" />
          </div>
          <div className="chat-message-list__empty-title">
            Chưa có tin nhắn nào
          </div>
          <div className="chat-message-list__empty-text">
            Hãy bắt đầu cuộc trò chuyện với một lời chào.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-message-list">
      {messages.map((message, index) => {
        const sender = message.senderId || {};
        const senderId = sender?._id || message.senderId;
        const isMine = String(senderId) === String(currentUserId);
        const prevMessage = messages[index - 1];
        const prevSenderId =
          prevMessage?.senderId?._id || prevMessage?.senderId || null;
        const showAvatar = !isMine && String(prevSenderId) !== String(senderId);

        return (
          <ChatMessageBubble
            key={message._id || `${senderId}-${message.createdAt}`}
            message={message}
            isMine={isMine}
            showAvatar={showAvatar}
            sender={sender}
            dockMode={dockMode}
          />
        );
      })}

      {isOtherTyping ? <ChatTypingIndicator /> : null}
    </div>
  );
}