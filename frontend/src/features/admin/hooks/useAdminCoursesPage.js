import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAdminCourses,
  publishAdminCourse,
  archiveAdminCourse,
  moveAdminCourseToDraft,
} from "../services/admin.service";

export default function useAdminCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState({ items: [], pagination: null });
  const [processingId, setProcessingId] = useState("");
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });
  const [confirmState, setConfirmState] = useState({
    open: false,
    courseId: "",
    nextStatus: "",
    courseTitle: "",
  });

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 9);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "";
  const level = searchParams.get("level") || "";
  const pricing = searchParams.get("pricing") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminCourses({
        page,
        limit,
        search,
        status,
        level,
        pricing,
        sortBy,
        sortOrder,
      });

      setResult({
        items: response?.items || [],
        pagination: response?.pagination || null,
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load courses",
        kind: "error",
      });
      setResult({ items: [], pagination: null });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, status, level, pricing, sortBy, sortOrder]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const updateQuery = useCallback(
    (nextValues = {}) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(nextValues).forEach(([key, value]) => {
        if (value === "" || value === null || value === undefined) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      if (!("page" in nextValues)) {
        next.set("page", "1");
      }

      setSearchParams(next);
    },
    [searchParams, setSearchParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const openStatusDialog = useCallback((course, nextStatus) => {
    setConfirmState({
      open: true,
      courseId: course?._id || "",
      nextStatus,
      courseTitle: course?.title || "",
    });
  }, []);

  const closeStatusDialog = useCallback(() => {
    setConfirmState({
      open: false,
      courseId: "",
      nextStatus: "",
      courseTitle: "",
    });
  }, []);

  const handleConfirmChangeStatus = useCallback(async () => {
    const courseId = confirmState.courseId;
    const nextStatus = confirmState.nextStatus;

    if (!courseId || !nextStatus) return;

    try {
      setProcessingId(courseId);

      if (nextStatus === "published") {
        await publishAdminCourse(courseId);
      } else if (nextStatus === "archived") {
        await archiveAdminCourse(courseId);
      } else {
        await moveAdminCourseToDraft(courseId);
      }

      setToast({
        message: `Course moved to ${nextStatus} successfully`,
        kind: "success",
      });

      closeStatusDialog();
      await fetchCourses();
    } catch (error) {
      setToast({
        message: error?.message || "Failed to update course status",
        kind: "error",
      });
    } finally {
      setProcessingId("");
    }
  }, [
    confirmState.courseId,
    confirmState.nextStatus,
    closeStatusDialog,
    fetchCourses,
  ]);

  const items = useMemo(() => result.items || [], [result]);
  const pagination = result.pagination;

  const counters = useMemo(() => {
    const total = items.length;
    const published = items.filter((item) => item.status === "published").length;
    const draft = items.filter((item) => item.status === "draft").length;
    const archived = items.filter((item) => item.status === "archived").length;
    const freeCourses = items.filter(
      (item) => item.isFree || Number(item.price || 0) === 0
    ).length;
    const paidCourses = items.filter(
      (item) => !item.isFree && Number(item.price || 0) > 0
    ).length;

    return {
      total,
      published,
      draft,
      archived,
      freeCourses,
      paidCourses,
    };
  }, [items]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(status) ||
    Boolean(level) ||
    Boolean(pricing) ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  return {
    loading,
    items,
    pagination,
    processingId,
    toast,
    setToast,
    confirmState,
    page,
    limit,
    search,
    status,
    level,
    pricing,
    sortBy,
    sortOrder,
    counters,
    hasActiveFilters,
    fetchCourses,
    updateQuery,
    clearAllFilters,
    openStatusDialog,
    closeStatusDialog,
    handleConfirmChangeStatus,
  };
}