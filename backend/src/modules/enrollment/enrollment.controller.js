import * as enrollmentService from "./enrollment.service.js";

export const enrollCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    if (!studentId || !courseId) {
      return res.status(400).json({
        message: "studentId and courseId are required",
      });
    }

    const enrollment = await enrollmentService.enrollCourse({
      studentId,
      courseId,
    });

    res.status(201).json(enrollment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMyCourses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const myCourses = await enrollmentService.getMyCourses(studentId);
    res.status(200).json(myCourses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getInstructorCourses = async (req, res) => {
  try {
    const { instructorId } = req.params;
    const courses = await enrollmentService.getInstructorCourses(instructorId);
    res.status(200).json(courses);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getEnrollmentByStudentAndCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const enrollment = await enrollmentService.getEnrollmentByStudentAndCourse(
      studentId,
      courseId
    );

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found" });
    }

    res.status(200).json(enrollment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const setCurrentLesson = async (req, res) => {
  try {
    const data = await enrollmentService.setCurrentLesson(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const completeLesson = async (req, res) => {
  try {
    const data = await enrollmentService.completeLesson(req.body);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getStudentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const data = await enrollmentService.getStudentsByCourse(courseId);
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getStudentProgressDetail = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const data = await enrollmentService.getStudentProgressDetail(
      courseId,
      studentId
    );
    res.status(200).json(data);
  } catch (err) {
    if (err.message === "Enrollment not found") {
      return res.status(404).json({ message: err.message });
    }

    res.status(400).json({ message: err.message });
  }
};