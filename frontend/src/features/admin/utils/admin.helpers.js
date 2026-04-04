const FALLBACK_COURSE_IMAGE =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

const FALLBACK_AVATAR =
    "https://ui-avatars.com/api/?name=User&background=111827&color=fff";

export { FALLBACK_COURSE_IMAGE, FALLBACK_AVATAR };

export function adminUnwrap(payload) {
    return payload?.data?.data ?? payload?.data ?? payload ?? null;
}   

export function buildAdminQuery(params = {}) {
    const filtered = Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) =>
                value !== undefined && value !== null && value !== "",
        ),
    );

    const query = new URLSearchParams(filtered).toString();
    return query ? `?${query}` : "";
}

export function formatAdminNumber(value) {
    return Number(value || 0).toLocaleString("vi-VN");
}

export function formatAdminDate(value) {
    if (!value) return "N/A";

    try {
        return new Date(value).toLocaleString("vi-VN");
    } catch {
        return "N/A";
    }
}

export function getAdminSafeImage(url, fallback = FALLBACK_COURSE_IMAGE) {
    if (!url || typeof url !== "string") return fallback;
    const trimmed = url.trim();

    if (
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("data:image/") ||
        trimmed.startsWith("/")
    ) {
        return trimmed;
    }

    return fallback;
}

export function getAdminInactiveUsersCount(stats = {}) {
    return Math.max(
        0,
        Number(stats?.totalUsers || 0) - Number(stats?.totalActiveUsers || 0),
    );
}

export const getAdminInactiveUsers = getAdminInactiveUsersCount;

export function getAdminCourseStatusMeta(status) {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "published") {
        return {
            label: "Published",
            badgeClass: "admin-courses-badge admin-courses-badge--emerald",
            cardTone: "admin-courses-card--published",
            detailBadgeClass:
                "admin-course-detail-badge admin-course-detail-badge--emerald",
            tone: "emerald",
        };
    }

    if (normalized === "archived") {
        return {
            label: "Archived",
            badgeClass: "admin-courses-badge admin-courses-badge--slate",
            cardTone: "admin-courses-card--archived",
            detailBadgeClass:
                "admin-course-detail-badge admin-course-detail-badge--slate",
            tone: "slate",
        };
    }

    return {
        label: "Draft",
        badgeClass: "admin-courses-badge admin-courses-badge--amber",
        cardTone: "admin-courses-card--draft",
        detailBadgeClass:
            "admin-course-detail-badge admin-course-detail-badge--amber",
        tone: "amber",
    };
}

export function getAdminUserRoleBadgeClass(role) {
    if (role === "admin") {
        return "admin-users-badge admin-users-badge--red";
    }

    if (role === "instructor") {
        return "admin-users-badge admin-users-badge--violet";
    }

    return "admin-users-badge admin-users-badge--emerald";
}

export function getAdminUserDetailRoleBadgeClass(role) {
    if (role === "admin") {
        return "admin-user-detail-badge admin-user-detail-badge--red";
    }

    if (role === "instructor") {
        return "admin-user-detail-badge admin-user-detail-badge--violet";
    }

    return "admin-user-detail-badge admin-user-detail-badge--emerald";
}

export function getAdminConfirmVariantByStatus(status) {
    if (status === "published") return "success";
    if (status === "draft") return "secondary";
    return "danger";
}

export function getAdminUserDisplayName(user = {}) {
    return user?.fullName || user?.name || user?.username || "User";
}
