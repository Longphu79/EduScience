import Course from "../models/Course.js";
import Instructor from "../models/Instructor.js";
import LessonComment from "../models/LessonComment.js";
import PayoutRequest from "../models/PayoutRequest.js";
import User from "../models/User.js";
import Enrollment from "../models/Enrollment.js";
import Lesson from "../models/Lesson.js";
import { getInstructorProfileForActor } from "./access.service.js";
import { getInstructorPayoutWorkspace } from "./payout.service.js";

const formatMoney = (value) => value ?? 0;

export const getInstructorOverview = async (actor) => {
  const instructor = await getInstructorProfileForActor(actor);
  const courses = await Course.find({ instructorId: instructor._id })
    .select(
      "title slug status totalEnrollments totalReviews totalLessons totalEnrollments createdAt updatedAt",
    )
    .sort({ updatedAt: -1 })
    .lean();
  const payoutWorkspace = await getInstructorPayoutWorkspace(actor);
  const courseIds = courses.map((course) => course._id);

  const [recentComments, commentCount] = await Promise.all([
    LessonComment.find({
      courseId: { $in: courseIds },
      authorRole: "student",
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("body authorDisplayName courseId createdAt")
      .lean(),
    LessonComment.countDocuments({
      courseId: { $in: courseIds },
      authorRole: "student",
    }),
  ]);

  return {
    profile: {
      id: instructor._id,
      name: instructor.name,
      bio: instructor.bio,
      expertise: instructor.expertise ?? [],
      rating: instructor.rating,
      totalStudents: instructor.totalStudents,
      revenue: instructor.revenue,
    },
    summary: {
      totalCourses: courses.length,
      publishedCourses: courses.filter((course) => course.status === "published")
        .length,
      totalStudents: instructor.totalStudents ?? 0,
      lifetimeRevenue: formatMoney(instructor.revenue),
      availablePayoutBalance: payoutWorkspace.balance.availableBalance,
      pendingPayoutAmount:
        payoutWorkspace.balance.pendingAmount +
        payoutWorkspace.balance.processingAmount,
      studentCommentCount: commentCount,
    },
    recentComments: recentComments.map((comment) => ({
      ...comment,
      course: courses.find(
        (course) => course._id.toString() === comment.courseId.toString(),
      )?.title,
    })),
  };
};

export const listInstructorCourses = async (actor) => {
  const instructor = await getInstructorProfileForActor(actor);

  return await Course.find({ instructorId: instructor._id })
    .select(
      "title slug status category level price salePrice totalLessons totalReviews totalEnrollments updatedAt createdAt",
    )
    .sort({ updatedAt: -1 })
    .lean();
};

export const getAdminOverview = async () => {
  const [courseStats, instructorCount, studentCount, payoutRequests] =
    await Promise.all([
      Course.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            enrollments: { $sum: "$totalEnrollments" },
          },
        },
      ]),
      Instructor.countDocuments({}),
      User.countDocuments({ role: "student" }),
      PayoutRequest.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .populate({
          path: "instructorId",
          select: "name",
        })
        .select("payoutCode amount status createdAt instructorId")
        .lean(),
    ]);

  const courseSummary = courseStats.reduce(
    (acc, item) => {
      acc.total += item.count;
      acc.totalEnrollments += item.enrollments ?? 0;
      acc[item._id] = item.count;
      return acc;
    },
    {
      total: 0,
      totalEnrollments: 0,
      published: 0,
      draft: 0,
      archived: 0,
    },
  );

  const payoutSummary = payoutRequests.reduce(
    (acc, request) => {
      if (request.status === "pending") {
        acc.pending += 1;
      } else if (request.status === "processing") {
        acc.processing += 1;
      } else if (request.status === "paid") {
        acc.paid += 1;
      } else if (request.status === "rejected") {
        acc.rejected += 1;
      }

      acc.totalRequested += request.amount;
      return acc;
    },
    { pending: 0, processing: 0, paid: 0, rejected: 0, totalRequested: 0 },
  );

  return {
    summary: {
      totalCourses: courseSummary.total,
      publishedCourses: courseSummary.published,
      draftCourses: courseSummary.draft,
      archivedCourses: courseSummary.archived,
      totalEnrollments: courseSummary.totalEnrollments,
      instructorCount,
      studentCount,
      payoutPendingCount: payoutSummary.pending,
      payoutProcessingCount: payoutSummary.processing,
      payoutTotalRequested: payoutSummary.totalRequested,
    },
    recentPayouts: payoutRequests.map((request) => ({
      _id: request._id,
      payoutCode: request.payoutCode,
      amount: request.amount,
      status: request.status,
      createdAt: request.createdAt,
      instructorName: request.instructorId?.name ?? "Unknown instructor",
    })),
  };
};

