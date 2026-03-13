import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../shared/components/card.jsx";
import {
  Brain,
  Shield,
  Zap,
  Users,
  Target,
  TrendingUp,
} from "lucide-react";

const goals = [
  {
    title: "Enhance learning experience",
    description:
      "Create a more engaging, structured, and interactive digital learning environment for students.",
    icon: Brain,
  },
  {
    title: "Foster community",
    description:
      "Build a supportive learning ecosystem where students and instructors can connect and grow together.",
    icon: Users,
  },
  {
    title: "Promote innovation",
    description:
      "Encourage modern teaching methods, digital workflows, and practical educational innovation.",
    icon: Zap,
  },
  {
    title: "Ensure quality",
    description:
      "Maintain high standards in course structure, learning content, and overall platform experience.",
    icon: Shield,
  },
  {
    title: "Drive clear outcomes",
    description:
      "Help learners achieve measurable progress through guided lessons, assessments, and visible results.",
    icon: Target,
  },
  {
    title: "Support continuous growth",
    description:
      "Enable long-term development for both learners and educators through scalable and future-ready learning tools.",
    icon: TrendingUp,
  },
];

export function Goals() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {goals.map((goal, index) => {
        const Icon = goal.icon;

        return (
          <Card
            key={index}
            className="rounded-[24px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
          >
            <CardHeader className="pb-3">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Icon className="h-7 w-7 text-slate-900" />
              </div>

              <CardTitle className="text-xl font-bold text-slate-950">
                {goal.title}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <CardDescription className="leading-7 text-slate-600">
                {goal.description}
              </CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}