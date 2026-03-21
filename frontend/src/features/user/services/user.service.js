import { request } from "../../../services/https.js";

export async function getUserProfile(userId) {
  return request(`/user/profile/${userId}`, {
    method: "GET",
  });
}

export async function updateUserProfile(userId, body) {
  return request(`/user/profile/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function updateStudentProfile(userId, body) {
  return request(`/user/student/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function updateInstructorProfile(userId, body) {
  return request(`/user/instructor/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function changeUserPassword(userId, body) {
  return request(`/user/changepassword/${userId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function deactivateUser(userId) {
  return request(`/user/deactivate/${userId}`, {
    method: "PUT",
  });
}

export async function uploadUserAvatar(userId, file) {
  const formData = new FormData();
  formData.append("avatar", file);

  return request(`/user/upload/avatar/${userId}`, {
    method: "POST",
    body: formData,
  });
}

export async function uploadUserCover(userId, file) {
  const formData = new FormData();
  formData.append("cover", file);

  return request(`/user/upload/cover/${userId}`, {
    method: "POST",
    body: formData,
  });
}