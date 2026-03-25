import Button from "../../../shared/components/Button";
import AttachmentList from "./AttachmentList";
import "../styles/assignment-page.css";
import "../styles/assignment-components.css";

export default function AssignmentSubmitCard({
  currentSubmission,
  assignment,
  submissionText,
  onChangeSubmissionText,
  selectedFiles = [],
  onChangeFiles,
  isSubmitDisabled,
  submitting,
  canResubmit,
  onSubmit,
  onBackToAssignments,
  onBackToLearnCourse,
}) {
  return (
    <div className="assignment-page__form-card">
      <div className="assignment-page__form-header">
        <div>
          <div className="assignment-page__section-title">
            {currentSubmission ? "Nộp lại bài tập" : "Nộp bài tập"}
          </div>
          <div className="assignment-page__form-help">
            {currentSubmission
              ? assignment?.allowResubmit
                ? "Bạn có thể cập nhật bài nộp mới."
                : "Bài tập này không cho phép nộp lại."
              : "Điền nội dung bài làm hoặc chọn file thật để nộp."}
          </div>
        </div>
      </div>

      <div className="assignment-form__field">
        <label className="assignment-form__label">Submission Text</label>
        <textarea
          className="assignment-form__textarea"
          rows={8}
          placeholder="Write your submission here..."
          value={submissionText}
          onChange={(event) => onChangeSubmissionText?.(event.target.value)}
          disabled={isSubmitDisabled}
        />
      </div>

      <div className="assignment-form__field">
        <label className="assignment-form__label">Upload Files</label>
        <input
          type="file"
          multiple
          onChange={(event) => {
            const files = Array.from(event.target.files || []);
            onChangeFiles?.(files);
          }}
          disabled={isSubmitDisabled}
          className="assignment-form__file-input"
        />

        {selectedFiles.length > 0 ? (
          <div className="assignment-page__selected-files">
            <AttachmentList items={selectedFiles} />
          </div>
        ) : null}
      </div>

      <div className="assignment-page__action-row">
        <Button
          type="button"
          onClick={onSubmit}
          loading={submitting}
          disabled={isSubmitDisabled}
        >
          {currentSubmission
            ? canResubmit
              ? "Resubmit Assignment"
              : "Already Submitted"
            : "Submit Assignment"}
        </Button>

        <button
          type="button"
          className="assignment-page__ghost-link assignment-page__ghost-link--small"
          onClick={onBackToAssignments}
        >
          Back to Assignments
        </button>

        <button
          type="button"
          className="assignment-page__ghost-link assignment-page__ghost-link--small"
          onClick={onBackToLearnCourse}
        >
          Back to Learn Course
        </button>
      </div>
    </div>
  );
}