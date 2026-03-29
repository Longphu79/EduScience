import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/state/useAuth";
import {
  enrollmentUnwrap,
  getStudentAnalytics,
  getStudentDashboardSummary,
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

export default function useStudentDashboardPage() {
  const { user } = useAuth();
  const studentId = useMemo(() => getUserId(user), [user]);

  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: getDateDaysAgoString(30),
    to: getTodayString(),
  });
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const loadSummary = useCallback(
    async (overrideFilters) => {
      try {
        if (!studentId) {
          setSummary(null);
          setAnalytics(null);
          setLoading(false);
          return;
        }

        setLoading(true);

        const finalFilters = overrideFilters || filters;

        const [summaryResponse, analyticsResponse] = await Promise.all([
          getStudentDashboardSummary(studentId),
          getStudentAnalytics(studentId, finalFilters),
        ]);

        setSummary(enrollmentUnwrap(summaryResponse) || null);
        setAnalytics(enrollmentUnwrap(analyticsResponse) || null);
      } catch (error) {
        setToast({
          message: error?.message || "Failed to load student dashboard",
          kind: "error",
        });
        setSummary(null);
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    },
    [studentId, filters]
  );

  useEffect(() => {
    loadSummary(filters);
  }, [loadSummary, filters]);

  const continueCourses = useMemo(() => {
    const raw = summary?.continueLearningCourses;
    return Array.isArray(raw) ? raw : [];
  }, [summary]);

  const weeklyTrend = useMemo(() => {
    return Array.isArray(analytics?.weeklyTrend) ? analytics.weeklyTrend : [];
  }, [analytics]);

  const monthlyTrend = useMemo(() => {
    return Array.isArray(analytics?.monthlyTrend) ? analytics.monthlyTrend : [];
  }, [analytics]);

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
    summary,
    analytics,
    continueCourses,
    weeklyTrend,
    monthlyTrend,
    filters,
    setFilters,
    applyPreset,
    resetFilters,
    toast,
    setToast,
    loadSummary,
    studentId,
  };
}