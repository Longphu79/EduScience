import { Search, MessageCircleMore, X } from "lucide-react";
import { useAuth } from "../../auth/state/useAuth";
import ConversationList from "./ConversationList";
import useMessageCenter from "../hooks/useMessageCenter";

export default function MessageCenter({
  open,
  currentUserId,
  onClose,
  onOpenConversation,
}) {
  const { user } = useAuth();
  const currentRole = user?.role || null;
  const isChatAllowed =
    currentRole === "student" || currentRole === "instructor";

  const {
    loading,
    keyword,
    filteredConversations,
    setKeyword,
    loadConversations,
    markConversationReadLocally,
  } = useMessageCenter({
    open,
    isChatAllowed,
    currentUserId,
  });

  if (!open) return null;

  if (!isChatAllowed) {
    return (
      <div className="absolute right-0 top-[calc(100%+14px)] z-[140] flex h-[min(78vh,720px)] w-[400px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <MessageCircleMore className="h-5 w-5" />
            </div>

            <div>
              <div className="text-2xl font-extrabold text-slate-900">
                Đoạn chat
              </div>
              <div className="text-sm text-slate-500">
                Tính năng này chỉ dành cho student và instructor
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 px-5 py-8 text-center text-sm text-slate-600">
          Tài khoản admin không được mở hoặc gửi tin nhắn.
        </div>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-[calc(100%+14px)] z-[140] flex h-[min(78vh,720px)] w-[420px] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
      <div className="border-b border-slate-200 px-5 py-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
              <MessageCircleMore className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="truncate text-2xl font-extrabold text-slate-900">
                Đoạn chat
              </div>
              <div className="truncate text-sm text-slate-500">
                Cuộc trò chuyện gần đây
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={loadConversations}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm đoạn chat..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </div>

        <div>
          <span className="inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-semibold text-indigo-700">
            Tất cả
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 overscroll-contain">
        <ConversationList
          conversations={filteredConversations}
          loading={loading}
          currentUserId={currentUserId}
          emptyText="Bạn chưa có cuộc trò chuyện nào."
          onSelect={(conversation) => {
            markConversationReadLocally(conversation);
            onOpenConversation?.(conversation);
            onClose?.();
          }}
        />
      </div>
    </div>
  );
}