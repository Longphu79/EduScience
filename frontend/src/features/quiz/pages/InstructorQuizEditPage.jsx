import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getQuizById, updateQuiz } from "../services/quiz.service";
import Toast from "../../../shared/components/Toast";
import QuizForm from "../components/QuizForm";
import { useAuth } from "../../auth/state/useAuth";

export default function InstructorQuizEditPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        const data = await getQuizById(quizId);
        const quiz = data?.data || data;

        setForm({
          _id: quiz._id,
          courseId: quiz.courseId,
          title: quiz.title || "",
          description: quiz.description || "",
          passingScore: quiz.passingScore ?? 0,
          timeLimit: quiz.timeLimit ?? 0,
          isPublished: !!quiz.isPublished,
          questions:
            quiz?.questions?.length > 0
              ? quiz.questions.map((q) => ({
                  _id: q._id,
                  questionText: q.questionText || "",
                  type: q.type || "single",
                  explanation: q.explanation || "",
                  points: q.points ?? 1,
                  options:
                    q.options?.length > 0
                      ? q.options.map((opt) => ({
                          text: opt.text || "",
                          isCorrect: !!opt.isCorrect,
                        }))
                      : [],
                }))
              : [],
        });
      } catch (error) {
        setToast({ message: error.message, kind: "error" });
      } finally {
        setLoading(false);
      }
    }

    loadQuiz();
  }, [quizId]);

  async function handleSubmit(e) {
    e.preventDefault();

    const instructorId = user?._id || user?.id || user?.userId;

    if (!form?.title?.trim()) {
      setToast({ message: "Vui lòng nhập tiêu đề quiz", kind: "error" });
      return;
    }

    try {
      setSaving(true);

      await updateQuiz(quizId, {
        instructorId,
        title: form.title.trim(),
        description: form.description?.trim() || "",
        passingScore: Number(form.passingScore) || 0,
        timeLimit: Number(form.timeLimit) || 0,
        isPublished: !!form.isPublished,
        questions: form.questions.map((q) => ({
          _id: q._id,
          questionText: q.questionText.trim(),
          type: q.type || "single",
          explanation: q.explanation?.trim() || "",
          points: Number(q.points) || 1,
          options: (q.options || []).map((opt) => ({
            text: opt.text.trim(),
            isCorrect: !!opt.isCorrect,
          })),
        })),
      });

      setToast({ message: "Cập nhật quiz thành công", kind: "success" });
      navigate(`/instructor/courses/${form.courseId}/quizzes`);
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
            Đang tải quiz...
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="rounded-2xl border bg-white p-8 text-center text-red-500">
            Không tìm thấy quiz.
          </div>
        </div>
      </div>
    );
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
          <p className="text-sm text-gray-500 mt-1">
            Chỉnh sửa thông tin và câu hỏi quiz
          </p>
        </div>

        <QuizForm
          form={form}
          setForm={setForm}
          onSubmit={handleSubmit}
          saving={saving}
          submitLabel="Save Changes"
        />
      </div>
    </div>
  );
}