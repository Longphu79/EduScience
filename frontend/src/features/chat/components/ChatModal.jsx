import { X } from "lucide-react";
import "../styles/chat-components.css";

export default function ChatModal({
  open,
  title = "Nhắn tin",
  subtitle = "",
  children,
  onClose,
}) {
  if (!open) return null;

  return (
    <div className="chat-modal">
      <div className="chat-modal__backdrop" onClick={onClose} />

      <div className="chat-modal__container">
        <div className="chat-modal__dialog">
          <div className="chat-modal__header">
            <div>
              <h3 className="chat-modal__title">{title}</h3>
              {subtitle ? (
                <p className="chat-modal__subtitle">{subtitle}</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="chat-modal__close"
              aria-label="Đóng chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="chat-modal__body">{children}</div>
        </div>
      </div>
    </div>
  );
}