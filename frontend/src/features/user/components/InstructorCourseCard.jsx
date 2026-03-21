import React from "react";
import { Link } from "react-router-dom";
import {
  formatPriceVND,
  getCoursePublishState,
  getSafeCourseId,
  getSafeImage,
} from "../utils/user.helpers";

export default function InstructorCourseCard({ course }) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

  const imageSrc = getSafeImage(course?.thumbnail) || fallbackImage;
  const publishMeta = getCoursePublishState(course);
  const courseId = getSafeCourseId(course);

  const displayPrice =
    course?.isFree || Number(course?.price || 0) === 0
      ? "Free"
      : formatPriceVND(course?.salePrice || course?.price || 0);

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={course?.title || "Course"}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-slate-700 shadow-sm">
            {course?.category || "General"}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${publishMeta.className}`}
          >
            {publishMeta.label}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="line-clamp-2 text-lg font-bold text-slate-950">
          {course?.title || "Course"}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {course?.shortDescription ||
            course?.description ||
            "No description available."}
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-[16px] bg-slate-50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Students
            </div>
            <div className="mt-1 font-semibold text-slate-900">
              {course?.totalEnrollments || 0}
            </div>
          </div>

          <div className="rounded-[16px] bg-slate-50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Lessons
            </div>
            <div className="mt-1 font-semibold text-slate-900">
              {course?.totalLessons || 0}
            </div>
          </div>

          <div className="rounded-[16px] bg-slate-50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Price
            </div>
            <div className="mt-1 font-semibold text-slate-900">
              {displayPrice}
            </div>
          </div>

          <div className="rounded-[16px] bg-slate-50 p-3">
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Duration
            </div>
            <div className="mt-1 font-semibold text-slate-900">
              {course?.duration || 0}m
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to={courseId ? `/courses/${courseId}` : "/courses"}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            View course
          </Link>
        </div>
      </div>
    </div>
  );
}