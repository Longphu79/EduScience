import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/state/useAuth";

export function Header() {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, isAuthenticated, booting, logout } = useAuth();
    if (booting) return null;

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

                <div className="hidden md:flex items-center gap-4">
                    {!isAuthenticated ? (
                        <>
                            <Link
                                to="/login"
                                className="text-sm font-medium text-gray-700"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium !text-white"
                            >
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <>
                            {/*wishlist*/}
                            <Link to="/wishlist">❤️</Link>

                            {/*cart*/}
                            <Link to="/cart">🛒</Link>

                            {/* Avatar */}
                            <div className="relative">
                                <button
                                    onClick={() =>
                                        setIsUserMenuOpen(!isUserMenuOpen)
                                    }
                                    className="focus:outline-none"
                                >
                                    <img
                                        src={
                                            user?.avatarUrl ||
                                            "/default-avatar.png"
                                        }
                                        alt={user?.username || "User"}
                                        className="h-9 w-9 rounded-full object-cover"
                                    />
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                                        <Link
                                            to="/profile"
                                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                                        >
                                            Profile
                                        </Link>

                                        <button
                                            onClick={logout}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
