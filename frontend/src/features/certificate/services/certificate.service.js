const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

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

async function handleResponse(res, fallbackMessage = "Request failed") {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export function certificateUnwrap(res) {
  return res?.data ?? res ?? null;
}

export async function generateCertificate(payload) {
  const res = await fetch(`${API_BASE_URL}/certificate/generate`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify({
      courseId: payload?.courseId,
      studentId: payload?.studentId,
      studentName: payload?.studentName,
    }),
  });

  return handleResponse(res, "Failed to generate certificate");
}

export async function getCertificateByCourseStudent(courseId, studentId) {
  const res = await fetch(
    `${API_BASE_URL}/certificate/course/${courseId}/student/${studentId}`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(res, "Failed to fetch certificate");
}

export async function getCertificateById(certificateId) {
  const res = await fetch(`${API_BASE_URL}/certificate/${certificateId}`, {
    headers: createHeaders({}, true),
  });

  return handleResponse(res, "Failed to fetch certificate by id");
}

export async function getCertificateByCode(code) {
  const res = await fetch(`${API_BASE_URL}/certificate/public/${code}`, {
    headers: createHeaders(),
  });

  return handleResponse(res, "Failed to fetch public certificate");
}