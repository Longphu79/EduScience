import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/state/useAuth";
import { enrollmentUnwrap, getMyCourses } from "../services/enrollment.service";
import {
    getCourseFromEnrollment,
    getUserId,
} from "../utils/enrollment.helpers";

export default function useMyCoursesPage() {
    const { user, isAuthenticated, booting } = useAuth();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [toast, setToast] = useState({
        message: "",
        kind: "success",
    });

    const loadMyCourses = useCallback(async () => {
        try {
            if (booting) return;

            if (!isAuthenticated) {
                setCourses([]);
                setLoading(false);
                return;
            }

            const studentId = getUserId(user);
            if (!studentId) return;

            setLoading(true);

            const response = await getMyCourses(studentId);
            const data = enrollmentUnwrap(response);

            const safeCourses = Array.isArray(data)
                ? data.filter((item) => {
                      const course = getCourseFromEnrollment(item);
                      return !!course?._id;
                  })
                : [];

            setCourses(safeCourses);
        } catch (error) {
            setToast({
                message: error?.message || "Không tải được khóa học của bạn",
                kind: "error",
            });
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }, [booting, isAuthenticated, user]);

    useEffect(() => {
        loadMyCourses();
    }, [loadMyCourses]);

    const filteredCourses = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return courses;

        return courses.filter((item) => {
            const course = getCourseFromEnrollment(item);
            const title = String(course?.title || "").toLowerCase();
            const description = String(
                course?.shortDescription || course?.description || "",
            ).toLowerCase();

            return title.includes(keyword) || description.includes(keyword);
        });
    }, [courses, search]);

    return {
        loading,
        courses,
        filteredCourses,
        search,
        setSearch,
        toast,
        setToast,
        loadMyCourses,
    };
}
