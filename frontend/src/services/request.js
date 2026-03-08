const API_BASE_RAW = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_BASE = API_BASE_RAW.replace(/\/+$/, "");

export async function request(path, options = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const res = await fetch(`${API_BASE}${normalizedPath}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}