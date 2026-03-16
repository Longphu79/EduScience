import User from "../../models/User.js";
import Course from "../../models/Course.js";
import Enrollment from "../enrollment/enrollment.model.js";

/**
 * Dashboard statistics
 */
export const getDashboardStats = async () => {

  const totalUsers = await User.countDocuments();

  const totalCourses = await Course.countDocuments();

  const totalEnrollments = await Enrollment.countDocuments();

  const revenueResult = await Enrollment.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$pricePaid" },
      },
    },
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  return {
    totalUsers,
    totalCourses,
    totalEnrollments,
    totalRevenue,
  };
};

/**
 * Get all users
 */
export const getAllUsers = async () => {
  return User.find().sort({ createdAt: -1 });
};

/**
 * Get all courses
 */
export const getAllCourses = async () => {
  return Course.find()
    .populate("instructorId")
    .sort({ createdAt: -1 });
};

/**
 * Delete user
 */
export const deleteUser = async (userId) => {
  return User.findByIdAndDelete(userId);
};

/**
 * Delete course
 */
export const deleteCourse = async (courseId) => {
  return Course.findByIdAndDelete(courseId);
};

/**
 * Top courses by sales
 */
export const getTopCourses = async (limit = 5) => {
  return Enrollment.aggregate([
    {
      $group: {
        _id: "$courseId",
        totalSales: { $sum: 1 },
        revenue: { $sum: "$pricePaid" },
      },
    },
    {
      $sort: { totalSales: -1 },
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "courses",
        localField: "_id",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },
  ]);
};

/**
 * Top instructors by revenue
 */
export const getTopInstructors = async (limit = 5) => {
  return Enrollment.aggregate([
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    { $unwind: "$course" },

    {
      $group: {
        _id: "$course.instructorId",
        totalRevenue: { $sum: "$pricePaid" },
        totalSales: { $sum: 1 },
      },
    },

    {
      $sort: { totalRevenue: -1 },
    },

    {
      $limit: limit,
    },

    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "instructor",
      },
    },

    { $unwind: "$instructor" },
  ]);
};

/**
 * Revenue by month
 */
export const getRevenueByMonth = async () => {
  return Enrollment.aggregate([
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        revenue: { $sum: "$pricePaid" },
        sales: { $sum: 1 },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);
};