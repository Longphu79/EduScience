import React from "react";

export default function QuizOptionEditor({
  questionIndex,
  option,
  optionIndex,
  questionType,
  onToggleCorrect,
  onChangeText,
  onRemove,
  canRemove,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <input
          type={questionType === "multiple" ? "checkbox" : "radio"}
          name={`correct-answer-${questionIndex}`}
          checked={!!option.isCorrect}
          onChange={onToggleCorrect}
        />
        <span className="text-sm font-semibold text-slate-700">
          Option {optionIndex + 1}
        </span>
      </div>

      <input
        type="text"
        className="flex-1 rounded-[16px] border border-slate-300 bg-white px-3 py-2.5 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        value={option.text || ""}
        onChange={onChangeText}
        disabled={questionType === "true-false"}
        placeholder={`Option ${optionIndex + 1}`}
      />

      {canRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center rounded-full bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}