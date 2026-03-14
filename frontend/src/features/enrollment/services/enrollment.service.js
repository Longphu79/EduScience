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

function getCurrentUserId() {
  try {
    const directUserId =
      localStorage.getItem("userId") ||
      localStorage.getItem("_id") ||
      localStorage.getItem("currentUserId");

    if (directUserId) return directUserId;

    const authRaw =
      localStorage.getItem("auth") ||
      localStorage.getItem("auth-storage") ||
      localStorage.getItem("eduscience_auth");

    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      return (
        parsed?.user?._id ||
        parsed?.user?.id ||
        parsed?.user?.userId ||
        parsed?.state?.user?._id ||
        parsed?.state?.user?.id ||
        parsed?.state?.user?.userId ||
        null
      );
    }
  } catch (error) {
    console.error("getCurrentUserId error:", error);
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

async function handleResponse(res, fallbackMessage) {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(data?.message || fallbackMessage);
  }

  return data;
}

export function enrollmentUnwrap(res) {
  return res?.data ?? res ?? null;
}

export async function enrollCourse(payload) {
  const studentId = payload?.studentId || getCurrentUserId();

  const res = await fetch(`${API_BASE_URL}/enrollment/enroll`, {
    method: "POST",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify({
      studentId,
      courseId: payload?.courseId,
    }),
  });

  return handleResponse(res, "Failed to enroll course");
}

export async function getMyCourses(studentId) {
  const res = await fetch(`${API_BASE_URL}/enrollment/student/${studentId}`, {
    headers: createHeaders({}, true),
  });

  return handleResponse(res, "Failed to fetch my courses");
}

export async function getStudentEnrollments(studentId) {
  const res = await fetch(`${API_BASE_URL}/enrollment/student/${studentId}`, {
    headers: createHeaders({}, true),
  });

  return handleResponse(res, "Failed to fetch student enrollments");
}

export async function getEnrollmentByStudentAndCourse(courseId, studentId) {
  const res = await fetch(
    `${API_BASE_URL}/enrollment/student/${studentId}/course/${courseId}`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(res, "Failed to fetch enrollment");
}

export async function setCurrentLesson(payload) {
  const studentId = payload?.studentId || getCurrentUserId();

  const res = await fetch(`${API_BASE_URL}/enrollment/current-lesson`, {
    method: "PATCH",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify({
      studentId,
      courseId: payload?.courseId,
      lessonId: payload?.lessonId,
    }),
  });

  return handleResponse(res, "Failed to set current lesson");
}

export async function completeLesson(payload) {
  const studentId = payload?.studentId || getCurrentUserId();

  const res = await fetch(`${API_BASE_URL}/enrollment/complete-lesson`, {
    method: "PATCH",
    headers: createHeaders({ "Content-Type": "application/json" }, true),
    body: JSON.stringify({
      studentId,
      courseId: payload?.courseId,
      lessonId: payload?.lessonId,
    }),
  });

  return handleResponse(res, "Failed to complete lesson");
}

export async function getStudentsByCourse(courseId) {
  const res = await fetch(
    `${API_BASE_URL}/enrollment/course/${courseId}/students`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(res, "Failed to fetch students by course");
}

export async function getInstructorCourses(instructorId) {
  const res = await fetch(
    `${API_BASE_URL}/enrollment/instructor/${instructorId}`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(res, "Failed to fetch instructor courses");
}

export async function getStudentProgressDetail(courseId, studentId) {
  const res = await fetch(
    `${API_BASE_URL}/enrollment/course/${courseId}/student/${studentId}/progress`,
    {
      headers: createHeaders({}, true),
    }
  );

  return handleResponse(res, "Failed to fetch student progress detail");
}