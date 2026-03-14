import { ChevronDown, Phone, Video, Minus, X } from "lucide-react";
import ChatBox from "./ChatBox";
import {
  getConversationOtherParty,
  getParticipantName,
} from "../services/chat.service";

export default function ChatDockItem({
  conversation,
  currentUserId,
  onClose,
  onToggleMinimize,
  onFocus,
}) {
  const otherParty = getConversationOtherParty(conversation, currentUserId);
  const displayName = getParticipantName(otherParty);
  const avatarUrl = otherParty?.avatarUrl;
  const minimized = !!conversation?.minimized;

  const courseId = conversation?.courseId?._id || conversation?.courseId;
  const conversationId = conversation?._id;

  return (
    <div
      className={`overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] ${
        minimized ? "w-[320px]" : "w-[360px]"
      }`}
      onMouseDown={onFocus}
    >
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2.5">
        <button
          type="button"
          onClick={onToggleMinimize}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <img
            src={
              avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                displayName
              )}&background=111827&color=fff`
            }
            alt={displayName}
            className="h-10 w-10 rounded-full object-cover"
          />

          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-slate-900">
              {displayName}
            </div>
            <div className="truncate text-xs text-slate-500">
              {conversation?.courseId?.title || "Course chat"}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 text-violet-500">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-slate-100"
          >
            <Phone className="h-4 w-4" />
          </button>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-slate-100"
          >
            <Video className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={onToggleMinimize}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-slate-100"
          >
            {minimized ? <ChevronDown className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized ? (
        <div className="h-[460px]">
          <ChatBox
            courseId={courseId}
            conversationId={conversationId}
            compact
            hideHeader
            dockMode
          />
        </div>
      ) : null}
    </div>
  );
}