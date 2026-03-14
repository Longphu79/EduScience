import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getAssignmentsByCourse,
  submitAssignment,
  resubmitAssignment,
  getAssignmentSubmissionByStudentCourse,
  assignmentUnwrap,
} from "../services/assignment.service";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/state/useAuth";

function getAssignmentIdFromSubmission(item) {
  if (!item) return "";
  if (item.assignmentId && typeof item.assignmentId === "object") {
    return item.assignmentId._id || "";
  }
  return item.assignmentId || "";
}

function getLatestSubmissionInfo(submission) {
  if (!submission) return "N/A";
  return submission.resubmittedAt
    ? new Date(submission.resubmittedAt).toLocaleString("vi-VN")
    : submission.submittedAt
    ? new Date(submission.submittedAt).toLocaleString("vi-VN")
    : submission.createdAt
    ? new Date(submission.createdAt).toLocaleString("vi-VN")
    : "N/A";
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

export default function AssignmentPage() {
  const { courseId, assignmentId } = useParams();
  const { user } = useAuth();

  const studentId = user?._id || user?.id || user?.userId;

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [submissionText, setSubmissionText] = useState("");
  const [fileUrlInput, setFileUrlInput] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  async function loadData() {
    try {
      setLoading(true);

      const [assignmentRes, submissionRes] = await Promise.all([
        getAssignmentsByCourse(courseId),
        getAssignmentSubmissionByStudentCourse(studentId, courseId),
      ]);

      const assignmentList = assignmentUnwrap(assignmentRes) || [];
      const submissionList = assignmentUnwrap(submissionRes) || [];

      setAssignments(Array.isArray(assignmentList) ? assignmentList : []);
      setSubmissions(Array.isArray(submissionList) ? submissionList : []);

      const found =
        assignmentList.find((item) => String(item._id) === String(assignmentId)) ||
        assignmentList[0] ||
        null;

      setSelectedAssignment(found);
    } catch (error) {
      setToast({
        message: error.message || "Failed to load assignments",
        kind: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!studentId) return;
    loadData();
  }, [courseId, assignmentId, studentId]);

  const submissionsMap = useMemo(() => {
    const map = {};
    for (const item of submissions) {
      const id = getAssignmentIdFromSubmission(item);
      if (id) map[id] = item;
    }
    return map;
  }, [submissions]);

  const currentSubmission = selectedAssignment
    ? submissionsMap[selectedAssignment._id]
    : null;

  async function handleSubmit() {
    if (!selectedAssignment?._id) return;

    if (!submissionText.trim() && !fileUrlInput.trim()) {
      setToast({
        message: "Vui lòng nhập nội dung bài nộp hoặc file URL",
        kind: "error",
      });
      return;
    }

    const payload = {
      submissionText: submissionText.trim(),
      fileUrls: fileUrlInput
        ? fileUrlInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],
    };

    try {
      setSubmitting(true);

      if (currentSubmission?._id) {
        await resubmitAssignment(selectedAssignment._id, payload);
        setToast({
          message: "Assignment resubmitted successfully",
          kind: "success",
        });
      } else {
        await submitAssignment(selectedAssignment._id, payload);
        setToast({
          message: "Assignment submitted successfully",
          kind: "success",
        });
      }

      setSubmissionText("");
      setFileUrlInput("");
      await loadData();
    } catch (error) {
      setToast({
        message: error.message || "Failed to submit assignment",
        kind: "error",
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-6">Loading assignments...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <Toast
        message={toast.message}
        kind={toast.kind}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <div>
        <h1 className="text-2xl font-bold">Assignments</h1>
        <p className="text-sm text-gray-500">Submit and track your assignments</p>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl border bg-white p-6">
          No assignments available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <aside className="rounded-xl border bg-white p-4 lg:col-span-1">
            <h2 className="mb-3 font-semibold">Assignment List</h2>

            <div className="space-y-2">
              {assignments.map((item) => {
                const isActive = selectedAssignment?._id === item._id;
                const submission = submissionsMap[item._id];
                const statusBadge = submission ? getStatusBadge(submission.status) : null;

                return (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setSelectedAssignment(item)}
                    className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                      isActive ? "border-gray-400 bg-gray-100" : "bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="font-medium">{item.title}</div>

                    <div className="mt-2 flex flex-wrap gap-2">
                      {submission ? (
                        <span
                          className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                          Not submitted
                        </span>
                      )}
                    </div>

                    <div className="mt-2 text-xs text-gray-500">
                      Score: {submission?.grade ?? "Not graded"}
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="rounded-xl border bg-white p-5 space-y-6 lg:col-span-3">
            {selectedAssignment ? (
              <>
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-slate-900">
                      {selectedAssignment.title}
                    </h2>

                    {selectedAssignment.isOverdue ? (
                      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                        Overdue
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                        Open
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-slate-600">
                    {selectedAssignment.description || "No description"}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span>
                      Due:{" "}
                      {selectedAssignment.dueDate
                        ? new Date(selectedAssignment.dueDate).toLocaleString("vi-VN")
                        : "N/A"}
                    </span>
                    <span>Max score: {selectedAssignment.maxScore ?? 100}</span>
                    <span>
                      Resubmit: {selectedAssignment.allowResubmit ? "Yes" : "No"}
                    </span>
                  </div>

                  {Array.isArray(selectedAssignment.attachmentUrls) &&
                  selectedAssignment.attachmentUrls.length > 0 ? (
                    <div className="mt-4 rounded-xl border bg-slate-50 p-4">
                      <div className="font-medium text-slate-900">Assignment Resources</div>
                      <div className="mt-2 space-y-2">
                        {selectedAssignment.attachmentUrls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-sm text-indigo-600 hover:underline"
                          >
                            Resource {index + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                {currentSubmission ? (
                  <div className="rounded-xl border bg-slate-50 p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-semibold text-slate-900">Your Submission</h3>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          getStatusBadge(currentSubmission.status).className
                        }`}
                      >
                        {getStatusBadge(currentSubmission.status).label}
                      </span>
                    </div>

                    <div className="text-sm text-slate-600">
                      Score: {currentSubmission.grade ?? "Not graded"}
                    </div>
                    <div className="text-sm text-slate-600">
                      Feedback: {currentSubmission.feedback || "No feedback yet"}
                    </div>
                    <div className="text-sm text-slate-600">
                      Submitted: {getLatestSubmissionInfo(currentSubmission)}
                    </div>

                    {currentSubmission.submissionText ? (
                      <div className="rounded-lg border bg-white p-3 text-sm text-slate-700">
                        {currentSubmission.submissionText}
                      </div>
                    ) : null}

                    {Array.isArray(currentSubmission.fileUrls) &&
                    currentSubmission.fileUrls.length > 0 ? (
                      <div className="space-y-1">
                        {currentSubmission.fileUrls.map((url, index) => (
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
                ) : null}

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Submission Text
                    </label>
                    <textarea
                      className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                      rows={8}
                      placeholder="Write your submission here..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      File URLs
                    </label>
                    <input
                      className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                      placeholder="Paste one or multiple URLs separated by commas"
                      value={fileUrlInput}
                      onChange={(e) => setFileUrlInput(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button type="button" onClick={handleSubmit} loading={submitting}>
                      {currentSubmission ? "Resubmit Assignment" : "Submit Assignment"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div>No assignment selected.</div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}