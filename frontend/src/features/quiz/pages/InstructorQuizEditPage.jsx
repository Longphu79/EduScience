import Toast from "../../../shared/components/Toast";
import QuizForm from "../components/QuizForm";
import useInstructorQuizEditPage from "../hooks/useInstructorQuizEditPage";
import "../styles/instructor-quiz-edit-page.css";

export default function InstructorQuizEditPage() {
  const { form, setForm, loading, saving, toast, setToast, handleSubmit } =
    useInstructorQuizEditPage();

  if (loading) {
    return (
      <div className="instructor-quiz-edit-page">
        <div className="instructor-quiz-edit-page__container">
          <div className="rounded-[28px] border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
            Đang tải quiz...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="instructor-quiz-edit-page">
      {toast.message ? (
        <div className="instructor-quiz-edit-page__toast">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      <div className="instructor-quiz-edit-page__container">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
          <p className="mt-1 text-sm text-gray-500">
            Cập nhật quiz cho khóa học
          </p>
        </div>

        <QuizForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          saving={saving}
          submitLabel="Save Quiz"
        />
      </div>
    </div>
  );
}