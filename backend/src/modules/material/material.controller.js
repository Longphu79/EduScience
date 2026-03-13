import * as materialService from "./material.service.js";

export const createMaterial = async (req, res) => {
  try {
    const data = await materialService.createMaterial(req.body);
    res.status(201).json({ success: true, data });
  } catch (err) {
    const status = err.message === "Course not found" ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const getMaterialsByCourse = async (req, res) => {
  try {
    const data = await materialService.getMaterialsByCourse(
      req.params.courseId,
      req.user
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    const status =
      err.message === "Course not found"
        ? 404
        : err.message === "You are not enrolled in this course"
        ? 403
        : 400;

    res.status(status).json({ success: false, message: err.message });
  }
};

export const getMaterialsByLesson = async (req, res) => {
  try {
    const data = await materialService.getMaterialsByLesson(req.params.lessonId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateMaterial = async (req, res) => {
  try {
    const data = await materialService.updateMaterial(
      req.params.materialId,
      req.body
    );
    res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message === "Material not found" ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};

export const deleteMaterial = async (req, res) => {
  try {
    const data = await materialService.deleteMaterial(req.params.materialId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    const status = err.message === "Material not found" ? 404 : 400;
    res.status(status).json({ success: false, message: err.message });
  }
};