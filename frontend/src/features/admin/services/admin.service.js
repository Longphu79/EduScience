import api from "../../../services/api.js";
import { adminUnwrap, buildAdminQuery } from "../utils/admin.helpers";

export async function getAdminDashboard(params = {}) {
    const response = await api.get(
        `/api/admin/dashboard${buildAdminQuery(params)}`,
    );
    return adminUnwrap(response);
}

export async function exportAdminDashboardCsv(params = {}) {
    const response = await api.get(
        `/api/admin/dashboard/export/csv${buildAdminQuery(params)}`,
        {
            responseType: "blob",
        },
    );
    return response?.data;
}

export async function exportAdminDashboardPdf(params = {}) {
    const response = await api.get(
        `/api/admin/dashboard/export/pdf${buildAdminQuery(params)}`,
        {
            responseType: "blob",
        },
    );
    return response?.data;
}

export async function getAdminInstructorLeaderboard(params = {}) {
    const response = await api.get(
        `/api/admin/instructors/leaderboard${buildAdminQuery(params)}`,
    );
    return adminUnwrap(response);
}

export async function exportAdminInstructorLeaderboardCsv(params = {}) {
    const response = await api.get(
        `/api/admin/instructors/leaderboard/export/csv${buildAdminQuery(params)}`,
        {
            responseType: "blob",
        },
    );
    return response?.data;
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

export async function getAdminWithdrawals(params = {}) {
    const response = await api.get(
        `/api/admin/withdrawals${buildAdminQuery(params)}`,
    );
    return adminUnwrap(response);
}

export async function processAdminWithdrawal(withdrawalId, body) {
    const response = await api.patch(
        `/api/admin/withdrawals/${withdrawalId}/status`,
        body,
    );
    return adminUnwrap(response);
}

export async function approveAdminDeposit(depositId) {
    const response = await api.patch(
        `/api/admin/deposit/approve/${depositId}`,
        {},
    );
    return adminUnwrap(response);
}

export async function getAdminDeposits(params = {}) {
    const response = await api.get(
        `/api/admin/deposits${buildAdminQuery(params)}`,
    );
    // adminUnwrap là hàm bóc tách dữ liệu mà bạn đã viết ở đầu file này
    return adminUnwrap(response);
}

export async function rejectAdminDeposit(depositId) {
    const response = await api.patch(
        `/api/admin/deposit/reject/${depositId}`, // Kiểm tra route này có đúng với Backend không
        {},
    );
    return adminUnwrap(response);
}
