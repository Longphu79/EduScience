import { buildQuizPayload } from "../utils/quiz.form.helpers";

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

async function parseJsonSafe(response) {
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;
    return response.json().catch(() => null);
}

async function handleResponse(response, fallbackMessage = "Request failed") {
    const data = await parseJsonSafe(response);

    if (!response.ok) {
        throw new Error(data?.message || fallbackMessage);
    }

    return data;
}

async function request(path, options = {}, fallbackMessage = "Request failed") {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    return handleResponse(response, fallbackMessage);
}

export async function getQuizByCourse(courseId) {
    return request(
        `/api/quiz/course/${courseId}`,
        {
            headers: createHeaders({}, true),
        },
        "Failed to fetch quizzes by course",
    );
}

export async function getInstructorQuizzesByCourse(courseId) {
    return request(
        `/api/quiz/instructor/course/${courseId}`,
        {
            headers: createHeaders({}, true),
        },
        "Failed to fetch instructor quizzes",
    );
}

export async function getQuizById(quizId, options = {}) {
    const query = new URLSearchParams();

    if (options?.hideAnswers) {
        query.set("hideAnswers", "true");
    }

    const queryString = query.toString();

    return request(
        `/api/quiz/${quizId}${queryString ? `?${queryString}` : ""}`,
        {
            headers: createHeaders({}, true),
        },
        "Failed to fetch quiz detail",
    );
}

export async function createQuiz(payload) {
    return request(
        `/api/quiz`,

        {
            method: "POST",
            headers: createHeaders(
                { "Content-Type": "application/json" },
                true,
            ),
            body: JSON.stringify(payload),
        },
        "Failed to create quiz",
    );
}

export async function updateQuiz(quizId, payload) {
    return request(
        `/api/quiz/${quizId}`,
        {
            method: "PUT",
            headers: createHeaders(
                { "Content-Type": "application/json" },
                true,
            ),
            body: JSON.stringify(payload),
        },
        "Failed to update quiz",
    );
}

export async function deleteQuiz(quizId) {
    return request(
        `/api/quiz/${quizId}`,
        {
            method: "DELETE",
            headers: createHeaders({}, true),
        },
        "Failed to delete quiz",
    );
}

export async function toggleQuizPublished(quizId, nextPublished, currentQuiz) {
    const payload = buildQuizPayload(currentQuiz, {
        courseId: currentQuiz?.courseId || undefined,
        lessonId: currentQuiz?.lessonId || undefined,
        isPublished:
            typeof nextPublished === "boolean"
                ? nextPublished
                : !currentQuiz?.isPublished,
    });

    return updateQuiz(quizId, payload);
}

export async function submitQuizAttempt(quizId, payload) {
    return request(
        `/api/quiz/${quizId}/attempt`,
        {
            method: "POST",
            headers: createHeaders(
                { "Content-Type": "application/json" },
                true,
            ),
            body: JSON.stringify({
                answers: Array.isArray(payload?.answers) ? payload.answers : [],
            }),
        },
        "Failed to submit quiz attempt",
    );
}

export async function getAttemptsByStudentCourse(courseId) {
    return request(
        `/api/quiz/attempt/course/${courseId}/my`,
        {
            headers: createHeaders({}, true),
        },
        "Failed to fetch my attempts",
    );
}

export async function getAttemptReviewById(attemptId) {
    return request(
        `/api/quiz/attempt/${attemptId}/review`,
        {
            headers: createHeaders({}, true),
        },
        "Failed to fetch attempt review",
    );
}

export async function getQuizResultsByQuizId(quizId) {
    return request(
        `/api/quiz/${quizId}/results`,
        {
            headers: createHeaders({}, true),
        },
        "Failed to fetch quiz results",
    );
}

export async function getQuizAttemptsByQuizAndStudent(quizId, studentId) {
    return request(
        `/api/quiz/${quizId}/results/student/${studentId}`,
        {
            headers: createHeaders({}, true),
        },
        "Failed to fetch student quiz attempts",
    );
}

export async function getInstructorAttemptReviewById(attemptId) {
    return request(
        `/api/quiz/attempt/${attemptId}/instructor-review`,
        {
            headers: createHeaders({}, true),
        },
        "Failed to fetch instructor attempt review",
    );
}
