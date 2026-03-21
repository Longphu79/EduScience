import { normalizeCertificate } from "../utils/certificate.helpers";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

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
  } catch {
    return null;
  }
}

function createHeaders(useAuth = false, extraHeaders = {}) {
  const headers = { ...extraHeaders };

  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export function certificateUnwrap(payload) {
  return payload?.data ?? payload ?? null;
}

export async function getCertificateByCourseStudent(courseId, studentId) {
  const res = await fetch(
    `${API_BASE_URL}/certificate/course/${courseId}/student/${studentId}`,
    {
      method: "GET",
      headers: createHeaders(true),
    }
  );

  const data = await handleResponse(res);
  return normalizeCertificate(certificateUnwrap(data));
}

export async function generateCertificate(payload) {
  const res = await fetch(`${API_BASE_URL}/certificate/generate`, {
    method: "POST",
    headers: createHeaders(true, {
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(res);
  return normalizeCertificate(certificateUnwrap(data));
}

export async function getCertificateByCode(code) {
  const res = await fetch(`${API_BASE_URL}/certificate/public/${code}`, {
    method: "GET",
  });

  const data = await handleResponse(res);
  return normalizeCertificate(certificateUnwrap(data));
}