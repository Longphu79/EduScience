const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

function getAccessToken() {
  try {
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      ""
    );
  } catch (error) {
    console.error("getAccessToken error:", error);
    return "";
  }
}

async function request(endpoint, options = {}) {
  const token = getAccessToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error((isJson && data?.message) || "Request failed");
  }

  return data;
}

export const api = {
  get: (endpoint, options = {}) =>
    request(endpoint, {
      ...options,
      method: "GET",
    }),

  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  patch: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),

  delete: (endpoint, options = {}) =>
    request(endpoint, {
      ...options,
      method: "DELETE",
    }),
};