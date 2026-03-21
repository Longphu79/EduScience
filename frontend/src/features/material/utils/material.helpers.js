export function formatFileSize(fileSize = 0) {
  const size = Number(fileSize || 0);

  if (!size) return "N/A";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

export function getMaterialId(item) {
  if (!item) return "";
  if (typeof item === "string") return item;
  return item._id || item.id || item.materialId || "";
}

export function getLessonId(item) {
  if (!item) return "";
  if (typeof item === "string") return item;

  if (typeof item?.lessonId === "string") return item.lessonId;
  if (item?._id || item?.id) return item._id || item.id || "";

  if (item?.lessonId && typeof item.lessonId === "object") {
    return item.lessonId._id || item.lessonId.id || "";
  }

  return "";
}

export function materialUnwrap(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (payload?.data && typeof payload.data === "object") return payload.data;
  return payload;
}

export function normalizeMaterialItem(item) {
  if (!item || typeof item !== "object") return null;

  return {
    ...item,
    _id: item._id || item.id || item.materialId || "",
    title: item.title || "",
    description: item.description || "",
    fileUrl: item.fileUrl || "",
    fileName: item.fileName || "",
    fileType: item.fileType || "",
    fileSize: Number(item.fileSize || 0),
    lessonId: item.lessonId || "",
    isPublished:
      typeof item.isPublished === "boolean" ? item.isPublished : true,
  };
}

export function sortMaterialsByCreatedAt(items = []) {
  if (!Array.isArray(items)) return [];

  return [...items].sort(
    (a, b) =>
      new Date(b?.createdAt || 0).getTime() -
      new Date(a?.createdAt || 0).getTime()
  );
}

export function normalizeMaterialList(payload) {
  const data = materialUnwrap(payload);
  if (!Array.isArray(data)) return [];
  return sortMaterialsByCreatedAt(
    data.map(normalizeMaterialItem).filter(Boolean)
  );
}

export function normalizeCourseResponse(payload) {
  return payload?.data?.data || payload?.data || payload || null;
}

export function sortLessonsByOrder(items = []) {
  if (!Array.isArray(items)) return [];

  return [...items].sort(
    (a, b) =>
      Number(a?.order || 0) - Number(b?.order || 0) ||
      new Date(a?.createdAt || 0).getTime() -
        new Date(b?.createdAt || 0).getTime()
  );
}

export function getLessonTitleById(lessons = [], lessonId) {
  const safeLessonId = getLessonId(lessonId);

  if (!safeLessonId) return "Course-level material";

  const matchedLesson = lessons.find(
    (item) => String(getLessonId(item)) === String(safeLessonId)
  );

  return matchedLesson?.title || "Unknown lesson";
}

export function getMaterialStats(materials = []) {
  const publishedCount = materials.filter((item) => item?.isPublished).length;
  const lessonAttachedCount = materials.filter((item) =>
    Boolean(getLessonId(item?.lessonId))
  ).length;
  const courseLevelCount = materials.filter(
    (item) => !getLessonId(item?.lessonId)
  ).length;
  const totalFileSize = materials.reduce(
    (sum, item) => sum + Number(item?.fileSize || 0),
    0
  );

  return {
    totalCount: materials.length,
    publishedCount,
    lessonAttachedCount,
    courseLevelCount,
    totalFileSize,
  };
}

export function getDefaultMaterialForm() {
  return {
    title: "",
    description: "",
    fileUrl: "",
    fileName: "",
    fileType: "",
    fileSize: 0,
    lessonId: "",
    isPublished: true,
  };
}