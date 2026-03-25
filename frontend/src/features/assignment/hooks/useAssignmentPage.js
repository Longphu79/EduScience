import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import {
  getAssignmentsByCourse,
  getAssignmentSubmissionByStudentCourse,
  submitAssignment,
  resubmitAssignment,
} from "../services/assignment.service";
import {
  buildSubmissionMap,
  getAssignmentId,
  getSubmissionStatusMeta,
  validateAssignmentSubmission,
} from "../utils/assignment.helpers";

export default function useAssignmentPage() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentId = user?._id || user?.id || user?.userId || null;

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [submissionText, setSubmissionText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  async function loadData() {
    if (!courseId || !studentId) return;

    try {
      setLoading(true);

      const [assignmentList, submissionList] = await Promise.all([
        getAssignmentsByCourse(courseId),
        getAssignmentSubmissionByStudentCourse(studentId, courseId),
      ]);

      setAssignments(Array.isArray(assignmentList) ? assignmentList : []);
      setSubmissions(Array.isArray(submissionList) ? submissionList : []);
    } catch (error) {
      setAssignments([]);
      setSubmissions([]);
      setToast({
        message: error?.message || "Failed to load assignments",
        kind: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [courseId, studentId]);

  const submissionsMap = useMemo(
    () => buildSubmissionMap(submissions),
    [submissions]
  );

  useEffect(() => {
    if (!assignments.length) {
      setSelectedAssignment(null);
      return;
    }

    const found =
      assignments.find(
        (item) => String(getAssignmentId(item)) === String(assignmentId)
      ) ||
      assignments[0] ||
      null;

    setSelectedAssignment(found);
  }, [assignments, assignmentId]);

  const currentSubmission = selectedAssignment
    ? submissionsMap[getAssignmentId(selectedAssignment)]
    : null;

  const currentStatusMeta =
    currentSubmission || selectedAssignment
      ? getSubmissionStatusMeta(
          currentSubmission?.status,
          selectedAssignment?.allowResubmit
        )
      : null;

  const canResubmit = !!(
    selectedAssignment?.allowResubmit && currentSubmission?._id
  );

  const isSubmitDisabled =
    submitting ||
    (currentSubmission?._id && !selectedAssignment?.allowResubmit);

  useEffect(() => {
    if (!selectedAssignment?._id) {
      setSubmissionText("");
      setSelectedFiles([]);
      return;
    }

    const nextSubmission = submissionsMap[getAssignmentId(selectedAssignment)] || null;
    setSubmissionText(nextSubmission?.submissionText || "");
    setSelectedFiles([]);
  }, [selectedAssignment, submissionsMap]);

  async function handleSubmit() {
    if (!selectedAssignment?._id || isSubmitDisabled) return;

    const errorMessage = validateAssignmentSubmission({
      submissionText,
      selectedFiles,
    });

    if (errorMessage) {
      setToast({ message: errorMessage, kind: "error" });
      return;
    }

    const payload = {
      submissionText: submissionText.trim(),
      files: selectedFiles,
    };

    try {
      setSubmitting(true);

      if (currentSubmission?._id) {
        await resubmitAssignment(getAssignmentId(selectedAssignment), payload);
        setToast({
          message: "Nộp lại bài tập thành công",
          kind: "success",
        });
      } else {
        await submitAssignment(getAssignmentId(selectedAssignment), payload);
        setToast({
          message: "Nộp bài tập thành công",
          kind: "success",
        });
      }

      setSelectedFiles([]);
      await loadData();
    } catch (error) {
      setToast({
        message: error?.message || "Failed to submit assignment",
        kind: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  function handleSelectAssignment(item) {
    const nextId = getAssignmentId(item);
    setSelectedAssignment(item);

    navigate(`/learn/${courseId}/assignments/${nextId}`, {
      replace: true,
      preventScrollReset: true,
    });
  }

  function handleBackToAssignments() {
    navigate(`/learn/${courseId}?tab=assignments`, {
      preventScrollReset: true,
    });
  }

  function handleBackToLearnCourse() {
    navigate(`/learn/${courseId}`, {
      preventScrollReset: true,
    });
  }

  return {
    assignments,
    submissions,
    submissionsMap,
    selectedAssignment,
    currentSubmission,
    currentStatusMeta,
    submissionText,
    selectedFiles,
    loading,
    submitting,
    toast,
    canResubmit,
    isSubmitDisabled,
    setToast,
    setSubmissionText,
    setSelectedFiles,
    handleSubmit,
    handleSelectAssignment,
    handleBackToAssignments,
    handleBackToLearnCourse,
  };
}