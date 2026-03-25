import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAssignmentById,
  getAssignmentSubmissionsByAssignment,
  gradeAssignmentSubmission,
} from "../services/assignment.service";
import {
  buildAssignmentResultsSummary,
  getSubmissionSubmittedAt,
  validateGradePayload,
} from "../utils/assignment.helpers";

export default function useInstructorAssignmentResultsPage() {
  const { assignmentId } = useParams();

  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const [gradeModalOpen, setGradeModalOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeScore, setGradeScore] = useState("");
  const [gradeFeedback, setGradeFeedback] = useState("");
  const [grading, setGrading] = useState(false);

  async function loadResults() {
    if (!assignmentId) return;

    try {
      setLoading(true);

      const [assignmentData, submissionData] = await Promise.all([
        getAssignmentById(assignmentId),
        getAssignmentSubmissionsByAssignment(assignmentId),
      ]);

      setAssignment(assignmentData || null);
      setSubmissions(Array.isArray(submissionData) ? submissionData : []);
    } catch (error) {
      setAssignment(null);
      setSubmissions([]);
      setToast({
        message: error?.message || "Không tải được assignment results",
        kind: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadResults();
  }, [assignmentId]);

  function openGradeModal(submission) {
    setSelectedSubmission(submission);
    setGradeScore(
      submission?.grade !== null && submission?.grade !== undefined
        ? String(submission.grade)
        : ""
    );
    setGradeFeedback(submission?.feedback || "");
    setGradeModalOpen(true);
  }

  function closeGradeModal() {
    setGradeModalOpen(false);
    setSelectedSubmission(null);
    setGradeScore("");
    setGradeFeedback("");
  }

  async function handleSaveGrade() {
    if (!selectedSubmission?._id) return;

    const maxScore = Number(assignment?.maxScore ?? 100);
    const errorMessage = validateGradePayload(gradeScore, maxScore);

    if (errorMessage) {
      setToast({ message: errorMessage, kind: "error" });
      return;
    }

    try {
      setGrading(true);

      await gradeAssignmentSubmission(selectedSubmission._id, {
        grade: Number(gradeScore),
        feedback: gradeFeedback,
      });

      setToast({ message: "Chấm bài thành công", kind: "success" });
      closeGradeModal();
      await loadResults();
    } catch (error) {
      setToast({
        message: error?.message || "Không thể chấm bài",
        kind: "error",
      });
    } finally {
      setGrading(false);
    }
  }

  const summary = useMemo(
    () => buildAssignmentResultsSummary(submissions),
    [submissions]
  );

  const filteredSubmissions = useMemo(() => {
    let list = [...submissions];

    const keyword = search.trim().toLowerCase();
    if (keyword) {
      list = list.filter((item) => {
        const studentName =
          item?.studentId?.username?.toLowerCase() ||
          item?.studentId?.fullName?.toLowerCase() ||
          item?.studentId?.email?.toLowerCase() ||
          "";
        const studentEmail = item?.studentId?.email?.toLowerCase() || "";

        return studentName.includes(keyword) || studentEmail.includes(keyword);
      });
    }

    if (statusFilter !== "all") {
      list = list.filter((item) => item.status === statusFilter);
    }

    list.sort((a, b) => {
      if (sortBy === "grade") {
        return (Number(b.grade) || 0) - (Number(a.grade) || 0);
      }

      return new Date(getSubmissionSubmittedAt(b)) - new Date(getSubmissionSubmittedAt(a));
    });

    return list;
  }, [submissions, search, statusFilter, sortBy]);

  return {
    assignment,
    submissions,
    filteredSubmissions,
    loading,
    toast,
    search,
    statusFilter,
    sortBy,
    gradeModalOpen,
    selectedSubmission,
    gradeScore,
    gradeFeedback,
    grading,
    summary,
    setToast,
    setSearch,
    setStatusFilter,
    setSortBy,
    setGradeScore,
    setGradeFeedback,
    openGradeModal,
    closeGradeModal,
    handleSaveGrade,
  };
}