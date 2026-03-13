import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  getAssignmentsByCourse,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  assignmentUnwrap,
} from "../services/assignment.service";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/state/useAuth";

const initialForm = {
  title: "",
  description: "",
  dueDate: "",
  maxScore: 100,
  allowResubmit: true,
  attachmentUrls: "",
  isPublished: true,
};

export default function InstructorAssignmentManagePage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  const instructorId = user?._id || user?.id || user?.userId || null;

  async function loadAssignments() {
    try {
      setLoading(true);
      const data = await getAssignmentsByCourse(courseId);
      const payload = assignmentUnwrap(data);
      setAssignments(Array.isArray(payload) ? payload : []);
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, [courseId]);

  function resetForm() {
    setForm(initialForm);
    setEditingId(null);
  }

  function handleEdit(item) {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      description: item.description || "",
      dueDate: item.dueDate ? item.dueDate.slice(0, 16) : "",
      maxScore: item.maxScore ?? 100,
      allowResubmit: item.allowResubmit ?? true,
      attachmentUrls: Array.isArray(item.attachmentUrls)
        ? item.attachmentUrls.join(", ")
        : "",
      isPublished: !!item.isPublished,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      setToast({ message: "Vui lòng nhập tiêu đề assignment", kind: "error" });
      return;
    }

    if (!instructorId) {
      setToast({
        message: "Không tìm thấy instructorId từ tài khoản đăng nhập",
        kind: "error",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        courseId,
        instructorId,
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: form.dueDate || null,
        maxScore: Number(form.maxScore) || 100,
        allowResubmit: !!form.allowResubmit,
        attachmentUrls: form.attachmentUrls
          ? form.attachmentUrls
              .split(",")
              .map((x) => x.trim())
              .filter(Boolean)
          : [],
        isPublished: !!form.isPublished,
      };

      if (editingId) {
        await updateAssignment(editingId, payload);
        setToast({ message: "Cập nhật assignment thành công", kind: "success" });
      } else {
        await createAssignment(payload);
        setToast({ message: "Tạo assignment thành công", kind: "success" });
      }

      resetForm();
      await loadAssignments();
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(assignmentId) {
    const ok = window.confirm("Bạn có chắc muốn xóa assignment này?");
    if (!ok) return;

    try {
      setDeletingId(assignmentId);
      await deleteAssignment(assignmentId);
      setToast({ message: "Xóa assignment thành công", kind: "success" });

      if (editingId === assignmentId) resetForm();
      await loadAssignments();
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast
        message={toast.message}
        kind={toast.kind}
        onClose={() => setToast({ message: "", kind: "success" })}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Assignments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Tạo, chỉnh sửa và quản lý bài tập cho khóa học
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border bg-white p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingId ? "Edit Assignment" : "Create Assignment"}
            </h2>

            {editingId ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel edit
              </button>
            ) : null}
          </div>

          <div className="grid gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment title
              </label>
              <input
                type="text"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Nhập tiêu đề bài tập"
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={5}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Nhập mô tả bài tập"
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due date
                </label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max score
                </label>
                <input
                  type="number"
                  min="0"
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                  value={form.maxScore}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      maxScore: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <label className="flex items-center gap-3">
                <input
                  id="allowResubmit"
                  type="checkbox"
                  checked={form.allowResubmit}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      allowResubmit: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-gray-700">Allow resubmit</span>
              </label>

              <label className="flex items-center gap-3">
                <input
                  id="assignmentPublished"
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      isPublished: e.target.checked,
                    }))
                  }
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Attachment URLs
              </label>
              <input
                type="text"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Dán link, phân tách bằng dấu phẩy"
                value={form.attachmentUrls}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    attachmentUrls: e.target.value,
                  }))
                }
              />
              <p className="text-xs text-gray-500 mt-2">
                Ví dụ: https://file1.com, https://file2.com
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="submit" loading={saving}>
              {editingId ? "Update Assignment" : "Save Assignment"}
            </Button>
            {editingId ? (
              <Button type="button" onClick={resetForm}>
                Reset
              </Button>
            ) : null}
          </div>
        </form>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Assignment List</h2>

          {loading ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              Đang tải assignment...
            </div>
          ) : assignments.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
              Chưa có assignment nào.
            </div>
          ) : (
            <div className="grid gap-4">
              {assignments.map((item, index) => (
                <div
                  key={item._id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-semibold text-sm">
                          {index + 1}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.isPublished
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {item.isPublished ? "Published" : "Draft"}
                        </span>

                        {item.isOverdue ? (
                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            Overdue
                          </span>
                        ) : null}
                      </div>

                      <p className="text-sm text-gray-600">
                        {item.description || "Chưa có mô tả."}
                      </p>

                      <div className="flex flex-wrap gap-3 pt-1">
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                          Max score: {item.maxScore ?? 100}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                          Due:{" "}
                          {item.dueDate
                            ? new Date(item.dueDate).toLocaleString("vi-VN")
                            : "N/A"}
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                          Resubmit: {item.allowResubmit ? "Yes" : "No"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0 flex-wrap">
                      <Link
                        to={`/instructor/courses/${courseId}/assignments/${item._id}/results`}
                        className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-4 py-3 font-semibold text-white transition hover:opacity-95"
                      >
                        Results
                      </Link>

                      <Button type="button" onClick={() => handleEdit(item)}>
                        Edit
                      </Button>

                      <Button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        loading={deletingId === item._id}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}