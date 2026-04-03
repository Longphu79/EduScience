import React from "react";
import Toast from "../../../shared/components/Toast";
import LessonFormCard from "../components/LessonFormCard";
import LessonHeader from "../components/LessonHeader";
import LessonListCard from "../components/LessonListCard";
import LessonPreviewCard from "../components/LessonPreviewCard";
import LessonStatCard from "../components/LessonStatCard";
import useInstructorLessonManagePage from "../hooks/useInstructorLessonManagePage";
import { uploadLessonVideo } from "../services/lesson.service";
import "../styles/instructor-lesson-manage-page.css";

export default function InstructorLessonManagePage() {
    const pageClassName = "instructor-lesson-manage-page";

    const {
        courseId,
        course,
        lessons,
        loading,
        saving,
        setSaving,
        deletingId,
        editingLessonId,
        form,
        setForm, // Lấy setForm ra để cập nhật URL video trực tiếp
        toast,
        setToast,
        stats,
        handleChange,
        handleEdit,
        handleSubmit,
        handleDelete,
        resetForm,
    } = useInstructorLessonManagePage();

    // --- LOGIC UPLOAD VIDEO ---
    const handleVideoUpload = async (file) => {
        if (!file) return;

        try {
            setSaving(true);
            setToast({
                message: "Uploading video to Cloud R2...",
                kind: "info",
            });

            // 1. Gọi service upload file
            const data = await uploadLessonVideo(file);

            // 2. Cập nhật URL trả về vào state form
            setForm((prev) => ({
                ...prev,
                videoUrl: data.url,
            }));

            setToast({
                message: "Video uploaded successfully!",
                kind: "success",
            });
        } catch (error) {
            setToast({
                message: error.message || "Upload failed",
                kind: "error",
            });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className={pageClassName}>
                <div className={`${pageClassName}__loading`}>
                    <h1 className={`${pageClassName}__loading-title`}>
                        Loading lessons...
                    </h1>
                    <p className={`${pageClassName}__loading-text`}>
                        Please wait...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={pageClassName}>
            {toast.message ? (
                <Toast
                    kind={toast.kind}
                    message={toast.message}
                    onClose={() => setToast({ message: "", kind: "success" })}
                />
            ) : null}

            <LessonHeader
                courseId={courseId}
                courseTitle={course?.title}
                pageClassName={pageClassName}
            />

            <section className={`${pageClassName}__stats`}>
                <LessonStatCard
                    label="Total lessons"
                    value={stats.totalLessons}
                    tone="indigo"
                    pageClassName={pageClassName}
                />
                <LessonStatCard
                    label="Published"
                    value={stats.publishedLessons}
                    tone="emerald"
                    pageClassName={pageClassName}
                />
                <LessonStatCard
                    label="Preview lessons"
                    value={stats.previewLessons}
                    tone="amber"
                    pageClassName={pageClassName}
                />
                <LessonStatCard
                    label="Total duration"
                    value={stats.totalDurationLabel}
                    tone="rose"
                    pageClassName={pageClassName}
                />
            </section>

            <div className={`${pageClassName}__content`}>
                <div className={`${pageClassName}__left`}>
                    <LessonFormCard
                        form={form}
                        editingLessonId={editingLessonId}
                        saving={saving}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onReset={resetForm}
                        onVideoUpload={handleVideoUpload} // Truyền hàm xử lý file xuống Form
                        pageClassName={pageClassName}
                    />
                    <LessonPreviewCard
                        form={form}
                        pageClassName={pageClassName}
                    />
                </div>

                <LessonListCard
                    lessons={lessons}
                    deletingId={deletingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    pageClassName={pageClassName}
                />
            </div>
        </div>
    );
}
