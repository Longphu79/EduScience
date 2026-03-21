import { getParticipantAvatar, getParticipantName } from "../utils/chat.helpers";
import "../styles/chat-box.css";

export default function ChatBoxHeader({ otherParty, title, subtitle }) {
  const avatarName = getParticipantName(otherParty || { name: title });

  return (
    <div className="chat-box__header">
      <div className="chat-box__header-row">
        <div className="chat-box__avatar-wrap">
          <img
            src={getParticipantAvatar(otherParty || { name: avatarName })}
            alt={title}
            className="chat-box__avatar"
          />
          <span className="chat-box__avatar-status" />
        </div>

        <div className="chat-box__header-meta">
          <div className="chat-box__header-title">{title}</div>
          <div className="chat-box__header-subtitle">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}