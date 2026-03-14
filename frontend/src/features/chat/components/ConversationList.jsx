import {
  getConversationOtherParty,
  getParticipantName,
} from "../services/chat.service";

function formatLastTime(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
}

export default function ConversationList({
  conversations = [],
  loading = false,
  activeConversationId = null,
  currentUserId = null,
  onSelect,
  emptyText = "Chưa có cuộc trò chuyện nào.",
}) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Đang tải cuộc trò chuyện...
      </div>
    );
  }

  if (!Array.isArray(conversations) || conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white">
      <div className="max-h-[520px] overflow-y-auto">
        {conversations.map((conversation) => {
          const conversationId = conversation?._id;
          const otherParty = getConversationOtherParty(conversation, currentUserId);
          const displayName = getParticipantName(otherParty);
          const avatarUrl = otherParty?.avatarUrl;
          const courseTitle = conversation?.courseId?.title || "Course";
          const isActive = String(conversationId) === String(activeConversationId);

          return (
            <button
              key={conversationId}
              type="button"
              onClick={() => onSelect?.(conversation)}
              className={`flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition ${
                isActive ? "bg-violet-50" : "hover:bg-slate-50"
              }`}
            >
              <img
                src={
                  avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    displayName
                  )}&background=111827&color=fff`
                }
                alt={displayName}
                className="h-12 w-12 rounded-full object-cover"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-slate-900">
                      {displayName}
                    </div>
                    <div className="truncate text-xs text-slate-400">
                      {courseTitle}
                    </div>
                  </div>

                  <div className="shrink-0 text-[11px] text-slate-400">
                    {formatLastTime(conversation?.lastMessageAt)}
                  </div>
                </div>

                <div className="mt-1 truncate text-sm text-slate-500">
                  {conversation?.lastMessage || "Chưa có tin nhắn"}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}