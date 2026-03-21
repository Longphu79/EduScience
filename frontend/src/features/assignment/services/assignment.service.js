import {
  normalizeAssignmentItem,
  normalizeAssignmentList,
  normalizeSubmissionItem,
  normalizeSubmissionList,
} from "../utils/assignment.helpers";

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
  } catch (error) {
    console.error("getAuthToken error:", error);
    return null;
  }
}

function createHeaders(extraHeaders = {}, useAuth = false) {
  const headers = { ...extraHeaders };

  if (useAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return headers;
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data?.message || "Request failed");
    error.status = response.status;
    error.payload = data;
    throw error;
  }

  return data;
}

export function assignmentUnwrap(response) {
  return response?.data ?? response ?? null;
}

function appendIfDefined(formData, key, value) {
  if (value === undefined || value === null) return;
  formData.append(key, value);
}

export async function getAssignmentsByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/assignment/course/${courseId}`, {
    headers: createHeaders({}, true),
  });

  const data = await handleResponse(response);
  return normalizeAssignmentList(assignmentUnwrap(data));
}

export async function getAssignmentById(assignmentId) {
  const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`, {
    headers: createHeaders({}, true),
  });

  const data = await handleResponse(response);
  return normalizeAssignmentItem(assignmentUnwrap(data));
}

export async function createAssignment(payload) {
  const formData = new FormData();

  appendIfDefined(formData, "title", payload?.title || "");
  appendIfDefined(formData, "description", payload?.description || "");
  appendIfDefined(formData, "courseId", payload?.courseId || "");
  appendIfDefined(formData, "lessonId", payload?.lessonId || "");
  appendIfDefined(formData, "dueDate", payload?.dueDate || "");
  appendIfDefined(
    formData,
    "allowResubmit",
    String(payload?.allowResubmit !== false)
  );
  appendIfDefined(formData, "maxScore", String(payload?.maxScore ?? 100));
  appendIfDefined(formData, "isPublished", String(payload?.isPublished !== false));

  const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
  for (const file of attachments) {
    if (file) {
      formData.append("attachments", file);
    }
  }

  const response = await fetch(`${API_BASE_URL}/assignment`, {
    method: "POST",
    headers: createHeaders({}, true),
    body: formData,
  });

  const data = await handleResponse(response);
  return normalizeAssignmentItem(assignmentUnwrap(data));
}

export async function updateAssignment(assignmentId, payload) {
  const formData = new FormData();

  appendIfDefined(formData, "title", payload?.title || "");
  appendIfDefined(formData, "description", payload?.description || "");
  appendIfDefined(formData, "lessonId", payload?.lessonId || "");
  appendIfDefined(formData, "dueDate", payload?.dueDate || "");
  appendIfDefined(
    formData,
    "allowResubmit",
    String(payload?.allowResubmit !== false)
  );
  appendIfDefined(formData, "maxScore", String(payload?.maxScore ?? 100));
  appendIfDefined(formData, "isPublished", String(payload?.isPublished !== false));

  const keptAttachmentUrls = Array.isArray(payload?.keptAttachmentUrls)
    ? payload.keptAttachmentUrls
    : [];
  formData.append("keptAttachmentUrls", JSON.stringify(keptAttachmentUrls));

  const attachments = Array.isArray(payload?.attachments) ? payload.attachments : [];
  for (const file of attachments) {
    if (file) {
      formData.append("attachments", file);
    }
  }

  const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`, {
    method: "PUT",
    headers: createHeaders({}, true),
    body: formData,
  });

  const data = await handleResponse(response);
  return normalizeAssignmentItem(assignmentUnwrap(data));
}

export async function deleteAssignment(assignmentId) {
  const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });

  return handleResponse(response);
}

export async function submitAssignment(assignmentId, payload) {
  const formData = new FormData();

  appendIfDefined(formData, "submissionText", payload?.submissionText || "");

  const fileUrls = Array.isArray(payload?.fileUrls) ? payload.fileUrls : [];
  if (fileUrls.length > 0) {
    formData.append("fileUrls", JSON.stringify(fileUrls));
  }

  const files = Array.isArray(payload?.files) ? payload.files : [];
  for (const file of files) {
    if (file) {
      formData.append("files", file);
    }
  }

  const response = await fetch(
    `${API_BASE_URL}/assignment/${assignmentId}/submit`,
    {
      method: "POST",
      headers: createHeaders({}, true),
      body: formData,
    }
  );

  const data = await handleResponse(response);
  return normalizeSubmissionItem(assignmentUnwrap(data));
}

export async function resubmitAssignment(assignmentId, payload) {
  const formData = new FormData();

  appendIfDefined(formData, "submissionText", payload?.submissionText || "");

  const fileUrls = Array.isArray(payload?.fileUrls) ? payload.fileUrls : [];
  if (fileUrls.length > 0) {
    formData.append("fileUrls", JSON.stringify(fileUrls));
  }

  const files = Array.isArray(payload?.files) ? payload.files : [];
  for (const file of files) {
    if (file) {
      formData.append("files", file);
    }
  }

  const response = await fetch(
    `${API_BASE_URL}/assignment/${assignmentId}/resubmit`,
    {
      method: "PUT",
      headers: createHeaders({}, true),
      body: formData,
    }
  );

  const data = await handleResponse(response);
  return normalizeSubmissionItem(assignmentUnwrap(data));
}

export async function getAssignmentSubmissionByStudentCourse(studentId, courseId) {
  const response = await fetch(
    `${API_BASE_URL}/assignment/submission/student/${studentId}/course/${courseId}`,
    {
      headers: createHeaders({}, true),
    }
  );

  const data = await handleResponse(response);
  return normalizeSubmissionList(assignmentUnwrap(data));
}

export async function getAssignmentSubmissionsByAssignment(assignmentId) {
  const response = await fetch(
    `${API_BASE_URL}/assignment/submission/assignment/${assignmentId}`,
    {
      headers: createHeaders({}, true),
    }
  );

  const data = await handleResponse(response);
  return normalizeSubmissionList(assignmentUnwrap(data));
}

export async function gradeAssignmentSubmission(submissionId, payload) {
  const cleanPayload = {
    grade: payload?.grade,
    feedback: payload?.feedback || "",
  };

  const response = await fetch(
    `${API_BASE_URL}/assignment/submission/${submissionId}/grade`,
    {
      method: "PATCH",
      headers: createHeaders({ "Content-Type": "application/json" }, true),
      body: JSON.stringify(cleanPayload),
    }
  );

  const data = await handleResponse(response);
  return normalizeSubmissionItem(assignmentUnwrap(data));
}