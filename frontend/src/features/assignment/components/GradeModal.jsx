import Button from "../../../shared/components/Button";
import "../styles/assignment-components.css";

export default function GradeModal({
  open,
  submitting,
  score,
  feedback,
  maxScore,
  onChangeScore,
  onChangeFeedback,
  onClose,
  onSubmit,
}) {
  if (!open) return null;

  return (
    <div className="assignment-grade-modal__backdrop">
      <div className="assignment-grade-modal__dialog">
        <div className="assignment-grade-modal__header">
          <div>
            <h2 className="assignment-grade-modal__title">Grade Submission</h2>
            <p className="assignment-grade-modal__subtitle">
              Max score: {maxScore}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="assignment-grade-modal__close"
          >
            ×
          </button>
        </div>

        <div className="assignment-grade-modal__body">
          <div className="assignment-form__field">
            <label className="assignment-form__label">Score</label>
            <input
              type="number"
              min="0"
              max={maxScore}
              value={score}
              onChange={(event) => onChangeScore(event.target.value)}
              className="assignment-form__input"
            />
          </div>

          <div className="assignment-form__field">
            <label className="assignment-form__label">Feedback</label>
            <textarea
              rows={5}
              value={feedback}
              onChange={(event) => onChangeFeedback(event.target.value)}
              className="assignment-form__textarea"
            />
          </div>
        </div>

        <div className="assignment-grade-modal__footer">
          <Button type="button" onClick={onSubmit} loading={submitting}>
            Save Grade
          </Button>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}