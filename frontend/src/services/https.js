const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

function getStoredToken() {
  return localStorage.getItem("token");
}

export async function request(path, options = {}) {
  const token = getStoredToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  return data;
}