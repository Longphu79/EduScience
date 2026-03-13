import {
  Brain,
  MessageSquare,
  TrendingUp,
  Target,
  Shield,
  Zap,
  BarChart3,
  Users,
  Clock,
  ArrowRight,
  GraduationCap,
  BookOpen,
  FileCheck,
  LayoutDashboard,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../shared/components/card.jsx";

const coreFeatures = [
  {
    icon: Brain,
    title: "Smart Learning Paths",
    description:
      "Personalized learning journeys help students focus on the right skills at the right time with a clearer study direction.",
  },
  {
    icon: MessageSquare,
    title: "Interactive Lessons",
    description:
      "Video lessons, guided materials, and structured content blocks improve student engagement and retention.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track course completion, lesson progress, quiz history, and assignment performance in one place.",
  },
  {
    icon: Target,
    title: "Skill-Based Courses",
    description:
      "Each course is designed around practical outcomes so learners build useful real-world competencies.",
  },
  {
    icon: Shield,
    title: "Verified Certificates",
    description:
      "Learners can receive course completion certificates that validate achievement and strengthen motivation.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description:
      "Assessment flows provide fast results and clearer explanations to support continuous improvement.",
  },
  {
    icon: BarChart3,
    title: "Instructor Dashboard",
    description:
      "Instructors can monitor course performance, learner engagement, and teaching effectiveness more efficiently.",
  },
  {
    icon: Users,
    title: "Student Management",
    description:
      "Track enrolled students, review learning progress, inspect quiz attempts, and grade submissions more easily.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description:
      "Students can learn at their own pace while instructors maintain a structured digital teaching workflow.",
  },
];

const platformFlows = [
  {
    icon: BookOpen,
    title: "Create and structure courses",
    description:
      "Build complete courses with lessons, preview content, learning materials, quizzes, and assignments.",
  },
  {
    icon: LayoutDashboard,
    title: "Manage teaching workflows",
    description:
      "Instructors manage lessons, track students, review attempts, and monitor assignment submissions from one dashboard.",
  },
  {
    icon: GraduationCap,
    title: "Guide student learning",
    description:
      "Students enroll, continue lessons, complete learning tasks, and track their progress across the course journey.",
  },
  {
    icon: FileCheck,
    title: "Measure outcomes",
    description:
      "The platform captures attempts, scores, completion rate, and learning progress for more measurable outcomes.",
  },
];

const roleBenefits = [
  {
    title: "For Students",
    points: [
      "Clear lesson-by-lesson progression",
      "Easy access to materials and assessments",
      "Track quiz, assignment, and course progress",
      "Continue learning without losing context",
    ],
  },
  {
    title: "For Instructors",
    points: [
      "Create and manage structured digital courses",
      "Monitor students and review detailed attempts",
      "Grade assignments and inspect performance",
      "Maintain a cleaner and more professional teaching workflow",
    ],
  },
];

const outcomeStats = [
  { value: "Structured", label: "learning journey" },
  { value: "Real-time", label: "progress visibility" },
  { value: "Integrated", label: "assessment flow" },
  { value: "Modern", label: "teaching dashboard" },
];

export function Features() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.18),transparent_24%),radial-gradient(circle_at_top_right,rgba(37,99,235,0.14),transparent_24%),linear-gradient(180deg,#ffffff_0%,#f8fafc_52%,#eef2ff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-violet-600" />
              EduScience Platform Features
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-7xl">
              Everything you need to learn
              <span className="block bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                effectively and professionally
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              EduScience combines structured learning, assessments, course
              management, progress visibility, and instructor workflows into one
              modern academic platform.
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
                to="/aboutus"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                About Us
              </Link>
            </div>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {outcomeStats.map((item) => (
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
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
              Core capabilities
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              A connected learning system, not just a simple course catalog
            </h2>
          </div>

          <p className="max-w-2xl text-base leading-8 text-slate-600">
            The platform supports the full flow of digital teaching and learning:
            course browsing, enrollment, lesson progression, quizzes,
            assignments, student monitoring, and completion recognition.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {coreFeatures.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card
                key={index}
                className="rounded-[26px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Icon className="h-7 w-7 text-slate-900" />
                  </div>

                  <CardTitle className="text-2xl font-bold text-slate-950">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-base leading-8 text-slate-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
              Platform workflow
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              How EduScience supports the full teaching and learning cycle
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">
              From course creation to assessment review, the experience is
              designed to remain structured, measurable, and easier to manage.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            {platformFlows.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="rounded-[26px] border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
                      <Icon className="h-7 w-7 text-slate-900" />
                    </div>
                    <div className="text-sm font-black text-violet-600">
                      0{index + 1}
                    </div>
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
        <div className="grid gap-6 lg:grid-cols-2">
          {roleBenefits.map((group) => (
            <div
              key={group.title}
              className="rounded-[30px] border border-slate-200 bg-white p-8 shadow-sm"
            >
              <h2 className="text-2xl font-black text-slate-950">
                {group.title}
              </h2>

              <div className="mt-6 space-y-4">
                {group.points.map((point) => (
                  <div
                    key={point}
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-violet-600" />
                    <span className="leading-7 text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function FeaturesPreview() {
  return (
    <section className="bg-slate-50 py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <div className="inline-flex rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
            Why EduScience
          </div>
          <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            A modern learning system built for digital education
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            EduScience helps students learn with structure and helps instructors
            teach with more visibility, control, and clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {coreFeatures.slice(0, 6).map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card
                key={index}
                className="rounded-[26px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                    <Icon className="h-7 w-7 text-slate-900" />
                  </div>

                  <CardTitle className="text-xl font-bold text-slate-950">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-base leading-8 text-slate-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            to="/features"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View all features
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
} 