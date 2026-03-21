import React from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function HeaderAuthActions() {
  return (
    <>
      <Link
        to="/auth/login"
        className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition-all duration-300 hover:bg-slate-100 hover:text-slate-950"
      >
        Sign In
      </Link>

      <Link
        to="/auth/register"
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_rgba(124,58,237,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_36px_rgba(37,99,235,0.24)]"
      >
        <Sparkles className="h-4 w-4" />
        Sign Up
      </Link>
    </>
  );
}