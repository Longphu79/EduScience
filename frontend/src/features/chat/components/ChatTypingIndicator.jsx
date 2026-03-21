import "../styles/chat-box.css";

export default function ChatTypingIndicator() {
  return (
    <div className="chat-typing-indicator">
      <div className="chat-typing-indicator__spacer" />
      <div className="chat-typing-indicator__bubble">
        <div className="chat-typing-indicator__dots">
          <span className="chat-typing-indicator__dot chat-typing-indicator__dot--delay-1" />
          <span className="chat-typing-indicator__dot chat-typing-indicator__dot--delay-2" />
          <span className="chat-typing-indicator__dot" />
        </div>
      </div>
    </div>
  );
}