import { Hero } from "./hero.jsx";
import { FeaturesPreview } from "./features.jsx";
import { PopularCourses } from "./popularcourses.jsx";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileCheck,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { getPopularCourses } from "../../features/course/services/course.service.js";

const quickHighlights = [
  {
    icon: BookOpen,
    title: "Structured Courses",
    description:
      "Well-organized learning content with lessons, materials, quizzes, and assignments.",
  },
  {
    icon: TrendingUp,
    title: "Visible Progress",
    description:
      "Track completion rate, learning momentum, and assessment performance more clearly.",
  },
  {
    icon: LayoutDashboard,
    title: "Instructor Workflow",
    description:
      "Manage students, lessons, assessments, and course performance from one dashboard.",
  },
];

const outcomes = [
  "Practical course structure",
  "Modern digital learning experience",
  "Assessment-driven progress",
  "Cleaner teaching workflow",
];

function Home() {
  const [courses, setCourses] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);

  useEffect(() => {
    async function loadPopularCourses() {
      try {
        setLoadingPopular(true);
        const data = await getPopularCourses();
        const payload = Array.isArray(data) ? data : data?.data || [];
        setCourses(payload);
      } catch (err) {
        console.error("LOAD POPULAR COURSES ERROR:", err);
        setCourses([]);
      } finally {
        setLoadingPopular(false);
      }
    }

    loadPopularCourses();
  }, []);

  const platformStats = useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = courses.reduce(
      (sum, item) => sum + (Number(item?.totalEnrollments) || 0),
      0
    );
    const avgRating = totalCourses
      ? (
          courses.reduce((sum, item) => sum + (Number(item?.rating) || 0), 0) /
          totalCourses
        ).toFixed(1)
      : "0.0";

    return { totalCourses, totalStudents, avgRating };
  }, [courses]);

  return (
    <div className="bg-slate-50">
      <Hero />

      <section className="-mt-4 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-500">
                Available courses
              </div>
              <div className="mt-2 text-3xl font-black text-slate-950">
                {platformStats.totalCourses}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-500">
                Enrollments in popular catalog
              </div>
              <div className="mt-2 text-3xl font-black text-slate-950">
                {platformStats.totalStudents}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold text-slate-500">
                Average rating
              </div>
              <div className="mt-2 text-3xl font-black text-slate-950">
                {platformStats.avgRating}
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturesPreview />

      <section className="py-20 lg:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
          <div>
            <div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
              Platform value
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              A better academic experience for both learning and teaching
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              EduScience is not only a place to browse courses. It is a learning
              environment where students can progress with structure and
              instructors can manage teaching activities more effectively.
            </p>

            <div className="mt-8 space-y-4">
              {outcomes.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-violet-600" />
                  <span className="text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/aboutus"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Learn More
              </Link>
            </div>
          </div>

          <div className="grid gap-6">
            {quickHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Icon className="h-7 w-7 text-slate-900" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-950">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-8 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PopularCourses courses={courses} loading={loadingPopular} />

      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <GraduationCap className="h-7 w-7 text-slate-900" />
              </div>
              <h3 className="text-2xl font-black text-slate-950">
                For students
              </h3>
              <p className="mt-3 leading-8 text-slate-600">
                Learn from structured lessons, complete quizzes and assignments,
                access materials, and keep your progress visible across the full
                course journey.
              </p>
              <div className="mt-6">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 font-semibold text-violet-700"
                >
                  Start learning
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Users className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-black">For instructors</h3>
              <p className="mt-3 leading-8 text-slate-300">
                Build courses, manage lessons, review student work, inspect quiz
                attempts, and run digital teaching workflows in a cleaner way.
              </p>
              <div className="mt-6">
                <Link
                  to="/instructor/courses/create"
                  className="inline-flex items-center gap-2 font-semibold text-violet-300"
                >
                  Create a course
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white py-20 lg:py-24">
        <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            <Sparkles className="h-4 w-4" />
            Ready to grow with EduScience?
          </div>

          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Build stronger skills with a cleaner and more modern learning experience
          </h2>

          <p className="mt-5 text-lg leading-8 text-slate-600">
            Explore the course catalog, discover structured learning journeys,
            and study with a platform designed for progress and clarity.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5"
            >
              Browse Courses
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/features"
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Features
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;