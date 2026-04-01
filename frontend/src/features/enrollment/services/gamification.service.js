const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000"
).replace(/\/$/, "");

function getAuthToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("accessToken") ||
        localStorage.getItem("authToken") ||
        ""
    );
}

function createHeaders(extraHeaders = {}) {
    const token = getAuthToken();

    return {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...extraHeaders,
    };
}

async function parseJsonSafe(res) {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) return null;
    return res.json().catch(() => null);
}

async function request(path, options = {}, fallbackMessage = "Request failed") {
    const res = await fetch(`${API_BASE_URL}${path}`, options);
    const data = await parseJsonSafe(res);

    if (!res.ok) {
        const error = new Error(data?.message || fallbackMessage);
        error.status = res.status;
        error.payload = data;
        throw error;
    }

    return data;
}

function unwrap(payload) {
    return payload?.data || payload;
}

export async function getStudentGamification(studentId) {
    if (!studentId) throw new Error("studentId is required");

    const response = await request(
        `/api/gamification/student/${studentId}`,
        {
            method: "GET",
            headers: createHeaders(),
        },
        "Failed to fetch student gamification",
    );

    return unwrap(response);
}

export async function getStudentGamificationEvents(studentId, limit = 20) {
    if (!studentId) throw new Error("studentId is required");

    const response = await request(
        `/api/gamification/student/${studentId}/events?limit=${limit}`,
        {
            method: "GET",
            headers: createHeaders(),
        },
        "Failed to fetch student gamification events",
    );

    return unwrap(response);
}
