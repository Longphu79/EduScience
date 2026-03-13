import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LayoutGrid,
  BarChart3,
  FileText,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    icon: BookOpen,
    title: "Structured courses",
    description:
      "Lessons, materials, quizzes, and assignments are organized into one learning flow.",
  },
  {
    icon: GraduationCap,
    title: "Clear learning progress",
    description:
      "Students can track completion, performance, and learning momentum more effectively.",
  },
  {
    icon: LayoutGrid,
    title: "Modern teaching workflow",
    description:
      "Instructors manage courses, students, and assessments with greater clarity and control.",
  },
  {
    icon: BarChart3,
    title: "Results and analytics",
    description:
      "Monitor quiz attempts, assignment results, pass rates, and overall student performance.",
  },
  {
    icon: FileText,
    title: "Learning materials",
    description:
      "Attach supporting documents, lesson resources, and references directly into each course.",
  },
  {
    icon: MessagesSquare,
    title: "Course discussion",
    description:
      "Enable communication and collaboration through dedicated course-based chat and discussion.",
  },
];

const highlights = [
  "Course creation and content management",
  "Lesson progression and completion tracking",
  "Quiz system with attempts and review",
  "Assignment submission and grading flow",
  "Material library for each course",
  "Instructor dashboard and student monitoring",
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_22%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_20%),linear-gradient(180deg,#ffffff_0%,#f8fafc_52%,#eef2ff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <Sparkles className="mr-2 h-4 w-4 text-violet-600" />
                EduScience Features
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                A cleaner, smarter way to
                <span className="block bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  learn, teach, and grow
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                EduScience provides a modern fullstack E-learning experience with
                structured lessons, quiz workflows, assignments, materials,
                progress tracking, and instructor management in one platform.
              </p>

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
                  About Us
                </Link>
              </div>

              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-violet-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
              <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-violet-200">
                Platform overview
              </div>

              <h2 className="mt-5 text-3xl font-black tracking-tight">
                Built to support both students and instructors
              </h2>

              <p className="mt-4 leading-8 text-slate-300">
                From discovering courses to managing student progress,
                EduScience combines academic structure and practical digital
                workflow into one cohesive learning ecosystem.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-2xl font-black">Lessons</div>
                  <div className="mt-2 text-sm text-slate-300">
                    Organized lesson flow with learning continuity
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-2xl font-black">Assessments</div>
                  <div className="mt-2 text-sm text-slate-300">
                    Quizzes and assignments with result tracking
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-2xl font-black">Materials</div>
                  <div className="mt-2 text-sm text-slate-300">
                    Resources and references linked to courses
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-2xl font-black">Dashboard</div>
                  <div className="mt-2 text-sm text-slate-300">
                    Instructor-focused management and analytics
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            Core capabilities
          </div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Everything needed for a modern online learning workflow
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            EduScience helps structure the full teaching and learning process,
            from course delivery to learner progress visibility.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
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
      </section>

      <section className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e3a8a_100%)] p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.20)] sm:p-10 lg:p-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-violet-200">
                  Ready to explore?
                </div>

                <h2 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">
                  Start learning with a platform designed for clarity and growth
                </h2>

                <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                  Browse courses, track progress, take quizzes, complete
                  assignments, and experience a more structured digital learning
                  journey with EduScience.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3.5 font-semibold text-white"
                >
                  Explore Courses
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/aboutus"
                  className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold text-white"
                >
                  Learn More About Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}