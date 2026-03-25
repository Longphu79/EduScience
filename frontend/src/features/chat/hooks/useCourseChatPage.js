import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import {
  chatUnwrap,
  ensureConversation,
  getInstructorCourseConversations,
} from "../services/chat.service";
import {
  getConversationId,
  getUserId,
} from "../utils/chat.helpers";

export default function useCourseChatPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const currentRole = user?.role || null;
  const currentUserId = user?._id || user?.id || user?.userId || null;
  const isInstructor = currentRole === "instructor";
  const isStudent = currentRole === "student";
  const isChatAllowed = isInstructor || isStudent;

  const [conversations, setConversations] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [openingConversationId, setOpeningConversationId] = useState(null);

  const targetStudentId = useMemo(() => {
    return searchParams.get("studentId") || null;
  }, [searchParams]);

  useEffect(() => {
    async function loadConversations() {
      if (!isInstructor || !courseId) return;

      try {
        setLoadingList(true);
        const response = await getInstructorCourseConversations(courseId);
        const data = chatUnwrap(response);
        setConversations(Array.isArray(data) ? data : []);
      } catch {
        setConversations([]);
      } finally {
        setLoadingList(false);
      }
    }

    loadConversations();
  }, [courseId, isInstructor]);

  const activeConversation = useMemo(() => {
    if (!Array.isArray(conversations) || !targetStudentId) return null;

    return (
      conversations.find((item) => {
        const studentId = getUserId(item?.studentId);
        return String(studentId) === String(targetStudentId);
      }) || null
    );
  }, [conversations, targetStudentId]);

  function openConversationInDock(conversation) {
    if (!getConversationId(conversation)) return;

    window.dispatchEvent(
      new CustomEvent("open-chat-conversation-dock", {
        detail: { conversation },
      })
    );
  }

  async function openStudentChatDock() {
    if (!courseId) return;

    try {
      setOpeningConversationId("student-self");
      const response = await ensureConversation(courseId);
      const conversation = chatUnwrap(response);

      if (!getConversationId(conversation)) return;

      window.dispatchEvent(
        new CustomEvent("open-chat-conversation-dock", {
          detail: { conversation },
        })
      );
    } catch (error) {
      console.error("open student chat dock error:", error);
    } finally {
      setOpeningConversationId(null);
    }
  }

  function handleSelectInstructorConversation(conversation) {
    const studentId = getUserId(conversation?.studentId);

    navigate(`/instructor/courses/${courseId}/chat?studentId=${studentId}`, {
      replace: true,
    });

    openConversationInDock(conversation);
  }

  return {
    courseId,
    currentUserId,
    isInstructor,
    isStudent,
    isChatAllowed,
    conversations,
    loadingList,
    activeConversation,
    openingConversationId,
    handleSelectInstructorConversation,
    openStudentChatDock,
  };
}