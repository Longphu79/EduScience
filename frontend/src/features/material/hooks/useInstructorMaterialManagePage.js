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
    uploadMaterialFile,
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

function extractFileType(file) {
    if (!file) return "";
    if (file.type) return file.type;

    const fileName = file.name || "";
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
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
    const [uploading, setUploading] = useState(false);
    const [deletingId, setDeletingId] = useState("");
    const [editingMaterialId, setEditingMaterialId] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
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
            setLessons(
                sortLessonsByOrder(
                    Array.isArray(lessonRes?.data)
                        ? lessonRes.data
                        : lessonRes?.data?.data || lessonRes || [],
                ),
            );
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
        setSelectedFile(null);
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

    const handleFileChange = useCallback((e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedFile(file);

        setForm((prev) => ({
            ...prev,
            fileName: file.name || "",
            fileType: extractFileType(file),
            fileSize: Number(file.size || 0),
        }));
    }, []);

    const handleEdit = useCallback((item) => {
        setEditingMaterialId(getMaterialId(item));
        setSelectedFile(null);
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
                typeof item?.isPublished === "boolean"
                    ? item.isPublished
                    : true,
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

                if (!editingMaterialId && !selectedFile) {
                    throw new Error("Please choose a file to upload");
                }

                setSaving(true);

                let uploadedFileMeta = {
                    fileUrl: form.fileUrl,
                    fileName: form.fileName,
                    fileType: form.fileType,
                    fileSize: Number(form.fileSize) || 0,
                };

                if (selectedFile) {
                    setUploading(true);
                    const uploadRes = await uploadMaterialFile(selectedFile);
                    const uploadData =
                        uploadRes?.data?.data || uploadRes?.data || uploadRes;

                    uploadedFileMeta = {
                        fileUrl: uploadData?.fileUrl || "",
                        fileName:
                            uploadData?.fileName || selectedFile.name || "",
                        fileType:
                            uploadData?.fileType ||
                            extractFileType(selectedFile),
                        fileSize: Number(
                            uploadData?.fileSize || selectedFile.size || 0,
                        ),
                    };
                }

                if (!uploadedFileMeta.fileUrl) {
                    throw new Error("Upload failed: file URL not found");
                }

                const payload = {
                    title: form.title.trim(),
                    description: form.description.trim(),
                    fileUrl: uploadedFileMeta.fileUrl,
                    fileName: uploadedFileMeta.fileName,
                    fileType: uploadedFileMeta.fileType,
                    fileSize: Number(uploadedFileMeta.fileSize) || 0,
                    lessonId: form.lessonId || "",
                    isPublished: !!form.isPublished,
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
                setUploading(false);
            }
        },
        [
            courseId,
            editingMaterialId,
            form,
            instructorId,
            loadData,
            resetForm,
            selectedFile,
        ],
    );

    const handleDelete = useCallback(
        async (materialId, materialTitle) => {
            const ok = window.confirm(
                `Are you sure you want to delete "${materialTitle}"?`,
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
        [editingMaterialId, loadData, resetForm],
    );

    const stats = useMemo(() => getMaterialStats(materials), [materials]);

    const getLessonTitle = useCallback(
        (lessonId) => getLessonTitleById(lessons, lessonId),
        [lessons],
    );

    return {
        courseId,
        course,
        lessons,
        materials,
        loading,
        saving,
        uploading,
        deletingId,
        editingMaterialId,
        selectedFile,
        form,
        toast,
        setToast,
        stats,
        getLessonTitle,
        handleChange,
        handleFileChange,
        handleEdit,
        handleSubmit,
        handleDelete,
        resetForm,
        loadData,
    };
}
