import React from "react";
import { Link } from "react-router-dom";
import Button from "../../../shared/components/Button";

export default function InstructorQuizToolbar({
  courseId,
  search,
  onSearchChange,
  totalCount = 0,
}) {
  return (
    <>
      <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-violet-700">
              Instructor Quiz Manager
            </div>

            <h1 className="mt-3 text-[2rem] font-black tracking-tight text-slate-950">
              Manage Quizzes
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Tạo, chỉnh sửa, publish và theo dõi kết quả quiz trong khóa học.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/instructor/courses">
              <Button type="button">Back to Courses</Button>
            </Link>

            <Link to={`/instructor/courses/${courseId}/quizzes/create`}>
              <Button type="button">+ Create Quiz</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Tìm theo tiêu đề hoặc mô tả quiz..."
            className="rounded-[20px] border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />

          <div className="inline-flex items-center rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            Total: {totalCount}
          </div>
        </div>
      </div>
    </>
  );
}