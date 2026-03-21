import { SendHorizonal, Smile } from "lucide-react";
import "../styles/chat-box.css";

export default function ChatComposer({
  inputRef,
  content,
  sending,
  conversationId,
  onChange,
  onSubmit,
  onStopTyping,
}) {
  return (
    <form onSubmit={onSubmit} className="chat-composer">
      <div className="chat-composer__row">
        <button type="button" className="chat-composer__icon-btn">
          <Smile className="h-5 w-5" />
        </button>

        <div className="chat-composer__input-wrap">
          <input
            ref={inputRef}
            className="chat-composer__input"
            placeholder="Nhập tin nhắn..."
            value={content}
            onChange={(e) => {
              onChange(e.target.value);

              if (!e.target.value.trim() && conversationId) {
                onStopTyping?.();
              }
            }}
            disabled={sending}
          />
        </div>

        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="chat-composer__send-btn"
        >
          <SendHorizonal className="h-5 w-5" />
        </button>
      </div>
    </form>
  );
}