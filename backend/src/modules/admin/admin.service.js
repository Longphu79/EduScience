import mongoose from "mongoose";
import User from "../user/user.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Review from "../review/review.model.js";
import Certificate from "../certificate/certificate.model.js";

const normalizeSortOrder = (sortOrder = "desc") => {
  return sortOrder === "asc" ? 1 : -1;
};

function normalizeDateRange({ from, to } = {}) {
  const range = {};

  if (from) {
    const fromDate = new Date(from);
    if (!Number.isNaN(fromDate.getTime())) {
      fromDate.setHours(0, 0, 0, 0);
      range.$gte = fromDate;
    }
  }

  if (to) {
    const toDate = new Date(to);
    if (!Number.isNaN(toDate.getTime())) {
      toDate.setHours(23, 59, 59, 999);
      range.$lte = toDate;
    }
  }

  return Object.keys(range).length ? range : null;
}

function getMonthKey(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Unknown";
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function buildRecentMonthBuckets(monthCount = 6, endDate = null) {
  const base = endDate ? new Date(endDate) : new Date();
  const now = Number.isNaN(base.getTime()) ? new Date() : base;
  const buckets = [];

  for (let i = monthCount - 1; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    buckets.push({
      key: `${year}-${month}`,
      label: `${month}/${year}`,
      enrollments: 0,
      users: 0,
      revenue: 0,
    });
  }

  return buckets;
}

function getCourseEffectivePrice(course = {}) {
  if (course?.isFree) return 0;

  const salePrice = Number(course?.salePrice);
  const price = Number(course?.price);

  if (!Number.isNaN(salePrice) && salePrice >= 0) return salePrice;
  if (!Number.isNaN(price) && price >= 0) return price;

  return 0;
}

function escapeCsvValue(value) {
  const raw = value === null || value === undefined ? "" : String(value);
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
}

function toCsv(rows = []) {
  return rows
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
    .join("\n");
}

export const getDashboardStats = async ({ from, to } = {}) => {
  const createdAtRange = normalizeDateRange({ from, to });

  const userCreatedQuery = createdAtRange ? { createdAt: createdAtRange } : {};
  const courseCreatedQuery = createdAtRange ? { createdAt: createdAtRange } : {};
  const enrollmentCreatedQuery = createdAtRange
    ? { createdAt: createdAtRange }
    : {};
  const reviewCreatedQuery = createdAtRange ? { createdAt: createdAtRange } : {};
  const certificateCreatedQuery = createdAtRange
    ? { createdAt: createdAtRange }
    : {};

  const [
    totalUsers,
    totalStudents,
    totalInstructors,
    totalAdmins,
    totalActiveUsers,
    totalCourses,
    totalDraftCourses,
    totalPublishedCourses,
    totalArchivedCourses,
    totalFreeCourses,
    totalPaidCourses,
    totalEnrollments,
    completedEnrollments,
    totalReviews,
    totalCertificates,
  ] = await Promise.all([
    User.countDocuments(userCreatedQuery),
    User.countDocuments({ ...userCreatedQuery, role: "student" }),
    User.countDocuments({ ...userCreatedQuery, role: "instructor" }),
    User.countDocuments({ ...userCreatedQuery, role: "admin" }),
    User.countDocuments({ ...userCreatedQuery, isActive: true }),

    Course.countDocuments(courseCreatedQuery),
    Course.countDocuments({ ...courseCreatedQuery, status: "draft" }),
    Course.countDocuments({ ...courseCreatedQuery, status: "published" }),
    Course.countDocuments({ ...courseCreatedQuery, status: "archived" }),
    Course.countDocuments({ ...courseCreatedQuery, isFree: true }),
    Course.countDocuments({ ...courseCreatedQuery, isFree: false }),

    Enrollment.countDocuments(enrollmentCreatedQuery),
    Enrollment.countDocuments({ ...enrollmentCreatedQuery, completed: true }),
    Review.countDocuments(reviewCreatedQuery),
    Certificate.countDocuments(certificateCreatedQuery),
  ]);

  return {
    totalUsers,
    totalStudents,
    totalInstructors,
    totalAdmins,
    totalActiveUsers,
    totalInactiveUsers: Math.max(0, totalUsers - totalActiveUsers),
    totalCourses,
    totalDraftCourses,
    totalPublishedCourses,
    totalArchivedCourses,
    totalFreeCourses,
    totalPaidCourses,
    totalEnrollments,
    completedEnrollments,
    totalReviews,
    totalCertificates,
  };
};

export const getRecentUsers = async (limit = 5, { from, to } = {}) => {
  const safeLimit = Math.max(1, Number(limit) || 5);
  const createdAtRange = normalizeDateRange({ from, to });
  const query = createdAtRange ? { createdAt: createdAtRange } : {};

  return User.find(query)
    .select("-password")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
};

export const getRecentCourses = async (limit = 5, { from, to } = {}) => {
  const safeLimit = Math.max(1, Number(limit) || 5);
  const createdAtRange = normalizeDateRange({ from, to });
  const query = createdAtRange ? { createdAt: createdAtRange } : {};

  return Course.find(query)
    .populate("instructorId", "username fullName email avatarUrl role isActive")
    .sort({ createdAt: -1 })
    .limit(safeLimit)
    .lean();
};

export const getTopCourses = async (limit = 5, { from, to } = {}) => {
  const safeLimit = Math.max(1, Number(limit) || 5);
  const createdAtRange = normalizeDateRange({ from, to });
  const query = createdAtRange ? { createdAt: createdAtRange } : {};

  return Course.find(query)
    .populate("instructorId", "username fullName email avatarUrl")
    .sort({ totalEnrollments: -1, rating: -1, createdAt: -1 })
    .limit(safeLimit)
    .lean();
};

export const getDashboardAnalytics = async ({ from, to } = {}) => {
  const createdAtRange = normalizeDateRange({ from, to });

  const courseQuery = createdAtRange ? { createdAt: createdAtRange } : {};
  const enrollmentQuery = createdAtRange ? { createdAt: createdAtRange } : {};
  const userQuery = createdAtRange ? { createdAt: createdAtRange } : {};
  const reviewQuery = createdAtRange ? { createdAt: createdAtRange } : {};

  const [courses, enrollments, users, reviews] = await Promise.all([
    Course.find(courseQuery)
      .select(
        "_id title category instructorId price salePrice isFree totalEnrollments rating status createdAt"
      )
      .populate("instructorId", "username fullName email avatarUrl")
      .lean(),
    Enrollment.find(enrollmentQuery)
      .select("courseId studentId progress completed createdAt completedAt")
      .lean(),
    User.find(userQuery)
      .select("_id role createdAt isActive fullName username email")
      .lean(),
    Review.find(reviewQuery).select("courseId rating createdAt").lean(),
  ]);

  const courseMap = new Map(courses.map((course) => [String(course._id), course]));
  const topInstructorMap = new Map();
  const categoryMap = new Map();
  const reviewByCourseMap = new Map();

  reviews.forEach((review) => {
    const key = String(review.courseId);
    if (!reviewByCourseMap.has(key)) {
      reviewByCourseMap.set(key, []);
    }
    reviewByCourseMap.get(key).push(review);
  });

  courses.forEach((course) => {
    const courseId = String(course._id);
    const category = course.category || "General";
    const instructorId = String(course.instructorId?._id || course.instructorId || "");
    const instructorName =
      course.instructorId?.fullName ||
      course.instructorId?.username ||
      "Instructor";

    if (!categoryMap.has(category)) {
      categoryMap.set(category, {
        category,
        totalCourses: 0,
        totalEnrollments: 0,
        estimatedRevenue: 0,
      });
    }

    categoryMap.get(category).totalCourses += 1;

    if (instructorId) {
      if (!topInstructorMap.has(instructorId)) {
        topInstructorMap.set(instructorId, {
          _id: instructorId,
          fullName: instructorName,
          email: course.instructorId?.email || "",
          avatarUrl: course.instructorId?.avatarUrl || "",
          totalCourses: 0,
          publishedCourses: 0,
          totalEnrollments: 0,
          estimatedRevenue: 0,
          averageRating: 0,
          ratingCount: 0,
        });
      }

      const instructorItem = topInstructorMap.get(instructorId);
      instructorItem.totalCourses += 1;
      if (course.status === "published") {
        instructorItem.publishedCourses += 1;
      }
    }

    const courseReviews = reviewByCourseMap.get(courseId) || [];
    if (instructorId && courseReviews.length) {
      const instructorItem = topInstructorMap.get(instructorId);
      instructorItem.ratingCount += courseReviews.length;
      instructorItem.averageRating += courseReviews.reduce(
        (sum, item) => sum + Number(item.rating || 0),
        0
      );
    }
  });

  let estimatedRevenue = 0;
  let averageProgress = 0;
  let completionRate = 0;

  const trendBuckets = buildRecentMonthBuckets(6, to || null);
  const bucketMap = new Map(trendBuckets.map((item) => [item.key, item]));

  users.forEach((user) => {
    const key = getMonthKey(user.createdAt);
    if (bucketMap.has(key)) {
      bucketMap.get(key).users += 1;
    }
  });

  if (enrollments.length > 0) {
    averageProgress = Math.round(
      enrollments.reduce((sum, item) => sum + Number(item.progress || 0), 0) /
        enrollments.length
    );

    completionRate = Math.round(
      (enrollments.filter((item) => item.completed).length / enrollments.length) *
        100
    );
  }

  enrollments.forEach((enrollment) => {
    const course = courseMap.get(String(enrollment.courseId));
    const price = getCourseEffectivePrice(course);
    estimatedRevenue += price;

    if (course) {
      const category = course.category || "General";
      if (categoryMap.has(category)) {
        categoryMap.get(category).totalEnrollments += 1;
        categoryMap.get(category).estimatedRevenue += price;
      }

      const instructorId = String(
        course.instructorId?._id || course.instructorId || ""
      );
      if (topInstructorMap.has(instructorId)) {
        const instructorItem = topInstructorMap.get(instructorId);
        instructorItem.totalEnrollments += 1;
        instructorItem.estimatedRevenue += price;
      }
    }

    const key = getMonthKey(enrollment.createdAt);
    if (bucketMap.has(key)) {
      bucketMap.get(key).enrollments += 1;
      bucketMap.get(key).revenue += price;
    }
  });

  const topInstructors = [...topInstructorMap.values()]
    .map((item) => ({
      ...item,
      averageRating: item.ratingCount
        ? Number((item.averageRating / item.ratingCount).toFixed(1))
        : 0,
    }))
    .sort((a, b) => {
      if (b.totalEnrollments !== a.totalEnrollments) {
        return b.totalEnrollments - a.totalEnrollments;
      }
      if (b.estimatedRevenue !== a.estimatedRevenue) {
        return b.estimatedRevenue - a.estimatedRevenue;
      }
      return b.publishedCourses - a.publishedCourses;
    })
    .slice(0, 5);

  const topCategories = [...categoryMap.values()]
    .sort((a, b) => {
      if (b.totalEnrollments !== a.totalEnrollments) {
        return b.totalEnrollments - a.totalEnrollments;
      }
      return b.totalCourses - a.totalCourses;
    })
    .slice(0, 5);

  const publishedCourses = courses.filter((course) => course.status === "published");
  const averageCourseRating = publishedCourses.length
    ? Number(
        (
          publishedCourses.reduce(
            (sum, course) => sum + Number(course.rating || 0),
            0
          ) / publishedCourses.length
        ).toFixed(1)
      )
    : 0;

  return {
    estimatedRevenue,
    completionRate,
    averageProgress,
    averageCourseRating,
    monthlyTrend: trendBuckets,
    topInstructors,
    topCategories,
  };
};

export const getDashboardOverview = async ({ from, to } = {}) => {
  const [stats, recentUsers, recentCourses, topCourses, analytics] =
    await Promise.all([
      getDashboardStats({ from, to }),
      getRecentUsers(5, { from, to }),
      getRecentCourses(5, { from, to }),
      getTopCourses(5, { from, to }),
      getDashboardAnalytics({ from, to }),
    ]);

  return {
    stats: {
      ...stats,
      estimatedRevenue: analytics.estimatedRevenue,
      completionRate: analytics.completionRate,
      averageProgress: analytics.averageProgress,
      averageCourseRating: analytics.averageCourseRating,
    },
    recentUsers,
    recentCourses,
    topCourses,
    analytics,
    filters: {
      from: from || "",
      to: to || "",
    },
  };
};

export const getDashboardCsv = async ({ from, to } = {}) => {
  const dashboard = await getDashboardOverview({ from, to });

  const rows = [
    ["Section", "Metric", "Value", "Extra"],
    ["Filter", "From", dashboard.filters?.from || "", ""],
    ["Filter", "To", dashboard.filters?.to || "", ""],
    ["Summary", "Total Users", dashboard.stats.totalUsers, ""],
    ["Summary", "Total Students", dashboard.stats.totalStudents, ""],
    ["Summary", "Total Instructors", dashboard.stats.totalInstructors, ""],
    ["Summary", "Total Admins", dashboard.stats.totalAdmins, ""],
    ["Summary", "Active Users", dashboard.stats.totalActiveUsers, ""],
    ["Summary", "Inactive Users", dashboard.stats.totalInactiveUsers, ""],
    ["Summary", "Total Courses", dashboard.stats.totalCourses, ""],
    ["Summary", "Draft Courses", dashboard.stats.totalDraftCourses, ""],
    ["Summary", "Published Courses", dashboard.stats.totalPublishedCourses, ""],
    ["Summary", "Archived Courses", dashboard.stats.totalArchivedCourses, ""],
    ["Summary", "Free Courses", dashboard.stats.totalFreeCourses, ""],
    ["Summary", "Paid Courses", dashboard.stats.totalPaidCourses, ""],
    ["Summary", "Total Enrollments", dashboard.stats.totalEnrollments, ""],
    ["Summary", "Completed Enrollments", dashboard.stats.completedEnrollments, ""],
    ["Summary", "Estimated Revenue", dashboard.stats.estimatedRevenue, ""],
    ["Summary", "Completion Rate", `${dashboard.stats.completionRate}%`, ""],
    ["Summary", "Average Progress", `${dashboard.stats.averageProgress}%`, ""],
    ["Summary", "Average Course Rating", dashboard.stats.averageCourseRating, ""],
    ["Summary", "Total Reviews", dashboard.stats.totalReviews, ""],
    ["Summary", "Total Certificates", dashboard.stats.totalCertificates, ""],
    [""],
    ["Top Instructors", "Name", "Enrollments", "Revenue"],
    ...dashboard.analytics.topInstructors.map((item) => [
      "Top Instructor",
      item.fullName || "Instructor",
      item.totalEnrollments || 0,
      item.estimatedRevenue || 0,
    ]),
    [""],
    ["Top Categories", "Category", "Enrollments", "Revenue"],
    ...dashboard.analytics.topCategories.map((item) => [
      "Top Category",
      item.category || "General",
      item.totalEnrollments || 0,
      item.estimatedRevenue || 0,
    ]),
    [""],
    ["Monthly Trend", "Month", "Users", "Enrollments / Revenue"],
    ...dashboard.analytics.monthlyTrend.map((item) => [
      "Monthly Trend",
      item.label || item.key,
      item.users || 0,
      `${item.enrollments || 0} / ${item.revenue || 0}`,
    ]),
  ];

  return `\uFEFF${toCsv(rows)}`;
};

export const getUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  role = "",
  isActive = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  from = "",
  to = "",
}) => {
  const query = {};
  const createdAtRange = normalizeDateRange({ from, to });

  if (role) query.role = role;
  if (isActive === "true") query.isActive = true;
  if (isActive === "false") query.isActive = false;
  if (createdAtRange) query.createdAt = createdAtRange;

  if (search?.trim()) {
    query.$or = [
      { username: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
      { fullName: { $regex: search.trim(), $options: "i" } },
      { headline: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "username",
    "fullName",
    "role",
    "isActive",
  ];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const safeSortOrder = normalizeSortOrder(sortOrder);

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 10);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    User.find(query)
      .select("-password")
      .sort({ [safeSortBy]: safeSortOrder })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems: total,
      totalPages: Math.ceil(total / safeLimit),
    },
    filters: {
      search,
      role,
      isActive,
      sortBy: safeSortBy,
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
      from,
      to,
    },
  };
};

