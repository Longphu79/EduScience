import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="border-b bg-white sticky top-0 z-50">
            <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white">
                        EDU
                    </div>
                    <span className="text-xl font-semibold">Science</span>
                </Link>

                {/* Desktop nav */}
                <nav className="hidden md:flex items-center space-x-8">
                    <Link
                        to="features"
                        className="text-gray-600 hover:text-black"
                    >
                        Features
                    </Link>
                    <Link
                        to="pricing"
                        className="text-gray-600 hover:text-black"
                    >
                        Pricing
                    </Link>
                    <Link
                        to="testimonials"
                        className="text-gray-600 hover:text-black"
                    >
                        Testimonials
                    </Link>
                    <Link
                        to="aboutus"
                        className="text-gray-600 hover:text-black"
                    >
                        About Us
                    </Link>
                </nav>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        to="/login"
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black transition"
                    >
                        Sign In
                    </Link>

                    <Link
                        to="/register"
                        className="rounded-lg bg-black px-4 py-2 text-sm font-medium !text-white hover:bg-gray-800 transition"
                    >
                        Sign Up
                    </Link>
                </div>
                {/* Mobile toggle */}
                <button
                    className="md:hidden"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                    {isMenuOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <Menu className="h-6 w-6" />
                    )}
                </button>
            </div>

            {/* Mobile menu
            {isMenuOpen && (
                <div className="md:hidden border-t bg-white">
                    <nav className="flex flex-col space-y-4 p-4">
                        <a href="#features">Features</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#testimonials">Testimonials</a>
                        <a href="#faq">FAQ</a>

                        <Link to="/login" className="text-left">
                            Sign In
                        </Link>

                        <Link
                            to="/register"
                            className="bg-black text-white rounded px-3 py-2"
                        >
                            Start Free Trial
                        </Link>
                    </nav>
                </div>
            )} */}
        </header>
    );
}
