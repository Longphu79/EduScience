import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../auth/state/useAuth";
import {
  courseUnwrap,
  getCourseById as getCourseDetail,
} from "../../course/services/course.service";
import { getLessonsByCourse } from "../../lesson/services/lesson.service";
import {
  createMaterial,
  deleteMaterial,
  getMaterialsByCourse,
  updateMaterial,
} from "../services/material.service";
import {
  getDefaultMaterialForm,
  getLessonTitleById,
  getMaterialId,
  getMaterialStats,
  normalizeMaterialList,
  sortLessonsByOrder,
} from "../utils/material.helpers";

function getInstructorId(user) {
  return user?._id || user?.id || user?.userId || null;
}

export default function useInstructorMaterialManagePage() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const instructorId = useMemo(() => getInstructorId(user), [user]);

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingMaterialId, setEditingMaterialId] = useState("");
  const [form, setForm] = useState(getDefaultMaterialForm());
  const [toast, setToast] = useState({
    message: "",
    kind: "success",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [courseRes, lessonRes, materialRes] = await Promise.all([
        getCourseDetail(courseId),
        getLessonsByCourse(courseId),
        getMaterialsByCourse(courseId),
      ]);

      setCourse(courseUnwrap(courseRes) || null);
      setLessons(sortLessonsByOrder(Array.isArray(lessonRes?.data) ? lessonRes.data : lessonRes?.data?.data || lessonRes || []));
      setMaterials(normalizeMaterialList(materialRes));
    } catch (error) {
      setToast({
        message: error?.message || "Failed to load materials",
        kind: "error",
      });
      setCourse(null);
      setLessons([]);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      loadData();
    }
  }, [courseId, loadData]);

  const resetForm = useCallback(() => {
    setEditingMaterialId("");
    setForm(getDefaultMaterialForm());
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  }, []);

  const handleEdit = useCallback((item) => {
    setEditingMaterialId(getMaterialId(item));
    setForm({
      title: item?.title || "",
      description: item?.description || "",
      fileUrl: item?.fileUrl || "",
      fileName: item?.fileName || "",
      fileType: item?.fileType || "",
      fileSize: Number(item?.fileSize || 0),
      lessonId:
        typeof item?.lessonId === "string"
          ? item.lessonId
          : item?.lessonId?._id || item?.lessonId?.id || "",
      isPublished:
        typeof item?.isPublished === "boolean" ? item.isPublished : true,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        if (!instructorId) {
          throw new Error("Instructor id not found");
        }

        if (!form.title.trim()) {
          throw new Error("Material title is required");
        }

        if (!form.fileUrl.trim()) {
          throw new Error("File URL is required");
        }

        setSaving(true);

        const payload = {
          ...form,
          title: form.title.trim(),
          description: form.description.trim(),
          fileUrl: form.fileUrl.trim(),
          fileName: form.fileName.trim(),
          fileType: form.fileType.trim(),
          fileSize: Number(form.fileSize) || 0,
          lessonId: form.lessonId || "",
          courseId,
          instructorId,
        };

        if (editingMaterialId) {
          await updateMaterial(editingMaterialId, payload);
          setToast({
            message: "Material updated successfully",
            kind: "success",
          });
        } else {
          await createMaterial(payload);
          setToast({
            message: "Material created successfully",
            kind: "success",
          });
        }

        resetForm();
        await loadData();
      } catch (error) {
        setToast({
          message: error?.message || "Failed to save material",
          kind: "error",
        });
      } finally {
        setSaving(false);
      }
    },
    [courseId, editingMaterialId, form, instructorId, loadData, resetForm]
  );

  const handleDelete = useCallback(
    async (materialId, materialTitle) => {
      const ok = window.confirm(
        `Are you sure you want to delete "${materialTitle}"?`
      );

      if (!ok) return;

      try {
        setDeletingId(materialId);
        await deleteMaterial(materialId);

        if (editingMaterialId === materialId) {
          resetForm();
        }

        setToast({
          message: "Material deleted successfully",
          kind: "success",
        });

        await loadData();
      } catch (error) {
        setToast({
          message: error?.message || "Failed to delete material",
          kind: "error",
        });
      } finally {
        setDeletingId("");
      }
    },
    [editingMaterialId, loadData, resetForm]
  );

  const stats = useMemo(() => getMaterialStats(materials), [materials]);

  const getLessonTitle = useCallback(
    (lessonId) => getLessonTitleById(lessons, lessonId),
    [lessons]
  );

  return {
    courseId,
    course,
    lessons,
    materials,
    loading,
    saving,
    deletingId,
    editingMaterialId,
    form,
    toast,
    setToast,
    stats,
    getLessonTitle,
    handleChange,
    handleEdit,
    handleSubmit,
    handleDelete,
    resetForm,
    loadData,
  };
}