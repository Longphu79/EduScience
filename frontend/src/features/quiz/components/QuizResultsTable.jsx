import React from "react";

export default function QuizResultsTable({
  students = [],
  expandedStudentId = "",
  onToggleStudentAttempts,
}) {
  if (!students.length) {
    return (
      <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
        Chưa có dữ liệu kết quả.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {students.map((student) => {
        const isExpanded = String(expandedStudentId) === String(student?.studentId);

        return (
          <div
            key={student?.studentId}
            className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-lg font-bold text-slate-900">
                    {student?.studentName || "Student"}
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      student?.latestPassed
                        ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
                        : "border border-red-200 bg-red-100 text-red-700"
                    }`}
                  >
                    {student?.latestPassed ? "Passed" : "Not passed"}
                  </span>
                </div>

                <div className="mt-1 text-sm text-slate-500">
                  {student?.studentEmail || "No email"}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Metric label="Attempts" value={student?.attemptCount ?? 0} />
                  <Metric label="Latest score" value={student?.latestScore ?? 0} />
                  <Metric label="Best score" value={student?.bestScore ?? 0} />
                  <Metric
                    label="Last submitted"
                    value={
                      student?.lastSubmittedAt
                        ? new Date(student.lastSubmittedAt).toLocaleString("vi-VN")
                        : "N/A"
                    }
                  />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => onToggleStudentAttempts(student?.studentId)}
                  className="inline-flex items-center rounded-[18px] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {isExpanded ? "Hide Attempts" : "View Attempts"}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-[18px] bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-slate-700">{value}</div>
    </div>
  );
}