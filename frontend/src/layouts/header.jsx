import {
    Menu,
    X,
    ChevronDown,
    Sparkles,
    BookOpen,
    ArrowRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/state/useAuth";

const navItems = [
    { label: "Features", to: "/features" },
    { label: "Courses", to: "/courses" },
    { label: "About Us", to: "/aboutus" },
];

function navClass({ isActive }) {
    return [
        "group relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
        isActive
            ? "bg-slate-100 text-slate-950 shadow-sm"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
    ].join(" ");
}

export function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, isAuthenticated, booting, logout } = useAuth();
    const location = useLocation();

    useEffect(() => {
        setMobileOpen(false);
        setIsUserMenuOpen(false);
    }, [location.pathname]);

    if (booting) return null;

    return (
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
            <div className="mx-auto flex h-[74px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <Link to="/" className="group flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-2deg]">
                        EDU
                    </div>

                    <div className="leading-none">
                        <div className="text-[1.35rem] font-bold tracking-tight text-slate-950">
                            Science
                        </div>
                        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
                            Learn • Build • Grow
                        </div>
                    </div>
                </Link>

                <nav className="hidden items-center gap-2 md:flex">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} className={navClass}>
                            {({ isActive }) => (
                                <span className="relative inline-flex items-center">
                                    {item.label}
                                    <span
                                        className={`absolute -bottom-1 left-1/2 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 transition-all duration-300 ${
                                            isActive ? "w-8" : "group-hover:w-6"
                                        }`}
                                    />
                                </span>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    {!isAuthenticated ? (
                        <>
                            <Link
                                to="/login"
                                className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950"
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/register"
                                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(124,58,237,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(37,99,235,0.24)]"
                            >
                                <Sparkles className="h-4 w-4" />
                                Sign Up
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/cart"
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                            >
                                <BookOpen className="h-4 w-4" />
                                Cart
                            </Link>

                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen((prev) => !prev)}
                                    className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
                                >
                                    <img
                                        src={
                                            user?.avatarUrl ||
                                            "https://ui-avatars.com/api/?name=User&background=111827&color=fff"
                                        }
                                        alt={user?.username || "User"}
                                        className="h-9 w-9 rounded-full object-cover"
                                    />
                                    <ChevronDown className="h-4 w-4 text-slate-500" />
                                </button>

                                <div
                                    className={`absolute right-0 mt-3 w-56 origin-top-right rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur-xl transition-all duration-200 ${
                                        isUserMenuOpen
                                            ? "visible translate-y-0 opacity-100"
                                            : "invisible -translate-y-2 opacity-0"
                                    }`}
                                >
                                    <Link
                                        to="/profile"
                                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                                    >
                                        Profile
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <Link
                                        to="/cart"
                                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                                    >
                                        My Cart
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>

                                    <button
                                        onClick={logout}
                                        className="mt-1 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={() => setMobileOpen((prev) => !prev)}
                    className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 md:hidden"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
            </div>

            <div
                className={`overflow-hidden border-t border-slate-200/70 bg-white/90 backdrop-blur-xl transition-all duration-300 md:hidden ${
                    mobileOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) =>
                                    `rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                                        isActive
                                            ? "bg-slate-100 text-slate-950"
                                            : "text-slate-700 hover:bg-slate-50"
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4">
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_16px_30px_rgba(124,58,237,0.25)]"
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/profile"
                                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Profile
                                </Link>
                                <Link
                                    to="/cart"
                                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    Cart
                                </Link>
                                <button
                                    onClick={logout}
                                    className="rounded-2xl bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}