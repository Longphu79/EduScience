import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  createAssignment,
  deleteAssignment,
  getAssignmentsByCourse,
  updateAssignment,
} from "../services/assignment.service";
import {
  buildAssignmentFormFromItem,
  buildAssignmentFormInitialState,
  buildAssignmentSavePayload,
  getAssignmentId,
  validateAssignmentForm,
} from "../utils/assignment.helpers";

function validateDueDateInFuture(value) {
  if (!value) return "";
  const dueDate = new Date(value);
  const now = new Date();

  if (Number.isNaN(dueDate.getTime())) {
    return "Hạn nộp không hợp lệ";
  }

  if (dueDate <= now) {
    return "Hạn nộp phải lớn hơn thời điểm hiện tại";
  }

  return "";
}

export default function useInstructorAssignmentManagePage() {
  const { courseId } = useParams();

  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(buildAssignmentFormInitialState());
  const [editingId, setEditingId] = useState(null);

  const [selectedAttachmentFiles, setSelectedAttachmentFiles] = useState([]);
  const [keptAttachmentUrls, setKeptAttachmentUrls] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", kind: "success" });

  async function loadAssignments() {
    if (!courseId) return;

    try {
      setLoading(true);
      const items = await getAssignmentsByCourse(courseId);
      setAssignments(Array.isArray(items) ? items : []);
    } catch (error) {
      setAssignments([]);
      setToast({
        message: error?.message || "Không tải được assignment",
        kind: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignments();
  }, [courseId]);

  function resetForm() {
    setForm(buildAssignmentFormInitialState());
    setEditingId(null);
    setSelectedAttachmentFiles([]);
    setKeptAttachmentUrls([]);
  }

  function handleFieldChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleEdit(item) {
    setEditingId(getAssignmentId(item));
    setSelectedAttachmentFiles([]);
    setKeptAttachmentUrls(
      Array.isArray(item?.attachmentUrls) ? item.attachmentUrls : []
    );
    setForm(buildAssignmentFormFromItem(item));

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRemoveKeptAttachment(url) {
    setKeptAttachmentUrls((prev) => prev.filter((item) => item !== url));
  }

  function handleAddFiles(files) {
    setSelectedAttachmentFiles((prev) => [...prev, ...(files || [])]);
  }

  function handleRemoveSelectedFile(indexToRemove) {
    setSelectedAttachmentFiles((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateAssignmentForm(form);
    if (validationError) {
      setToast({ message: validationError, kind: "error" });
      return;
    }

    const dueDateError = validateDueDateInFuture(form.dueDate);
    if (dueDateError) {
      setToast({ message: dueDateError, kind: "error" });
      return;
    }

    const payload = buildAssignmentSavePayload({
      courseId,
      form,
      selectedAttachmentFiles,
      keptAttachmentUrls,
    });

    try {
      setSaving(true);

      if (editingId) {
        await updateAssignment(editingId, payload);
        setToast({
          message: "Cập nhật assignment thành công",
          kind: "success",
        });
      } else {
        await createAssignment(payload);
        setToast({
          message: "Tạo assignment thành công",
          kind: "success",
        });
      }

      resetForm();
      await loadAssignments();
    } catch (error) {
      setToast({
        message: error?.message || "Không thể lưu assignment",
        kind: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(assignmentId) {
    const confirmed = window.confirm("Bạn có chắc muốn xóa assignment này?");
    if (!confirmed) return;

    try {
      setDeletingId(assignmentId);
      await deleteAssignment(assignmentId);

      setToast({
        message: "Xóa assignment thành công",
        kind: "success",
      });

      if (editingId === assignmentId) {
        resetForm();
      }

      await loadAssignments();
    } catch (error) {
      setToast({
        message: error?.message || "Không thể xóa assignment",
        kind: "error",
      });
    } finally {
      setDeletingId(null);
    }
  }

  const filteredAssignments = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return assignments;

    return assignments.filter((item) => {
      const title = item.title?.toLowerCase() || "";
      const description = item.description?.toLowerCase() || "";
      return title.includes(keyword) || description.includes(keyword);
    });
  }, [assignments, search]);

  return {
    courseId,
    assignments,
    filteredAssignments,
    form,
    editingId,
    selectedAttachmentFiles,
    keptAttachmentUrls,
    loading,
    saving,
    deletingId,
    search,
    toast,
    setToast,
    setSearch,
    resetForm,
    handleFieldChange,
    handleEdit,
    handleRemoveKeptAttachment,
    handleAddFiles,
    handleRemoveSelectedFile,
    handleSubmit,
    handleDelete,
  };
}