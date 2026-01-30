import { Play, BarChart3, Brain, Zap } from "lucide-react";

export function Hero() {
    return (
        <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        {/* Badge */}
                        <div className="mt-6 mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-blue-600">
                            <Brain className="h-4 w-4" />
                            <span className="text-sm font-medium">
                                Smart Online Learning Platform
                            </span>
                        </div>

                        {/* Heading */}
                        <h1 className="max-w-5xl text-4xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                            Learn Anytime.
                            <span className="text-blue-600">
                                {" "}
                                Build Real Skills.
                            </span>
                        </h1>
                        <br />
                        {/* Description */}
                        <p className="mt-6 max-w-2xl text-base text-gray-600 md:text-lg leading-relaxed">
                            Access high-quality online courses taught by
                            industry experts. Learn at your own pace, track your
                            progress, and upgrade your skills for real-world
                            projects.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="flex items-center justify-center gap-2 rounded-lg bg-black px-8 py-4 text-lg font-medium !text-white hover:bg-gray-800 transition">
                            <Zap className="w-5 h-5 text-white" />
                            Start Learning Now
                        </button>
                        <button className="flex items-center justify-center gap-2 rounded-lg border px-8 py-4 text-lg hover:bg-gray-50 transition">
                            <Play className="w-5 h-5" />
                            Watch Introductions
                        </button>
                    </div>

                    <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            Learn at your own pace
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            Lifetime access
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                            Certificate included
                        </div>
                    </div>
                </div>

                <div className="mt-16 relative">
                    <div className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl p-8 backdrop-blur-sm border">
                        <img
                            src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=600"
                            alt="Online Course Dashboard"
                            className="w-full rounded-lg shadow-2xl"
                        />
                    </div>

                    <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 border">
                        <div className="flex items-center space-x-3">
                            <BarChart3 className="w-8 h-8 text-blue-600" />
                            <div>
                                <div className="text-sm">Completion Rate</div>
                                <div className="text-xl font-semibold">92%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
