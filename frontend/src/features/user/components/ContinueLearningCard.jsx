import React from "react";
import { Link } from "react-router-dom";
import {
  getSafeImage,
  normalizeContinueLearningCourse,
} from "../utils/user.helpers";

export default function ContinueLearningCard({ course }) {
  const fallbackImage = "https://placehold.co/600x350?text=Course";
  const data = normalizeContinueLearningCourse(course);
  const imageSrc = getSafeImage(data.__thumbnail) || fallbackImage;

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <img
        src={imageSrc}
        alt={data.__title}
        className="h-40 w-full rounded-[18px] object-cover"
        onError={(e) => {
          e.currentTarget.src = fallbackImage;
        }}
      />

      <h3 className="mt-4 line-clamp-2 text-lg font-bold text-slate-900">
        {data.__title}
      </h3>

      <p className="mt-2 line-clamp-2 text-sm text-slate-600">
        {data.__description}
      </p>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Progress</span>
          <span>{data.__progress}%</span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-600"
            style={{ width: `${data.__progress}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-[16px] bg-slate-50 p-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Lessons
          </div>
          <div className="mt-1 font-semibold text-slate-900">
            {data.__completedLessons}/{data.__totalLessons}
          </div>
        </div>

        <div className="rounded-[16px] bg-slate-50 p-3">
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Status
          </div>
          <div className="mt-1 font-semibold text-slate-900">
            {data.__completed ? "Completed" : "In progress"}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={data.__courseId ? `/learn/${data.__courseId}` : "/my-courses"}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Continue
        </Link>

        {data.__completed && data.__courseId ? (
          <Link
            to={`/learn/${data.__courseId}/certificate`}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
          >
            Certificate
          </Link>
        ) : null}
      </div>
    </div>
  );
}