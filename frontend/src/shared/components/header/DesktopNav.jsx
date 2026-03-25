import React from "react";
import { NavLink } from "react-router-dom";

function navClass({ isActive }) {
  return [
    "group relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300",
    isActive
      ? "bg-slate-100 text-slate-950 shadow-sm"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
  ].join(" ");
}

export default function DesktopNav({ navItems = [] }) {
  return (
    <nav className="header-desktop-nav relative z-10 hidden min-w-0 items-center justify-center gap-2 md:flex">
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
  );
}