export const getInstructorCourseHealth = async (actor) => {
  const instructor = await getInstructorProfileForActor(actor);
  const courses = await Course.find({ instructorId: instructor._id })
    .select(
      "title slug status totalEnrollments totalReviews totalLessons updatedAt createdAt",
    )
    .sort({ updatedAt: -1 })
    .lean();

  const courseIds = courses.map((course) => course._id);
  if (courseIds.length === 0) {
    return [];
  }

  const [enrollmentStats, previewLessons, commentStats] = await Promise.all([
    Enrollment.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      {
        $group: {
          _id: "$courseId",
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: ["$completed", 1, 0],
            },
          },
        },
      },
    ]),
    Lesson.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      {
        $group: {
          _id: "$courseId",
          hasPreview: {
            $max: {
              $cond: ["$isPreview", 1, 0],
            },
          },
          latestLesson: { $max: "$updatedAt" },
        },
      },
    ]),
    LessonComment.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      {
        $group: {
          _id: "$courseId",
          totalComments: { $sum: 1 },
        },
      },
    ]),
  ]);

  const enrollmentMap = new Map(
    enrollmentStats.map((stat) => [stat._id.toString(), stat]),
  );
  const previewMap = new Map(
    previewLessons.map((lesson) => [lesson._id.toString(), lesson]),
  );
  const commentMap = new Map(
    commentStats.map((stat) => [stat._id.toString(), stat.totalComments]),
  );

  return courses.map((course) => {
    const stats = enrollmentMap.get(course._id.toString()) ?? {
      total: 0,
      completed: 0,
    };
    const preview = previewMap.get(course._id.toString());
    const totalEnrollments = stats.total;
    const completionRate =
      totalEnrollments === 0
        ? 0
        : Math.round((stats.completed / totalEnrollments) * 100);
    const healthFlags = [];
    if (totalEnrollments < 10) {
      healthFlags.push("low-enrollment");
    }
    if (completionRate < 50) {
      healthFlags.push("low-completion");
    }
    if (!preview?.hasPreview) {
      healthFlags.push("no-preview");
    }

    return {
      courseId: course._id,
      title: course.title,
      slug: course.slug,
      status: course.status,
      totalEnrollments,
      completionRate,
      previewReady: Boolean(preview?.hasPreview),
      totalLessons: course.totalLessons,
      totalReviews: course.totalReviews,
      lastActivity: preview?.latestLesson ?? course.updatedAt,
      recentComments: commentMap.get(course._id.toString()) ?? 0,
      healthFlags,
    };
  });
};

export const getAdminModerationQueue = async () => {
  const flaggedCourses = await Course.find({
    status: { $in: ["draft", "archived"] },
  })
    .select(
      "title slug status totalEnrollments totalReviews totalLessons updatedAt createdAt instructorId category level",
    )
    .populate({
      path: "instructorId",
      select: "name",
    })
    .sort({ updatedAt: -1 })
    .limit(8)
    .lean();

  return flaggedCourses.map((course) => ({
    courseId: course._id,
    title: course.title,
    slug: course.slug,
    status: course.status,
    instructor: course.instructorId?.name ?? "Unknown",
    category: course.category,
    level: course.level,
    enrollments: course.totalEnrollments,
    reviews: course.totalReviews,
    lessons: course.totalLessons,
    updatedAt: course.updatedAt,
  }));
};

export const listAdminCourses = async () => {
  return await Course.find({})
    .select(
      "title slug status category level price salePrice totalLessons totalReviews totalEnrollments updatedAt createdAt instructorId",
    )
    .populate({
      path: "instructorId",
      select: "name avatarUrl rating totalStudents",
    })
    .sort({ updatedAt: -1 })
    .lean();
};
