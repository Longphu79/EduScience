import {
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    CardDescription,
} from "../../shared/components/card.jsx";

import { Brain, Shield, Zap, Users } from "lucide-react";

const goals = [
    {
        title: "Enhance Learning Experience",
        description:
            "Provide an engaging and interactive learning environment.",
        icon: Brain,
    },
    {
        title: "Foster Community",
        description: "Build a supportive community for learners and educators.",
        icon: Users,
    },
    {
        title: "Promote Innovation",
        description: "Encourage creative thinking and innovation in education.",
        icon: Zap,
    },
    {
        title: "Ensure Quality",
        description: "Maintain high standards in all educational content.",
        icon: Shield,
    },
];

export function Goals() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {goals.map((goal, index) => {
                const Icon = goal.icon;

                return (
                    <Card
                        key={index}
                        className="bg-white hover:border-gray-300 transition-colors"
                    >
                        <CardHeader>
                            <div className="w-12 h-12 rounded-lg bg-black/5 flex items-center justify-center mb-4">
                                <Icon className="w-6 h-6 text-black" />
                            </div>

                            <CardTitle className="text-xl font-medium">
                                {goal.title}
                            </CardTitle>
                        </CardHeader>

                        <CardContent>
                            <CardDescription className="text-gray-600 leading-relaxed">
                                {goal.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
