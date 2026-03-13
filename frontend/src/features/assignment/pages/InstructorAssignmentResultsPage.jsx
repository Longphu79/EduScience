import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAssignmentById,
  getAssignmentSubmissionsByAssignment,
  gradeAssignmentSubmission,
  assignmentUnwrap,
} from "../services/assignment.service";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/state/useAuth";

function GradeModal({
  open,
  submitting,
  score,
  feedback,
  maxScore,
  onChangeScore,
  onChangeFeedback,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-xl rounded-3xl border bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Grade Submission</h2>
            <p className="text-sm text-slate-500">Max score: {maxScore}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl text-slate-500 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Score
            </label>
            <input
              type="number"
              min="0"
              max={maxScore}
              value={score}
              onChange={(e) => onChangeScore(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Feedback
            </label>
            <textarea
              rows={5}
              value={feedback}
              onChange={(e) => onChangeFeedback(e.target.value)}
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" onClick={onSubmit} loading={submitting}>
            Save Grade
          </Button>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status) {
  if (status === "graded") {
    return { label: "Graded", className: "bg-emerald-100 text-emerald-700" };
  }
  if (status === "overdue") {
    return { label: "Overdue", className: "bg-red-100 text-red-700" };
  }
  if (status === "resubmitted") {
    return { label: "Resubmitted", className: "bg-amber-100 text-amber-700" };
  }
  return { label: "Submitted", className: "bg-blue-100 text-blue-700" };
}

export default function InstructorAssignmentResultsPage() {
  const { assignmentId } = useParams();
  const { user } = useAuth();

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
    try {
      setLoading(true);

      const [assignmentRes, submissionRes] = await Promise.all([
        getAssignmentById(assignmentId),
        getAssignmentSubmissionsByAssignment(assignmentId),
      ]);

      setAssignment(assignmentUnwrap(assignmentRes));
      setSubmissions(Array.isArray(assignmentUnwrap(submissionRes)) ? assignmentUnwrap(submissionRes) : []);
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (assignmentId) {
      loadResults();
    }
  }, [assignmentId]);

  function openGradeModal(submission) {
    setSelectedSubmission(submission);
    setGradeScore(submission.grade ?? "");
    setGradeFeedback(submission.feedback || "");
    setGradeModalOpen(true);
  }

  async function handleSaveGrade() {
    if (!selectedSubmission?._id) return;

    try {
      setGrading(true);

      await gradeAssignmentSubmission(selectedSubmission._id, {
        grade: Number(gradeScore),
        feedback: gradeFeedback,
        gradedBy: user?._id || user?.id || user?.userId || null,
      });

      setToast({ message: "Chấm bài thành công", kind: "success" });
      setGradeModalOpen(false);
      setSelectedSubmission(null);
      await loadResults();
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setGrading(false);
    }
  }

  const summary = useMemo(() => {
    const totalSubmissions = submissions.length;
    const gradedCount = submissions.filter((item) => item.status === "graded").length;
    const overdueCount = submissions.filter((item) => item.status === "overdue").length;
    const gradedItems = submissions.filter((item) => typeof item.grade === "number");
    const averageGrade = gradedItems.length
      ? Math.round(
          gradedItems.reduce((sum, item) => sum + Number(item.grade || 0), 0) /
            gradedItems.length
        )
      : 0;

    return {
      totalSubmissions,
      gradedCount,
      overdueCount,
      averageGrade,
    };
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    let list = [...submissions];

    const keyword = search.trim().toLowerCase();
    if (keyword) {
      list = list.filter((item) => {
        const studentName =
          item.studentId?.username?.toLowerCase() ||
          item.studentId?.email?.toLowerCase() ||
          "";
        const studentEmail = item.studentId?.email?.toLowerCase() || "";
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

      return (
        new Date(b.resubmittedAt || b.submittedAt || b.createdAt) -
        new Date(a.resubmittedAt || a.submittedAt || a.createdAt)
      );
    });

    return list;
  }, [submissions, search, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-6xl rounded-3xl border bg-white p-8 text-center text-slate-500">
          Đang tải assignment results...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <Toast
        message={toast.message}
        kind={toast.kind}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <GradeModal
        open={gradeModalOpen}
        submitting={grading}
        score={gradeScore}
        feedback={gradeFeedback}
        maxScore={assignment?.maxScore ?? 100}
        onChangeScore={setGradeScore}
        onChangeFeedback={setGradeFeedback}
        onClose={() => setGradeModalOpen(false)}
        onSubmit={handleSaveGrade}
      />

      <div className="mx-auto max-w-6xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {assignment?.title || "Assignment Results"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Theo dõi bài nộp và chấm điểm assignment
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Total submissions</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary.totalSubmissions}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Graded</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary.gradedCount}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Overdue</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary.overdueCount}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Average grade</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary.averageGrade}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 rounded-2xl border bg-white p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email học viên..."
            className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">All statuses</option>
            <option value="submitted">Submitted</option>
            <option value="resubmitted">Resubmitted</option>
            <option value="graded">Graded</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="latest">Sort by latest submission</option>
            <option value="grade">Sort by grade</option>
          </select>
        </div>

        <div className="grid gap-4">
          {filteredSubmissions.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-slate-500 shadow-sm">
              Chưa có dữ liệu phù hợp.
            </div>
          ) : (
            filteredSubmissions.map((item) => {
              const badge = getStatusBadge(item.status);

              return (
                <div
                  key={item._id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.studentId?.username ||
                            item.studentId?.email ||
                            "Student"}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </div>

                      <div className="text-sm text-slate-600">
                        Email: {item.studentId?.email || "N/A"}
                      </div>

                      <div className="text-sm text-slate-600">
                        Score: {item.grade ?? "Not graded"} / {assignment?.maxScore ?? 100}
                      </div>

                      <div className="text-sm text-slate-600">
                        Submitted:{" "}
                        {new Date(
                          item.resubmittedAt || item.submittedAt || item.createdAt
                        ).toLocaleString("vi-VN")}
                      </div>

                      <div className="text-sm text-slate-600">
                        Feedback: {item.feedback || "No feedback yet"}
                      </div>

                      {item.submissionText ? (
                        <div className="rounded-xl border bg-slate-50 p-3 text-sm text-slate-700">
                          {item.submissionText}
                        </div>
                      ) : null}

                      {Array.isArray(item.fileUrls) && item.fileUrls.length > 0 ? (
                        <div className="space-y-1">
                          {item.fileUrls.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="block text-sm text-indigo-600 hover:underline"
                            >
                              Submitted File {index + 1}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="shrink-0">
                      <Button type="button" onClick={() => openGradeModal(item)}>
                        {item.status === "graded" ? "Re-grade" : "Grade"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}