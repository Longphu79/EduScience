import {
  ArrowRight,
  Award,
  BookOpen,
  Brain,
  Briefcase,
  CheckCircle2,
  Globe,
  GraduationCap,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Goals } from "./goals.jsx";

const values = [
  {
    icon: Target,
    title: "Outcome-driven learning",
    description:
      "We design learning experiences that help students build practical skills, not just consume theory.",
  },
  {
    icon: Brain,
    title: "Modern digital education",
    description:
      "Our platform combines structured teaching, digital workflows, and learner-centered design for better results.",
  },
  {
    icon: ShieldCheck,
    title: "Quality and clarity",
    description:
      "We focus on high-quality course structure, measurable progress, and a cleaner learning journey for everyone.",
  },
];

const impactStats = [
  { value: "Structured", label: "learning journeys" },
  { value: "Practical", label: "skill development" },
  { value: "Modern", label: "teaching workflow" },
  { value: "Scalable", label: "digital platform vision" },
];

const audienceBlocks = [
  {
    icon: GraduationCap,
    title: "For Students",
    description:
      "Learn through structured lessons, quizzes, assignments, materials, and guided progress tracking.",
    points: [
      "Follow a clear lesson roadmap",
      "Track course progress visually",
      "Review quiz and assignment results",
      "Build confidence through consistent learning",
    ],
  },
  {
    icon: Briefcase,
    title: "For Professionals",
    description:
      "Strengthen real-world competencies through flexible learning and industry-relevant course design.",
    points: [
      "Upskill with practical content",
      "Study with flexible pacing",
      "Focus on measurable outcomes",
      "Develop job-relevant knowledge",
    ],
  },
  {
    icon: Users,
    title: "For Instructors",
    description:
      "Create courses, manage students, review attempts, and organize academic workflows more effectively.",
    points: [
      "Build structured digital courses",
      "Manage lessons and assessments",
      "Monitor student engagement",
      "Use one cleaner teaching dashboard",
    ],
  },
];

const principles = [
  {
    icon: BookOpen,
    title: "Accessible education",
    description:
      "We believe quality learning should be available regardless of location or background.",
  },
  {
    icon: TrendingUp,
    title: "Continuous growth",
    description:
      "Learning should support long-term progress through practice, reflection, and measurable improvement.",
  },
  {
    icon: Globe,
    title: "Future-ready mindset",
    description:
      "We aim to prepare learners for a fast-changing digital world with modern tools and relevant skills.",
  },
  {
    icon: Award,
    title: "Professional standards",
    description:
      "We care about structure, usability, and educational quality to deliver a more trustworthy experience.",
  },
];

function SectionHeading({ badge, title, description, center = false }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
        {badge}
      </div>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_22%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_22%),linear-gradient(180deg,#ffffff_0%,#f8fafc_52%,#eef2ff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              About EduScience
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">
              A modern learning platform built for
              <span className="block bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                practical growth and real skills
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              EduScience helps students, instructors, and lifelong learners
              experience digital education in a more structured, measurable, and
              professional way.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/courses"
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-[0_18px_36px_rgba(124,58,237,0.22)] transition hover:-translate-y-0.5"
              >
                Explore Courses
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

          <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {impactStats.map((item) => (
              <div
                key={item.label}
                className="rounded-[24px] border border-slate-200 bg-white/85 p-6 text-center shadow-sm backdrop-blur"
              >
                <div className="text-2xl font-black text-slate-950">
                  {item.value}
                </div>
                <div className="mt-2 text-sm font-medium text-slate-500">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm">
            <SectionHeading
              badge="Who we are"
              title="We bridge structured education and practical digital learning"
              description="EduScience is an online learning platform created to make education more applicable, modern, and accessible. We aim to connect strong academic structure with real-world learning needs so students and professionals can grow with confidence."
            />

            <div className="mt-8 space-y-5 text-slate-600">
              <p className="leading-8">
                We believe learning should be more than just passive content
                consumption. It should be organized, guided, measurable, and
                connected to meaningful outcomes. That is why our platform
                supports not only course discovery, but also lessons, materials,
                assessments, progress tracking, and instructor workflows in one
                unified environment.
              </p>

              <p className="leading-8">
                By combining modern technology, structured pedagogy, and
                practical course design, EduScience aims to help learners build
                stronger skills while helping instructors teach more effectively
                in a digital-first world.
              </p>
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
            <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-violet-200">
              Our mission
            </div>

            <h2 className="mt-5 text-3xl font-black tracking-tight">
              Make quality education more practical, accessible, and future-ready
            </h2>

            <p className="mt-5 leading-8 text-slate-300">
              Our mission is to help learners access high-quality education
              regardless of background or location, while ensuring that learning
              remains practical, engaging, and aligned with real-world needs.
            </p>

            <div className="mt-8 space-y-4">
              {[
                "Support clear and structured learning journeys",
                "Help students apply knowledge to practical situations",
                "Empower instructors with cleaner digital workflows",
                "Build a more modern and measurable learning experience",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-violet-300" />
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <SectionHeading
            center
            badge="Our values"
            title="Principles that shape the EduScience experience"
            description="We focus on educational quality, professional product thinking, and practical learner outcomes."
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-slate-200 bg-slate-50 p-7"
                >
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Icon className="h-7 w-7 text-slate-900" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-950">
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

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          center
          badge="Who we serve"
          title="Designed for learners, professionals, and educators"
          description="EduScience is built to support different roles across the learning ecosystem with one clear digital experience."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {audienceBlocks.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[28px] border border-slate-200 bg-white p-8 shadow-sm"
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

                <div className="mt-6 space-y-3">
                  {item.points.map((point) => (
                    <div
                      key={point}
                      className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                    >
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-violet-600" />
                      <span className="text-slate-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <SectionHeading
              badge="Our goals"
              title="What we are building toward"
              description="We want EduScience to become a stronger academic and professional learning environment through structure, quality, and measurable value."
            />

            <div className="rounded-[30px] border border-slate-200 bg-slate-50 p-8">
              <Goals />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading
          center
          badge="What we believe"
          title="Education should help people move forward with confidence"
          description="That means learning must stay relevant, accessible, and connected to real growth."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[26px] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                  <Icon className="h-7 w-7 text-slate-900" />
                </div>
                <h3 className="text-xl font-bold text-slate-950">
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
    </div>
  );
}