import app from "../../src/app.js";

export const startTestServer = async () =>
  await new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();

      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });
  });

export const stopTestServer = async (server) =>
  await new Promise((resolve, reject) => {
    if (!server) {
      resolve();
      return;
    }

    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      resolve();
    });
  });

export const requestJson = async (
  baseUrl,
  path,
  { method = "GET", token, headers = {}, body } = {},
) => {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await response.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return {
    status: response.status,
    data,
  };
};

export const loginViaApi = async (baseUrl, { username, password }) => {
  const response = await requestJson(baseUrl, "/auth/login", {
    method: "POST",
    body: { username, password },
  });

  if (response.status !== 200) {
    throw new Error(`Login failed for ${username}`);
  }

  return response.data;
};
