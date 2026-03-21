import React from "react";

export default function BrandLogo({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="header-brand group inline-flex cursor-pointer items-center gap-3"
    >
      <div className="header-brand__mark flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-950 via-slate-800 to-slate-700 text-sm font-bold text-white shadow-[0_12px_24px_rgba(15,23,42,0.18)] transition-all duration-300 group-hover:scale-105 group-hover:rotate-[-2deg]">
        EDU
      </div>

      <div className="header-brand__text leading-none text-left">
        <div className="text-[1.35rem] font-bold tracking-tight text-slate-950">
          Science
        </div>
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">
          Learn • Build • Grow
        </div>
      </div>
    </button>
  );
}