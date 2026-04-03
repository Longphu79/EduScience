import React from "react";
import Button from "../../../shared/components/Button";
import LessonSectionCard from "./LessonSectionCard";
import LessonField from "./LessonField";

export default function LessonFormCard({
    form,
    editingLessonId,
    saving,
    onChange,
    onSubmit,
    onReset,
    // Thêm prop này từ Page truyền xuống
    onVideoUpload,
    pageClassName = "",
}) {
    return (
        <LessonSectionCard
            title={editingLessonId ? "Edit Lesson" : "Add Lesson"}
            description="Tạo mới hoặc cập nhật bài học cho khóa học."
            pageClassName={pageClassName}
            action={
                editingLessonId ? (
                    <button
                        type="button"
                        onClick={onReset}
                        className={`${pageClassName}__ghost-btn`}
                    >
                        Cancel Edit
                    </button>
                ) : null
            }
        >
            <form onSubmit={onSubmit} className={`${pageClassName}__form`}>
                <LessonField label="Lesson Title" pageClassName={pageClassName}>
                    <input
                        name="title"
                        value={form.title}
                        onChange={onChange}
                        className={`${pageClassName}__input`}
                        placeholder="Enter lesson title"
                    />
                </LessonField>

                <LessonField label="Description" pageClassName={pageClassName}>
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={onChange}
                        rows={4}
                        className={`${pageClassName}__input ${pageClassName}__textarea`}
                        placeholder="Enter lesson description"
                    />
                </LessonField>

                {/* --- PHẦN VIDEO: KẾT HỢP URL VÀ UPLOAD --- */}
                <LessonField
                    label="Video Content"
                    hint="Supports YouTube URL or Direct Cloud Video"
                    pageClassName={pageClassName}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        {/* Nhập URL thủ công */}
                        <input
                            name="videoUrl"
                            value={form.videoUrl}
                            onChange={onChange}
                            className={`${pageClassName}__input`}
                            placeholder="https://youtube.com/watch?v=... hoặc link video"
                        />

                        <div
                            style={{
                                textAlign: "center",
                                fontSize: "12px",
                                color: "#94a3b8",
                                margin: "4px 0",
                            }}
                        >
                            — OR —
                        </div>

                        {/* Tải file trực tiếp lên Cloud */}
                        <div className="video-upload-zone">
                            <input
                                type="file"
                                id="lesson-video-file"
                                accept="video/*"
                                hidden
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file && onVideoUpload) {
                                        onVideoUpload(file);
                                    }
                                }}
                                disabled={saving}
                            />
                            <label
                                htmlFor="lesson-video-file"
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: "12px",
                                    border: "2px dashed #e2e8f0",
                                    borderRadius: "12px",
                                    cursor: saving ? "not-allowed" : "pointer",
                                    backgroundColor: "#f8fafc",
                                    transition: "all 0.2s",
                                }}
                                onMouseOver={(e) =>
                                    (e.target.style.borderColor = "#cbd5e1")
                                }
                                onMouseOut={(e) =>
                                    (e.target.style.borderColor = "#e2e8f0")
                                }
                            >
                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: "600",
                                        color: "#475569",
                                    }}
                                >
                                    {saving
                                        ? "🔄 System processing..."
                                        : "📁 Click to upload video to Cloud R2"}
                                </span>
                            </label>
                        </div>
                    </div>
                </LessonField>

                <LessonField
                    label="Material URL"
                    hint="Optional lesson material link"
                    pageClassName={pageClassName}
                >
                    <input
                        name="materialUrl"
                        value={form.materialUrl}
                        onChange={onChange}
                        className={`${pageClassName}__input`}
                        placeholder="Optional material link"
                    />
                </LessonField>

                <div className={`${pageClassName}__form-grid`}>
                    <LessonField
                        label="Duration (minutes)"
                        pageClassName={pageClassName}
                    >
                        <input
                            type="number"
                            min="0"
                            name="duration"
                            value={form.duration}
                            onChange={onChange}
                            className={`${pageClassName}__input`}
                        />
                    </LessonField>

                    <LessonField label="Order" pageClassName={pageClassName}>
                        <input
                            type="number"
                            min="1"
                            name="order"
                            value={form.order}
                            onChange={onChange}
                            className={`${pageClassName}__input`}
                        />
                    </LessonField>
                </div>

                <div className={`${pageClassName}__checks`}>
                    <label className={`${pageClassName}__check`}>
                        <input
                            type="checkbox"
                            name="isPreview"
                            checked={form.isPreview}
                            onChange={onChange}
                        />
                        Preview lesson
                    </label>

                    <label className={`${pageClassName}__check`}>
                        <input
                            type="checkbox"
                            name="isPublished"
                            checked={form.isPublished}
                            onChange={onChange}
                        />
                        Published
                    </label>
                </div>

                <div>
                    <Button type="submit" disabled={saving}>
                        {saving
                            ? editingLessonId
                                ? "Saving..."
                                : "Creating..."
                            : editingLessonId
                              ? "Save Lesson"
                              : "Create Lesson"}
                    </Button>
                </div>
            </form>
        </LessonSectionCard>
    );
}
