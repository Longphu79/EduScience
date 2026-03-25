import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import { getUserProfile } from "../services/user.service";
import {
    getInstructorDashboardSummary,
    enrollmentUnwrap,
} from "../../enrollment/services/enrollment.service";
import {
    DEFAULT_AVATAR,
    getCurrentUserId,
    getRoleMeta,
    getSafeImage,
    getUserDisplayName,
    getUserProfileTags,
    normalizeUserItem,
    userUnwrap,
} from "../utils/user.helpers";

export default function useUserProfilePage() {
    const { userId } = useParams();
    const { user: currentUser } = useAuth();

    const normalizedCurrentUser = useMemo(
        () => normalizeUserItem(currentUser || {}),
        [currentUser],
    );
    const currentUserId = getCurrentUserId(normalizedCurrentUser);

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [summary, setSummary] = useState(null);
    const [toast, setToast] = useState({ message: "", kind: "error" });

    const loadProfile = useCallback(async () => {
        if (!userId) return;

        try {
            setLoading(true);
            const response = await getUserProfile(userId);
            const data = normalizeUserItem(userUnwrap(response));
            setProfile(data);
        } catch (error) {
            setToast({
                message: error?.message || "Failed to load profile",
                kind: "error",
            });
            setProfile(null);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const loadInstructorSummary = useCallback(async () => {
        const profileId = getCurrentUserId(profile);

        try {
            if (!profileId || profile?.role !== "instructor") {
                setSummary(null);
                setSummaryLoading(false);
                return;
            }

            setSummaryLoading(true);
            const response = await getInstructorDashboardSummary(profileId);
            setSummary(enrollmentUnwrap(response) || null);
        } catch {
            setSummary(null);
        } finally {
            setSummaryLoading(false);
        }
    }, [profile]);

    useEffect(() => {
        loadInstructorSummary();
    }, [loadInstructorSummary]);

    const profileId = getCurrentUserId(profile);
    const isOwnProfile =
        String(currentUserId || "") === String(profileId || "");
    const isInstructor = profile?.role === "instructor";
    const isAdmin = profile?.role === "admin";
    const roleMeta = getRoleMeta(profile?.role || "student");
    const displayName = getUserDisplayName(profile || {});
    const avatar = getSafeImage(profile?.avatarUrl) || DEFAULT_AVATAR;
    const coverImage =
        getSafeImage(profile?.coverImageUrl) || roleMeta.coverFallback;
    const tags = getUserProfileTags(profile || {});
    const latestCourses = useMemo(() => {
        return Array.isArray(summary?.latestCourses)
            ? summary.latestCourses
            : [];
    }, [summary]);

    return {
        loading,
        toast,
        setToast,
        profile,
        summary,
        summaryLoading,
        isOwnProfile,
        isInstructor,
        isAdmin,
        roleMeta,
        displayName,
        avatar,
        coverImage,
        tags,
        latestCourses,
    };
}
