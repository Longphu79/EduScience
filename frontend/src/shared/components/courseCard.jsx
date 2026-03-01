import { RatingStars } from "./ratingStars.jsx";

export function CourseCard({ course }) {
    const instructorName = course.instructorId?.name || "Instructor";
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        instructorName
    )}&background=7c3aed&color=ffffff&bold=true`;

    return (
        <div className="relative group bg-white/90 backdrop-blur-md rounded-[22px] border border-violet-200 overflow-hidden h-full flex flex-col shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.14)]">
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-500 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.18)_48%,transparent_100%)] translate-x-[-120%] group-hover:translate-x-[120%]" />

            <div className="relative w-full aspect-[16/9] overflow-hidden">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />

                <span className="absolute bottom-3 left-3 bg-slate-950/85 text-white text-xs px-4 py-1.5 rounded-full font-semibold tracking-wide">
                    {course.category}
                </span>

                <span className="absolute top-3 left-3 bg-white/90 text-violet-700 text-xs px-3 py-1 rounded-full font-bold shadow">
                    {course.level}
                </span>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                    <RatingStars rating={course.rating} />
                    <span className="text-neutral-500 text-sm">
                        ({course.totalReviews})
                    </span>
                </div>

                <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-violet-600 font-bold text-lg">
                        {course.price === 0 ? "Free" : `$${course.price}`}
                    </span>

                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {course.tag}
                    </span>
                </div>

                <h3 className="text-slate-900 font-bold text-[20px] leading-snug line-clamp-2 mb-4 min-h-[3.5rem]">
                    {course.title}
                </h3>

                <div className="bg-gradient-to-r from-slate-50 to-indigo-50 rounded-xl px-4 py-3 flex justify-between text-sm text-slate-700 mb-4 border border-slate-200">
                    <span>📘 {course.totalLessons}</span>
                    <span>⏱ {course.duration}h</span>
                    <span>👨‍🎓 {course.totalEnrollments}+</span>
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

                    <button className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-4 py-2.5 rounded-xl hover:opacity-95 transition font-semibold shadow-md whitespace-nowrap">
                        Enroll
                    </button>
                </div>
            </div>
        </div>
    );
}