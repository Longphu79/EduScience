import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAdminCourseDetail,
  publishAdminCourse,
  archiveAdminCourse,
  moveAdminCourseToDraft,
} from "../services/admin.service";
import { getAdminCourseStatusMeta } from "../utils/admin.helpers";

export default function useAdminCourseDetailPage() {
  const { courseId } = useParams();

  const [loading, setLoading] = useState(true);
  const [processingStatus, setProcessingStatus] = useState(false);
  const [payload, setPayload] = useState(null);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });
  const [confirmState, setConfirmState] = useState({
    open: false,
    nextStatus: "",
  });

  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAdminCourseDetail(courseId);
      setPayload(response || null);
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load course detail",
        kind: "error",
      });
      setPayload(null);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const course = payload?.course || null;
  const summary = payload?.summary || {};

  const statusMeta = useMemo(() => {
    return getAdminCourseStatusMeta(course?.status);
  }, [course?.status]);

  const openStatusDialog = useCallback((nextStatus) => {
    setConfirmState({
      open: true,
      nextStatus,
    });
  }, []);

  const closeStatusDialog = useCallback(() => {
    setConfirmState({
      open: false,
      nextStatus: "",
    });
  }, []);

  const handleConfirmChangeStatus = useCallback(async () => {
    const nextStatus = confirmState.nextStatus;
    const currentCourseId = course?._id;

    if (!currentCourseId || !nextStatus) return;

    try {
      setProcessingStatus(true);

      if (nextStatus === "published") {
        await publishAdminCourse(currentCourseId);
      } else if (nextStatus === "archived") {
        await archiveAdminCourse(currentCourseId);
      } else {
        await moveAdminCourseToDraft(currentCourseId);
      }

      setToast({
        message: `Course moved to ${nextStatus} successfully`,
        kind: "success",
      });

      closeStatusDialog();
      await fetchDetail();
    } catch (error) {
      setToast({
        message: error?.message || "Failed to update course status",
        kind: "error",
      });
    } finally {
      setProcessingStatus(false);
    }
  }, [confirmState.nextStatus, course?._id, closeStatusDialog, fetchDetail]);

  return {
    loading,
    processingStatus,
    toast,
    setToast,
    confirmState,
    course,
    summary,
    statusMeta,
    fetchDetail,
    openStatusDialog,
    closeStatusDialog,
    handleConfirmChangeStatus,
  };
}