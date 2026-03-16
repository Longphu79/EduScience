import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { getMyCourses } from "../services/enrollment.service";
import { useAuth } from "../../auth/state/useAuth";

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        if (!isAuthenticated) {
          setCourses([]);
          setLoading(false);
          return;
        }

        const studentId = user?._id || user?.id || user?.userId;

        if (!studentId) {
          throw new Error("Student id not found");
        }

        setLoading(true);

        const response = await getMyCourses(studentId);
        const data = response?.data?.data || response?.data || response || [];
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        setToast({
          show: true,
          message:
            error?.response?.data?.message ||
            error?.message ||
            "Không tải được khóa học của bạn",
          type: "error",
        });
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, [user, isAuthenticated]);

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return courses;

    return courses.filter((item) => {
      const course = item.courseId || item.course || item;
      const title = course?.title || "";
      return title.toLowerCase().includes(keyword);
    });
  }, [courses, search]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p>Đang tải khóa học...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />
      )}

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Khóa học của tôi</h1>
          <p className="text-slate-600">
            Tiếp tục học các khóa bạn đã đăng ký
          </p>
        </div>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm khóa học..."
          className="w-full rounded-xl border border-slate-300 px-4 py-2 md:w-80"
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="text-slate-600">Bạn chưa có khóa học nào.</p>
          <div className="mt-4">
            <Button onClick={() => navigate("/courses")}>
              Khám phá khóa học
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredCourses.map((item) => {
            const course = item.courseId || item.course || item;
            const progress = Number(item.progress || 0);

            return (
              <div
                key={item._id || course?._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <img
                  src={
                    course?.thumbnail ||
                    "https://placehold.co/600x350?text=Course"
                  }
                  alt={course?.title || "Course"}
                  className="h-44 w-full rounded-xl object-cover"
                />

                <div className="mt-4 space-y-2">
                  <h2 className="line-clamp-2 text-lg font-semibold text-slate-900">
                    {course?.title || "Khóa học"}
                  </h2>

                  <p className="text-sm text-slate-600">
                    Tiến độ: {progress}%
                  </p>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="pt-3 flex flex-wrap gap-2">
                    <Link
                      to={`/learn/${course?._id}`}
                      className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-white"
                    >
                      Tiếp tục học
                    </Link>

                    {progress >= 100 ? (
                      <Link
                        to={`/learn/${course?._id}/certificate`}
                        className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-white"
                      >
                        Certificate
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}