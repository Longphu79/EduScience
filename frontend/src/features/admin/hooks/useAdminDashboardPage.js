import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAdminDashboard,
  getAdminInstructorLeaderboard,
} from "../services/admin.service";
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
  const [leaderboardLoading, setLeaderboardLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [filters, setFilters] = useState({
    from: getDateDaysAgoString(30),
    to: getTodayString(),
  });
  const [leaderboardSortBy, setLeaderboardSortBy] = useState("students");
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const fetchDashboard = useCallback(
    async (overrideFilters) => {
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
    },
    [filters]
  );

  const fetchLeaderboard = useCallback(
    async (override = {}) => {
      try {
        setLeaderboardLoading(true);
        const finalFilters = override.filters || filters;
        const finalSortBy = override.sortBy || leaderboardSortBy;

        const response = await getAdminInstructorLeaderboard({
          ...finalFilters,
          sortBy: finalSortBy,
          limit: 10,
        });

        setLeaderboard(response || null);
      } catch (error) {
        setToast({
          message: error?.message || "Failed to load instructor leaderboard",
          kind: "error",
        });
        setLeaderboard(null);
      } finally {
        setLeaderboardLoading(false);
      }
    },
    [filters, leaderboardSortBy]
  );

  useEffect(() => {
    fetchDashboard(filters);
  }, [fetchDashboard, filters]);

  useEffect(() => {
    fetchLeaderboard({
      filters,
      sortBy: leaderboardSortBy,
    });
  }, [fetchLeaderboard, filters, leaderboardSortBy]);

  const stats = useMemo(() => dashboard?.stats || {}, [dashboard]);
  const analytics = useMemo(() => dashboard?.analytics || {}, [dashboard]);
  const recentUsers = useMemo(() => dashboard?.recentUsers || [], [dashboard]);
  const recentCourses = useMemo(
    () => dashboard?.recentCourses || [],
    [dashboard]
  );
  const topCourses = useMemo(() => dashboard?.topCourses || [], [dashboard]);

  const leaderboardItems = useMemo(
    () => leaderboard?.items || [],
    [leaderboard]
  );
  const leaderboardTopThree = useMemo(
    () => leaderboard?.topThree || [],
    [leaderboard]
  );

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
    leaderboardLoading,
    dashboard,
    leaderboard,
    stats,
    analytics,
    recentUsers,
    recentCourses,
    topCourses,
    leaderboardItems,
    leaderboardTopThree,
    inactiveUsers,
    toast,
    setToast,
    fetchDashboard,
    fetchLeaderboard,
    filters,
    setFilters,
    applyPreset,
    resetFilters,
    leaderboardSortBy,
    setLeaderboardSortBy,
  };
}