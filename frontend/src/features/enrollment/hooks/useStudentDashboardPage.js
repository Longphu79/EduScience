import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/state/useAuth";
import {
  enrollmentUnwrap,
  getStudentDashboardSummary,
} from "../services/enrollment.service";
import { getUserId } from "../utils/enrollment.helpers";

export default function useStudentDashboardPage() {
  const { user } = useAuth();
  const studentId = useMemo(() => getUserId(user), [user]);

  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const loadSummary = useCallback(async () => {
    try {
      if (!studentId) {
        setSummary(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const response = await getStudentDashboardSummary(studentId);
      setSummary(enrollmentUnwrap(response) || null);
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load student dashboard",
        kind: "error",
      });
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const continueCourses = useMemo(() => {
    const raw = summary?.continueLearningCourses;
    return Array.isArray(raw) ? raw : [];
  }, [summary]);

  return {
    loading,
    summary,
    continueCourses,
    toast,
    setToast,
    loadSummary,
  };
}