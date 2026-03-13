import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getQuizResultsByQuizId,
  getQuizAttemptsByQuizAndStudent,
  getInstructorAttemptReviewById,
  quizUnwrap,
} from "../../quiz/services/quiz.service";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/state/useAuth";

function ReviewAnswerModal({ open, loading, reviewData, onClose }) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        zIndex: 1200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 980,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 24,
          boxShadow: "0 30px 60px rgba(15,23,42,0.25)",
          border: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            padding: "24px 28px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 900 }}>
              Review Attempt
            </h2>
            <p style={{ margin: "8px 0 0", color: "#64748b" }}>
              {reviewData?.studentName || "Student"} — Score{" "}
              {reviewData?.score ?? 0}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 28,
              cursor: "pointer",
              color: "#475569",
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 28 }}>
          {loading ? (
            <div>Đang tải review...</div>
          ) : !reviewData ? (
            <div>Không có dữ liệu.</div>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              {(reviewData.questionReviews || []).map((question, questionIndex) => (
                <div
                  key={question.questionId || questionIndex}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 20,
                    padding: 20,
                    background: "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "start",
                      justifyContent: "space-between",
                      gap: 16,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: 22,
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        Câu {questionIndex + 1}. {question.questionText}
                      </h3>
                    </div>

                    <span
                      style={{
                        flexShrink: 0,
                        padding: "8px 12px",
                        borderRadius: 999,
                        fontWeight: 700,
                        fontSize: 14,
                        background: question.isCorrect ? "#dcfce7" : "#fee2e2",
                        color: question.isCorrect ? "#15803d" : "#dc2626",
                      }}
                    >
                      {question.isCorrect ? "Đúng" : "Sai"}
                    </span>
                  </div>

                  <div style={{ display: "grid", gap: 10 }}>
                    {(question.options || []).map((option) => {
                      const isCorrect = (question.correctOptionIndexes || []).includes(
                        option.index
                      );
                      const isSelected = (question.selectedOptionIndexes || []).includes(
                        option.index
                      );

                      let background = "#fff";
                      let border = "1px solid #cbd5e1";
                      let color = "#0f172a";

                      if (isCorrect) {
                        background = "#ecfdf5";
                        border = "1px solid #22c55e";
                        color = "#166534";
                      }

                      if (isSelected && !isCorrect) {
                        background = "#fef2f2";
                        border = "1px solid #ef4444";
                        color = "#991b1b";
                      }

                      return (
                        <div
                          key={option.index}
                          style={{
                            border,
                            background,
                            color,
                            borderRadius: 14,
                            padding: "14px 16px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 12,
                          }}
                        >
                          <span>{option.text}</span>

                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {isSelected ? (
                              <span
                                style={{
                                  background: "#dbeafe",
                                  color: "#1d4ed8",
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                Student selected
                              </span>
                            ) : null}

                            {isCorrect ? (
                              <span
                                style={{
                                  background: "#bbf7d0",
                                  color: "#166534",
                                  padding: "4px 10px",
                                  borderRadius: 999,
                                  fontSize: 12,
                                  fontWeight: 700,
                                }}
                              >
                                Correct answer
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#334155",
                        marginBottom: 8,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Explanation
                    </div>
                    <div style={{ color: "#334155", lineHeight: 1.7 }}>
                      {question.explanation || "Chưa có lời giải cho câu hỏi này."}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            padding: 24,
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button type="button" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function InstructorQuizResultsPage() {
  const { quizId } = useParams();
  const { user } = useAuth();

  const [results, setResults] = useState(null);
  const [expandedStudentId, setExpandedStudentId] = useState("");
  const [studentAttempts, setStudentAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  const instructorId = user?._id || user?.id || user?.userId || null;

  async function loadResults() {
    try {
      setLoading(true);
      const res = await getQuizResultsByQuizId(quizId, instructorId);
      setResults(quizUnwrap(res));
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (quizId && instructorId) {
      loadResults();
    }
  }, [quizId, instructorId]);

  async function toggleStudentAttempts(studentId) {
    if (expandedStudentId === String(studentId)) {
      setExpandedStudentId("");
      setStudentAttempts([]);
      return;
    }

    try {
      setAttemptsLoading(true);
      setExpandedStudentId(String(studentId));

      const res = await getQuizAttemptsByQuizAndStudent(
        quizId,
        studentId,
        instructorId
      );

      const data = quizUnwrap(res);
      setStudentAttempts(Array.isArray(data) ? data : []);
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setAttemptsLoading(false);
    }
  }

  async function handleOpenReview(attemptId) {
    try {
      setReviewLoading(true);
      const res = await getInstructorAttemptReviewById(attemptId, instructorId);
      setReviewData(quizUnwrap(res));
      setShowReview(true);
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setReviewLoading(false);
    }
  }

  const quiz = results?.quiz || {};
  const summary = results?.summary || {};
  const students = results?.students || [];

  const filteredStudents = useMemo(() => {
    let list = [...students];

    const keyword = search.trim().toLowerCase();
    if (keyword) {
      list = list.filter((student) => {
        const name = student.studentName?.toLowerCase() || "";
        const email = student.studentEmail?.toLowerCase() || "";
        return name.includes(keyword) || email.includes(keyword);
      });
    }

    if (statusFilter === "passed") {
      list = list.filter((student) => student.latestPassed);
    } else if (statusFilter === "not-passed") {
      list = list.filter((student) => !student.latestPassed);
    }

    list.sort((a, b) => {
      if (sortBy === "best") return (b.bestScore || 0) - (a.bestScore || 0);
      if (sortBy === "attempts") return (b.attemptCount || 0) - (a.attemptCount || 0);
      return (b.latestScore || 0) - (a.latestScore || 0);
    });

    return list;
  }, [students, search, statusFilter, sortBy]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
            Đang tải kết quả quiz...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.message ? (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      <ReviewAnswerModal
        open={showReview}
        loading={reviewLoading}
        reviewData={reviewData}
        onClose={() => {
          setShowReview(false);
          setReviewData(null);
        }}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-sm text-gray-500 mt-1">Quiz results dashboard</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Total attempts</div>
            <div className="mt-2 text-3xl font-black text-gray-900">
              {summary.totalAttempts ?? 0}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Students</div>
            <div className="mt-2 text-3xl font-black text-gray-900">
              {summary.totalStudents ?? 0}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Average score</div>
            <div className="mt-2 text-3xl font-black text-gray-900">
              {summary.averageScore ?? 0}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Pass rate</div>
            <div className="mt-2 text-3xl font-black text-gray-900">
              {summary.passRate ?? 0}%
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm grid md:grid-cols-3 gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="all">All results</option>
            <option value="passed">Passed</option>
            <option value="not-passed">Not passed</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="latest">Sort by latest score</option>
            <option value="best">Sort by best score</option>
            <option value="attempts">Sort by attempts</option>
          </select>
        </div>

        <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-700">
                <tr>
                  <th className="px-5 py-4 font-semibold">Student</th>
                  <th className="px-5 py-4 font-semibold">Email</th>
                  <th className="px-5 py-4 font-semibold">Attempts</th>
                  <th className="px-5 py-4 font-semibold">Latest score</th>
                  <th className="px-5 py-4 font-semibold">Best score</th>
                  <th className="px-5 py-4 font-semibold">Latest result</th>
                  <th className="px-5 py-4 font-semibold">Last submitted</th>
                  <th className="px-5 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-5 py-8 text-center text-gray-500">
                      Chưa có dữ liệu phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.studentId} className="border-t">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {student.studentName}
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {student.studentEmail || "N/A"}
                      </td>
                      <td className="px-5 py-4">{student.attemptCount}</td>
                      <td className="px-5 py-4">{student.latestScore}</td>
                      <td className="px-5 py-4">{student.bestScore}</td>
                      <td className="px-5 py-4">
                        <span
                          className={
                            student.latestPassed
                              ? "text-emerald-600 font-semibold"
                              : "text-red-500 font-semibold"
                          }
                        >
                          {student.latestPassed ? "Passed" : "Not passed"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {student.lastSubmittedAt
                          ? new Date(student.lastSubmittedAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <Button
                          type="button"
                          onClick={() => toggleStudentAttempts(student.studentId)}
                        >
                          {expandedStudentId === String(student.studentId)
                            ? "Hide Attempts"
                            : "View Attempts"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {expandedStudentId ? (
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Attempts of selected student
            </h2>

            {attemptsLoading ? (
              <div className="text-gray-500">Đang tải attempts...</div>
            ) : studentAttempts.length === 0 ? (
              <div className="text-gray-500">Không có attempt nào.</div>
            ) : (
              <div className="grid gap-4">
                {studentAttempts.map((attempt) => (
                  <div
                    key={attempt._id}
                    className="rounded-xl border p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold text-gray-900">
                        Score: {attempt.score}
                      </div>
                      <div className="text-sm text-gray-600">
                        Correct: {attempt.correctAnswers}/{attempt.totalQuestions}
                      </div>
                      <div className="text-sm text-gray-600">
                        Result: {attempt.passed ? "Passed" : "Not passed"}
                      </div>
                      <div className="text-sm text-gray-600">
                        Submitted:{" "}
                        {attempt.submittedAt
                          ? new Date(attempt.submittedAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </div>
                    </div>

                    <div>
                      <Button
                        type="button"
                        onClick={() => handleOpenReview(attempt._id)}
                      >
                        Review Attempt
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}