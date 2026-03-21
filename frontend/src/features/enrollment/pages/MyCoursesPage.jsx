import { useNavigate } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import EnrollmentPageHero from "../components/EnrollmentPageHero";
import MyCourseCard from "../components/MyCourseCard";
import useMyCoursesPage from "../hooks/useMyCoursesPage";
import "../styles/my-courses-page.css";

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const pageClassName = "my-courses-page";
  const {
    loading,
    courses,
    filteredCourses,
    search,
    setSearch,
    toast,
    setToast,
  } = useMyCoursesPage();

  if (loading) {
    return (
      <div className={pageClassName}>
        <div className={`${pageClassName}__state-card`}>
          Đang tải khóa học...
        </div>
      </div>
    );
  }

  const hasCourses = courses.length > 0;
  const hasFilteredCourses = filteredCourses.length > 0;

  return (
    <div className={pageClassName}>
      {toast.message ? (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <EnrollmentPageHero
        eyebrow="Student Learning"
        title="Khóa học của tôi"
        description="Tiếp tục học các khóa bạn đã đăng ký và theo dõi tiến độ của mình."
        pageClassName={pageClassName}
        actions={
          <>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm khóa học..."
              className={`${pageClassName}__input`}
            />

            <Button type="button" onClick={() => navigate("/dashboard/student")}>
              Dashboard
            </Button>
          </>
        }
      />

      {!hasCourses ? (
        <div className={`${pageClassName}__empty-card`}>
          <p className={`${pageClassName}__empty-text`}>
            Bạn chưa có khóa học nào.
          </p>
          <div className={`${pageClassName}__empty-actions`}>
            <Button type="button" onClick={() => navigate("/courses")}>
              Khám phá khóa học
            </Button>
          </div>
        </div>
      ) : !hasFilteredCourses ? (
        <div className={`${pageClassName}__empty-card`}>
          <p className={`${pageClassName}__empty-text`}>
            Không tìm thấy khóa học phù hợp với từ khóa tìm kiếm.
          </p>
          <div className={`${pageClassName}__empty-actions`}>
            <Button type="button" onClick={() => setSearch("")}>
              Xóa tìm kiếm
            </Button>
          </div>
        </div>
      ) : (
        <div className={`${pageClassName}__course-grid`}>
          {filteredCourses.map((item, index) => (
            <MyCourseCard
              key={item?._id || item?.id || item?.enrollmentId || index}
              item={item}
              pageClassName={pageClassName}
            />
          ))}
        </div>
      )}
    </div>
  );
}