export const getUserDetail = async (userId) => {
  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    throw new Error("User not found");
  }

  let extra = {};

  if (user.role === "student") {
    const enrollments = await Enrollment.find({ studentId: userId })
      .populate(
        "courseId",
        "title slug thumbnail status level price salePrice isFree"
      )
      .sort({ createdAt: -1 })
      .lean();

    const certificatesCount = await Certificate.countDocuments({ studentId: userId });

    extra = {
      enrollments,
      summary: {
        totalEnrollments: enrollments.length,
        completedCourses: enrollments.filter((e) => e.completed).length,
        inProgressCourses: enrollments.filter((e) => !e.completed).length,
        certificatesCount,
      },
    };
  }

  if (user.role === "instructor") {
    const courses = await Course.find({ instructorId: userId })
      .sort({ createdAt: -1 })
      .lean();

    const courseIds = courses.map((c) => c._id);

    const enrollmentsCount = courseIds.length
      ? await Enrollment.countDocuments({ courseId: { $in: courseIds } })
      : 0;

    extra = {
      courses,
      summary: {
        totalCourses: courses.length,
        publishedCourses: courses.filter((c) => c.status === "published").length,
        draftCourses: courses.filter((c) => c.status === "draft").length,
        archivedCourses: courses.filter((c) => c.status === "archived").length,
        totalStudents: enrollmentsCount,
      },
    };
  }

  return {
    user,
    ...extra,
  };
};

