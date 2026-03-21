import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/state/useAuth";
import {
  enrollmentUnwrap,
  getInstructorDashboardSummary,
} from "../services/enrollment.service";
import { getUserId } from "../utils/enrollment.helpers";

export default function useInstructorDashboardPage() {
  const { user, booting } = useAuth();
  const instructorId = useMemo(() => getUserId(user), [user]);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const loadSummary = useCallback(async () => {
    try {
      if (!instructorId) {
        setSummary(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await getInstructorDashboardSummary(instructorId);
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
  }, [instructorId]);

  useEffect(() => {
    if (!booting) {
      loadSummary();
    }
  }, [booting, loadSummary]);

  const latestCourses = useMemo(() => {
    return Array.isArray(summary?.latestCourses) ? summary.latestCourses : [];
  }, [summary]);

  return {
    booting,
    loading,
    summary,
    latestCourses,
    toast,
    setToast,
    loadSummary,
  };
}