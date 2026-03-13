import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getStudentsByCourse } from "../services/enrollment.service";
import Toast from "../../../shared/components/Toast";

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
    return item.studentId._id || "";
  }

  if (typeof item.studentId === "string") {
    return item.studentId;
  }

  if (item.student && typeof item.student === "object") {
    return item.student._id || "";
  }

  return "";
}

export default function InstructorStudentsPage() {
  const { courseId } = useParams();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("progress");
  const [toast, setToast] = useState({ message: "", kind: "success" });

  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const data = await getStudentsByCourse(courseId);
        const list = Array.isArray(data) ? data : data?.data || [];
        setStudents(list);
      } catch (error) {
        setToast({ message: error.message, kind: "error" });
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      loadStudents();
    }
  }, [courseId]);

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
      };
    });

    const keyword = search.trim().toLowerCase();
    let filtered = keyword
      ? list.filter((item) => {
          const name = item.__studentName?.toLowerCase() || "";
          const email = item.__student?.email?.toLowerCase() || "";
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

    return {
      totalStudents,
      averageProgress,
      activeStudents,
      highProgressStudents,
    };
  }, [normalizedStudents]);

  return (
    <div className="min-h-screen bg-gray-50">
      {toast.message ? (
        <div className="max-w-6xl mx-auto px-4 pt-4">
          <Toast
            message={toast.message}
            kind={toast.kind}
            onClose={() => setToast({ message: "", kind: "success" })}
          />
        </div>
      ) : null}

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500 mt-1">
            Danh sách học viên đã ghi danh vào khóa học
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Total students</div>
            <div className="mt-2 text-3xl font-black text-gray-900">
              {stats.totalStudents}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Average progress</div>
            <div className="mt-2 text-3xl font-black text-gray-900">
              {stats.averageProgress}%
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">Active students</div>
            <div className="mt-2 text-3xl font-black text-gray-900">
              {stats.activeStudents}
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="text-sm text-gray-500">80%+ progress</div>
            <div className="mt-2 text-3xl font-black text-gray-900">
              {stats.highProgressStudents}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 rounded-2xl border bg-white p-4 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or email..."
            className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="progress">Sort by progress</option>
            <option value="name">Sort by name</option>
            <option value="latest">Sort by latest enrolled</option>
          </select>
        </div>

        {loading ? (
          <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
            Đang tải danh sách học viên...
          </div>
        ) : normalizedStudents.length === 0 ? (
          <div className="rounded-2xl border bg-white p-10 text-center">
            <div className="text-lg font-semibold text-gray-800">
              Chưa có học viên
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Khi có học viên enroll khóa học, danh sách sẽ hiển thị ở đây.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 text-left text-gray-700">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Student</th>
                    <th className="px-5 py-4 font-semibold">Email</th>
                    <th className="px-5 py-4 font-semibold">Progress</th>
                    <th className="px-5 py-4 font-semibold">Enrolled At</th>
                    <th className="px-5 py-4 font-semibold text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedStudents.map((item) => (
                    <tr key={item._id || item.__studentId} className="border-t">
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {item.__studentName}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {item.__student?.email || "N/A"}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 w-28 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full bg-indigo-500"
                              style={{
                                width: `${item.__progress}%`,
                              }}
                            />
                          </div>
                          <span className="text-gray-700">{item.__progress}%</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600">
                        {item.__enrolledAt
                          ? new Date(item.__enrolledAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </td>
                      <td className="px-5 py-4 text-center">
                        {item.__studentId ? (
                          <Link
                            to={`/instructor/courses/${courseId}/students/${item.__studentId}`}
                            className="inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
                          >
                            View Detail
                          </Link>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Missing student id
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}