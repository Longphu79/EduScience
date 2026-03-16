import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createQuiz } from "../services/quiz.service";
import Toast from "../../../shared/components/Toast";
import { useAuth } from "../../auth/state/useAuth";
import QuizForm from "../components/QuizForm";

const createEmptyQuestion = () => ({
  questionText: "",
  type: "single",
  explanation: "",
  points: 1,
  options: [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
});

export default function InstructorQuizCreatePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    description: "",
    passingScore: 70,
    timeLimit: 15,
    isPublished: true,
    questions: [createEmptyQuestion()],
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  async function handleSubmit(e) {
    e.preventDefault();

    const instructorId = user?._id || user?.id || user?.userId;

    if (!form.title.trim()) {
      setToast({ message: "Vui lòng nhập tiêu đề quiz", kind: "error" });
      return;
    }

    if (!instructorId) {
      setToast({
        message: "Không tìm thấy instructorId từ tài khoản đăng nhập",
        kind: "error",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        courseId,
        instructorId,
        title: form.title.trim(),
        description: form.description.trim(),
        passingScore: Number(form.passingScore) || 0,
        timeLimit: Number(form.timeLimit) || 0,
        isPublished: !!form.isPublished,
        questions: form.questions.map((q) => ({
          questionText: q.questionText.trim(),
          type: q.type || "single",
          explanation: q.explanation?.trim() || "",
          points: Number(q.points) || 1,
          options: (q.options || []).map((opt) => ({
            text: opt.text.trim(),
            isCorrect: !!opt.isCorrect,
          })),
        })),
      };

      await createQuiz(payload);

      setToast({ message: "Tạo quiz thành công", kind: "success" });
      navigate(`/instructor/courses/${courseId}/quizzes`);
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.message ? (
        <div className="max-w-5xl mx-auto px-4 pt-4">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Quiz</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tạo quiz mới cho khóa học
          </p>
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