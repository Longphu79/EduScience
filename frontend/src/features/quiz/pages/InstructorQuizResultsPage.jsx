import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import QuizResultsTable from "../components/QuizResultsTable";
import ReviewAnswerModal from "../components/ReviewAnswerModal";
import StudentAttemptsPanel from "../components/StudentAttemptsPanel";
import useInstructorQuizResultsPage from "../hooks/useInstructorQuizResultsPage";
import "../styles/instructor-quiz-results-page.css";

export default function InstructorQuizResultsPage() {
  const {
    courseId,
    quiz,
    summary,
    filteredStudents,
    loading,
    expandedStudentId,
    studentAttempts,
    attemptsLoading,
    reviewLoading,
    reviewData,
    showReview,
    setShowReview,
    setReviewData,
    toast,
    setToast,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    toggleStudentAttempts,
    handleOpenReview,
  } = useInstructorQuizResultsPage();

  if (loading) {
    return (
      <div className="instructor-quiz-results-page">
        <div className="instructor-quiz-results-page__container">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Đang tải kết quả quiz...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-quiz-results-page">
      <div className="instructor-quiz-results-page__container">
        {toast.message ? (
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
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

        <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-700">
                Quiz Results Dashboard
              </div>
              <h1 className="mt-3 text-[2rem] font-black tracking-tight text-slate-950">
                {quiz?.title || "Quiz Results"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Theo dõi kết quả học viên, attempts và review chi tiết từng bài
                làm.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to={`/instructor/courses/${courseId}/quizzes`}>
                <Button type="button">Back to Quizzes</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Total attempts</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary?.totalAttempts ?? 0}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Students</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary?.totalStudents ?? 0}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Average score</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary?.averageScore ?? 0}
            </div>
          </div>

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="text-sm text-slate-500">Pass rate</div>
            <div className="mt-2 text-3xl font-black text-slate-900">
              {summary?.passRate ?? 0}%
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="all">All results</option>
              <option value="passed">Passed</option>
              <option value="not-passed">Not passed</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            >
              <option value="latest">Sort by latest score</option>
              <option value="best">Sort by best score</option>
              <option value="attempts">Sort by attempts</option>
            </select>
          </div>
        </div>

        <QuizResultsTable
          students={filteredStudents}
          expandedStudentId={expandedStudentId}
          onToggleStudentAttempts={toggleStudentAttempts}
        />

        <StudentAttemptsPanel
          open={!!expandedStudentId}
          attemptsLoading={attemptsLoading}
          studentAttempts={studentAttempts}
          onOpenReview={handleOpenReview}
        />
      </div>
    </div>
  );
}