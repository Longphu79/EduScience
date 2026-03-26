import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import useCourseDetailPage from "../hooks/useCourseDetailPage";
import CourseDetailMainContent from "../components/CourseDetailMainContent";
import CourseDetailSidebar from "../components/CourseDetailSidebar";
import "../styles/course-detail-page.css";

export default function CourseDetailPage() {
    const {
        courseId,
        course,
        relatedCourses,
        loading,
        enrolling,
        addingToCart,
        isEnrolled,
        isInCart,
        reviews,
        materials,
        extraLoading,
        toast,
        isOwner,
        instructorName,
        instructorAvatar,
        displayLevel,
        displayPrice,
        originalPrice,
        previewVideoUrl,
        lessons,
        primaryButtonText,
        setToast,
        handlePrimaryAction,
        handleCreateReview,
    } = useCourseDetailPage();

    if (loading) {
        return (
            <div className="course-detail-page">
                <div className="course-detail-page__wrapper">
                    <div className="course-detail-page__main-card">
                        <div className="course-detail-page__main-content">
                            <h2>Loading course detail...</h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="course-detail-page">
                <div className="course-detail-page__wrapper">
                    <div className="course-detail-page__main-card">
                        <div className="course-detail-page__main-content">
                            <h2>Course not found.</h2>
                            <div className="course-detail-page__not-found-action">
                                <Link
                                    to="/courses"
                                    className="course-detail-page__link-btn"
                                >
                                    Back to Courses
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="course-detail-page">
            {toast.message ? (
                <Toast
                    kind={toast.kind}
                    message={toast.message}
                    position="bottom-center"
                    onClose={() => setToast({ message: "", kind: "success" })}
                />
            ) : null}

            <div className="course-detail-page__wrapper">
                <div className="course-detail-page__main-card">
                    <img
                        src={
                            course.thumbnail ||
                            "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
                        }
                        alt={course.title}
                        className="course-detail-page__main-image"
                    />

                    <CourseDetailMainContent
                        courseId={courseId}
                        course={course}
                        lessons={lessons}
                        reviews={reviews}
                        materials={materials}
                        relatedCourses={relatedCourses}
                        extraLoading={extraLoading}
                        isEnrolled={isEnrolled}
                        isOwner={isOwner}
                        instructorName={instructorName}
                        instructorAvatar={instructorAvatar}
                        previewVideoUrl={previewVideoUrl}
                        onCreateReview={handleCreateReview}
                    />
                </div>

                <CourseDetailSidebar
                    course={course}
                    lessons={lessons}
                    instructorName={instructorName}
                    instructorAvatar={instructorAvatar}
                    displayLevel={displayLevel}
                    displayPrice={displayPrice}
                    originalPrice={originalPrice}
                    isOwner={isOwner}
                    isEnrolled={isEnrolled}
                    isInCart={isInCart}
                    enrolling={enrolling}
                    addingToCart={addingToCart}
                    primaryButtonText={primaryButtonText}
                    onPrimaryAction={handlePrimaryAction}
                />
            </div>
        </div>
    );
}
