import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import {
  chatUnwrap,
  listMyConversations,
} from "../services/chat.service";
import ConversationList from "./ConversationList";

export default function MessageCenter({
  open,
  currentUserId,
  onClose,
  onOpenConversation,
}) {
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [keyword, setKeyword] = useState("");

  async function loadConversations() {
    try {
      setLoading(true);
      const response = await listMyConversations();
      const data = chatUnwrap(response);
      setConversations(Array.isArray(data) ? data : []);
    } catch (error) {
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    loadConversations();
  }, [open]);

  const filteredConversations = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword) return conversations;

    return conversations.filter((item) => {
      const studentName =
        item?.studentId?.name ||
        item?.studentId?.fullName ||
        item?.studentId?.username ||
        item?.studentId?.email ||
        "";

      const instructorName =
        item?.instructorId?.name ||
        item?.instructorId?.fullName ||
        item?.instructorId?.username ||
        item?.instructorId?.email ||
        "";

      const courseTitle = item?.courseId?.title || "";
      const lastMessage = item?.lastMessage || "";

      const haystack = [
        studentName,
        instructorName,
        courseTitle,
        lastMessage,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedKeyword);
    });
  }, [conversations, keyword]);

  if (!open) return null;

  return (
    <div className="absolute right-0 top-[calc(100%+12px)] z-[70] w-[380px] overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xl font-bold text-slate-900">Đoạn chat</div>
            <div className="text-xs text-slate-500">
              Danh sách cuộc trò chuyện gần đây
            </div>
          </div>

          <button
            type="button"
            onClick={loadConversations}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-100 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm kiếm đoạn chat..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Tất cả
          </span>
        </div>
      </div>

      <div className="p-3">
        <ConversationList
          conversations={filteredConversations}
          loading={loading}
          currentUserId={currentUserId}
          emptyText="Bạn chưa có cuộc trò chuyện nào."
          onSelect={(conversation) => {
            onOpenConversation?.(conversation);
            onClose?.();
          }}
        />
      </div>
    </div>
  );
}