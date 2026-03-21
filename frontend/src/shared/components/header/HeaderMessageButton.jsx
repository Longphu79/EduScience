import React from "react";
import { MessageCircle } from "lucide-react";

export default function HeaderMessageButton({
  conversationCount = 0,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_16px_30px_rgba(15,23,42,0.12)]"
      aria-label="Messages"
    >
      <MessageCircle className="h-5 w-5" />

      {conversationCount > 0 ? (
        <span className="absolute right-0 top-0 inline-flex min-h-[20px] min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-blue-600 px-1 text-[10px] font-bold text-white shadow-lg">
          {conversationCount > 99 ? "99+" : conversationCount}
        </span>
      ) : null}
    </button>
  );
}