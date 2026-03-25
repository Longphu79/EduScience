import React from "react";
import QuizOptionEditor from "./QuizOptionEditor";

export default function QuizQuestionEditor({
  question,
  questionIndex,
  totalQuestions,
  onRemoveQuestion,
  onUpdateQuestion,
  onUpdateOption,
  onToggleCorrectOption,
  onAddOption,
  onRemoveOption,
}) {
  const questionType = question?.type || "single";
  const options = Array.isArray(question?.options) ? question.options : [];

  return (
    <div className="space-y-5 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Question {questionIndex + 1}
          </div>
          <div className="mt-1 text-lg font-bold text-slate-900">
            Cấu hình câu hỏi
          </div>
        </div>

        {totalQuestions > 1 ? (
          <button
            type="button"
            onClick={() => onRemoveQuestion(questionIndex)}
            className="inline-flex items-center rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            Remove Question
          </button>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Question text
        </label>
        <input
          type="text"
          className="w-full rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          value={question?.questionText || ""}
          onChange={(e) =>
            onUpdateQuestion(questionIndex, "questionText", e.target.value)
          }
          placeholder="Nhập nội dung câu hỏi"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Type
          </label>
          <select
            value={questionType}
            onChange={(e) =>
              onUpdateQuestion(questionIndex, "type", e.target.value)
            }
            className="w-full rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            <option value="single">Single choice</option>
            <option value="multiple">Multiple choice</option>
            <option value="true-false">True / False</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Points
          </label>
          <input
            type="number"
            min="1"
            className="w-full rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            value={question?.points ?? 1}
            onChange={(e) =>
              onUpdateQuestion(questionIndex, "points", e.target.value)
            }
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <label className="block text-sm font-medium text-slate-700">
            Options
          </label>

          <div className="text-xs text-slate-500">
            {questionType === "multiple"
              ? "Có thể chọn nhiều đáp án đúng"
              : questionType === "true-false"
              ? "Dạng đúng / sai"
              : "Chỉ chọn một đáp án đúng"}
          </div>
        </div>

        {options.map((option, optionIndex) => (
          <QuizOptionEditor
            key={option?.clientId || optionIndex}
            questionIndex={questionIndex}
            option={option}
            optionIndex={optionIndex}
            questionType={questionType}
            onToggleCorrect={() =>
              onToggleCorrectOption(questionIndex, optionIndex)
            }
            onChangeText={(e) =>
              onUpdateOption(questionIndex, optionIndex, "text", e.target.value)
            }
            onRemove={() => onRemoveOption(questionIndex, optionIndex)}
            canRemove={questionType !== "true-false" && options.length > 2}
          />
        ))}

        {questionType !== "true-false" ? (
          <button
            type="button"
            onClick={() => onAddOption(questionIndex)}
            className="inline-flex items-center rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
          >
            + Add option
          </button>
        ) : null}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Explanation
        </label>
        <textarea
          rows={3}
          className="w-full rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          value={question?.explanation || ""}
          onChange={(e) =>
            onUpdateQuestion(questionIndex, "explanation", e.target.value)
          }
          placeholder="Giải thích đáp án đúng"
        />
      </div>
    </div>
  );
}