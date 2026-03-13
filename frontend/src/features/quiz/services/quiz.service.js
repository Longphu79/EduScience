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

export function quizUnwrap(res) {
  return res?.data ?? res ?? null;
}

export async function getQuizByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/quiz/course/${courseId}`);
  return handleResponse(response);
}

export async function getInstructorQuizzesByCourse(courseId, instructorId) {
  const query = new URLSearchParams({ instructorId }).toString();
  const response = await fetch(
    `${API_BASE_URL}/quiz/instructor/course/${courseId}?${query}`
  );
  return handleResponse(response);
}

export async function getQuizById(quizId, options = {}) {
  const query = new URLSearchParams();
  if (options.hideAnswers) query.set("hideAnswers", "true");

  const response = await fetch(
    `${API_BASE_URL}/quiz/${quizId}${query.toString() ? `?${query}` : ""}`
  );
  return handleResponse(response);
}

export async function createQuiz(payload) {
  const response = await fetch(`${API_BASE_URL}/quiz`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateQuiz(quizId, payload) {
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function deleteQuiz(quizId, instructorId) {
  const query = new URLSearchParams({ instructorId }).toString();
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}?${query}`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function toggleQuizPublished(quizId, instructorId, nextPublished) {
  const currentQuizRes = await getQuizById(quizId);
  const currentQuiz = quizUnwrap(currentQuizRes);

  const payload = {
    courseId: currentQuiz?.courseId?._id || currentQuiz?.courseId || null,
    instructorId,
    title: currentQuiz?.title || "",
    description: currentQuiz?.description || "",
    passingScore: Number(currentQuiz?.passingScore) || 0,
    timeLimit: Number(currentQuiz?.timeLimit) || 0,
    isPublished:
      typeof nextPublished === "boolean"
        ? nextPublished
        : !currentQuiz?.isPublished,
    questions: Array.isArray(currentQuiz?.questions) ? currentQuiz.questions : [],
  };

  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function submitQuizAttempt(quizId, payload) {
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function getAttemptsByStudentCourse(studentId, courseId) {
  const response = await fetch(
    `${API_BASE_URL}/quiz/attempt/student/${studentId}/course/${courseId}`
  );
  return handleResponse(response);
}

export async function getAttemptReviewById(attemptId, studentId) {
  const query = new URLSearchParams({ studentId }).toString();
  const response = await fetch(
    `${API_BASE_URL}/quiz/attempt/${attemptId}/review?${query}`
  );
  return handleResponse(response);
}

export async function getQuizResultsByQuizId(quizId, instructorId) {
  const query = new URLSearchParams({ instructorId }).toString();
  const response = await fetch(
    `${API_BASE_URL}/quiz/${quizId}/results?${query}`
  );
  return handleResponse(response);
}

export async function getQuizAttemptsByQuizAndStudent(
  quizId,
  studentId,
  instructorId
) {
  const query = new URLSearchParams({ instructorId }).toString();
  const response = await fetch(
    `${API_BASE_URL}/quiz/${quizId}/results/student/${studentId}?${query}`
  );
  return handleResponse(response);
}

export async function getInstructorAttemptReviewById(attemptId, instructorId) {
  const query = new URLSearchParams({ instructorId }).toString();
  const response = await fetch(
    `${API_BASE_URL}/quiz/attempt/${attemptId}/instructor-review?${query}`
  );
  return handleResponse(response);
}