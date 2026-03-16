import { Link } from "react-router-dom";
import { CourseCard } from "../../shared/components/courseCard.jsx";

export function PopularCourses({ courses = [], loading = false }) {
  return (
    <section className="bg-white py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Popular Courses
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              Discover the courses learners are exploring most
            </h2>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Explore high-quality courses with real content, structured
              lessons, and measurable learning outcomes.
            </p>
          </div>

          <Link
            to="/courses"
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View all courses
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[420px] animate-pulse rounded-[24px] border border-slate-200 bg-slate-100"
              />
            ))}
          </div>
        ) : !courses.length ? (
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-10 text-center">
            <h3 className="text-2xl font-bold text-slate-900">
              No popular courses yet
            </h3>
            <p className="mt-3 text-slate-500">
              Published and popular courses will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}