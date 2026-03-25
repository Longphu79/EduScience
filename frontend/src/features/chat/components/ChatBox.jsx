import { CircleEllipsis, SendHorizonal, Smile } from "lucide-react";
import Toast from "../../../shared/components/Toast";
import ChatMessageBubble from "./ChatMessageBubble";
import ChatTypingIndicator from "./ChatTypingIndicator";
import { getParticipantAvatar, getUserId } from "../utils/chat.helpers";
import useChatBox from "../hooks/useChatBox";
import "../styles/chat-components.css";

function MessageSkeleton({ align = "left" }) {
  return (
    <div
      className={`chat-box__message-row ${
        align === "right"
          ? "chat-box__message-row--mine"
          : "chat-box__message-row--other"
      }`}
    >
      <div
        className="chat-box__bubble chat-box__bubble--other"
        style={{
          width: align === "right" ? 160 : 176,
          height: 64,
          background: "#e2e8f0",
          animation: "pulse 1.5s infinite",
        }}
      />
    </div>
  );
}

export default function ChatBox({
  courseId,
  targetStudentId = null,
  conversationId: externalConversationId = null,
  compact = false,
  hideHeader = false,
  dockMode = false,
}) {
  const {
    currentRole,
    currentUserId,
    isChatAllowed,
    title,
    subtitle,
    messages,
    content,
    loading,
    sending,
    isOtherTyping,
    toast,
    otherParty,
    chatContainerRef,
    inputRef,
    setToast,
    setContent,
    emitTyping,
    emitStopTyping,
    handleSendMessage,
  } = useChatBox({
    courseId,
    targetStudentId,
    externalConversationId,
  });

  if (!isChatAllowed) {
    return (
      <div className="chat-box__instructor-empty">
        Tài khoản admin không được sử dụng chức năng chat.
      </div>
    );
  }

  if (
    currentRole === "instructor" &&
    !targetStudentId &&
    !externalConversationId
  ) {
    return (
      <div className="chat-box__instructor-empty">
        Chọn một học viên để bắt đầu trò chuyện.
      </div>
    );
  }

  return (
    <div className={`chat-box ${dockMode ? "chat-box--dock" : "chat-box--panel"}`}>
      {toast.message ? (
        <div className="chat-box__toast">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      {!hideHeader ? (
        <div className="chat-box__header">
          <div className="chat-box__header-row">
            <div className="chat-box__avatar-wrap">
              <img
                src={getParticipantAvatar(otherParty || { name: title })}
                alt={title}
                className="chat-box__avatar"
              />
              <span className="chat-box__presence-dot" />
            </div>

            <div className="chat-box__header-content">
              <div className="chat-box__title">{title}</div>
              <div className="chat-box__subtitle">{subtitle}</div>
            </div>
          </div>
        </div>
      ) : null}

      <div
        ref={chatContainerRef}
        className={`chat-box__body ${compact ? "chat-box__body--compact" : ""}`}
      >
        <div className="chat-box__messages">
          {loading ? (
            <>
              <MessageSkeleton align="left" />
              <MessageSkeleton align="right" />
              <MessageSkeleton align="left" />
            </>
          ) : messages.length === 0 ? (
            <div className="chat-box__empty">
              <div className="chat-box__empty-card">
                <div className="chat-box__empty-icon">
                  <CircleEllipsis className="h-6 w-6" />
                </div>
                <div className="chat-box__empty-title">Chưa có tin nhắn nào</div>
                <div className="chat-box__empty-text">
                  Hãy bắt đầu cuộc trò chuyện với một lời chào.
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const sender = message?.senderId || {};
              const senderId = getUserId(sender || message?.senderId);
              const isMine = String(senderId) === String(currentUserId);

              const prevMessage = messages[index - 1];
              const prevSenderId = getUserId(
                prevMessage?.senderId?._id
                  ? prevMessage?.senderId
                  : prevMessage?.senderId
              );

              const showAvatar =
                !isMine && String(prevSenderId) !== String(senderId);

              return (
                <ChatMessageBubble
                  key={message?._id || `${senderId}-${message?.createdAt}`}
                  message={message}
                  isMine={isMine}
                  showAvatar={showAvatar}
                  sender={sender}
                  dockMode={dockMode}
                />
              );
            })
          )}

          {isOtherTyping ? <ChatTypingIndicator /> : null}
        </div>
      </div>

      <form onSubmit={handleSendMessage} className="chat-box__composer">
        <div className="chat-box__composer-row">
          <button type="button" className="chat-box__icon-btn">
            <Smile className="h-5 w-5" />
          </button>

          <div className="chat-box__input-wrap">
            <input
              ref={inputRef}
              className="chat-box__input"
              placeholder="Nhập tin nhắn..."
              value={content}
              onChange={(event) => {
                const nextValue = event.target.value;
                setContent(nextValue);

                if (nextValue.trim()) {
                  emitTyping();
                } else {
                  emitStopTyping();
                }
              }}
              disabled={sending}
            />
          </div>

          <button
            type="submit"
            disabled={sending || !content.trim()}
            className="chat-box__send-btn"
          >
            <SendHorizonal className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
}