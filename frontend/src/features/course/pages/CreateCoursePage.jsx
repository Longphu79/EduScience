import Toast from "../../../shared/components/Toast";
import CreateCourseHero from "../components/CreateCourseHero";
import CourseEditorForm from "../components/CourseEditorForm";
import useCreateCoursePage from "../hooks/useCreateCoursePage";
import "../styles/create-course-page.css";

export default function CreateCoursePage() {
    const {
        form,
        submitting,
        toast,
        shortDescriptionCount,
        setToast,
        handleChange,
        handleSubmit,
        navigate,
    } = useCreateCoursePage();

    return (
        <div className="create-course-page">
            {toast.message ? (
                <Toast
                    kind={toast.kind}
                    message={toast.message}
                    position="bottom-center"
                    onClose={() => setToast({ message: "", kind: "success" })}
                />
            ) : null}

            <CreateCourseHero onBack={() => navigate("/instructor/courses")} />

            <CourseEditorForm
                form={form}
                shortDescriptionCount={shortDescriptionCount}
                pageClass="create-course-page"
                submitLabel="Create Course"
                submitLoadingLabel="Creating..."
                submitting={submitting}
                deleting={false}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate("/instructor/courses")}
            />
        </div>
    );
}
