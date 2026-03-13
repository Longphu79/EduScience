const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

export async function getMaterialsByCourse(courseId) {
  const response = await fetch(`${API_BASE_URL}/material/course/${courseId}`);
  return handleResponse(response);
}

export async function getMaterialsByLesson(lessonId) {
  const response = await fetch(`${API_BASE_URL}/material/lesson/${lessonId}`);
  return handleResponse(response);
}

export async function createMaterial(payload) {
  const response = await fetch(`${API_BASE_URL}/material`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function updateMaterial(materialId, payload) {
  const response = await fetch(`${API_BASE_URL}/material/${materialId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
}

export async function deleteMaterial(materialId) {
  const response = await fetch(`${API_BASE_URL}/material/${materialId}`, {
    method: "DELETE",
  });

  return handleResponse(response);
}

export const getCourseMaterials = getMaterialsByCourse;
export const getLessonMaterials = getMaterialsByLesson;