import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminDashboard } from "../services/admin.service";
import { getAdminInactiveUsersCount } from "../utils/admin.helpers";

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getDateDaysAgoString(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function useAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [filters, setFilters] = useState({
    from: getDateDaysAgoString(30),
    to: getTodayString(),
  });
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const fetchDashboard = useCallback(async (overrideFilters) => {
    try {
      setLoading(true);
      const finalFilters = overrideFilters || filters;
      const response = await getAdminDashboard(finalFilters);
      setDashboard(response || null);
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load admin dashboard",
        kind: "error",
      });
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboard(filters);
  }, [fetchDashboard, filters]);

  const stats = useMemo(() => dashboard?.stats || {}, [dashboard]);
  const analytics = useMemo(() => dashboard?.analytics || {}, [dashboard]);
  const recentUsers = useMemo(() => dashboard?.recentUsers || [], [dashboard]);
  const recentCourses = useMemo(
    () => dashboard?.recentCourses || [],
    [dashboard]
  );
  const topCourses = useMemo(() => dashboard?.topCourses || [], [dashboard]);

  const inactiveUsers = useMemo(() => {
    return getAdminInactiveUsersCount(stats);
  }, [stats]);

  const applyPreset = useCallback((preset) => {
    const today = getTodayString();

    if (preset === "7d") {
      setFilters({
        from: getDateDaysAgoString(7),
        to: today,
      });
      return;
    }

    if (preset === "30d") {
      setFilters({
        from: getDateDaysAgoString(30),
        to: today,
      });
      return;
    }

    if (preset === "month") {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .slice(0, 10);

      setFilters({
        from: firstDay,
        to: today,
      });
      return;
    }

    if (preset === "year") {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), 0, 1)
        .toISOString()
        .slice(0, 10);

      setFilters({
        from: firstDay,
        to: today,
      });
    }
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      from: "",
      to: "",
    });
  }, []);

  return {
    loading,
    dashboard,
    stats,
    analytics,
    recentUsers,
    recentCourses,
    topCourses,
    inactiveUsers,
    toast,
    setToast,
    fetchDashboard,
    filters,
    setFilters,
    applyPreset,
    resetFilters,
  };
}