import React from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function MobileMenu({
  mobileOpen,
  setMobileOpen,
  navItems = [],
  isAuthenticated,
  isStudent,
  isInstructor,
  isAdmin,
  cartCount = 0,
  onLogout,
}) {
  return (
    <>
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:bg-slate-50 md:hidden"
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen ? (
        <div className="header-mobile-panel border-t border-slate-200 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      isActive
                        ? "bg-slate-100 text-slate-950"
                        : "text-slate-700 hover:bg-slate-50",
                    ].join(" ")
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/auth/login"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {isStudent ? (
                    <Link
                      to="/cart"
                      className="relative rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cart
                      {cartCount > 0 ? (
                        <span className="absolute right-3 top-2 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-1 text-[10px] font-bold text-white shadow-lg">
                          {cartCount > 99 ? "99+" : cartCount}
                        </span>
                      ) : null}
                    </Link>
                  ) : null}

                  <Link
                    to="/profile"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View Profile
                  </Link>

                  {isStudent ? (
                    <Link
                      to="/dashboard/student"
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Student Dashboard
                    </Link>
                  ) : null}

                  {isInstructor ? (
                    <Link
                      to="/dashboard/instructor"
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Instructor Dashboard
                    </Link>
                  ) : null}

                  {isAdmin ? (
                    <Link
                      to="/admin/dashboard"
                      className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    >
                      Admin Dashboard
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={onLogout}
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}