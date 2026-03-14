import Material from "./material.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";

async function ensureCourseOwnership(courseId, { requesterId, requesterRole } = {}) {
  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (
    requesterRole !== "admin" &&
    String(course.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to modify materials of this course");
  }

  return course;
}

async function ensureMaterialOwnership(materialId, { requesterId, requesterRole } = {}) {
  const material = await Material.findById(materialId);

  if (!material) {
    throw new Error("Material not found");
  }

  const course = await Course.findById(material.courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  if (
    requesterRole !== "admin" &&
    String(course.instructorId) !== String(requesterId)
  ) {
    throw new Error("You are not allowed to modify this material");
  }

  return { material, course };
}

export const createMaterial = async (
  payload,
  { requesterId, requesterRole } = {}
) => {
  if (!payload?.courseId) {
    throw new Error("courseId is required");
  }

  if (!payload?.fileUrl?.trim()) {
    throw new Error("fileUrl is required");
  }

  if (!payload?.fileName?.trim()) {
    throw new Error("fileName is required");
  }

  const course = await ensureCourseOwnership(payload.courseId, {
    requesterId,
    requesterRole,
  });

  return await Material.create({
    title: payload.title?.trim() || payload.fileName?.trim() || "Material",
    description: payload.description?.trim() || "",
    fileUrl: payload.fileUrl.trim(),
    fileName: payload.fileName.trim(),
    fileType: payload.fileType?.trim() || "",
    fileSize: Number(payload.fileSize) || 0,
    courseId: payload.courseId,
    lessonId: payload.lessonId || null,
    instructorId: requesterRole === "admin"
      ? payload.instructorId || course.instructorId
      : requesterId,
    isPublished:
      typeof payload.isPublished === "boolean" ? payload.isPublished : true,
  });
};

export const getMaterialsByCourse = async (courseId, user) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new Error("Course not found");

  const baseQuery = { courseId };

  if (!user) {
    return await Material.find({
      ...baseQuery,
      isPublished: true,
    }).sort({ createdAt: -1 });
  }

  if (user.role === "student") {
    const enrolled = await Enrollment.findOne({
      courseId,
      studentId: user._id,
    }).lean();

    if (!enrolled) {
      throw new Error("You are not enrolled in this course");
    }

    return await Material.find({
      ...baseQuery,
      isPublished: true,
    }).sort({ createdAt: -1 });
  }

  if (
    user.role === "instructor" &&
    String(course.instructorId) === String(user._id)
  ) {
    return await Material.find(baseQuery).sort({ createdAt: -1 });
  }

  if (user.role === "admin") {
    return await Material.find(baseQuery).sort({ createdAt: -1 });
  }

  return await Material.find({
    ...baseQuery,
    isPublished: true,
  }).sort({ createdAt: -1 });
};

export const getMaterialsByLesson = async (lessonId) => {
  return await Material.find({
    lessonId,
    isPublished: true,
  }).sort({ createdAt: -1 });
};

export const updateMaterial = async (
  materialId,
  payload,
  { requesterId, requesterRole } = {}
) => {
  const { material } = await ensureMaterialOwnership(materialId, {
    requesterId,
    requesterRole,
  });

  const updatePayload = { ...payload };

  delete updatePayload._id;
  delete updatePayload.courseId;
  delete updatePayload.instructorId;

  if (typeof payload.title === "string") {
    updatePayload.title = payload.title.trim();
  }

  if (typeof payload.description === "string") {
    updatePayload.description = payload.description.trim();
  }

  if (typeof payload.fileUrl === "string") {
    updatePayload.fileUrl = payload.fileUrl.trim();
  }

  if (typeof payload.fileName === "string") {
    updatePayload.fileName = payload.fileName.trim();
  }

  if (typeof payload.fileType === "string") {
    updatePayload.fileType = payload.fileType.trim();
  }

  if (payload.fileSize !== undefined) {
    updatePayload.fileSize = Number(payload.fileSize) || 0;
  }

  if (payload.isPublished !== undefined) {
    updatePayload.isPublished = !!payload.isPublished;
  }

  if (payload.lessonId !== undefined) {
    updatePayload.lessonId = payload.lessonId || null;
  }

  const updatedMaterial = await Material.findByIdAndUpdate(
    material._id,
    updatePayload,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedMaterial) {
    throw new Error("Material not found");
  }

  return updatedMaterial;
};

export const deleteMaterial = async (
  materialId,
  { requesterId, requesterRole } = {}
) => {
  const { material } = await ensureMaterialOwnership(materialId, {
    requesterId,
    requesterRole,
  });

  await Material.findByIdAndDelete(material._id);

  return material;
};