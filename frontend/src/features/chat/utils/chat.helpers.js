export function getUserId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || value.userId || "");
  }
  return String(value);
}

export function getConversationId(conversation) {
  if (!conversation) return "";
  return String(conversation._id || conversation.id || conversation.conversationId || "");
}

export function getCourseId(course) {
  if (!course) return "";
  if (typeof course === "object") {
    return String(course._id || course.id || "");
  }
  return String(course);
}

export function getParticipantName(participant) {
  if (!participant) return "User";

  return (
    participant?.name ||
    participant?.fullName ||
    participant?.username ||
    participant?.displayName ||
    participant?.email ||
    "User"
  );
}

export function getParticipantAvatar(participant) {
  const name = getParticipantName(participant);

  return (
    participant?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name || "User"
    )}&background=111827&color=fff`
  );
}

export function formatMessageTime(value) {
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

export function formatHeaderStatus(conversation) {
  const lastTime = conversation?.lastMessageAt;
  if (!lastTime) return "Sẵn sàng trò chuyện";

  const date = new Date(lastTime);
  if (Number.isNaN(date.getTime())) return "Sẵn sàng trò chuyện";

  return `Hoạt động gần đây ${date.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  })}`;
}

export function getConversationOtherParty(conversation, currentUserId) {
  if (!conversation) return null;

  const student = conversation?.studentId;
  const instructor = conversation?.instructorId;

  const studentId = getUserId(student);
  const instructorId = getUserId(instructor);

  if (String(studentId) === String(currentUserId)) {
    return instructor || null;
  }

  return student || null;
}

export function getConversationUnreadCount(conversation, currentUserId) {
  if (!conversation || !currentUserId) return 0;

  const studentId = getUserId(conversation?.studentId);
  const instructorId = getUserId(conversation?.instructorId);

  if (String(studentId) === String(currentUserId)) {
    return Number(conversation?.studentUnreadCount || 0);
  }

  if (String(instructorId) === String(currentUserId)) {
    return Number(conversation?.instructorUnreadCount || 0);
  }

  return 0;
}

export function getLastMessageText(conversation) {
  const raw =
    conversation?.lastMessage ||
    conversation?.latestMessage?.message ||
    conversation?.latestMessage?.content ||
    conversation?.latestMessage?.text ||
    conversation?.message;

  if (!raw) return "Chưa có tin nhắn";

  if (typeof raw === "string") return raw;

  return raw?.message || raw?.content || raw?.text || "Chưa có tin nhắn";
}

export function sortConversations(list = []) {
  return [...list].sort((a, b) => {
    const aTime = new Date(a?.lastMessageAt || 0).getTime();
    const bTime = new Date(b?.lastMessageAt || 0).getTime();
    return bTime - aTime;
  });
}

export function sortBoxes(list = []) {
  return [...list].sort((a, b) => {
    const aFocused = Number(Boolean(a?.focused));
    const bFocused = Number(Boolean(b?.focused));

    if (aFocused !== bFocused) {
      return bFocused - aFocused;
    }

    const aTime = new Date(a?.lastMessageAt || a?.updatedAt || 0).getTime();
    const bTime = new Date(b?.lastMessageAt || b?.updatedAt || 0).getTime();
    return bTime - aTime;
  });
}

export function normalizeConversationForCurrentUser(conversation, currentUserId) {
  if (!getConversationId(conversation)) return conversation;

  const isStudent =
    String(getUserId(conversation?.studentId)) === String(currentUserId);

  const isInstructor =
    String(getUserId(conversation?.instructorId)) === String(currentUserId);

  return {
    ...conversation,
    studentUnreadCount: isStudent
      ? 0
      : Number(conversation?.studentUnreadCount || 0),
    instructorUnreadCount: isInstructor
      ? 0
      : Number(conversation?.instructorUnreadCount || 0),
  };
}

export function mergeConversation(prevConversation, nextConversation) {
  if (!prevConversation) return nextConversation;
  if (!nextConversation) return prevConversation;

  return {
    ...prevConversation,
    ...nextConversation,
    studentId: nextConversation?.studentId ?? prevConversation?.studentId,
    instructorId:
      nextConversation?.instructorId ?? prevConversation?.instructorId,
    courseId: nextConversation?.courseId ?? prevConversation?.courseId,
  };
}

export function normalizeConversationList(list = []) {
  if (!Array.isArray(list)) return [];
  return list.filter(Boolean);
}