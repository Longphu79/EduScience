import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAdminUsers,
  deactivateAdminUser,
  reactivateAdminUser,
} from "../services/admin.service";

export default function useAdminUsersPage() {
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
    user: null,
  });

  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";
  const role = searchParams.get("role") || "";
  const isActive = searchParams.get("isActive") || "";
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getAdminUsers({
        page,
        limit,
        search,
        role,
        isActive,
        sortBy,
        sortOrder,
      });

      setResult({
        items: response?.items || [],
        pagination: response?.pagination || null,
      });
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load users",
        kind: "error",
      });
      setResult({ items: [], pagination: null });
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, role, isActive, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

  const openToggleDialog = useCallback((user) => {
    setConfirmState({
      open: true,
      user,
    });
  }, []);

  const closeToggleDialog = useCallback(() => {
    setConfirmState({
      open: false,
      user: null,
    });
  }, []);

  const handleConfirmToggleActive = useCallback(async () => {
    const user = confirmState.user;
    if (!user?._id) return;

    try {
      setProcessingId(user._id);

      if (user.isActive) {
        await deactivateAdminUser(user._id);
        setToast({
          message: "User deactivated successfully",
          kind: "success",
        });
      } else {
        await reactivateAdminUser(user._id);
        setToast({
          message: "User reactivated successfully",
          kind: "success",
        });
      }

      closeToggleDialog();
      await fetchUsers();
    } catch (error) {
      setToast({
        message: error?.message || "Failed to update user status",
        kind: "error",
      });
    } finally {
      setProcessingId("");
    }
  }, [confirmState.user, closeToggleDialog, fetchUsers]);

  const pagination = result.pagination;
  const items = useMemo(() => result.items || [], [result]);

  const counters = useMemo(() => {
    const total = items.length;
    const totalStudents = items.filter((item) => item.role === "student").length;
    const totalInstructors = items.filter(
      (item) => item.role === "instructor"
    ).length;
    const totalAdmins = items.filter((item) => item.role === "admin").length;
    const activeUsers = items.filter((item) => item.isActive).length;
    const inactiveUsers = items.filter((item) => !item.isActive).length;

    return {
      total,
      totalStudents,
      totalInstructors,
      totalAdmins,
      activeUsers,
      inactiveUsers,
    };
  }, [items]);

  const hasActiveFilters =
    Boolean(search) ||
    Boolean(role) ||
    Boolean(isActive) ||
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
    role,
    isActive,
    sortBy,
    sortOrder,
    counters,
    hasActiveFilters,
    fetchUsers,
    updateQuery,
    clearAllFilters,
    openToggleDialog,
    closeToggleDialog,
    handleConfirmToggleActive,
  };
}