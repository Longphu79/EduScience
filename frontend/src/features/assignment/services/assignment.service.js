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

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export function assignmentUnwrap(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (res?.data && typeof res.data === "object") return res.data;
  return res ?? null;
}

export async function getAssignmentsByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/assignment/course/${courseId}`, {
    headers: createHeaders({}, true),
  });
  return handleResponse(response);
}

export async function getAssignmentById(assignmentId) {
  const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`, {
    headers: createHeaders({}, true),
  });
  return handleResponse(response);
}

export async function createAssignment(payload) {
  const cleanPayload = { ...payload };
  delete cleanPayload.instructorId;

  const response = await fetch(`${API_BASE_URL}/assignment`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(cleanPayload),
  });

  return handleResponse(response);
}

export async function updateAssignment(assignmentId, payload) {
  const cleanPayload = { ...payload };
  delete cleanPayload.instructorId;

  const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`, {
    method: "PUT",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(cleanPayload),
  });

  return handleResponse(response);
}

export async function deleteAssignment(assignmentId) {
  const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });

  return handleResponse(response);
}

export async function submitAssignment(assignmentId, payload) {
  const cleanPayload = {
    submissionText: payload?.submissionText || "",
    fileUrls: Array.isArray(payload?.fileUrls) ? payload.fileUrls : [],
  };

  const response = await fetch(
    `${API_BASE_URL}/assignment/${assignmentId}/submit`,
    {
      method: "POST",
      headers: createHeaders({ "Content-Type": "application/json" }, true),
      body: JSON.stringify(cleanPayload),
    }
  );

  return handleResponse(response);
}

export async function resubmitAssignment(assignmentId, payload) {
  const cleanPayload = {
    submissionText: payload?.submissionText || "",
    fileUrls: Array.isArray(payload?.fileUrls) ? payload.fileUrls : [],
  };

  const response = await fetch(
    `${API_BASE_URL}/assignment/${assignmentId}/resubmit`,
    {
      method: "PUT",
      headers: createHeaders({ "Content-Type": "application/json" }, true),
      body: JSON.stringify(cleanPayload),
    }
  );

  return handleResponse(response);
}

export async function getAssignmentSubmissionByStudentCourse(studentId, courseId) {
  const response = await fetch(
    `${API_BASE_URL}/assignment/submission/student/${studentId}/course/${courseId}`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(response);
}

export async function getAssignmentSubmissionsByAssignment(assignmentId) {
  const response = await fetch(
    `${API_BASE_URL}/assignment/submission/assignment/${assignmentId}`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(response);
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

  return handleResponse(response);
}

export const getAssignmentsByCourseId = getAssignmentsByCourse;
export const getStudentAssignmentSubmissions = getAssignmentSubmissionByStudentCourse;
export const getSubmissionsByAssignment = getAssignmentSubmissionsByAssignment;
export const gradeSubmission = gradeAssignmentSubmission;
export const createAssignmentSubmission = submitAssignment;
export const updateAssignmentSubmission = resubmitAssignment;