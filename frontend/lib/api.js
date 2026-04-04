const DEFAULT_API_BASE_URL = "http://127.0.0.1:4000";

export const API_BASE_URL =
  process.env.API_BASE_URL ||
  process.env.INTERNAL_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  DEFAULT_API_BASE_URL;

const buildUrl = (path) =>
  path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

const parseError = async (response) => {
  try {
    const data = await response.json();
    return data?.message || "Request failed";
  } catch (_error) {
    return "Request failed";
  }
};

export async function apiFetch(path, options = {}) {
  const { token, headers, cache = "no-store", ...rest } = options;
  const response = await fetch(buildUrl(path), {
    ...rest,
    cache,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
}

export const postJson = (path, body, options = {}) =>
  apiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });

export const putJson = (path, body, options = {}) =>
  apiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });
