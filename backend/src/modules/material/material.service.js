import Material from "./material.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";

export const createMaterial = async (payload) => {
  const course = await Course.findById(payload.courseId);
  if (!course) throw new Error("Course not found");

  return Material.create(payload);
};

export const getMaterialsByCourse = async (courseId, user) => {
  const course = await Course.findById(courseId).lean();
  if (!course) throw new Error("Course not found");

  const baseQuery = { courseId };

  if (!user) {
    return Material.find({
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

    return Material.find({
      ...baseQuery,
      isPublished: true,
    }).sort({ createdAt: -1 });
  }

  if (
    user.role === "instructor" &&
    String(course.instructorId) === String(user._id)
  ) {
    return Material.find(baseQuery).sort({ createdAt: -1 });
  }

  return Material.find({
    ...baseQuery,
    isPublished: true,
  }).sort({ createdAt: -1 });
};

export const getMaterialsByLesson = async (lessonId) => {
  return Material.find({
    lessonId,
    isPublished: true,
  }).sort({ createdAt: -1 });
};

export const updateMaterial = async (materialId, payload) => {
  const material = await Material.findByIdAndUpdate(materialId, payload, {
    new: true,
  });

  if (!material) throw new Error("Material not found");
  return material;
};

export const deleteMaterial = async (materialId) => {
  const material = await Material.findByIdAndDelete(materialId);

  if (!material) throw new Error("Material not found");
  return material;
};