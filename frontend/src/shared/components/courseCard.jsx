import { Link } from "react-router-dom";
import { RatingStars } from "./ratingStars.jsx";

export function CourseCard({ course }) {
  const instructorName =
    course.instructorId?.fullName ||
    course.instructorId?.name ||
    course.instructorId?.username ||
    "Instructor";

  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    instructorName
  )}&background=7c3aed&color=ffffff&bold=true`;

  const displayLevel = course.level
    ? course.level.charAt(0).toUpperCase() + course.level.slice(1)
    : "Beginner";

  const displayPrice =
    course.isFree || course.price === 0
      ? "Free"
      : course.salePrice && course.salePrice > 0
      ? `₫${Number(course.salePrice).toLocaleString("vi-VN")}`
      : `₫${Number(course.price || 0).toLocaleString("vi-VN")}`;

  const badgeText = course.isPopular
    ? "Popular"
    : course.status === "published"
    ? "Published"
    : "Course";

  return (
    <Link to={`/courses/${course._id}`} className="block h-full">
      <div className="relative group bg-white/90 backdrop-blur-md rounded-[22px] border border-violet-200 overflow-hidden h-full flex flex-col shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
        <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_48%,transparent_100%)] translate-x-[-120%] group-hover:translate-x-[120%]" />

        <div className="relative w-full aspect-[16/9] overflow-hidden">
          <img
            src={
              course.thumbnail ||
              "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"
            }
            alt={course.title}
            className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />

          <span className="absolute bottom-3 left-3 bg-slate-950/85 text-white text-xs px-4 py-1.5 rounded-full font-semibold tracking-wide">
            {course.category || "General"}
          </span>

          <span className="absolute top-3 left-3 bg-white/90 text-violet-700 text-xs px-3 py-1 rounded-full font-bold shadow">
            {displayLevel}
          </span>
        </div>

        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <RatingStars rating={Math.round(course.rating || 0)} />
            <span className="text-neutral-500 text-sm">
              ({course.totalReviews || 0})
            </span>
          </div>

          <div className="flex items-center justify-between mb-2 gap-2">
            <span className="text-violet-600 font-bold text-lg">
              {displayPrice}
            </span>

            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
              {badgeText}
            </span>
          </div>

          <h3 className="text-slate-900 font-bold text-[20px] leading-snug line-clamp-2 mb-4 min-h-[3.5rem]">
            {course.title}
          </h3>

          <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl px-4 py-3 flex justify-between text-sm text-slate-700 mb-4 border border-slate-200">
            <span>📘 {course.totalLessons || 0}</span>
            <span>⏱ {course.duration || 0}m</span>
            <span>👨‍🎓 {course.totalEnrollments || 0}+</span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-11 w-11 min-w-[44px] overflow-hidden rounded-full border-2 border-violet-500 bg-slate-100">
                <img
                  src={course.instructorId?.avatarUrl || fallbackAvatar}
                  alt={instructorName}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = fallbackAvatar;
                  }}
                />
              </div>

              <span className="text-sm font-semibold text-slate-800 truncate">
                {instructorName}
              </span>
            </div>

            <span className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold shadow-md whitespace-nowrap">
              View
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}