const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export async function getCourseMessages(courseId, userId) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : "";
  const response = await fetch(
    `${API_BASE_URL}/chat/course/${courseId}/messages${query}`
  );
  return handleResponse(response);
}

export async function sendCourseMessage(courseId, payload) {
  const response = await fetch(
    `${API_BASE_URL}/chat/course/${courseId}/messages`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(response);
}

export const createCourseMessage = sendCourseMessage;
export const getMessagesByCourse = getCourseMessages;
export const getChatMessages = getCourseMessages;
export const sendMessage = sendCourseMessage;