import { request } from "../../../services/https";

export const getUserProfileApi = (userId) => {
  return request(`/user/profile/${userId}`, {
    method: "GET",
  });
}

export const updateUserProfileApi = (userId, data) => {
    return request(`/user/profile/${userId}`, {
        method: "PUT",
        data
    });
}

export const changePasswordApi = (userId, data) => {
    return request(`/user/changepassword/${userId}`, {
        method: "PUT",
        data
    });
}

export const deactivateAccountApi = (userId) => {
    return request(`/user/deactivate/${userId}`, {
        method: "PUT",
    });
}

export const updateStudentProfileApi = (userId, data) => {
    return request(`/user/student/${userId}`, {
        method: "PUT",
        data
    });
}

export const updateInstructorProfileApi = (userId, data) => {
    return request(`/user/instructor/${userId}`, {
        method: "PUT",
        data
    });
}