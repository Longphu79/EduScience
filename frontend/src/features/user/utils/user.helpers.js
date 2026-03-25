const DEFAULT_AVATAR =
    "https://ui-avatars.com/api/?name=User&background=111827&color=fff";

const DEFAULT_COVER =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80";

export { DEFAULT_AVATAR, DEFAULT_COVER };

function toStringArray(value) {
    if (Array.isArray(value)) {
        return value.map((item) => String(item || "").trim()).filter(Boolean);
    }

    if (typeof value === "string") {
        return value
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

export function userUnwrap(payload) {
    return payload?.data || payload;
}

export function parseLinesToArray(value = "") {
    return String(value)
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean);
}

export function buildLinesFromArray(value) {
    if (!Array.isArray(value)) return "";
    return value.join("\n");
}

export function getCurrentUserId(user) {
    return user?._id || user?.id || user?.userId || null;
}

export function getUserDisplayName(user = {}) {
    return (
        user?.fullName || user?.name || user?.username || user?.email || "User"
    );
}

export function getSafeImage(value) {
    if (!value) return null;

    if (typeof value === "string") {
        const trimmed = value.trim();

        if (
            trimmed.startsWith("http://") ||
            trimmed.startsWith("https://") ||
            trimmed.startsWith("data:image/") ||
            trimmed.startsWith("/")
        ) {
            return trimmed;
        }

        return null;
    }

    if (typeof value === "object") {
        return (
            getSafeImage(value?.url) ||
            getSafeImage(value?.secure_url) ||
            getSafeImage(value?.src) ||
            getSafeImage(value?.path) ||
            getSafeImage(value?.imageUrl) ||
            getSafeImage(value?.avatarUrl) ||
            getSafeImage(value?.coverImageUrl) ||
            null
        );
    }

    return null;
}

export function clampProgress(value) {
    return Math.max(0, Math.min(100, Number(value || 0)));
}

export function getSafeCourseId(course) {
    if (!course) return "";

    if (typeof course === "string") return course;

    if (typeof course?.courseId === "string") return course.courseId;
    if (typeof course?._id === "string") return course._id;
    if (typeof course?.id === "string") return course.id;
    if (typeof course?.course?._id === "string") return course.course._id;
    if (typeof course?.course?.id === "string") return course.course.id;

    if (course?.courseId && typeof course.courseId === "object") {
        return course.courseId._id || course.courseId.id || "";
    }

    return "";
}

export function normalizeContinueLearningCourse(course = {}) {
    const courseData =
        course?.courseId && typeof course.courseId === "object"
            ? course.courseId
            : course?.course && typeof course.course === "object"
              ? course.course
              : course;

    const progress = clampProgress(
        course?.progress ?? courseData?.progress ?? 0,
    );

    const completedLessons = Number(
        course?.completedLessons ??
            course?.completedLessonCount ??
            courseData?.completedLessons ??
            0,
    );

    const totalLessons = Number(
        course?.totalLessons ??
            course?.totalLessonCount ??
            courseData?.totalLessons ??
            (Array.isArray(courseData?.lessonIds)
                ? courseData.lessonIds.length
                : 0) ??
            0,
    );

    const courseId = getSafeCourseId(course) || getSafeCourseId(courseData);

    return {
        ...course,
        __courseId: courseId,
        __title: courseData?.title || course?.title || "Course",
        __description:
            courseData?.shortDescription ||
            courseData?.description ||
            course?.shortDescription ||
            course?.description ||
            "Continue your learning journey.",
        __thumbnail:
            getSafeImage(courseData?.thumbnail) ||
            getSafeImage(courseData?.image) ||
            getSafeImage(course?.thumbnail) ||
            getSafeImage(course?.image) ||
            "",
        __progress: progress,
        __completedLessons: completedLessons,
        __totalLessons: totalLessons,
        __completed: !!course?.completed || progress >= 100,
    };
}

export function normalizeUserItem(user = {}) {
    const raw = userUnwrap(user) || {};
    const userId = getCurrentUserId(raw);

    return {
        ...raw,
        _id: userId || "",
        id: userId || "",
        role: raw?.role || "student",
        fullName: raw?.fullName || raw?.name || "",
        name: raw?.name || raw?.fullName || "",
        username: raw?.username || "",
        email: raw?.email || "",
        phone: raw?.phone || "",
        headline: raw?.headline || "",
        bio: raw?.bio || "",
        avatarUrl:
            getSafeImage(raw?.avatarUrl) ||
            getSafeImage(raw?.avatar) ||
            getSafeImage(raw?.photoURL) ||
            "",
        coverImageUrl:
            getSafeImage(raw?.coverImageUrl) ||
            getSafeImage(raw?.coverImage) ||
            getSafeImage(raw?.cover) ||
            "",
        expertise: toStringArray(raw?.expertise),
        learningGoals: toStringArray(raw?.learningGoals),
        createdAt: raw?.createdAt || null,
        isActive: typeof raw?.isActive === "boolean" ? raw.isActive : true,
    };
}

export function getUserProfileTags(user = {}) {
    const normalized = normalizeUserItem(user);

    if (normalized.role === "instructor") {
        return normalized.expertise;
    }

    if (normalized.role === "student") {
        return normalized.learningGoals;
    }

    return [];
}

export function validateProfileForm(form, isInstructor, isAdmin) {
    const errors = {};

    if (!form.fullName.trim()) {
        errors.fullName = "Full name is required";
    }

    if (form.phone && !/^[0-9+\-\s()]{8,20}$/.test(form.phone.trim())) {
        errors.phone = "Phone number format is invalid";
    }

    if (form.bio.trim().length > 500) {
        errors.bio = "Bio must be at most 500 characters";
    }

    if (form.headline.trim().length > 120) {
        errors.headline = "Headline must be at most 120 characters";
    }

    if (isInstructor) {
        if (parseLinesToArray(form.expertiseText).length > 12) {
            errors.expertiseText = "Please keep expertise within 12 items";
        }
    }

    if (!isInstructor && !isAdmin) {
        if (parseLinesToArray(form.learningGoalsText).length > 12) {
            errors.learningGoalsText =
                "Please keep learning goals within 12 items";
        }
    }

    return errors;
}

export function validatePasswordForm(values) {
    const errors = {};

    if (!values.oldPassword) {
        errors.oldPassword = "Current password is required";
    }

    if (!values.newPassword) {
        errors.newPassword = "New password is required";
    } else if (values.newPassword.length < 6) {
        errors.newPassword = "New password must be at least 6 characters";
    }

    if (!values.confirmPassword) {
        errors.confirmPassword = "Please confirm the new password";
    } else if (values.confirmPassword !== values.newPassword) {
        errors.confirmPassword = "Confirm password does not match";
    }

    if (
        values.oldPassword &&
        values.newPassword &&
        values.oldPassword === values.newPassword
    ) {
        errors.newPassword = "New password must be different from old password";
    }

    return errors;
}

export function getPasswordStrengthText(password = "") {
    const len = password.length;
    if (!len) return "Enter a new password";
    if (len < 6) return "Too short";
    if (len < 10) return "Acceptable";
    return "Strong";
}

export function getRoleMeta(role) {
    if (role === "admin") {
        return {
            badgeClass: "border-red-200 bg-red-50 text-red-700",
            heroClass: "border-red-200 bg-red-50 text-red-700",
            gradientClass: "from-red-600 to-rose-600",
            coverFallback:
                "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80",
            description:
                "Update your admin-facing profile information and public identity.",
            roleLabel: "admin",
            headlineFallback: "Platform administrator",
            profileDescription:
                "This public profile represents a platform administrator.",
        };
    }

    if (role === "instructor") {
        return {
            badgeClass: "border-violet-200 bg-violet-50 text-violet-700",
            heroClass: "border-violet-200 bg-violet-50 text-violet-700",
            gradientClass: "from-violet-600 to-blue-600",
            coverFallback: DEFAULT_COVER,
            description:
                "Update your public instructor identity, expertise and teaching profile.",
            roleLabel: "instructor",
            headlineFallback: "Instructor profile",
            profileDescription:
                "Public-facing personal and professional information.",
        };
    }

    return {
        badgeClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
        heroClass: "border-indigo-200 bg-indigo-50 text-indigo-700",
        gradientClass: "from-indigo-600 to-blue-600",
        coverFallback: DEFAULT_COVER,
        description:
            "Update your public information, avatar and learner profile details.",
        roleLabel: "student",
        headlineFallback: "Learner profile",
        profileDescription: "Public-facing personal information.",
    };
}

export function getCoursePublishState(course) {
    const status = String(
        course?.status ||
            course?.publishStatus ||
            course?.state ||
            course?.visibility ||
            "",
    ).toLowerCase();

    const isPublished =
        course?.isPublished === true ||
        course?.published === true ||
        course?.isActive === true ||
        status === "published" ||
        status === "active" ||
        status === "public";

    if (isPublished) {
        return {
            label: "Published",
            className:
                "border border-emerald-200 bg-emerald-100 text-emerald-700",
        };
    }

    return {
        label: "Draft",
        className: "border border-amber-200 bg-amber-100 text-amber-700",
    };
}

export function formatPriceVND(value) {
    const amount = Number(value || 0);
    return `₫${amount.toLocaleString("vi-VN")}`;
}
