import { useCallback, useEffect, useMemo, useState } from "react";
import { getAdminDashboard } from "../services/admin.service";
import { getAdminInactiveUsersCount } from "../utils/admin.helpers";

export default function useAdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminDashboard();
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
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const stats = useMemo(() => dashboard?.stats || {}, [dashboard]);
  const recentUsers = useMemo(() => dashboard?.recentUsers || [], [dashboard]);
  const recentCourses = useMemo(
    () => dashboard?.recentCourses || [],
    [dashboard]
  );
  const topCourses = useMemo(() => dashboard?.topCourses || [], [dashboard]);

  const inactiveUsers = useMemo(() => {
    return getAdminInactiveUsersCount(stats);
  }, [stats]);

  return {
    loading,
    dashboard,
    stats,
    recentUsers,
    recentCourses,
    topCourses,
    inactiveUsers,
    toast,
    setToast,
    fetchDashboard,
  };
}