import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/state/useAuth";
import {
  getStudentDashboardSummary,
  getInstructorDashboardSummary,
  enrollmentUnwrap,
} from "../../enrollment/services/enrollment.service";
import { getAdminDashboard } from "../../admin/services/admin.service";
import {
  DEFAULT_AVATAR,
  getCurrentUserId,
  getSafeImage,
  getUserDisplayName,
  getUserProfileTags,
  normalizeUserItem,
} from "../utils/user.helpers";

export default function useProfilePage() {
  const { user, booting, isAuthenticated } = useAuth();

  const normalizedUser = useMemo(() => normalizeUserItem(user || {}), [user]);
  const currentUserId = getCurrentUserId(normalizedUser);
  const isInstructor = normalizedUser?.role === "instructor";
  const isAdmin = normalizedUser?.role === "admin";

  const displayName = getUserDisplayName(normalizedUser);
  const avatar =
    getSafeImage(normalizedUser?.avatarUrl) || DEFAULT_AVATAR;

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const chips = useMemo(() => {
    return getUserProfileTags(normalizedUser);
  }, [normalizedUser]);

  const loadSummary = useCallback(async () => {
    try {
      if (!currentUserId) {
        setSummary(null);
        setSummaryLoading(false);
        return;
      }

      setSummaryLoading(true);

      if (isAdmin) {
        const response = await getAdminDashboard();
        setSummary(response?.data || null);
        return;
      }

      const response = isInstructor
        ? await getInstructorDashboardSummary(currentUserId)
        : await getStudentDashboardSummary(currentUserId);

      setSummary(enrollmentUnwrap(response));
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load profile summary",
        kind: "error",
      });
      setSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [currentUserId, isAdmin, isInstructor]);

  useEffect(() => {
    if (!booting && isAuthenticated) {
      loadSummary();
    }
  }, [booting, isAuthenticated, loadSummary]);

  return {
    booting,
    isAuthenticated,
    user: normalizedUser,
    currentUserId,
    isInstructor,
    isAdmin,
    displayName,
    avatar,
    summary,
    summaryLoading,
    chips,
    toast,
    setToast,
  };
}