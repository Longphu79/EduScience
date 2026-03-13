const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export function assignmentUnwrap(res) {
  return res?.data ?? res ?? null;
}

export async function getAssignmentsByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/assignment/course/${courseId}`);
  return handleResponse(response);
}

export async function getAssignmentById(assignmentId) {
  const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`);
  return handleResponse(response);
}

export async function createAssignment(payload) {
  const response = await fetch(`${API_BASE_URL}/assignment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateAssignment(assignmentId, payload) {
  const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deleteAssignment(assignmentId) {
  const response = await fetch(`${API_BASE_URL}/assignment/${assignmentId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}

export async function submitAssignment(assignmentId, payload) {
  const response = await fetch(
    `${API_BASE_URL}/assignment/${assignmentId}/submit`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(response);
}

export async function resubmitAssignment(assignmentId, payload) {
  const response = await fetch(
    `${API_BASE_URL}/assignment/${assignmentId}/resubmit`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );

  return handleResponse(response);
}

export async function getAssignmentSubmissionByStudentCourse(studentId, courseId) {
  const response = await fetch(
    `${API_BASE_URL}/assignment/submission/student/${studentId}/course/${courseId}`
  );

  return handleResponse(response);
}

export async function getAssignmentSubmissionsByAssignment(assignmentId) {
  const response = await fetch(
    `${API_BASE_URL}/assignment/submission/assignment/${assignmentId}`
  );

  return handleResponse(response);
}

export async function gradeAssignmentSubmission(submissionId, payload) {
  const response = await fetch(
    `${API_BASE_URL}/assignment/submission/${submissionId}/grade`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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