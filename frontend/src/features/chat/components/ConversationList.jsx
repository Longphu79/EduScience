import {
  formatHeaderStatus,
  getConversationId,
  getConversationOtherParty,
  getConversationUnreadCount,
  getLastMessageText,
  getParticipantAvatar,
  getParticipantName,
} from "../utils/chat.helpers";

function ConversationSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3"
        >
          <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="min-w-0 flex-1">
            <div className="mb-2 h-4 w-40 animate-pulse rounded bg-slate-200" />
            <div className="mb-2 h-3 w-28 animate-pulse rounded bg-slate-100" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ConversationList({
  conversations = [],
  loading = false,
  currentUserId = null,
  activeConversationId = null,
  emptyText = "Chưa có cuộc trò chuyện nào.",
  onSelect,
}) {
  if (loading) {
    return <ConversationSkeleton />;
  }

  if (!Array.isArray(conversations) || conversations.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm font-medium text-slate-500">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((conversation) => {
        const conversationId = getConversationId(conversation);
        const otherParty = getConversationOtherParty(
          conversation,
          currentUserId
        );

        const displayName = getParticipantName(otherParty);
        const courseTitle = conversation?.courseId?.title || "Course chat";
        const lastMessage = getLastMessageText(conversation);
        const unreadCount = getConversationUnreadCount(
          conversation,
          currentUserId
        );
        const isActive =
          String(conversationId) === String(activeConversationId);

        return (
          <button
            key={conversationId || displayName}
            type="button"
            onClick={() => onSelect?.(conversation)}
            className={`flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition ${
              isActive
                ? "border-indigo-300 bg-indigo-50 shadow-sm"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <img
              src={getParticipantAvatar(otherParty)}
              alt={displayName}
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
            />

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-slate-900">
                    {displayName}
                  </div>
                  <div className="truncate text-xs text-slate-500">
                    {courseTitle}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {unreadCount > 0 ? (
                    <span className="inline-flex min-w-[22px] items-center justify-center rounded-full bg-indigo-600 px-1.5 py-0.5 text-[11px] font-bold text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mb-1 truncate text-sm text-slate-600">
                {lastMessage}
              </div>

              <div className="text-[11px] text-slate-400">
                {formatHeaderStatus(conversation)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}