import { io } from "socket.io-client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

let socketInstance = null;

function getAuthToken() {
  try {
    const directToken =
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken");

    if (directToken) return directToken;

    const authRaw =
      localStorage.getItem("auth") ||
      localStorage.getItem("auth-storage") ||
      localStorage.getItem("eduscience_auth");

    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      return (
        parsed?.token ||
        parsed?.accessToken ||
        parsed?.state?.token ||
        parsed?.state?.accessToken ||
        null
      );
    }
  } catch (error) {
    console.error("getAuthToken error:", error);
  }

  return null;
}

function createHeaders(extraHeaders = {}, useAuth = false) {
  const headers = {
    ...extraHeaders,
  };

  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse(response, fallbackMessage = "Request failed") {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export function chatUnwrap(payload) {
  return payload?.data ?? payload ?? null;
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

export function getConversationOtherParty(conversation, currentUserId) {
  if (!conversation) return null;

  const student = conversation?.studentId;
  const instructor = conversation?.instructorId;

  const studentId = student?._id || student?.id || student;
  const instructorId = instructor?._id || instructor?.id || instructor;

  if (String(studentId) === String(currentUserId)) {
    return instructor || null;
  }

  return student || null;
}

export async function ensureConversation(courseId, studentId) {
  const response = await fetch(
    `${API_BASE_URL}/chat/course/${courseId}/conversation`,
    {
      method: "POST",
      headers: createHeaders({ "Content-Type": "application/json" }, true),
      body: JSON.stringify(studentId ? { studentId } : {}),
    }
  );

  return handleResponse(response, "Failed to ensure conversation");
}

export async function getConversationMessages(conversationId) {
  const response = await fetch(
    `${API_BASE_URL}/chat/conversation/${conversationId}/messages`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(response, "Failed to fetch conversation messages");
}

export async function getInstructorCourseConversations(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/chat/course/${courseId}/conversations`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(response, "Failed to fetch instructor conversations");
}

export async function listMyConversations() {
  const response = await fetch(`${API_BASE_URL}/chat/conversations/my`, {
    headers: createHeaders({}, true),
  });

  return handleResponse(response, "Failed to fetch conversations");
}

export async function sendConversationMessage(conversationId, payload) {
  const response = await fetch(
    `${API_BASE_URL}/chat/conversation/${conversationId}/messages`,
    {
      method: "POST",
      headers: createHeaders({ "Content-Type": "application/json" }, true),
      body: JSON.stringify({
        message: payload?.message,
      }),
    }
  );

  return handleResponse(response, "Failed to send conversation message");
}

export function getChatSocket() {
  const token = getAuthToken();

  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  if (!socketInstance) {
    socketInstance = io(API_BASE_URL, {
      transports: ["websocket"],
      autoConnect: true,
      auth: {
        token,
      },
    });
  } else if (!socketInstance.connected) {
    socketInstance.auth = { token };
    socketInstance.connect();
  }

  return socketInstance;
}

export function disconnectChatSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}