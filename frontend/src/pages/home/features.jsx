import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "../../shared/components/card.jsx";

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
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Smart Learning Paths",
    description:
      "Personalized learning paths powered by AI to help students learn efficiently based on their goals and skill levels.",
  },
  {
    icon: MessageSquare,
    title: "Interactive Lessons",
    description:
      "Engage with video lectures, quizzes, and discussions to reinforce knowledge and improve retention.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Monitor learning progress with detailed insights on completed lessons, scores, and improvement areas.",
  },
  {
    icon: Target,
    title: "Skill-Based Courses",
    description:
      "Courses designed around real-world skills with clear objectives and practical outcomes.",
  },
  {
    icon: Shield,
    title: "Verified Certificates",
    description:
      "Earn shareable certificates upon course completion to showcase your achievements.",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description:
      "Get real-time feedback on quizzes and assignments to quickly understand your strengths and gaps.",
  },
  {
    icon: BarChart3,
    title: "Instructor Dashboard",
    description:
      "Instructors can track student engagement, performance, and course effectiveness in one place.",
  },
  {
    icon: Users,
    title: "Community Learning",
    description:
      "Learn together with peers through group discussions, comments, and collaborative learning.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description:
      "Learn anytime, anywhere with lifetime access to course materials at your own pace.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto max-w-6xl px-4">
        
        {/* Section header */}
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold">
            Everything You Need to Learn Effectively
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our online learning platform provides all the tools students and
            instructors need to teach, learn, and grow skills efficiently.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <Card
                key={index}
                className="hover:border-gray-300 transition-colors bg-white"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-black" />
                  </div>

                  <CardTitle className="text-xl font-medium">
                    {feature.title}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