export const setUserActiveStatus = async (
  userId,
  isActive,
  currentAdminId = null
) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error("User not found");
  }

  if (
    currentAdminId &&
    String(user._id) === String(currentAdminId) &&
    isActive === false
  ) {
    throw new Error("You cannot deactivate your own account");
  }

  if (
    user.role === "admin" &&
    currentAdminId &&
    String(user._id) !== String(currentAdminId)
  ) {
    throw new Error("Cannot change active status of another admin");
  }

  user.isActive = isActive;
  await user.save();

  return user.toObject();
};

export const getCourses = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  level = "",
  pricing = "",
  instructorId = "",
  sortBy = "createdAt",
  sortOrder = "desc",
  from = "",
  to = "",
}) => {
  const query = {};
  const createdAtRange = normalizeDateRange({ from, to });

  if (status) query.status = status;
  if (level) query.level = level;
  if (createdAtRange) query.createdAt = createdAtRange;

  if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
    query.instructorId = instructorId;
  }

  if (pricing === "free") query.isFree = true;
  if (pricing === "paid") query.isFree = false;

  if (search?.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: "i" } },
      { slug: { $regex: search.trim(), $options: "i" } },
      { category: { $regex: search.trim(), $options: "i" } },
      { shortDescription: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const allowedSortFields = [
    "createdAt",
    "updatedAt",
    "title",
    "price",
    "rating",
    "totalEnrollments",
    "status",
    "level",
  ];
  const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : "createdAt";
  const safeSortOrder = normalizeSortOrder(sortOrder);

  const safePage = Math.max(1, Number(page) || 1);
  const safeLimit = Math.max(1, Number(limit) || 10);
  const skip = (safePage - 1) * safeLimit;

  const [items, total] = await Promise.all([
    Course.find(query)
      .populate("instructorId", "username fullName email avatarUrl isActive")
      .sort({ [safeSortBy]: safeSortOrder })
      .skip(skip)
      .limit(safeLimit)
      .lean(),
    Course.countDocuments(query),
  ]);

  return {
    items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      totalItems: total,
      totalPages: Math.ceil(total / safeLimit),
    },
    filters: {
      search,
      status,
      level,
      pricing,
      instructorId,
      sortBy: safeSortBy,
      sortOrder: sortOrder === "asc" ? "asc" : "desc",
      from,
      to,
    },
  };
};

export const getCourseDetail = async (courseId) => {
  const course = await Course.findById(courseId)
    .populate("instructorId", "username fullName email avatarUrl isActive")
    .lean();

  if (!course) {
    throw new Error("Course not found");
  }

  const enrollmentsCount = await Enrollment.countDocuments({ courseId });

  return {
    course,
    summary: {
      enrollmentsCount,
    },
  };
};

export const setCourseStatus = async (courseId, status) => {
  const allowedStatuses = ["draft", "published", "archived"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid course status");
  }

  const course = await Course.findById(courseId);

  if (!course) {
    throw new Error("Course not found");
  }

  course.status = status;
  await course.save();

  return course.toObject();
};