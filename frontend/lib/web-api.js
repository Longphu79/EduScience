import { nprogress } from "@mantine/nprogress";

const parseResponse = async (response) => {
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

const parseTextResponse = (status, text) => {
  const data = text ? JSON.parse(text) : null;

  if (status < 200 || status >= 300) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};

export async function browserApiFetch(path, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  nprogress.start();

  try {
    const response = await fetch(path, {
      ...options,
      cache: options.cache ?? "no-store",
      headers: {
        ...(!isFormData && options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });

    return await parseResponse(response);
  } finally {
    nprogress.complete();
  }
}

export const browserPostJson = (path, body, options = {}) =>
  browserApiFetch(path, {
    method: "POST",
    body: JSON.stringify(body),
    ...options,
  });

export const browserPutJson = (path, body, options = {}) =>
  browserApiFetch(path, {
    method: "PUT",
    body: JSON.stringify(body),
    ...options,
  });

export const browserDelete = (path, options = {}) =>
  browserApiFetch(path, {
    method: "DELETE",
    ...options,
  });

export const browserPostFormData = (path, formData, options = {}) =>
  browserApiFetch(path, {
    method: "POST",
    body: formData,
    ...options,
  });

export const browserUploadFormData = (path, formData, options = {}) =>
  new Promise((resolve, reject) => {
    nprogress.start();
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || "POST", path, true);

    xhr.onload = () => {
      try {
        resolve(parseTextResponse(xhr.status, xhr.responseText));
      } catch (error) {
        reject(error);
      } finally {
        nprogress.complete();
      }
    };

    xhr.onerror = () => {
      nprogress.complete();
      reject(new Error("Network request failed"));
    };

    if (xhr.upload && typeof options.onProgress === "function") {
      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) {
          return;
        }

        options.onProgress(Math.round((event.loaded / event.total) * 100));
      };
    }

    xhr.send(formData);
  });

const normalizeBackendPath = (path) => path.replace(/^\/+/, "");

export const backendBrowserApiFetch = (path, options = {}) =>
  browserApiFetch(`/api/backend/${normalizeBackendPath(path)}`, options);

export const backendBrowserPostJson = (path, body, options = {}) =>
  browserPostJson(`/api/backend/${normalizeBackendPath(path)}`, body, options);

export const backendBrowserPutJson = (path, body, options = {}) =>
  browserPutJson(`/api/backend/${normalizeBackendPath(path)}`, body, options);

export const backendBrowserPostFormData = (path, formData, options = {}) =>
  browserPostFormData(`/api/backend/${normalizeBackendPath(path)}`, formData, options);

export const backendBrowserDelete = (path, options = {}) =>
  browserDelete(`/api/backend/${normalizeBackendPath(path)}`, options);

export const backendBrowserUploadFormData = (path, formData, options = {}) =>
  browserUploadFormData(`/api/backend/${normalizeBackendPath(path)}`, formData, options);
