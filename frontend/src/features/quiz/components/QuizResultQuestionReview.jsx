import React from "react";

export default function QuizResultQuestionReview({ question, index }) {
  const options = Array.isArray(question?.options) ? question.options : [];

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">
          Câu {index + 1}. {question?.questionText}
        </h3>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            question?.isCorrect
              ? "border border-emerald-200 bg-emerald-100 text-emerald-700"
              : "border border-red-200 bg-red-100 text-red-700"
          }`}
        >
          {question?.isCorrect ? "Đúng" : "Sai"}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {options.map((option, optionIndex) => (
          <div
            key={option?.clientId || option?.index || optionIndex}
            className={`rounded-[18px] border px-4 py-3 ${
              option?.isCorrect
                ? "border-emerald-300 bg-emerald-50"
                : option?.isSelected
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-slate-800">{option?.text}</span>

              <div className="flex flex-wrap gap-2">
                {option?.isSelected ? (
                  <span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1 text-[11px] font-semibold text-blue-700">
                    Student selected
                  </span>
                ) : null}

                {option?.isCorrect ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                    Correct answer
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {question?.explanation ? (
        <div className="mt-4 rounded-[18px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-bold text-slate-800">Explanation</div>
          <div className="mt-1 text-sm leading-6 text-slate-600">
            {question.explanation}
          </div>
        </div>
      ) : null}
    </div>
  );
}