import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Toast from "../../shared/components/Toast";
import Button from "../../shared/components/Button";
import { getInstructorCourses } from "../../services/course.service";
import { useAuth } from "../../features/auth/state/useAuth";

export default function InstructorCoursesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  useEffect(() => {
    const fetchInstructorCourses = async () => {
      try {
        if (!isAuthenticated || !(user?._id || user?.id)) {
          setLoading(false);
          return;
        }

        setLoading(true);

        const instructorId = user._id || user.id;
        const data = await getInstructorCourses(instructorId);

        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setToast({
          message: error.message || "Failed to load instructor courses",
          kind: "error",
        });
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInstructorCourses();
  }, [isAuthenticated, user]);

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

          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Courses</p>
            <p className="text-2xl font-black text-slate-950">
              {courses.length}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              Loading instructor courses...
            </h2>
            <p className="mt-3 text-slate-500">
              Please wait while we fetch your courses.
            </p>
          </div>
        ) : !courses.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900">
              No teaching courses found
            </h2>
            <p className="mt-3 text-slate-500">
              You have not created any course yet.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/courses"
                className="inline-flex rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-3 font-semibold text-white"
              >
                Browse Public Courses
              </Link>

              <Link
                to="/"
                className="inline-flex rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course._id}
                className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={
                      course.thumbnail ||
                      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
                    }
                    alt={course.title}
                    className="h-full w-full object-cover"
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
                    <span>📘 {course.totalLessons || 0}</span>
                    <span>⏱ {course.duration || 0}m</span>
                    <span>👨‍🎓 {course.totalEnrollments || 0}</span>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Link
                      to={`/courses/${course._id}`}
                      className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-center font-semibold text-white"
                    >
                      View Detail
                    </Link>
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