import { Link } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import EnrollmentPageHero from "../components/EnrollmentPageHero";
import EnrollmentStatCard from "../components/EnrollmentStatCard";
import StudentProgressFilters from "../components/StudentProgressFilters";
import StudentProgressTable from "../components/StudentProgressTable";
import useInstructorStudentsPage from "../hooks/useInstructorStudentsPage";
import "../styles/instructor-students-page.css";

export default function InstructorStudentsPage() {
  const pageClassName = "instructor-students-page";
  const {
    courseId,
    loading,
    normalizedStudents,
    filteredStudents,
    search,
    setSearch,
    sortBy,
    setSortBy,
    stats,
    toast,
    setToast,
    loadStudents,
  } = useInstructorStudentsPage();

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
        eyebrow="Course Students"
        title="Danh sách học viên"
        description="Theo dõi học viên đã ghi danh, mức độ học tập và truy cập nhanh vào trang chi tiết từng học viên."
        pageClassName={pageClassName}
        actions={
          <>
            <button
              type="button"
              onClick={loadStudents}
              className={`${pageClassName}__refresh-btn`}
            >
              Refresh
            </button>

            <Link to="/instructor/courses">
              <Button type="button">Về instructor courses</Button>
            </Link>
          </>
        }
      />

      <div className={`${pageClassName}__stats`}>
        <EnrollmentStatCard
          title="Total students"
          value={stats.totalStudents}
          subtitle="Tổng số học viên đã enroll"
          tone="indigo"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          title="Average progress"
          value={`${stats.averageProgress}%`}
          subtitle="Trung bình tiến độ toàn lớp"
          tone="amber"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          title="Active students"
          value={stats.activeStudents}
          subtitle="Đã bắt đầu học"
          tone="emerald"
          pageClassName={pageClassName}
        />
        <EnrollmentStatCard
          title="80%+ progress"
          value={stats.highProgressStudents}
          subtitle={`${stats.completedStudents} học viên đã hoàn thành`}
          tone="rose"
          pageClassName={pageClassName}
        />
      </div>

      <StudentProgressFilters
        search={search}
        sortBy={sortBy}
        onSearchChange={setSearch}
        onSortChange={setSortBy}
        pageClassName={pageClassName}
      />

      {loading ? (
        <div className={`${pageClassName}__state-card`}>
          Đang tải danh sách học viên...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className={`${pageClassName}__empty-card`}>
          <div className={`${pageClassName}__empty-title`}>
            {normalizedStudents.length === 0
              ? "Chưa có học viên"
              : "Không tìm thấy học viên phù hợp"}
          </div>
          <p className={`${pageClassName}__empty-text`}>
            {normalizedStudents.length === 0
              ? "Khi có học viên enroll khóa học, danh sách sẽ hiển thị tại đây."
              : "Thử đổi từ khóa tìm kiếm hoặc cách sắp xếp."}
          </p>
        </div>
      ) : (
        <>
          <div className={`${pageClassName}__desktop-table`}>
            <StudentProgressTable
              students={filteredStudents}
              courseId={courseId}
              pageClassName={pageClassName}
            />
          </div>

          <div className={`${pageClassName}__mobile-table`}>
            <StudentProgressTable
              students={filteredStudents}
              courseId={courseId}
              compact
              pageClassName={pageClassName}
            />
          </div>
        </>
      )}
    </div>
  );
}