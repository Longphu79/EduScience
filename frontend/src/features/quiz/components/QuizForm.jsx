import React, { useCallback } from "react";
import Button from "../../../shared/components/Button";
import {
  createEmptyQuestion,
  createQuizOption,
  normalizeQuestionTypeOptions,
} from "../utils/quiz.form.helpers";
import QuizQuestionEditor from "./QuizQuestionEditor";

export default function QuizForm({
  form,
  setForm,
  onSubmit,
  saving = false,
  submitLabel = "Save Quiz",
}) {
  const updateRootField = useCallback(
    (field, value) => {
      setForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    },
    [setForm]
  );

  const updateQuestion = useCallback(
    (questionIndex, field, value) => {
      setForm((prev) => {
        const nextQuestions = [...prev.questions];
        const currentQuestion = nextQuestions[questionIndex];

        if (!currentQuestion) return prev;

        if (field === "type") {
          nextQuestions[questionIndex] = normalizeQuestionTypeOptions(
            currentQuestion,
            value
          );
        } else {
          nextQuestions[questionIndex] = {
            ...currentQuestion,
            [field]: field === "points" ? Number(value) || 1 : value,
          };
        }

        return {
          ...prev,
          questions: nextQuestions,
        };
      });
    },
    [setForm]
  );

  const updateOption = useCallback(
    (questionIndex, optionIndex, field, value) => {
      setForm((prev) => {
        const nextQuestions = [...prev.questions];
        const currentQuestion = nextQuestions[questionIndex];
        if (!currentQuestion) return prev;

        const nextOptions = [...(currentQuestion.options || [])];
        const currentOption = nextOptions[optionIndex];
        if (!currentOption) return prev;

        nextOptions[optionIndex] = {
          ...currentOption,
          [field]: value,
        };

        nextQuestions[questionIndex] = {
          ...currentQuestion,
          options: nextOptions,
        };

        return {
          ...prev,
          questions: nextQuestions,
        };
      });
    },
    [setForm]
  );

  const toggleCorrectOption = useCallback(
    (questionIndex, optionIndex) => {
      setForm((prev) => {
        const nextQuestions = [...prev.questions];
        const currentQuestion = nextQuestions[questionIndex];
        if (!currentQuestion) return prev;

        const questionType = currentQuestion.type || "single";
        const nextOptions = [...(currentQuestion.options || [])];

        if (questionType === "multiple") {
          nextOptions[optionIndex] = {
            ...nextOptions[optionIndex],
            isCorrect: !nextOptions[optionIndex]?.isCorrect,
          };
        } else {
          for (let i = 0; i < nextOptions.length; i += 1) {
            nextOptions[i] = {
              ...nextOptions[i],
              isCorrect: i === optionIndex,
            };
          }
        }

        nextQuestions[questionIndex] = {
          ...currentQuestion,
          options: nextOptions,
        };

        return {
          ...prev,
          questions: nextQuestions,
        };
      });
    },
    [setForm]
  );

  const addOption = useCallback(
    (questionIndex) => {
      setForm((prev) => {
        const nextQuestions = [...prev.questions];
        const currentQuestion = nextQuestions[questionIndex];
        if (!currentQuestion) return prev;

        nextQuestions[questionIndex] = {
          ...currentQuestion,
          options: [...(currentQuestion.options || []), createQuizOption("", false)],
        };

        return {
          ...prev,
          questions: nextQuestions,
        };
      });
    },
    [setForm]
  );

  const removeOption = useCallback(
    (questionIndex, optionIndex) => {
      setForm((prev) => {
        const nextQuestions = [...prev.questions];
        const currentQuestion = nextQuestions[questionIndex];
        if (!currentQuestion) return prev;

        const options = [...(currentQuestion.options || [])];
        if (options.length <= 2) return prev;

        options.splice(optionIndex, 1);

        nextQuestions[questionIndex] = {
          ...currentQuestion,
          options,
        };

        return {
          ...prev,
          questions: nextQuestions,
        };
      });
    },
    [setForm]
  );

  const addQuestion = useCallback(() => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, createEmptyQuestion()],
    }));
  }, [setForm]);

  const removeQuestion = useCallback(
    (questionIndex) => {
      setForm((prev) => {
        if ((prev.questions || []).length <= 1) return prev;

        const nextQuestions = [...prev.questions];
        nextQuestions.splice(questionIndex, 1);

        return {
          ...prev,
          questions: nextQuestions,
        };
      });
    },
    [setForm]
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Quiz title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateRootField("title", e.target.value)}
              className="w-full rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              placeholder="Nhập tiêu đề quiz"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => updateRootField("description", e.target.value)}
              className="w-full rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              placeholder="Mô tả quiz"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Passing score
            </label>
            <input
              type="number"
              min="0"
              value={form.passingScore}
              onChange={(e) =>
                updateRootField("passingScore", Number(e.target.value) || 0)
              }
              className="w-full rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Time limit (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={form.timeLimit}
              onChange={(e) =>
                updateRootField("timeLimit", Number(e.target.value) || 0)
              }
              className="w-full rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
          </div>
        </div>

        <label className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={!!form.isPublished}
            onChange={(e) => updateRootField("isPublished", e.target.checked)}
          />
          Publish quiz immediately
        </label>
      </div>

      <div className="space-y-5">
        {(form.questions || []).map((question, questionIndex) => (
          <QuizQuestionEditor
            key={question?.clientId || questionIndex}
            question={question}
            questionIndex={questionIndex}
            totalQuestions={form.questions.length}
            onRemoveQuestion={removeQuestion}
            onUpdateQuestion={updateQuestion}
            onUpdateOption={updateOption}
            onToggleCorrectOption={toggleCorrectOption}
            onAddOption={addOption}
            onRemoveOption={removeOption}
          />
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
        >
          + Add question
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={saving} loading={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}