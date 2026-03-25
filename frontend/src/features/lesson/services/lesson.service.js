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

async function apiRequest(
    path,
    options = {},
    fallbackMessage = "Request failed",
) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    return handleResponse(response, fallbackMessage);
}

export async function getLessonsByCourse(courseId) {
    if (!courseId) {
        throw new Error("courseId is required");
    }

    return apiRequest(
        `/api/lesson/course/${courseId}`,
        {
            headers: createHeaders({}, true),
        },
        "Failed to fetch lessons",
    );
}

export async function createLesson(payload) {
    return apiRequest(
        "/api/lesson",
        {
            method: "POST",
            headers: createHeaders(
                { "Content-Type": "application/json" },
                true,
            ),
            body: JSON.stringify(payload),
        },
        "Failed to create lesson",
    );
}

export async function updateLesson(lessonId, payload) {
    if (!lessonId) {
        throw new Error("lessonId is required");
    }

    return apiRequest(
        `/api/lesson/${lessonId}`,
        {
            method: "PUT",
            headers: createHeaders(
                { "Content-Type": "application/json" },
                true,
            ),
            body: JSON.stringify(payload),
        },
        "Failed to update lesson",
    );
}

export async function deleteLesson(lessonId) {
    if (!lessonId) {
        throw new Error("lessonId is required");
    }

    return apiRequest(
        `/api/lesson/${lessonId}`,
        {
            method: "DELETE",
            headers: createHeaders({}, true),
        },
        "Failed to delete lesson",
    );
}

export const getCourseLessons = getLessonsByCourse;
