import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentsByCourse } from "../services/enrollment.service";
import { normalizeStudentProgressItem } from "../utils/enrollment.helpers";

export default function useInstructorStudentsPage() {
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
    return students.map(normalizeStudentProgressItem);
  }, [students]);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    const filtered = keyword
      ? normalizedStudents.filter((item) => {
          const name = item.__studentName?.toLowerCase() || "";
          const email = item.__email?.toLowerCase() || "";
          return name.includes(keyword) || email.includes(keyword);
        })
      : [...normalizedStudents];

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
  }, [normalizedStudents, search, sortBy]);

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

  return {
    courseId,
    loading,
    students,
    normalizedStudents,
    filteredStudents,
    search,
    setSearch,
    sortBy,
    setSortBy,
    stats,
    toast,
    setToast,
    loadStudents,
  };
}