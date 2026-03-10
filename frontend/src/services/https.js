const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function request(path, options = {}) {
  const token = localStorage.getItem("token");

  const { data, method = "GET", headers = {}, ...rest } = options;

  const isFormData = data instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(!isFormData && { "Content-Type": "application/json" }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers
    },
    ...(data ? { body: isFormData ? data : JSON.stringify(data) } : {}),
    ...rest
  });

  const responseData = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(responseData.message || "Request failed");
  }

  return responseData;
}