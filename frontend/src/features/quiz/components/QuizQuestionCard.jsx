import React from "react";
import { getQuestionId } from "../utils/quiz.helpers";

export default function QuizQuestionCard({
  question,
  index,
  selectedOptionIndexes = [],
  disabled = false,
  onSelectOption,
}) {
  const questionId = getQuestionId(question);
  const questionType = question?.type || "single";
  const inputType = questionType === "multiple" ? "checkbox" : "radio";
  const options = Array.isArray(question?.options) ? question.options : [];

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
          Question {index + 1}
        </span>

        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {question?.points || 1} point(s)
        </span>
      </div>

      <h3 className="mt-4 text-lg font-bold text-slate-900">
        {question?.questionText || "Question"}
      </h3>

      <div className="mt-5 space-y-3">
        {options.map((option, optionIndex) => {
          const optionValue = Number(option?.index ?? optionIndex);
          const checked = selectedOptionIndexes.includes(optionValue);

          return (
            <label
              key={option?.clientId || optionValue}
              className={`flex cursor-pointer items-start gap-3 rounded-[20px] border px-4 py-4 transition ${
                checked
                  ? "border-violet-300 bg-violet-50"
                  : "border-slate-200 bg-white hover:border-slate-300"
              } ${disabled ? "cursor-not-allowed opacity-70" : ""}`}
            >
              <input
                type={inputType}
                name={`student-question-${questionId}`}
                checked={checked}
                disabled={disabled}
                onChange={() => onSelectOption(question, optionValue)}
                className="mt-1"
              />

              <div className="text-sm leading-6 text-slate-700">
                {option?.text || `Option ${optionIndex + 1}`}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}