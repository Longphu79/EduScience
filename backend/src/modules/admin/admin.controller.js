import * as adminService from "./admin.service.js";

export const getDashboard = async (req, res) => {
  try {

    const stats = await adminService.getDashboardStats();

    const topCourses = await adminService.getTopCourses();

    const topInstructors = await adminService.getTopInstructors();

    const revenueByMonth = await adminService.getRevenueByMonth();

    res.json({
      stats,
      topCourses,
      topInstructors,
      revenueByMonth,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {

    const users = await adminService.getAllUsers();

    res.json(users);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getCourses = async (req, res) => {
  try {

    const courses = await adminService.getAllCourses();

    res.json(courses);

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {

    await adminService.deleteUser(req.params.userId);

    res.json({
      message: "User deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteCourse = async (req, res) => {
  try {

    await adminService.deleteCourse(req.params.courseId);

    res.json({
      message: "Course deleted",
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};