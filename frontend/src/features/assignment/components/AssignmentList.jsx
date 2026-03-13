import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAssignmentsByCourse } from "../services/assignment.service";

export default function AssignmentList({ courseId }) {
  const { courseId: routeCourseId } = useParams();
  const finalCourseId = courseId || routeCourseId;

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setLoading(true);
        const response = await getAssignmentsByCourse(finalCourseId);
        const data = response?.data?.data || response?.data || response || [];
        setAssignments(Array.isArray(data) ? data : []);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    if (finalCourseId) fetchAssignments();
  }, [finalCourseId]);

  if (loading) return <p>Đang tải bài tập...</p>;

  if (!assignments.length) {
    return <p className="text-slate-600">Chưa có bài tập nào.</p>;
  }

  return (
    <div className="space-y-3">
      {assignments.map((item) => (
        <div
          key={item._id}
          className="rounded-xl border border-slate-200 p-4"
        >
          <p className="font-medium text-slate-900">{item.title}</p>
          <p className="text-sm text-slate-600">{item.description}</p>

          <Link
            to={`/learn/${finalCourseId}/assignments/${item._id}`}
            className="mt-3 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            Xem bài tập
          </Link>
        </div>
      ))}
    </div>
  );
}