import Course from "../models/Course.js";
import "../models/Lesson.js";

export const getPopularCourses = async () => {
  const courses = await Course.find({
    isPopular: true,
    status: "published",
  })
    .sort({ totalEnrollments: -1 })
    .limit(6)
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });

  return courses;
};

export const createCourse = async (courseData) => {
  if (courseData.isFree) {
    courseData.price = 0;
    courseData.salePrice = 0;
  }

  if (Array.isArray(courseData.lessonIds)) {
    courseData.totalLessons = courseData.lessonIds.length;
  }

  return await Course.create(courseData);
};

export const getCourseById = async (courseId) => {
  return await Course.findById(courseId)
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const getCourseBySlug = async (slug) => {
  return await Course.findOne({
    slug,
    status: "published",
  })
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const getAllCourses = async (query = {}) => {
  const filter = {};

  if (query.status) {
    filter.status = query.status;
  } else {
    filter.status = "published";
  }

  if (query.search) {
    filter.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { category: { $regex: query.search, $options: "i" } },
      { level: { $regex: query.search, $options: "i" } },
    ];
  }

  if (query.category && query.category !== "All") {
    filter.category = { $regex: `^${query.category}$`, $options: "i" };
  }

  if (query.level && query.level !== "All") {
    filter.level = query.level.toLowerCase();
  }

  let sort = { createdAt: -1 };

  switch (query.sortBy) {
    case "popular":
      sort = { totalEnrollments: -1, createdAt: -1 };
      break;
    case "rating":
      sort = { rating: -1, createdAt: -1 };
      break;
    case "priceAsc":
      sort = { price: 1, createdAt: -1 };
      break;
    case "priceDesc":
      sort = { price: -1, createdAt: -1 };
      break;
    case "newest":
      sort = { createdAt: -1 };
      break;
    default:
      sort = { createdAt: -1 };
      break;
  }

  return await Course.find(filter).populate("instructorId").sort(sort);
};

export const getCoursesByInstructor = async (instructorId) => {
  return await Course.find({ instructorId })
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      options: { sort: { order: 1, createdAt: 1 } },
    })
    .sort({ createdAt: -1 });
};

export const getCourseLearningDetail = async (courseId) => {
  return await Course.findById(courseId)
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      match: { isPublished: true },
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const updateCourse = async (courseId, updateData) => {
  if (updateData.isFree) {
    updateData.price = 0;
    updateData.salePrice = 0;
  }

  if (Array.isArray(updateData.lessonIds)) {
    updateData.totalLessons = updateData.lessonIds.length;
  }

  return await Course.findByIdAndUpdate(courseId, updateData, {
    new: true,
  })
    .populate("instructorId")
    .populate({
      path: "lessonIds",
      options: { sort: { order: 1, createdAt: 1 } },
    });
};

export const deleteCourse = async (courseId) => {
  return await Course.findByIdAndDelete(courseId);
};