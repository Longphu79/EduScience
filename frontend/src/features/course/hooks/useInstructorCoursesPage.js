import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCourse, getInstructorCourses } from "../services/course.service";
import { useAuth } from "../../auth/state/useAuth";
import { getCourseId } from "../utils/course.helpers";

function sumBy(courses = [], key) {
  return courses.reduce(
    (sum, item) => sum + (Number(item?.analytics?.[key]) || 0),
    0
  );
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("vi-VN");
}

export function getCourseStatusMeta(course) {
  const rawStatus = String(course?.status || "").toLowerCase();
  const isPublished =
    course?.isPublished === true ||
    rawStatus === "published" ||
    rawStatus === "active";

  if (isPublished) {
    return {
      label: "Published",
      badgeClass:
        "instructor-courses-page__status-badge instructor-courses-page__status-badge--published",
      cardTone: "instructor-courses-page__course-card--published",
    };
  }

  return {
    label: "Draft",
    badgeClass:
      "instructor-courses-page__status-badge instructor-courses-page__status-badge--draft",
    cardTone: "",
  };
}

export default function useInstructorCoursesPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const instructorId = useMemo(() => {
    return user?._id || user?.id || user?.userId || null;
  }, [user]);

  const fetchInstructorCourses = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      if (!instructorId) {
        setLoading(false);
        setToast({
          message: "Instructor id not found. Please login again.",
          kind: "error",
        });
        return;
      }

      setLoading(true);

      const payload = await getInstructorCourses(instructorId);
      setCourses(Array.isArray(payload) ? payload : []);
    } catch (error) {
      console.error("INSTRUCTOR COURSES ERROR:", error);
      setToast({
        message: error?.message || "Failed to load instructor courses",
        kind: "error",
      });
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, instructorId]);

  useEffect(() => {
    fetchInstructorCourses();
  }, [fetchInstructorCourses]);

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let list = !keyword
      ? [...courses]
      : courses.filter((course) => {
          const title = course.title?.toLowerCase() || "";
          const category = course.category?.toLowerCase() || "";
          const description =
            course.shortDescription?.toLowerCase() ||
            course.description?.toLowerCase() ||
            "";

          return (
            title.includes(keyword) ||
            category.includes(keyword) ||
            description.includes(keyword)
          );
        });

    list.sort((a, b) => {
      if (sortBy === "students") {
        return (
          Number(b?.analytics?.totalStudents || 0) -
          Number(a?.analytics?.totalStudents || 0)
        );
      }

      if (sortBy === "progress") {
        return (
          Number(b?.analytics?.averageProgress || 0) -
          Number(a?.analytics?.averageProgress || 0)
        );
      }

      if (sortBy === "title") {
        return String(a?.title || "").localeCompare(String(b?.title || ""));
      }

      return (
        new Date(b?.createdAt || b?.updatedAt || 0).getTime() -
        new Date(a?.createdAt || a?.updatedAt || 0).getTime()
      );
    });

    return list;
  }, [courses, search, sortBy]);

  const dashboard = useMemo(() => {
    const totalCourses = courses.length;
    const totalStudents = sumBy(courses, "totalStudents");
    const totalQuizAttempts = sumBy(courses, "totalQuizAttempts");
    const totalAssignmentSubmissions = sumBy(
      courses,
      "totalAssignmentSubmissions"
    );

    const averageProgress = totalCourses
      ? Math.round(sumBy(courses, "averageProgress") / totalCourses)
      : 0;

    const publishedCourses = courses.filter((course) => {
      const status = String(course?.status || "").toLowerCase();
      return (
        course?.isPublished === true ||
        status === "published" ||
        status === "active"
      );
    }).length;

    return {
      totalCourses,
      totalStudents,
      totalQuizAttempts,
      totalAssignmentSubmissions,
      averageProgress,
      publishedCourses,
    };
  }, [courses]);

  async function handleDeleteCourse(courseId, courseTitle) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${courseTitle}"?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(courseId);
      await deleteCourse(courseId);

      setCourses((prev) =>
        prev.filter((item) => getCourseId(item) !== String(courseId))
      );

      setToast({
        message: "Course deleted successfully",
        kind: "success",
      });
    } catch (error) {
      console.error("DELETE COURSE ERROR:", error);
      setToast({
        message: error?.message || "Failed to delete course",
        kind: "error",
      });
    } finally {
      setDeletingId("");
    }
  }

  return {
    isAuthenticated,
    courses,
    filteredCourses,
    loading,
    deletingId,
    search,
    sortBy,
    toast,
    dashboard,
    navigate,
    setSearch,
    setSortBy,
    setToast,
    fetchInstructorCourses,
    handleDeleteCourse,
  };
}