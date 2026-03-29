import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/state/useAuth";
import {
  enrollmentUnwrap,
  getInstructorDashboardSummary,
} from "../services/enrollment.service";
import { getUserId } from "../utils/enrollment.helpers";

function getTodayString() {
  return new Date().toISOString().slice(0, 10);
}

function getDateDaysAgoString(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export default function useInstructorDashboardPage() {
  const { user, booting } = useAuth();
  const instructorId = useMemo(() => getUserId(user), [user]);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: getDateDaysAgoString(30),
    to: getTodayString(),
  });
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const loadSummary = useCallback(async (overrideFilters) => {
    try {
      if (!instructorId) {
        setSummary(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const finalFilters = overrideFilters || filters;
      const response = await getInstructorDashboardSummary(
        instructorId,
        finalFilters
      );
      setSummary(enrollmentUnwrap(response) || null);
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load instructor dashboard",
        kind: "error",
      });
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [instructorId, filters]);

  useEffect(() => {
    if (!booting) {
      loadSummary(filters);
    }
  }, [booting, loadSummary, filters]);

  const latestCourses = useMemo(() => {
    return Array.isArray(summary?.latestCourses) ? summary.latestCourses : [];
  }, [summary]);

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
    booting,
    loading,
    summary,
    latestCourses,
    toast,
    setToast,
    loadSummary,
    filters,
    setFilters,
    applyPreset,
    resetFilters,
  };
}