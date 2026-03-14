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

async function handleResponse(response, fallbackMessage = "Request failed") {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export function quizUnwrap(res) {
  return res?.data ?? res ?? null;
}

export async function getQuizByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/quiz/course/${courseId}`, {
    headers: createHeaders({}, true),
  });
  return handleResponse(response, "Failed to fetch quizzes by course");
}

export async function getInstructorQuizzesByCourse(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/quiz/instructor/course/${courseId}`,
    {
      headers: createHeaders({}, true),
    }
  );
  return handleResponse(response, "Failed to fetch instructor quizzes");
}

export async function getQuizById(quizId, options = {}) {
  const query = new URLSearchParams();
  if (options.hideAnswers) query.set("hideAnswers", "true");

  const response = await fetch(
    `${API_BASE_URL}/quiz/${quizId}${query.toString() ? `?${query}` : ""}`,
    {
      headers: createHeaders({}, true),
    }
  );
  return handleResponse(response, "Failed to fetch quiz detail");
}

export async function createQuiz(payload) {
  const response = await fetch(`${API_BASE_URL}/quiz`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Failed to create quiz");
}

export async function updateQuiz(quizId, payload) {
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
    method: "PUT",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(payload),
  });
  return handleResponse(response, "Failed to update quiz");
}

export async function deleteQuiz(quizId) {
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}`, {
    method: "DELETE",
    headers: createHeaders({}, true),
  });
  return handleResponse(response, "Failed to delete quiz");
}

export async function toggleQuizPublished(quizId, nextPublished) {
  const currentQuizRes = await getQuizById(quizId);
  const currentQuiz = quizUnwrap(currentQuizRes);

  const payload = {
    courseId: currentQuiz?.courseId?._id || currentQuiz?.courseId || null,
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
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Failed to toggle quiz published state");
}

export async function submitQuizAttempt(quizId, payload) {
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/attempt`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify({
      answers: Array.isArray(payload?.answers) ? payload.answers : [],
    }),
  });
  return handleResponse(response, "Failed to submit quiz attempt");
}

export async function getAttemptsByStudentCourse(courseId) {
  const response = await fetch(
    `${API_BASE_URL}/quiz/attempt/course/${courseId}/my`,
    {
      headers: createHeaders({}, true),
    }
  );
  return handleResponse(response, "Failed to fetch my attempts");
}

export async function getAttemptReviewById(attemptId) {
  const response = await fetch(
    `${API_BASE_URL}/quiz/attempt/${attemptId}/review`,
    {
      headers: createHeaders({}, true),
    }
  );
  return handleResponse(response, "Failed to fetch attempt review");
}

export async function getQuizResultsByQuizId(quizId) {
  const response = await fetch(`${API_BASE_URL}/quiz/${quizId}/results`, {
    headers: createHeaders({}, true),
  });
  return handleResponse(response, "Failed to fetch quiz results");
}

export async function getQuizAttemptsByQuizAndStudent(quizId, studentId) {
  const response = await fetch(
    `${API_BASE_URL}/quiz/${quizId}/results/student/${studentId}`,
    {
      headers: createHeaders({}, true),
    }
  );
  return handleResponse(response, "Failed to fetch student quiz attempts");
}

export async function getInstructorAttemptReviewById(attemptId) {
  const response = await fetch(
    `${API_BASE_URL}/quiz/attempt/${attemptId}/instructor-review`,
    {
      headers: createHeaders({}, true),
    }
  );
  return handleResponse(
    response,
    "Failed to fetch instructor attempt review"
  );
}