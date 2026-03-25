import api from "../../../services/api.js";
import { adminUnwrap, buildAdminQuery } from "../utils/admin.helpers";

export async function getAdminDashboard() {
    const response = await api.get("/api/admin/dashboard");
    return adminUnwrap(response);
}

export async function getAdminUsers(params = {}) {
    const response = await api.get(
        `/api/admin/users${buildAdminQuery(params)}`,
    );
    return adminUnwrap(response);
}

export async function getAdminUserDetail(userId) {
    const response = await api.get(`/api/admin/users/${userId}`);
    return adminUnwrap(response);
}

export async function deactivateAdminUser(userId) {
    const response = await api.patch(
        `/api/admin/users/${userId}/deactivate`,
        {},
    );
    return adminUnwrap(response);
}

export async function reactivateAdminUser(userId) {
    const response = await api.patch(
        `/api/admin/users/${userId}/reactivate`,
        {},
    );
    return adminUnwrap(response);
}

export async function getAdminCourses(params = {}) {
    const response = await api.get(
        `/api/admin/courses${buildAdminQuery(params)}`,
    );
    return adminUnwrap(response);
}

export async function getAdminCourseDetail(courseId) {
    const response = await api.get(`/api/admin/courses/${courseId}`);
    return adminUnwrap(response);
}

export async function publishAdminCourse(courseId) {
    const response = await api.patch(
        `/api/admin/courses/${courseId}/publish`,
        {},
    );
    return adminUnwrap(response);
}

export async function archiveAdminCourse(courseId) {
    const response = await api.patch(
        `/api/admin/courses/${courseId}/archive`,
        {},
    );
    return adminUnwrap(response);
}

export async function moveAdminCourseToDraft(courseId) {
    const response = await api.patch(
        `/api/admin/courses/${courseId}/draft`,
        {},
    );
    return adminUnwrap(response);
}
