import { Mail, Phone, MapPin, Linkedin, Twitter } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-primary text-primary-foreground">
            <div className="container mx-auto max-w-6xl px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-primary-foreground text-primary rounded-lg flex items-center justify-center">
                                <span>EDU</span>
                            </div>
                            <span className="text-xl">Science</span>
                        </div>

                        <div className="flex space-x-4">
                            <button className="p-2 rounded-md text-primary-foreground hover:bg-primary-foreground/10 transition">
                                <Linkedin className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-md text-primary-foreground hover:bg-primary-foreground/10 transition">
                                <Twitter className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Product */}
                    <div className="space-y-4">
                        <h3>Product</h3>
                        <div className="space-y-2 text-primary-foreground/80">
                            <a
                                href="features"
                                className="block hover:text-primary-foreground transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#courses"
                                className="block hover:text-primary-foreground transition-colors"
                            >
                                Courses
                            </a>
                            <a
                                href="#"
                                className="block hover:text-primary-foreground transition-colors"
                            >
                                Security
                            </a>
                        </div>
                    </div>

                    {/* About us */}
                    <div className="space-y-4">
                        <h3>About Us</h3>
                        <div className="space-y-2 text-primary-foreground/80">
                            <a
                                href="/aboutus"
                                className="block hover:text-primary-foreground transition-colors"
                            >
                                About
                            </a>
                            <a
                                href="#"
                                className="block hover:text-primary-foreground transition-colors"
                            >
                                Goals
                            </a>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3>Contact</h3>
                        <div className="space-y-3 text-primary-foreground/80">
                            <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>EduScieneAI@gmail.com</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span>1-800-CALL-AI</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>Ngu Hanh Son, DN</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Separator */}
                <hr className="my-8 border-primary-foreground/20" />

                {/* Bottom */}
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-primary-foreground/80 text-sm">
                        © 2025 EduScience. All rights reserved.
                    </div>

                    <div className="flex space-x-6 text-sm text-primary-foreground/80">
                        <a
                            href="#"
                            className="hover:text-primary-foreground transition-colors"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="hover:text-primary-foreground transition-colors"
                        >
                            Terms of Service
                        </a>
                        <a
                            href="#"
                            className="hover:text-primary-foreground transition-colors"
                        >
                            Cookie Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
