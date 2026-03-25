import ChatBox from "./ChatBox";
import {
  getConversationId,
  getCourseId,
  getConversationOtherParty,
  getParticipantName,
} from "../utils/chat.helpers";

export default function ChatDockArea({
  boxes = [],
  currentUserId = null,
  onCloseBox,
  onToggleMinimize,
  onFocusBox,
}) {
  if (!Array.isArray(boxes) || boxes.length === 0 || !currentUserId) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[1300] flex max-w-[calc(100vw-1rem)] items-end gap-3">
      {boxes.map((box) => {
        const conversationId = getConversationId(box);
        const courseId = getCourseId(box?.courseId);

        if (!conversationId || !courseId) return null;

        const otherParty = getConversationOtherParty(box, currentUserId);
        const title = getParticipantName(otherParty);

        return (
          <div
            key={conversationId}
            className="pointer-events-auto flex w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
          >
            <button
              type="button"
              onClick={() => onFocusBox?.(conversationId)}
              className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left transition hover:bg-slate-100"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-slate-900">
                  {title}
                </div>
                <div className="truncate text-xs text-slate-500">
                  {box?.courseId?.title || "Course chat"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMinimize?.(conversationId);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-800"
                  aria-label={box?.minimized ? "Expand chat" : "Minimize chat"}
                >
                  {box?.minimized ? "▢" : "—"}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseBox?.(conversationId);
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-white hover:text-red-500"
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>
            </button>

            {!box?.minimized ? (
              <div className="h-[440px]">
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
      })}
    </div>
  );
}