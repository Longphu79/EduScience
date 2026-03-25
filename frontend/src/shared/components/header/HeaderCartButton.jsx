import React from "react";
import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

export default function HeaderCartButton({ cartCount = 0 }) {
  return (
    <Link
      to="/cart"
      className="relative inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
    >
      <BookOpen className="h-4 w-4" />
      Cart

      {cartCount > 0 ? (
        <span className="absolute -right-1 -top-1 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-1 text-[10px] font-bold text-white shadow-lg">
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      ) : null}
    </Link>
  );
}