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

  if (options?.responseType === "blob") {
    if (!res.ok) {
      const data = await parseJsonSafe(res);
      const error = new Error(data?.message || fallbackMessage);
      error.status = res.status;
      error.payload = data;
      throw error;
    }
    return res.blob();
  }

  const data = await parseJsonSafe(res);

  if (!res.ok) {
    const error = new Error(data?.message || fallbackMessage);
    error.status = res.status;
    error.payload = data;
    throw error;
  }

  return data;
}

function createJsonRequestOptions(method, body) {
  return {
    method,
    headers: createHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(body),
  };
}

function buildQuery(params = {}) {
  const filtered = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );

  const query = new URLSearchParams(filtered).toString();
  return query ? `?${query}` : "";
}

async function apiGet(path, fallbackMessage) {
  return request(
    path,
    {
      method: "GET",
      headers: createHeaders(),
    },
    fallbackMessage
  );
}

async function apiGetBlob(path, fallbackMessage) {
  return request(
    path,
    {
      method: "GET",
      headers: createHeaders(),
      responseType: "blob",
    },
    fallbackMessage
  );
}

async function apiPost(path, body, fallbackMessage) {
  return request(
    path,
    createJsonRequestOptions("POST", body),
    fallbackMessage
  );
}

async function apiPatch(path, body, fallbackMessage) {
  return request(
    path,
    createJsonRequestOptions("PATCH", body),
    fallbackMessage
  );
}

export function enrollmentUnwrap(payload) {
  return payload?.data || payload;
}

export async function enrollCourse(courseId) {
  if (!courseId || typeof courseId !== "string") {
    throw new Error("courseId is required");
  }

  return apiPost(
    "/enrollment/enroll",
    { courseId },
    "Failed to enroll course"
  );
}

export async function getMyCourses(studentId) {
  if (!studentId) {
    throw new Error("studentId is required");
  }

  return apiGet(
    `/enrollment/student/${studentId}`,
    "Failed to fetch my courses"
  );
}

export async function getInstructorCourses(instructorId) {
  if (!instructorId) {
    throw new Error("instructorId is required");
  }

  return apiGet(
    `/enrollment/instructor/${instructorId}`,
    "Failed to fetch instructor courses"
  );
}

export async function getEnrollmentByStudentAndCourse(courseId, studentId) {
  if (!courseId || !studentId) {
    throw new Error("courseId and studentId are required");
  }

  return apiGet(
    `/enrollment/student/${studentId}/course/${courseId}`,
    "Failed to fetch enrollment"
  );
}

export async function setCurrentLesson({ courseId, lessonId }) {
  if (!courseId || !lessonId) {
    throw new Error("courseId and lessonId are required");
  }

  return apiPatch(
    "/enrollment/current-lesson",
    { courseId, lessonId },
    "Failed to set current lesson"
  );
}

export async function completeLesson({ courseId, lessonId }) {
  if (!courseId || !lessonId) {
    throw new Error("courseId and lessonId are required");
  }

  return apiPatch(
    "/enrollment/complete-lesson",
    { courseId, lessonId },
    "Failed to complete lesson"
  );
}

export async function getStudentsByCourse(courseId) {
  if (!courseId) {
    throw new Error("courseId is required");
  }

  return apiGet(
    `/enrollment/course/${courseId}/students`,
    "Failed to fetch students by course"
  );
}

export async function getStudentProgressDetail(courseId, studentId) {
  if (!courseId || !studentId) {
    throw new Error("courseId and studentId are required");
  }

  return apiGet(
    `/enrollment/course/${courseId}/student/${studentId}/progress`,
    "Failed to fetch student progress detail"
  );
}

export async function getStudentDashboardSummary(studentId, params = {}) {
  if (!studentId) {
    throw new Error("studentId is required");
  }

  return apiGet(
    `/enrollment/dashboard/student/${studentId}${buildQuery(params)}`,
    "Failed to fetch student dashboard"
  );
}

export async function getStudentAnalytics(studentId, params = {}) {
  if (!studentId) {
    throw new Error("studentId is required");
  }

  return apiGet(
    `/enrollment/dashboard/student/${studentId}/analytics${buildQuery(params)}`,
    "Failed to fetch student learning analytics"
  );
}

export async function exportStudentAnalyticsCsv(studentId, params = {}) {
  if (!studentId) {
    throw new Error("studentId is required");
  }

  return apiGetBlob(
    `/enrollment/dashboard/student/${studentId}/export/csv${buildQuery(params)}`,
    "Failed to export student analytics csv"
  );
}

export async function getInstructorDashboardSummary(instructorId, params = {}) {
  if (!instructorId) {
    throw new Error("instructorId is required");
  }

  return apiGet(
    `/enrollment/dashboard/instructor/${instructorId}${buildQuery(params)}`,
    "Failed to fetch instructor dashboard"
  );
}

export async function exportInstructorDashboardCsv(
  instructorId,
  params = {}
) {
  if (!instructorId) {
    throw new Error("instructorId is required");
  }

  return apiGetBlob(
    `/enrollment/dashboard/instructor/${instructorId}/export/csv${buildQuery(
      params
    )}`,
    "Failed to export instructor dashboard csv"
  );
}

export async function exportInstructorDashboardPdf(
  instructorId,
  params = {}
) {
  if (!instructorId) {
    throw new Error("instructorId is required");
  }

  return apiGetBlob(
    `/enrollment/dashboard/instructor/${instructorId}/export/pdf${buildQuery(
      params
    )}`,
    "Failed to export instructor dashboard pdf"
  );
}