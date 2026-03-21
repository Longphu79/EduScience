import { formatMessageTime } from "../utils/chat.helpers";
import "../styles/chat-box.css";

export default function ChatMessageBubble({
  message,
  isMine,
  showAvatar,
  sender,
  dockMode = false,
}) {
  return (
    <div
      className={`chat-message-bubble ${
        isMine ? "chat-message-bubble--mine" : "chat-message-bubble--other"
      }`}
    >
      {!isMine ? (
        showAvatar ? (
          <img
            src={
              sender?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                sender?.name ||
                  sender?.fullName ||
                  sender?.username ||
                  sender?.email ||
                  "User"
              )}&background=111827&color=fff`
            }
            alt="avatar"
            className="chat-message-bubble__avatar"
          />
        ) : (
          <div className="chat-message-bubble__avatar-spacer" />
        )
      ) : null}

      <div className="chat-message-bubble__body">
        {!dockMode && !isMine && showAvatar ? (
          <div className="chat-message-bubble__sender-name">
            {sender?.name ||
              sender?.fullName ||
              sender?.username ||
              sender?.email ||
              "User"}
          </div>
        ) : null}

        <div
          className={`chat-message-bubble__content ${
            isMine
              ? "chat-message-bubble__content--mine"
              : "chat-message-bubble__content--other"
          } ${message?.isPending ? "chat-message-bubble__content--pending" : ""}`}
        >
          <div className="chat-message-bubble__text">
            {message.message || ""}
          </div>

          <div
            className={`chat-message-bubble__time ${
              isMine
                ? "chat-message-bubble__time--mine"
                : "chat-message-bubble__time--other"
            }`}
          >
            {message?.isPending
              ? "Đang gửi..."
              : formatMessageTime(message.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}