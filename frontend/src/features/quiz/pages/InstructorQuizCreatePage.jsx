import Toast from "../../../shared/components/Toast";
import QuizForm from "../components/QuizForm";
import useInstructorQuizCreatePage from "../hooks/useInstructorQuizCreatePage";
import "../styles/instructor-quiz-create-page.css";

export default function InstructorQuizCreatePage() {
  const { form, setForm, saving, toast, setToast, handleSubmit } =
    useInstructorQuizCreatePage();

  return (
    <div className="instructor-quiz-create-page">
      {toast.message ? (
        <div className="instructor-quiz-create-page__toast">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      <div className="instructor-quiz-create-page__container">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
          <p className="mt-1 text-sm text-gray-500">Tạo quiz mới cho khóa học</p>
        </div>

        <QuizForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          saving={saving}
          submitLabel="Create Quiz"
        />
      </div>
    </div>
  );
}