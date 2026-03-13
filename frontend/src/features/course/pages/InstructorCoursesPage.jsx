import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import {
  getInstructorCourses,
  deleteCourse,
} from "../services/course.service";
import { useAuth } from "../../auth/state/useAuth";

function sumBy(courses = [], key) {
  return courses.reduce(
    (sum, item) => sum + (Number(item?.analytics?.[key]) || 0),
    0
  );
}

function getSafeImage(url) {
  if (!url || typeof url !== "string") return null;

  const trimmed = url.trim();

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  return null;
}

const FALLBACK_COURSE_IMAGE =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

export default function InstructorCoursesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const instructorId = useMemo(() => {
    return user?._id || user?.id || user?.userId || null;
  }, [user]);

  const fetchInstructorCourses = async () => {
    try {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      if (!instructorId) {
        setLoading(false);
        setToast({
          message: "Instructor id not found. Please login again.",
          kind: "error",
        });
        return;
      }

      setLoading(true);

      const data = await getInstructorCourses(instructorId);
      const payload = Array.isArray(data) ? data : data?.data || [];
      setCourses(payload);
    } catch (error) {
      console.error("INSTRUCTOR COURSES ERROR:", error);
      setToast({
        message: error.message || "Failed to load instructor courses",
        kind: "error",
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructorCourses();
  }, [isAuthenticated, instructorId]);

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return courses;

    return courses.filter((course) => {
      const title = course.title?.toLowerCase() || "";
      const category = course.category?.toLowerCase() || "";
      const description =
        course.shortDescription?.toLowerCase() ||
        course.description?.toLowerCase() ||
        "";

      return (
        title.includes(keyword) ||
        category.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [courses, search]);

  const dashboard = useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = sumBy(courses, "totalStudents");
    const totalQuizAttempts = sumBy(courses, "totalQuizAttempts");
    const totalAssignmentSubmissions = sumBy(
      courses,
      "totalAssignmentSubmissions"
    );

    const averageProgress = totalCourses
      ? Math.round(sumBy(courses, "averageProgress") / totalCourses)
      : 0;

    return {
      totalCourses,
      totalStudents,
      totalQuizAttempts,
      totalAssignmentSubmissions,
      averageProgress,
    };
  }, [courses]);

  const handleDeleteCourse = async (courseId, courseTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${courseTitle}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(courseId);
      await deleteCourse(courseId);

      setCourses((prev) => prev.filter((item) => item._id !== courseId));

      setToast({
        message: "Course deleted successfully",
        kind: "success",
      });
    } catch (error) {
      console.error("DELETE COURSE ERROR:", error);
      setToast({
        message: error.message || "Failed to delete course",
        kind: "error",
      });
    } finally {
      setDeletingId("");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Toast
          kind={toast.kind}
          message={toast.message}
          onClose={() => setToast({ message: "", kind: "success" })}
        />

        <section className="mx-auto max-w-7xl px-4 py-16">
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
              Instructor Dashboard
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
              Instructor Courses
            </h1>

            <p className="mt-4 text-slate-600">
              Please login to manage and view your teaching courses.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button onClick={() => navigate("/login")}>Login Now</Button>

              <Link
                to="/courses"
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toast
        kind={toast.kind}
        message={toast.message}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
              Instructor Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
              My Teaching Courses
            </h1>
            <p className="mt-3 text-slate-500">
              Manage your created courses and monitor learning engagement.
            </p>
          </div>

          <Link
            to="/instructor/courses/create"
            className="inline-flex items-center rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-4 font-semibold text-white shadow-sm"
          >
            Create Course
          </Link>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Courses</p>
            <p className="text-2xl font-black text-slate-950">
              {dashboard.totalCourses}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Students</p>
            <p className="text-2xl font-black text-slate-950">
              {dashboard.totalStudents}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-slate-500">Quiz Attempts</p>
            <p className="text-2xl font-black text-slate-950">
              {dashboard.totalQuizAttempts}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-slate-500">Assignment Submissions</p>
            <p className="text-2xl font-black text-slate-950">
              {dashboard.totalAssignmentSubmissions}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-slate-500">Avg Progress</p>
            <p className="text-2xl font-black text-slate-950">
              {dashboard.averageProgress}%
            </p>
          </div>
        </div>

        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, category, description..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-violet-500"
          />
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Loading courses...
            </h2>
          </div>
        ) : !filteredCourses.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              {courses.length
                ? "No matching courses found"
                : "No teaching courses found"}
            </h2>
            <p className="mt-3 text-slate-500">
              {courses.length
                ? "Try a different keyword."
                : "You have not created any course yet."}
            </p>

            {!courses.length ? (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/instructor/courses/create"
                  className="inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 font-semibold text-white"
                >
                  Create Your First Course
                </Link>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCourses.map((course) => (
              <div
                key={course._id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={getSafeImage(course.thumbnail) || FALLBACK_COURSE_IMAGE}
                    alt={course.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_COURSE_IMAGE;
                    }}
                  />
                </div>

                <div className="p-6">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">
                      {course.category || "General"}
                    </span>

                    <span className="text-sm font-semibold capitalize text-slate-500">
                      {course.status || "draft"}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold leading-tight text-slate-950">
                    {course.title}
                  </h3>

                  <p className="mt-3 line-clamp-3 text-slate-600">
                    {course.shortDescription || course.description}
                  </p>

                  <div className="mt-5 grid grid-cols-3 gap-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <span>📘 {course.analytics?.totalLessons || 0}</span>
                    <span>⏱ {course.duration || 0}m</span>
                    <span>👨‍🎓 {course.analytics?.totalStudents || 0}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                      Materials: {course.analytics?.totalMaterials || 0}
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                      Quizzes: {course.analytics?.totalQuizzes || 0}
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                      Assignments: {course.analytics?.totalAssignments || 0}
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                      Quiz Attempts: {course.analytics?.totalQuizAttempts || 0}
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                      Avg Score: {course.analytics?.averageQuizScore || 0}
                    </div>
                    <div className="rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                      Pass Rate: {course.analytics?.quizPassRate || 0}%
                    </div>
                    <div className="col-span-2 rounded-xl bg-slate-50 px-3 py-2 text-slate-700">
                      Assignment Submissions:{" "}
                      {course.analytics?.totalAssignmentSubmissions || 0}
                    </div>
                    <div className="col-span-2 rounded-xl bg-indigo-50 px-3 py-2 font-semibold text-indigo-700">
                      Avg Progress: {course.analytics?.averageProgress || 0}%
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <Link
                      to={`/courses/${course._id}`}
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-center font-semibold text-white"
                    >
                      View Detail
                    </Link>

                    <Link
                      to={`/instructor/courses/${course._id}/edit`}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </Link>

                    <Link
                      to={`/instructor/courses/${course._id}/lessons`}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Lessons
                    </Link>

                    <Link
                      to={`/instructor/courses/${course._id}/materials`}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Materials
                    </Link>

                    <Link
                      to={`/instructor/courses/${course._id}/quizzes`}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Quizzes
                    </Link>

                    <Link
                      to={`/instructor/courses/${course._id}/assignments`}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Assignments
                    </Link>

                    <Link
                      to={`/instructor/courses/${course._id}/students`}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Students
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteCourse(course._id, course.title)
                      }
                      disabled={deletingId === course._id}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-60"
                    >
                      {deletingId === course._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}