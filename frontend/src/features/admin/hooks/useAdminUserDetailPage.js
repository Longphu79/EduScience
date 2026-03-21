import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAdminUserDetail,
  deactivateAdminUser,
  reactivateAdminUser,
} from "../services/admin.service";

export default function useAdminUserDetailPage() {
  const { userId } = useParams();

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [payload, setPayload] = useState(null);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminUserDetail(userId);
      setPayload(response || null);
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load user detail",
        kind: "error",
      });
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const user = payload?.user || null;
  const summary = payload?.summary || {};
  const enrollments = useMemo(() => payload?.enrollments || [], [payload]);
  const courses = useMemo(() => payload?.courses || [], [payload]);

  const handleConfirmToggleActive = useCallback(async () => {
    if (!user?._id) return;

    try {
      setProcessing(true);

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

      setConfirmOpen(false);
      await fetchDetail();
    } catch (error) {
      setToast({
        message: error?.message || "Failed to update user status",
        kind: "error",
      });
    } finally {
      setProcessing(false);
    }
  }, [user?._id, user?.isActive, fetchDetail]);

  return {
    loading,
    processing,
    toast,
    setToast,
    confirmOpen,
    setConfirmOpen,
    user,
    summary,
    enrollments,
    courses,
    fetchDetail,
    handleConfirmToggleActive,
  };
}