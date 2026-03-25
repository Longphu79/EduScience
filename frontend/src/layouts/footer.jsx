import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  ArrowRight,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const footerHighlights = [
  {
    icon: BookOpen,
    title: "Structured courses",
    description:
      "Lessons, materials, quizzes, and assignments organized into one learning flow.",
  },
  {
    icon: GraduationCap,
    title: "Clear learning progress",
    description:
      "Students can track completion, performance, and learning momentum more effectively.",
  },
  {
    icon: LayoutDashboard,
    title: "Modern teaching workflow",
    description:
      "Instructors manage courses, students, and assessments with greater clarity and control.",
  },
];

export function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-slate-200 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="absolute inset-0 opacity-25">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.35),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.28),transparent_28%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.22)] lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-violet-200">
                <Sparkles className="h-4 w-4" />
                EduScience Platform
              </span>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Learn smarter, grow faster, and build real-world skills.
              </h2>

              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                EduScience delivers a modern academic experience with structured
                courses, practical assessments, visible learning progress, and
                cleaner instructor workflows.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(124,58,237,0.28)] transition-all duration-300 hover:-translate-y-0.5"
              >
                Explore Courses
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/aboutus"
                className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
              >
                About Us
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {footerHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[22px] border border-white/10 bg-white/5 p-5"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Icon className="h-6 w-6 text-violet-200" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-300">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-sm font-bold text-slate-950 shadow-lg">
                EDU
              </div>
              <div>
                <div className="text-2xl font-bold">Science</div>
                <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Learn • Build • Grow
                </div>
              </div>
            </div>

            <p className="max-w-sm text-sm leading-7 text-slate-300">
              A modern learning platform focused on practical skills, structured
              learning experiences, and meaningful student outcomes.
            </p>

            <div className="flex items-center gap-3">
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                <Linkedin className="h-4 w-4" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10">
                <Twitter className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Product</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <Link to="/features" className="block transition hover:text-white">
                Features
              </Link>
              <Link to="/courses" className="block transition hover:text-white">
                Courses
              </Link>
              <Link to="/my-courses" className="block transition hover:text-white">
                My Courses
              </Link>
              <Link to="/cart" className="block transition hover:text-white">
                Cart
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Company</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <Link to="/aboutus" className="block transition hover:text-white">
                About Us
              </Link>
              <Link to="/features" className="block transition hover:text-white">
                Platform Features
              </Link>
              <Link to="/register" className="block transition hover:text-white">
                Join EduScience
              </Link>
              <Link to="/courses" className="block transition hover:text-white">
                Learning Paths
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-violet-300" />
                <span>EduScienceAI@gmail.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-violet-300" />
                <span>1-800-CALL-AI</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-violet-300" />
                <span>Ngu Hanh Son, Da Nang</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-10 border-white/10" />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="text-sm text-slate-400">
            © 2025 EduScience. All rights reserved.
          </div>

          <div className="flex flex-wrap gap-6 text-sm text-slate-400">
            <Link to="/" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/" className="transition hover:text-white">
              Terms of Service
            </Link>
            <Link to="/" className="transition hover:text-white">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}