import { Play, BarChart3, Brain, Zap } from "lucide-react";

export function Hero() {
    return (
        <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="text-center space-y-8 max-w-4xl mx-auto">
                    <div className="space-y-4">
                        <div className="inline-flex items-center bg-blue-100 text-blue-600 px-3 py-1 rounded-full border">
                            <Brain className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                                Smart Online Learning Platform
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tight">
                            Learn Anytime.
                            <span className="text-blue-600">
                                {" "}
                                Build Real Skills.
                            </span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                            Access high-quality online courses taught by
                            industry experts. Learn at your own pace, track your
                            progress, and upgrade your skills for real-world
                            projects.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium !text-white hover:bg-gray-800 transition">
                            <Zap className="w-5 h-5 mr-2" />
                            Start Learning Now
                        </button>

                        <button className="flex items-center justify-center px-8 py-4 border rounded-lg text-lg">
                            <Play className="w-5 h-5 mr-2" />
                            Watch Introduction
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
