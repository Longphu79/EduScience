import * as courseService from "./course.service.js";

export const getPopularCourses = async (req, res) => {
  try {
    const courses = await courseService.getPopularCourses();
    res.status(200).json(courses);
  } catch (err) {
    console.error("getPopularCourses error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const course = await courseService.createCourse(req.body);
    res.status(201).json(course);
  } catch (err) {
    console.error("createCourse error:", err);
    res.status(500).json({
      message: err.message || "Failed to create course",
      error: err.errors || null,
    });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("getCourseById error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getCourseBySlug = async (req, res) => {
  try {
    const course = await courseService.getCourseBySlug(req.params.slug);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("getCourseBySlug error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getAllCourses = async (req, res) => {
  try {
    const courses = await courseService.getAllCourses(req.query);
    res.status(200).json(courses);
  } catch (err) {
    console.error("getAllCourses error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const getCoursesByInstructor = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const courses = await courseService.getCoursesByInstructor(instructorId);
    res.status(200).json(courses);
  } catch (err) {
    console.error("getCoursesByInstructor error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const course = await courseService.updateCourse(req.params.courseId, req.body);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json(course);
  } catch (err) {
    console.error("updateCourse error:", err);
    res.status(400).json({ message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    const course = await courseService.deleteCourse(req.params.courseId);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.status(200).json({
      message: "Delete course successfully",
      data: course,
    });
  } catch (err) {
    console.error("deleteCourse error:", err);
    res.status(400).json({ message: err.message });
  }
};