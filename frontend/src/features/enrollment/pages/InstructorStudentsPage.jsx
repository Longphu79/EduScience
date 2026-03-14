import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudentsByCourse } from "../services/enrollment.service";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";

function getStudentName(student) {
  if (!student) return "Unknown";

  return (
    student.name ||
    student.fullName ||
    student.username ||
    student.displayName ||
    [student.firstName, student.lastName].filter(Boolean).join(" ") ||
    student.email ||
    "Unknown"
  );
}

function getStudentIdFromItem(item) {
  if (!item) return "";

  if (item.studentId && typeof item.studentId === "object") {
    return item.studentId._id || item.studentId.id || "";
  }

  if (typeof item.studentId === "string") {
    return item.studentId;
  }

  if (item.student && typeof item.student === "object") {
    return item.student._id || item.student.id || "";
  }

  return "";
}

function formatDateTime(value) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString("vi-VN");
}

function StatCard({ title, value, subtitle, tone = "indigo" }) {
  const toneClass = {
    indigo: "from-indigo-500 to-blue-500",
    emerald: "from-emerald-500 to-green-500",
    amber: "from-amber-500 to-orange-500",
    rose: "from-rose-500 to-pink-500",
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-black text-slate-900">{value}</h3>
          {subtitle ? (
            <p className="mt-2 text-xs text-slate-400">{subtitle}</p>
          ) : null}
        </div>

        <div
          className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${toneClass[tone]}`}
        />
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  const safeValue = Math.max(0, Math.min(100, Number(value || 0)));

  let barClass = "bg-gradient-to-r from-slate-400 to-slate-500";
  let badgeClass = "bg-slate-100 text-slate-700";

  if (safeValue >= 80) {
    barClass = "bg-gradient-to-r from-emerald-500 to-green-500";
    badgeClass = "bg-emerald-100 text-emerald-700";
  } else if (safeValue >= 50) {
    barClass = "bg-gradient-to-r from-indigo-500 to-blue-500";
    badgeClass = "bg-indigo-100 text-indigo-700";
  } else if (safeValue > 0) {
    barClass = "bg-gradient-to-r from-amber-500 to-orange-500";
    badgeClass = "bg-amber-100 text-amber-700";
  }

  return (
    <div className="flex items-center gap-3">
      <div className="h-2.5 w-28 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full ${barClass}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <span
        className={`inline-flex min-w-[64px] justify-center rounded-full px-2.5 py-1 text-xs font-bold ${badgeClass}`}
      >
        {safeValue}%
      </span>
    </div>
  );
}

export default function InstructorStudentsPage() {
  const { courseId } = useParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("progress");
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getStudentsByCourse(courseId);
      const list = Array.isArray(data) ? data : data?.data || [];
      setStudents(Array.isArray(list) ? list : []);
    } catch (error) {
      setToast({
        message: error?.message || "Không tải được danh sách học viên",
        kind: "error",
      });
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadStudents();
    }
  }, [courseId, loadStudents]);

  const normalizedStudents = useMemo(() => {
    const list = students.map((item) => {
      const student =
        item.studentId && typeof item.studentId === "object"
          ? item.studentId
          : item.student && typeof item.student === "object"
          ? item.student
          : null;

      return {
        ...item,
        __student: student,
        __studentId: getStudentIdFromItem(item),
        __studentName: getStudentName(student),
        __progress: Number(item.progress ?? item.progressPercent ?? 0),
        __enrolledAt: item.enrolledAt || item.createdAt || null,
        __email: student?.email || "",
        __completed: !!item.completed,
      };
    });

    const keyword = search.trim().toLowerCase();

    let filtered = keyword
      ? list.filter((item) => {
          const name = item.__studentName?.toLowerCase() || "";
          const email = item.__email?.toLowerCase() || "";
          return name.includes(keyword) || email.includes(keyword);
        })
      : list;

    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.__studentName.localeCompare(b.__studentName);
      }

      if (sortBy === "latest") {
        return (
          new Date(b.__enrolledAt || 0).getTime() -
          new Date(a.__enrolledAt || 0).getTime()
        );
      }

      if (sortBy === "status") {
        if (a.__completed === b.__completed) return b.__progress - a.__progress;
        return Number(b.__completed) - Number(a.__completed);
      }

      return b.__progress - a.__progress;
    });

    return filtered;
  }, [students, search, sortBy]);

  const stats = useMemo(() => {
    const totalStudents = normalizedStudents.length;

    const averageProgress = totalStudents
      ? Math.round(
          normalizedStudents.reduce((sum, item) => sum + item.__progress, 0) /
            totalStudents
        )
      : 0;

    const activeStudents = normalizedStudents.filter(
      (item) => item.__progress > 0
    ).length;

    const highProgressStudents = normalizedStudents.filter(
      (item) => item.__progress >= 80
    ).length;

    const completedStudents = normalizedStudents.filter(
      (item) => item.__completed || item.__progress >= 100
    ).length;

    return {
      totalStudents,
      averageProgress,
      activeStudents,
      highProgressStudents,
      completedStudents,
    };
  }, [normalizedStudents]);

  return (
    <div className="min-h-screen bg-slate-50">
      {toast.message ? (
        <div className="mx-auto max-w-7xl px-4 pt-4">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-500">
              Course students
            </p>
            <h1 className="mt-2 text-3xl font-black text-slate-900">
              Danh sách học viên
            </h1>
            <p className="mt-2 text-slate-500">
              Theo dõi học viên đã ghi danh, mức độ học tập và truy cập nhanh vào
              trang chi tiết từng học viên.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadStudents}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>

            <Link to={`/instructor/courses/${courseId}`}>
              <Button type="button">Về khóa học</Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total students"
            value={stats.totalStudents}
            subtitle="Tổng số học viên đã enroll"
            tone="indigo"
          />
          <StatCard
            title="Average progress"
            value={`${stats.averageProgress}%`}
            subtitle="Trung bình tiến độ toàn lớp"
            tone="amber"
          />
          <StatCard
            title="Active students"
            value={stats.activeStudents}
            subtitle="Đã bắt đầu học"
            tone="emerald"
          />
          <StatCard
            title="80%+ progress"
            value={stats.highProgressStudents}
            subtitle={`${stats.completedStudents} học viên đã hoàn thành`}
            tone="rose"
          />
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 md:grid-cols-[1.4fr_220px] xl:grid-cols-[1.6fr_240px]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Tìm kiếm học viên
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Sắp xếp
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="progress">Sort by progress</option>
                <option value="name">Sort by name</option>
                <option value="latest">Sort by latest enrolled</option>
                <option value="status">Sort by status</option>
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
            Đang tải danh sách học viên...
          </div>
        ) : normalizedStudents.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="text-xl font-bold text-slate-900">
              Chưa có học viên
            </div>
            <p className="mt-2 text-slate-500">
              Khi có học viên enroll khóa học, danh sách sẽ hiển thị tại đây.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-left text-slate-700">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Student</th>
                      <th className="px-6 py-4 font-semibold">Email</th>
                      <th className="px-6 py-4 font-semibold">Progress</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold">Enrolled At</th>
                      <th className="px-6 py-4 font-semibold text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {normalizedStudents.map((item) => {
                      const completed =
                        item.__completed || Number(item.__progress) >= 100;

                      return (
                        <tr
                          key={item._id || item.__studentId}
                          className="border-t border-slate-100"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-black uppercase text-indigo-700">
                                {(item.__studentName || "S").slice(0, 1)}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {item.__studentName}
                                </div>
                                <div className="text-xs text-slate-400">
                                  ID: {item.__studentId || "N/A"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5 text-slate-600">
                            {item.__email || "N/A"}
                          </td>

                          <td className="px-6 py-5">
                            <ProgressBar value={item.__progress} />
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                completed
                                  ? "bg-emerald-100 text-emerald-700"
                                  : item.__progress > 0
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {completed
                                ? "Completed"
                                : item.__progress > 0
                                ? "Learning"
                                : "Not started"}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-slate-600">
                            {formatDateTime(item.__enrolledAt)}
                          </td>

                          <td className="px-6 py-5 text-center">
                            {item.__studentId ? (
                              <div className="flex items-center justify-center gap-2">
                                <Link
                                  to={`/instructor/courses/${courseId}/students/${item.__studentId}`}
                                  className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                                >
                                  View Detail
                                </Link>

                                <Link
                                  to={`/instructor/courses/${courseId}/chat?studentId=${item.__studentId}`}
                                  className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                                >
                                  Chat
                                </Link>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">
                                Missing student id
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid gap-4 lg:hidden">
              {normalizedStudents.map((item) => {
                const completed =
                  item.__completed || Number(item.__progress) >= 100;

                return (
                  <div
                    key={item._id || item.__studentId}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-sm font-black uppercase text-indigo-700">
                        {(item.__studentName || "S").slice(0, 1)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-lg font-bold text-slate-900">
                              {item.__studentName}
                            </div>
                            <div className="truncate text-sm text-slate-500">
                              {item.__email || "N/A"}
                            </div>
                          </div>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                              completed
                                ? "bg-emerald-100 text-emerald-700"
                                : item.__progress > 0
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {completed
                              ? "Completed"
                              : item.__progress > 0
                              ? "Learning"
                              : "Not started"}
                          </span>
                        </div>

                        <div className="mt-4">
                          <ProgressBar value={item.__progress} />
                        </div>

                        <div className="mt-4 text-sm text-slate-500">
                          Enrolled: {formatDateTime(item.__enrolledAt)}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.__studentId ? (
                            <>
                              <Link
                                to={`/instructor/courses/${courseId}/students/${item.__studentId}`}
                                className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                              >
                                View Detail
                              </Link>

                              <Link
                                to={`/instructor/courses/${courseId}/chat?studentId=${item.__studentId}`}
                                className="inline-flex items-center rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-100"
                              >
                                Chat
                              </Link>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">
                              Missing student id
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}