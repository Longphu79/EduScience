import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import InstructorQuizCard from "../components/InstructorQuizCard";
import InstructorQuizToolbar from "../components/InstructorQuizToolbar";
import useInstructorQuizManagePage from "../hooks/useInstructorQuizManagePage";
import { getInstructorQuizStatusMeta, getQuizId } from "../utils/quiz.helpers";
import "../styles/instructor-quiz-manage-page.css";

export default function InstructorQuizManagePage() {
  const {
    courseId,
    quizzes,
    filteredQuizzes,
    loading,
    deletingId,
    publishingId,
    search,
    setSearch,
    toast,
    setToast,
    handleDelete,
    handleTogglePublish,
  } = useInstructorQuizManagePage();

  return (
    <div className="instructor-quiz-manage-page">
      <div className="instructor-quiz-manage-page__container">
        {toast.message ? (
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        ) : null}

        <InstructorQuizToolbar
          courseId={courseId}
          search={search}
          onSearchChange={setSearch}
          totalCount={quizzes.length}
        />

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-6"
              >
                <div className="h-6 w-56 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-full rounded bg-slate-100" />
                <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
                <div className="mt-5 h-10 w-64 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-lg font-semibold text-slate-800">
              {quizzes.length === 0
                ? "Chưa có quiz nào"
                : "Không tìm thấy quiz phù hợp"}
            </div>
            <p className="mt-2 text-sm text-slate-500">
              {quizzes.length === 0
                ? "Hãy tạo quiz đầu tiên cho khóa học này."
                : "Thử từ khóa khác."}
            </p>

            {quizzes.length === 0 ? (
              <div className="mt-5">
                <Link to={`/instructor/courses/${courseId}/quizzes/create`}>
                  <Button>+ Create First Quiz</Button>
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredQuizzes.map((quiz, index) => {
              const quizId = getQuizId(quiz);

              return (
                <InstructorQuizCard
                  key={quizId}
                  quiz={quiz}
                  index={index}
                  courseId={courseId}
                  statusMeta={getInstructorQuizStatusMeta(quiz)}
                  deleting={deletingId === quizId}
                  publishing={publishingId === quizId}
                  onTogglePublish={handleTogglePublish}
                  onDelete={handleDelete}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}