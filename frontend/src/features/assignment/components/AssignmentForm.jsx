import Button from "../../../shared/components/Button";
import AttachmentList from "./AttachmentList";
import {
  getMinDueDateTimeValue,
} from "../utils/assignment.helpers";
import "../styles/assignment-components.css";

export default function AssignmentForm({
  form,
  editingId,
  saving,
  keptAttachmentUrls = [],
  selectedAttachmentFiles = [],
  onChange,
  onSubmit,
  onReset,
  onRemoveKeptAttachment,
  onAddFiles,
  onRemoveSelectedFile,
}) {
  return (
    <form onSubmit={onSubmit} className="assignment-form assignment-form--card">
      <div className="assignment-form__topbar">
        <div>
          <div className="assignment-form__eyebrow">Assignment Form</div>
          <h2 className="assignment-form__title">
            {editingId ? "Edit Assignment" : "Create Assignment"}
          </h2>
          <p className="assignment-form__subtitle">
            Thiết lập bài tập với tiêu đề, mô tả, hạn nộp, điểm tối đa và file
            đính kèm theo bố cục rõ ràng, hiện đại và chuyên nghiệp.
          </p>
        </div>

        {editingId ? (
          <button
            type="button"
            onClick={onReset}
            className="assignment-form__cancel-pill"
          >
            Cancel edit
          </button>
        ) : null}
      </div>

      <div className="assignment-form__grid">
        <div className="assignment-form__field">
          <label className="assignment-form__label">Assignment title</label>
          <input
            type="text"
            className="assignment-form__input"
            placeholder="Nhập tiêu đề bài tập"
            value={form.title}
            onChange={(event) => onChange("title", event.target.value)}
          />
        </div>

        <div className="assignment-form__field">
          <label className="assignment-form__label">Description</label>
          <textarea
            rows={5}
            className="assignment-form__textarea"
            placeholder="Nhập mô tả bài tập"
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
          />
        </div>

        <div className="assignment-form__row assignment-form__row--two">
          <div className="assignment-form__field">
            <label className="assignment-form__label">Due date</label>
            <input
              type="datetime-local"
              className="assignment-form__input"
              value={form.dueDate}
              min={getMinDueDateTimeValue()}
              onChange={(event) => onChange("dueDate", event.target.value)}
            />
          </div>

          <div className="assignment-form__field">
            <label className="assignment-form__label">Max score</label>
            <input
              type="number"
              min="0"
              className="assignment-form__input"
              value={form.maxScore}
              onChange={(event) => onChange("maxScore", event.target.value)}
            />
          </div>
        </div>

        <div className="assignment-form__checkbox-group">
          <label className="assignment-form__checkbox-item">
            <input
              type="checkbox"
              checked={form.allowResubmit}
              onChange={(event) =>
                onChange("allowResubmit", event.target.checked)
              }
            />
            <span>Allow resubmit</span>
          </label>

          <label className="assignment-form__checkbox-item">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(event) => onChange("isPublished", event.target.checked)}
            />
            <span>Published</span>
          </label>
        </div>

        {editingId && keptAttachmentUrls.length > 0 ? (
          <div className="assignment-form__field">
            <label className="assignment-form__label">Current attachments</label>
            <AttachmentList
              items={keptAttachmentUrls}
              removable
              onRemove={onRemoveKeptAttachment}
              fallbackPrefix="Attachment"
            />
          </div>
        ) : null}

        <div className="assignment-form__field">
          <label className="assignment-form__label">Upload attachment files</label>
          <input
            type="file"
            multiple
            onChange={(event) =>
              onAddFiles(Array.from(event.target.files || []))
            }
            className="assignment-form__file-input"
          />

          {selectedAttachmentFiles.length > 0 ? (
            <div className="assignment-form__file-list">
              <AttachmentList
                items={selectedAttachmentFiles}
                removable
                onRemove={(_, index) => onRemoveSelectedFile(index)}
              />
            </div>
          ) : null}

          <p className="assignment-form__hint">
            Hạn nộp không được ở quá khứ. Khi sửa assignment, bạn có thể xóa file
            cũ hoặc thêm file mới.
          </p>
        </div>
      </div>

      <div className="assignment-form__actions">
        <Button type="submit" loading={saving}>
          {editingId ? "Update Assignment" : "Save Assignment"}
        </Button>

        {editingId ? (
          <Button type="button" onClick={onReset}>
            Reset
          </Button>
        ) : null}
      </div>
    </form>
  );
}