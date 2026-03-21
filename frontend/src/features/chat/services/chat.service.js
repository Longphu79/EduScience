import { io } from "socket.io-client";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

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

    if (!authRaw) return null;

    const parsed = JSON.parse(authRaw);
    return (
      parsed?.token ||
      parsed?.accessToken ||
      parsed?.state?.token ||
      parsed?.state?.accessToken ||
      null
    );
  } catch (error) {
    console.error("getAuthToken error:", error);
    return null;
  }
}

function createHeaders(extraHeaders = {}, useAuth = false) {
  const headers = { ...extraHeaders };

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
    const error = new Error(data?.message || fallbackMessage);
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export function chatUnwrap(payload) {
  return payload?.data ?? payload ?? null;
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

export async function getMyUnreadSummary() {
  const response = await fetch(
    `${API_BASE_URL}/chat/conversations/unread-summary`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(response, "Failed to fetch unread summary");
}

export async function markConversationAsRead(conversationId) {
  const response = await fetch(
    `${API_BASE_URL}/chat/conversation/${conversationId}/read`,
    {
      method: "POST",
      headers: createHeaders({ "Content-Type": "application/json" }, true),
    }
  );

  return handleResponse(response, "Failed to mark conversation as read");
}

function createSocket(token) {
  return io(API_BASE_URL, {
    transports: ["websocket"],
    autoConnect: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 800,
    reconnectionDelayMax: 4000,
  });
}

export function getChatSocket() {
  const token = getAuthToken();

  if (!socketInstance) {
    socketInstance = createSocket(token);
    return socketInstance;
  }

  const currentSocketToken = socketInstance.auth?.token || null;

  if (currentSocketToken !== token) {
    socketInstance.disconnect();
    socketInstance = createSocket(token);
    return socketInstance;
  }

  if (!socketInstance.connected) {
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