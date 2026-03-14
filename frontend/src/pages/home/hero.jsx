import {
  Play,
  Brain,
  Zap,
  BarChart3,
  GraduationCap,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_26%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_55%,#eef2ff_100%)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Brain className="h-4 w-4" />
            Smart Online Learning Platform
          </div>

          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            Learn anytime.
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              {" "}
              Build real skills.
            </span>
            <br />
            Grow with confidence.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Access structured online courses, practical assessments, learning
            progress tracking, and modern academic workflows designed for both
            students and instructors.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/courses"
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-[0_18px_40px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5"
            >
              <Zap className="h-4 w-4" />
              Start Learning Now
            </Link>

            <Link
              to="/features"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Play className="h-4 w-4" />
              Explore Features
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-2xl font-black text-slate-950">6+</div>
              <div className="text-sm text-slate-500">Learning modules</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-2xl font-black text-slate-950">Real-time</div>
              <div className="text-sm text-slate-500">Progress visibility</div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="text-2xl font-black text-slate-950">Modern</div>
              <div className="text-sm text-slate-500">Instructor workflows</div>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {[
              "Learn at your own pace",
              "Lessons, materials, quizzes, assignments",
              "Track performance and progress clearly",
              "Certificates for course completion",
            ].map((item) => (
              <div
                key={item}
                className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 text-sm font-medium text-slate-700 shadow-sm"
              >
                ✓ {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-slate-950">
              Student Learning Flow
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              Structured courses with lesson progress, quiz attempts, assignment
              submissions, and smoother continuation across modules.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:mt-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
              <BarChart3 className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-2xl font-bold text-slate-950">
              Instructor Dashboard
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              Manage lessons, materials, quizzes, assignments, students, and
              analytics with a cleaner teaching workflow.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-violet-600">
              EduScience
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-950">
              Practical digital learning ecosystem
            </h3>
            <p className="mt-3 leading-7 text-slate-600">
              More than course browsing — this is a connected environment for
              teaching, learning, tracking, and growth.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-gradient-to-r from-slate-950 to-slate-900 p-6 text-white shadow-[0_20px_60px_rgba(15,23,42,0.12)] sm:mt-10">
            <div className="text-sm font-bold uppercase tracking-[0.18em] text-violet-300">
              Platform Vision
            </div>
            <h3 className="mt-4 text-2xl font-bold">
              Built for professional and modern online education
            </h3>
            <p className="mt-3 leading-7 text-slate-300">
              Clean UI, real data, structured modules, and measurable learning
              outcomes for both students and instructors.
            </p>

            <Link
              to="/courses"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              Explore the catalog
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}   