import React from "react";
import Button from "../../../shared/components/Button";

const createDefaultOptions = (type = "single") => {
  if (type === "true-false") {
    return [
      { text: "True", isCorrect: true },
      { text: "False", isCorrect: false },
    ];
  }

  return [
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ];
};

const createEmptyQuestion = () => ({
  questionText: "",
  type: "single",
  explanation: "",
  points: 1,
  options: createDefaultOptions("single"),
});

export default function QuizForm({
  form,
  setForm,
  onSubmit,
  saving = false,
  submitLabel = "Save Quiz",
}) {
  function updateQuestion(index, key, value) {
    setForm((prev) => {
      const questions = [...(prev.questions || [])];
      questions[index] = { ...questions[index], [key]: value };

      if (key === "type") {
        if (value === "true-false") {
          questions[index].options = createDefaultOptions("true-false");
        } else if ((questions[index].options || []).length < 2) {
          questions[index].options = createDefaultOptions(value);
        } else if (value === "single") {
          const firstCorrectIndex = questions[index].options.findIndex(
            (opt) => opt.isCorrect
          );

          questions[index].options = questions[index].options.map(
            (opt, optIdx) => ({
              ...opt,
              isCorrect:
                firstCorrectIndex === -1
                  ? optIdx === 0
                  : optIdx === firstCorrectIndex,
            })
          );
        }
      }

      return { ...prev, questions };
    });
  }

  function updateOption(questionIndex, optionIndex, key, value) {
    setForm((prev) => {
      const questions = [...(prev.questions || [])];
      const options = [...(questions[questionIndex].options || [])];

      options[optionIndex] = { ...options[optionIndex], [key]: value };
      questions[questionIndex] = { ...questions[questionIndex], options };

      return { ...prev, questions };
    });
  }

  function toggleCorrectOption(questionIndex, optionIndex) {
    setForm((prev) => {
      const questions = [...(prev.questions || [])];
      const question = questions[questionIndex];
      const type = question.type || "single";

      let options = [...(question.options || [])];

      if (type === "multiple") {
        options[optionIndex] = {
          ...options[optionIndex],
          isCorrect: !options[optionIndex].isCorrect,
        };

        if (!options.some((opt) => opt.isCorrect)) {
          options[optionIndex].isCorrect = true;
        }
      } else {
        options = options.map((option, idx) => ({
          ...option,
          isCorrect: idx === optionIndex,
        }));
      }

      questions[questionIndex] = { ...question, options };
      return { ...prev, questions };
    });
  }

  function addQuestion() {
    setForm((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), createEmptyQuestion()],
    }));
  }

  function removeQuestion(index) {
    setForm((prev) => ({
      ...prev,
      questions: (prev.questions || []).filter((_, i) => i !== index),
    }));
  }

  function addOption(questionIndex) {
    setForm((prev) => {
      const questions = [...(prev.questions || [])];
      const question = questions[questionIndex];

      if (question.type === "true-false") return prev;

      questions[questionIndex] = {
        ...question,
        options: [...(question.options || []), { text: "", isCorrect: false }],
      };

      return { ...prev, questions };
    });
  }

  function removeOption(questionIndex, optionIndex) {
    setForm((prev) => {
      const questions = [...(prev.questions || [])];
      const question = questions[questionIndex];

      if (question.type === "true-false") return prev;
      if ((question.options || []).length <= 2) return prev;

      let nextOptions = (question.options || []).filter(
        (_, idx) => idx !== optionIndex
      );

      if (
        question.type !== "multiple" &&
        !nextOptions.some((opt) => opt.isCorrect) &&
        nextOptions.length > 0
      ) {
        nextOptions = nextOptions.map((opt, idx) => ({
          ...opt,
          isCorrect: idx === 0,
        }));
      }

      questions[questionIndex] = {
        ...question,
        options: nextOptions,
      };

      return { ...prev, questions };
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quiz title
          </label>
          <input
            type="text"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.title || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Nhập tiêu đề quiz"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            rows={4}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.description || ""}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Nhập mô tả quiz"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passing score
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.passingScore ?? 0}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  passingScore: e.target.value,
                }))
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time limit (minutes)
            </label>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.timeLimit ?? 0}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  timeLimit: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-3 pt-8">
            <input
              id="quiz-published"
              type="checkbox"
              checked={!!form.isPublished}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  isPublished: e.target.checked,
                }))
              }
            />
            <label htmlFor="quiz-published" className="text-sm text-gray-700">
              Published
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {(form.questions || []).map((question, questionIndex) => {
          const questionType = question.type || "single";

          return (
            <div
              key={question._id || questionIndex}
              className="rounded-2xl border bg-white p-6 shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Question {questionIndex + 1}
                </h2>

                {(form.questions || []).length > 1 ? (
                  <button
                    type="button"
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question text
                </label>
                <input
                  type="text"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                  value={question.questionText || ""}
                  onChange={(e) =>
                    updateQuestion(questionIndex, "questionText", e.target.value)
                  }
                  placeholder="Nhập nội dung câu hỏi"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={questionType}
                    onChange={(e) =>
                      updateQuestion(questionIndex, "type", e.target.value)
                    }
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                  >
                    <option value="single">Single choice</option>
                    <option value="multiple">Multiple choice</option>
                    <option value="true-false">True / False</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                    value={question.points ?? 1}
                    onChange={(e) =>
                      updateQuestion(questionIndex, "points", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Options
                </label>

                {(question.options || []).map((option, optionIndex) => (
                  <div
                    key={optionIndex}
                    className="flex items-center gap-3 rounded-xl border p-3"
                  >
                    <input
                      type={questionType === "multiple" ? "checkbox" : "radio"}
                      name={`correct-answer-${questionIndex}`}
                      checked={!!option.isCorrect}
                      onChange={() =>
                        toggleCorrectOption(questionIndex, optionIndex)
                      }
                    />

                    <input
                      type="text"
                      className="flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                      value={option.text || ""}
                      onChange={(e) =>
                        updateOption(
                          questionIndex,
                          optionIndex,
                          "text",
                          e.target.value
                        )
                      }
                      disabled={questionType === "true-false"}
                      placeholder={`Option ${optionIndex + 1}`}
                    />

                    {questionType !== "true-false" &&
                    (question.options || []).length > 2 ? (
                      <button
                        type="button"
                        onClick={() => removeOption(questionIndex, optionIndex)}
                        className="text-sm text-red-600"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                ))}

                {questionType !== "true-false" ? (
                  <button
                    type="button"
                    onClick={() => addOption(questionIndex)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    + Add option
                  </button>
                ) : null}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation
                </label>
                <textarea
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                  value={question.explanation || ""}
                  onChange={(e) =>
                    updateQuestion(questionIndex, "explanation", e.target.value)
                  }
                  placeholder="Giải thích đáp án đúng"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={addQuestion}>
          + Add Question
        </Button>

        <Button type="submit" loading={saving} disabled={saving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}