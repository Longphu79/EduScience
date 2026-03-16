import React, { useState } from "react";

export default function AssignmentForm({ onSubmit, initialData = null }) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [maxScore, setMaxScore] = useState(initialData?.maxScore || 100);
  const [allowResubmit, setAllowResubmit] = useState(
    initialData?.allowResubmit ?? true
  );
  const [attachmentUrls, setAttachmentUrls] = useState(
    (initialData?.attachmentUrls || []).join(", ")
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      dueDate: dueDate || null,
      maxScore: Number(maxScore),
      allowResubmit,
      attachmentUrls: attachmentUrls
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Assignment title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <br />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <br />
      <input
        type="datetime-local"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      <br />
      <input
        type="number"
        value={maxScore}
        onChange={(e) => setMaxScore(e.target.value)}
      />
      <br />
      <label>
        <input
          type="checkbox"
          checked={allowResubmit}
          onChange={(e) => setAllowResubmit(e.target.checked)}
        />
        Allow resubmit
      </label>
      <br />
      <textarea
        placeholder="Attachment URLs separated by comma"
        value={attachmentUrls}
        onChange={(e) => setAttachmentUrls(e.target.value)}
      />
      <br />
      <button type="submit">Save Assignment</button>
    </form>
  );
}