import ConversationList from "../components/ConversationList";
import useCourseChatPage from "../hooks/useCourseChatPage";
import "../styles/chat-page.css";

export default function CourseChatPage() {
  const {
    courseId,
    currentUserId,
    isInstructor,
    isChatAllowed,
    conversations,
    loadingList,
    activeConversation,
    openingConversationId,
    handleSelectInstructorConversation,
    openStudentChatDock,
  } = useCourseChatPage();

  if (!isChatAllowed) {
    return (
      <div className="course-chat-page">
        <div className="course-chat-page__card">
          <div className="course-chat-page__hero">
            <h1 className="course-chat-page__title">Tin nhắn khóa học</h1>
            <p className="course-chat-page__subtitle">
              Tài khoản admin không được sử dụng chức năng chat.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isInstructor) {
    return (
      <div className="course-chat-page">
        <div className="course-chat-page__hero">
          <h1 className="course-chat-page__title">Tin nhắn khóa học</h1>
          <p className="course-chat-page__subtitle">
            Chọn học viên để mở hộp chat realtime ở góc dưới màn hình.
          </p>
        </div>

        <div className="course-chat-page__card">
          <ConversationList
            conversations={conversations}
            loading={loadingList}
            currentUserId={currentUserId}
            activeConversationId={activeConversation?._id || null}
            emptyText="Khóa học này chưa có cuộc trò chuyện nào."
            onSelect={handleSelectInstructorConversation}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="course-chat-page course-chat-page--student">
      <div className="course-chat-page__card">
        <div className="course-chat-page__hero">
          <h1 className="course-chat-page__title">Nhắn tin với instructor</h1>
          <p className="course-chat-page__subtitle">
            Mở cuộc trò chuyện realtime bằng hộp chat nhỏ ở góc dưới màn hình.
          </p>
        </div>

        <div className="course-chat-page__empty-dock-card">
          <div className="course-chat-page__empty-dock-inner">
            <div className="course-chat-page__empty-dock-title">
              Chat theo kiểu mini messenger
            </div>
            <p className="course-chat-page__empty-dock-text">
              Nhấn nút bên dưới để mở hộp chat với instructor mà không chiếm toàn
              bộ trang.
            </p>

            <button
              type="button"
              onClick={openStudentChatDock}
              disabled={openingConversationId === "student-self"}
              className="course-chat-page__open-btn"
            >
              {openingConversationId === "student-self"
                ? "Đang mở chat..."
                : "Mở hộp chat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}