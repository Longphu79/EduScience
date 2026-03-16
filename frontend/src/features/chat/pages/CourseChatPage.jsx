import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import ChatBox from "../components/ChatBox";
import ConversationList from "../components/ConversationList";
import {
  chatUnwrap,
  getInstructorCourseConversations,
} from "../services/chat.service";
import { useAuth } from "../../auth/state/useAuth";

export default function CourseChatPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const currentRole = user?.role || null;
  const currentUserId = user?._id || user?.id || user?.userId || null;

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  const targetStudentId = useMemo(() => {
    const value = searchParams.get("studentId");
    return value || null;
  }, [searchParams]);

  useEffect(() => {
    async function loadConversations() {
      if (currentRole !== "instructor" || !courseId) return;

      try {
        setLoadingList(true);
        const response = await getInstructorCourseConversations(courseId);
        const data = chatUnwrap(response);
        setConversations(Array.isArray(data) ? data : []);
      } catch (error) {
        setConversations([]);
      } finally {
        setLoadingList(false);
      }
    }

    loadConversations();
  }, [courseId, currentRole]);

  const activeConversation = useMemo(() => {
    if (!Array.isArray(conversations) || !targetStudentId) return null;

    return (
      conversations.find((item) => {
        const studentId =
          item?.studentId?._id || item?.studentId?.id || item?.studentId;
        return String(studentId) === String(targetStudentId);
      }) || null
    );
  }, [conversations, targetStudentId]);

  if (currentRole === "instructor") {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Tin nhắn khóa học</h1>
          <p className="mt-1 text-sm text-slate-500">
            Chọn học viên để trò chuyện realtime.
          </p>
        </div>

        <div className="grid min-h-[720px] gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside>
            <ConversationList
              conversations={conversations}
              loading={loadingList}
              currentUserId={currentUserId}
              activeConversationId={activeConversation?._id || null}
              emptyText="Khóa học này chưa có cuộc trò chuyện nào."
              onSelect={(conversation) => {
                const studentId =
                  conversation?.studentId?._id ||
                  conversation?.studentId?.id ||
                  conversation?.studentId;

                navigate(
                  `/instructor/courses/${courseId}/chat?studentId=${studentId}`
                );
              }}
            />
          </aside>

          <main className="min-h-0">
            <ChatBox
              courseId={courseId}
              targetStudentId={targetStudentId}
              conversationId={activeConversation?._id || null}
            />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Nhắn tin với instructor</h1>
        <p className="mt-1 text-sm text-slate-500">
          Realtime chat với instructor của khóa học.
        </p>
      </div>

      <div className="min-h-[720px]">
        <ChatBox courseId={courseId} compact={false} />
      </div>
    </div>
  );
}