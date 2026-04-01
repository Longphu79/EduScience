import Enrollment from "./enrollment.model.js";
import Course from "../course/course.model.js";
import Quiz from "../quiz/quiz.model.js";
import QuizAttempt from "../quiz/quizAttempt.model.js";
import Assignment from "../assignment/assignment.model.js";
import AssignmentSubmission from "../assignment/assignmentSubmission.model.js";
import Certificate from "../certificate/certificate.model.js";
import ChatConversation from "../chat/chatConversation.model.js";
import Material from "../material/material.model.js";
import { awardXp, XP_RULES } from "../gamification/gamification.service.js";

const lessonPopulateConfig = {
    path: "lessonIds",
    match: { isPublished: true },
    options: { sort: { order: 1, createdAt: 1 } },
};

async function getPublishedCourseWithLessons(courseId) {
    return Course.findById(courseId).populate(lessonPopulateConfig);
}

function toStringId(value) {
    return String(value?._id || value || "");
}

function calcProgress(totalLessons, completedLessonsCount) {
    if (!totalLessons || totalLessons <= 0) return 0;

    return Math.min(
        100,
        Math.round(
            (Number(completedLessonsCount || 0) / Number(totalLessons)) * 100,
        ),
    );
}

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

function isDateInRange(dateValue, range) {
    if (!range) return true;
    if (!dateValue) return false;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return false;

    if (range.$gte && date < range.$gte) return false;
    if (range.$lte && date > range.$lte) return false;

    return true;
}

function getMonthKey(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "Unknown";
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    return `${year}-${month}`;
}

function getDayKey(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
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
            quizAttempts: 0,
            submissions: 0,
        });
    }

    return buckets;
}

function buildRecentWeekBuckets(dayCount = 7, endDate = null) {
    const base = endDate ? new Date(endDate) : new Date();
    const now = Number.isNaN(base.getTime()) ? new Date() : base;
    now.setHours(0, 0, 0, 0);

    const buckets = [];

    for (let i = dayCount - 1; i >= 0; i -= 1) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);

        const key = getDayKey(date);
        buckets.push({
            key,
            label: `${`${date.getDate()}`.padStart(2, "0")}/${`${date.getMonth() + 1}`.padStart(2, "0")}`,
            activities: 0,
            quizAttempts: 0,
            submissions: 0,
            learningHours: 0,
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

function calculateStreakStats(dateValues = []) {
    const uniqueDays = [
        ...new Set(dateValues.map((item) => getDayKey(item)).filter(Boolean)),
    ].sort((a, b) => new Date(a) - new Date(b));

    if (!uniqueDays.length) {
        return {
            currentStreak: 0,
            bestStreak: 0,
            activeDays: 0,
            lastActiveDate: null,
        };
    }

    let bestStreak = 1;
    let running = 1;

    for (let i = 1; i < uniqueDays.length; i += 1) {
        const prev = new Date(uniqueDays[i - 1]);
        const current = new Date(uniqueDays[i]);
        const diffDays = Math.round(
            (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (diffDays === 1) {
            running += 1;
        } else {
            running = 1;
        }

        if (running > bestStreak) {
            bestStreak = running;
        }
    }

    const todayKey = getDayKey(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getDayKey(yesterday);

    let currentStreak = 0;
    const lastDay = uniqueDays[uniqueDays.length - 1];

    if (lastDay === todayKey || lastDay === yesterdayKey) {
        currentStreak = 1;

        for (let i = uniqueDays.length - 1; i > 0; i -= 1) {
            const current = new Date(uniqueDays[i]);
            const prev = new Date(uniqueDays[i - 1]);
            const diffDays = Math.round(
                (current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
            );

            if (diffDays === 1) {
                currentStreak += 1;
            } else {
                break;
            }
        }
    }

    return {
        currentStreak,
        bestStreak,
        activeDays: uniqueDays.length,
        lastActiveDate: uniqueDays[uniqueDays.length - 1] || null,
    };
}

export const createEnrollmentRecord = async ({ studentId, courseId }) => {
    if (!studentId || !courseId) {
        throw new Error("studentId and courseId are required");
    }

    const existed = await Enrollment.findOne({ studentId, courseId });
    if (existed) {
        return existed;
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }

    if (course.status !== "published") {
        throw new Error("Course is not available for enrollment");
    }

    const enrollment = await Enrollment.create({
        studentId,
        courseId,
        progress: 0,
        completed: false,
        completedAt: null,
        completedLessons: [],
        lastLessonId: null,
    });

    await Course.findByIdAndUpdate(courseId, {
        $inc: { totalEnrollments: 1 },
    });

    return enrollment;
};

export const enrollCourse = async ({ studentId, courseId }) => {
    if (!studentId || !courseId) {
        throw new Error("studentId and courseId are required");
    }

    const existed = await Enrollment.findOne({ studentId, courseId });
    if (existed) {
        throw new Error("You already enrolled in this course");
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }

    if (course.status !== "published") {
        throw new Error("Course is not available for enrollment");
    }

    if (String(course.instructorId) === String(studentId)) {
        throw new Error("Instructor cannot enroll in own course");
    }

    const isFreeCourse =
        course.isFree === true || Number(course.price || 0) === 0;

    if (!isFreeCourse) {
        throw new Error(
            "Paid course must be purchased through cart checkout before enrollment",
        );
    }

    return await createEnrollmentRecord({ studentId, courseId });
};

export const getStudentDashboardSummary = async (
    studentId,
    { from = "", to = "" } = {},
) => {
    if (!studentId) {
        throw new Error("studentId is required");
    }

    const eventRange = normalizeDateRange({ from, to });

    const allEnrollments = await Enrollment.find({ studentId })
        .populate({
            path: "courseId",
            populate: [{ path: "instructorId" }, lessonPopulateConfig],
        })
        .sort({ updatedAt: -1 });

    const allCourseIds = allEnrollments
        .map((item) => item?.courseId?._id || item?.courseId)
        .filter(Boolean);

    const scopeEnrollments = eventRange
        ? allEnrollments.filter((item) => {
              return (
                  isDateInRange(item.createdAt, eventRange) ||
                  isDateInRange(item.updatedAt, eventRange) ||
                  isDateInRange(item.completedAt, eventRange)
              );
          })
        : allEnrollments;

    const scopeCourseIds = [
        ...new Set(
            scopeEnrollments
                .map((item) => item?.courseId?._id || item?.courseId)
                .filter(Boolean)
                .map(String),
        ),
    ];

    const quizQuery = {
        courseId: { $in: scopeCourseIds },
        isPublished: true,
    };

    const assignmentQuery = {
        courseId: { $in: scopeCourseIds },
        isPublished: true,
    };

    const attemptQuery = {
        studentId,
        courseId: { $in: scopeCourseIds },
    };

    const submissionQuery = {
        studentId,
        courseId: { $in: scopeCourseIds },
    };

    const certificateQuery = {
        studentId,
        courseId: { $in: allCourseIds },
    };

    if (eventRange) {
        attemptQuery.createdAt = eventRange;
        submissionQuery.createdAt = eventRange;
        certificateQuery.createdAt = eventRange;
    }

    const [quizzes, attempts, assignments, submissions, certificates] =
        await Promise.all([
            Quiz.find(quizQuery).lean(),
            QuizAttempt.find(attemptQuery).lean(),
            Assignment.find(assignmentQuery).lean(),
            AssignmentSubmission.find(submissionQuery).lean(),
            Certificate.find(certificateQuery).lean(),
        ]);

    const totalEnrolledCourses = eventRange
        ? allEnrollments.filter((item) =>
              isDateInRange(item.createdAt, eventRange),
          ).length
        : allEnrollments.length;

    const totalCompletedCourses = eventRange
        ? allEnrollments.filter(
              (item) =>
                  item.completed && isDateInRange(item.completedAt, eventRange),
          ).length
        : allEnrollments.filter((item) => item.completed).length;

    const totalInProgressCourses = eventRange
        ? allEnrollments.filter(
              (item) =>
                  !item.completed &&
                  Number(item.progress || 0) > 0 &&
                  (isDateInRange(item.createdAt, eventRange) ||
                      isDateInRange(item.updatedAt, eventRange)),
          ).length
        : allEnrollments.filter(
              (item) => !item.completed && Number(item.progress || 0) > 0,
          ).length;

    const totalLessonCount = scopeEnrollments.reduce((sum, item) => {
        const lessons = Array.isArray(item?.courseId?.lessonIds)
            ? item.courseId.lessonIds.length
            : 0;

        return sum + lessons;
    }, 0);

    const totalCompletedLessons = scopeEnrollments.reduce((sum, item) => {
        const completed = Array.isArray(item?.completedLessons)
            ? item.completedLessons.length
            : 0;

        return sum + completed;
    }, 0);

    const attemptMap = new Map();
    attempts.forEach((item) => {
        const key = String(item.quizId);
        if (!attemptMap.has(key)) {
            attemptMap.set(key, true);
        }
    });

    const submissionMap = new Map();
    submissions.forEach((item) => {
        const key = String(item.assignmentId);
        if (!submissionMap.has(key)) {
            submissionMap.set(key, true);
        }
    });

    const pendingQuizCount = quizzes.filter(
        (quiz) => !attemptMap.has(String(quiz._id)),
    ).length;

    const pendingAssignmentCount = assignments.filter(
        (assignment) => !submissionMap.has(String(assignment._id)),
    ).length;

    const continueLearningCourses = allEnrollments
        .filter((item) => item?.courseId)
        .map((item) => ({
            enrollmentId: item._id,
            courseId: item.courseId?._id || item.courseId,
            title: item.courseId?.title || "Course",
            thumbnail: item.courseId?.thumbnail || "",
            shortDescription: item.courseId?.shortDescription || "",
            progress: Number(item.progress || 0),
            completed: !!item.completed,
            completedAt: item.completedAt || null,
            totalLessons: Array.isArray(item.courseId?.lessonIds)
                ? item.courseId.lessonIds.length
                : 0,
            completedLessons: Array.isArray(item.completedLessons)
                ? item.completedLessons.length
                : 0,
            lastLessonId: item.lastLessonId || null,
            updatedAt: item.updatedAt,
        }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 6);

    return {
        totalEnrolledCourses,
        totalInProgressCourses,
        totalCompletedCourses,
        totalLessonCount,
        totalCompletedLessons,
        pendingQuizCount,
        pendingAssignmentCount,
        certificateCount: certificates.length,
        continueLearningCourses,
        filters: {
            from: from || "",
            to: to || "",
        },
    };
};

export const getStudentLearningAnalytics = async (
    studentId,
    { from = "", to = "" } = {},
) => {
    if (!studentId) {
        throw new Error("studentId is required");
    }

    const enrollmentQuery = { studentId };
    const eventRange = normalizeDateRange({ from, to });

    if (eventRange) {
        enrollmentQuery.createdAt = eventRange;
    }

    const enrollments = await Enrollment.find(enrollmentQuery)
        .populate("courseId")
        .sort({ updatedAt: -1 })
        .lean();

    const courseIds = enrollments
        .map((item) => item?.courseId?._id || item?.courseId)
        .filter(Boolean);

    const sharedCourseQuery = courseIds.length
        ? { courseId: { $in: courseIds } }
        : { courseId: { $in: [] } };

    const attemptQuery = { studentId, ...sharedCourseQuery };
    const submissionQuery = { studentId, ...sharedCourseQuery };
    const certificateQuery = { studentId, ...sharedCourseQuery };

    if (eventRange) {
        attemptQuery.createdAt = eventRange;
        submissionQuery.createdAt = eventRange;
        certificateQuery.createdAt = eventRange;
    }

    const [attempts, submissions, certificates] = await Promise.all([
        QuizAttempt.find(attemptQuery).lean(),
        AssignmentSubmission.find(submissionQuery).lean(),
        Certificate.find(certificateQuery).lean(),
    ]);

    const totalCourses = enrollments.length;
    const completedCourses = enrollments.filter(
        (item) => item.completed,
    ).length;
    const inProgressCourses = enrollments.filter(
        (item) => !item.completed && Number(item.progress || 0) > 0,
    ).length;
    const notStartedCourses = Math.max(
        0,
        totalCourses - completedCourses - inProgressCourses,
    );

    const averageProgress = totalCourses
        ? Math.round(
              enrollments.reduce(
                  (sum, item) => sum + Number(item.progress || 0),
                  0,
              ) / totalCourses,
          )
        : 0;

    const totalQuizAttempts = attempts.length;
    const averageQuizScore = totalQuizAttempts
        ? Math.round(
              attempts.reduce((sum, item) => sum + Number(item.score || 0), 0) /
                  totalQuizAttempts,
          )
        : 0;
    const quizPassRate = totalQuizAttempts
        ? Math.round(
              (attempts.filter((item) => item.passed).length /
                  totalQuizAttempts) *
                  100,
          )
        : 0;

    const totalAssignmentsSubmitted = submissions.length;
    const gradedAssignmentsCount = submissions.filter(
        (item) => item.status === "graded",
    ).length;

    const certificateCount = certificates.length;

    const estimatedLearningMinutes = Math.round(
        enrollments.reduce((sum, item) => {
            const durationMinutes = Number(item?.courseId?.duration || 0);
            const progress = Number(item?.progress || 0);
            return sum + (durationMinutes * progress) / 100;
        }, 0),
    );

    const estimatedLearningHours = Number(
        (estimatedLearningMinutes / 60).toFixed(1),
    );

    const activityDateValues = [
        ...enrollments.map((item) => item.updatedAt || item.createdAt),
        ...attempts.map((item) => item.submittedAt || item.createdAt),
        ...submissions.map((item) => item.submittedAt || item.createdAt),
        ...certificates.map((item) => item.issuedAt || item.createdAt),
    ].filter(Boolean);

    const streak = calculateStreakStats(activityDateValues);

    const monthlyTrend = buildRecentMonthBuckets(6, to || null);
    const monthlyBucketMap = new Map(
        monthlyTrend.map((item) => [item.key, item]),
    );

    enrollments.forEach((item) => {
        const key = getMonthKey(item.createdAt);
        if (monthlyBucketMap.has(key)) {
            monthlyBucketMap.get(key).enrollments += 1;
        }
    });

    attempts.forEach((item) => {
        const key = getMonthKey(item.submittedAt || item.createdAt);
        if (monthlyBucketMap.has(key)) {
            monthlyBucketMap.get(key).quizAttempts += 1;
        }
    });

    submissions.forEach((item) => {
        const key = getMonthKey(item.submittedAt || item.createdAt);
        if (monthlyBucketMap.has(key)) {
            monthlyBucketMap.get(key).submissions += 1;
        }
    });

    const weeklyTrend = buildRecentWeekBuckets(7, to || null);
    const weeklyBucketMap = new Map(
        weeklyTrend.map((item) => [item.key, item]),
    );

    attempts.forEach((item) => {
        const key = getDayKey(item.submittedAt || item.createdAt);
        if (weeklyBucketMap.has(key)) {
            weeklyBucketMap.get(key).activities += 1;
            weeklyBucketMap.get(key).quizAttempts += 1;
        }
    });

    submissions.forEach((item) => {
        const key = getDayKey(item.submittedAt || item.createdAt);
        if (weeklyBucketMap.has(key)) {
            weeklyBucketMap.get(key).activities += 1;
            weeklyBucketMap.get(key).submissions += 1;
        }
    });

    enrollments.forEach((item) => {
        const key = getDayKey(item.updatedAt || item.createdAt);
        if (weeklyBucketMap.has(key)) {
            weeklyBucketMap.get(key).activities += 1;

            const durationMinutes = Number(item?.courseId?.duration || 0);
            const progress = Number(item?.progress || 0);
            const estimatedHours = Number(
                ((durationMinutes * progress) / 100 / 60).toFixed(1),
            );

            weeklyBucketMap.get(key).learningHours += estimatedHours;
        }
    });

    const completionRate = totalCourses
        ? Math.round((completedCourses / totalCourses) * 100)
        : 0;

    return {
        totalCourses,
        completedCourses,
        inProgressCourses,
        notStartedCourses,
        completionRate,
        averageProgress,
        totalQuizAttempts,
        averageQuizScore,
        quizPassRate,
        totalAssignmentsSubmitted,
        gradedAssignmentsCount,
        certificateCount,
        estimatedLearningMinutes,
        estimatedLearningHours,
        currentStreak: streak.currentStreak,
        bestStreak: streak.bestStreak,
        activeDays: streak.activeDays,
        lastActiveDate: streak.lastActiveDate,
        weeklyTrend,
        monthlyTrend,
        filters: {
            from: from || "",
            to: to || "",
        },
    };
};

export const getStudentLearningAnalyticsCsv = async (
    studentId,
    { from = "", to = "" } = {},
) => {
    const analytics = await getStudentLearningAnalytics(studentId, {
        from,
        to,
    });

    const rows = [
        ["Section", "Metric", "Value", "Extra"],
        ["Filter", "From", analytics.filters?.from || "", ""],
        ["Filter", "To", analytics.filters?.to || "", ""],
        ["Summary", "Total Courses", analytics.totalCourses, ""],
        ["Summary", "Completed Courses", analytics.completedCourses, ""],
        ["Summary", "In Progress Courses", analytics.inProgressCourses, ""],
        ["Summary", "Not Started Courses", analytics.notStartedCourses, ""],
        ["Summary", "Completion Rate", `${analytics.completionRate}%`, ""],
        ["Summary", "Average Progress", `${analytics.averageProgress}%`, ""],
        ["Summary", "Total Quiz Attempts", analytics.totalQuizAttempts, ""],
        ["Summary", "Average Quiz Score", analytics.averageQuizScore, ""],
        ["Summary", "Quiz Pass Rate", `${analytics.quizPassRate}%`, ""],
        [
            "Summary",
            "Assignments Submitted",
            analytics.totalAssignmentsSubmitted,
            "",
        ],
        ["Summary", "Graded Assignments", analytics.gradedAssignmentsCount, ""],
        ["Summary", "Certificates", analytics.certificateCount, ""],
        [
            "Summary",
            "Estimated Learning Minutes",
            analytics.estimatedLearningMinutes,
            "",
        ],
        [
            "Summary",
            "Estimated Learning Hours",
            analytics.estimatedLearningHours,
            "",
        ],
        ["Summary", "Current Streak", analytics.currentStreak, ""],
        ["Summary", "Best Streak", analytics.bestStreak, ""],
        ["Summary", "Active Days", analytics.activeDays, ""],
        ["Summary", "Last Active Date", analytics.lastActiveDate || "", ""],
        [""],
        ["Weekly Trend", "Day", "Activities", "Quiz / Submission / Hours"],
        ...analytics.weeklyTrend.map((item) => [
            "Weekly Trend",
            item.label || item.key,
            item.activities || 0,
            `${item.quizAttempts || 0} / ${item.submissions || 0} / ${item.learningHours || 0}`,
        ]),
        [""],
        ["Monthly Trend", "Month", "Enrollments", "Quiz / Submission"],
        ...analytics.monthlyTrend.map((item) => [
            "Monthly Trend",
            item.label || item.key,
            item.enrollments || 0,
            `${item.quizAttempts || 0} / ${item.submissions || 0}`,
        ]),
    ];

    return `\uFEFF${toCsv(rows)}`;
};

export const getInstructorDashboardSummary = async (
    instructorId,
    { from = "", to = "" } = {},
) => {
    if (!instructorId) {
        throw new Error("instructorId is required");
    }

    const createdAtRange = normalizeDateRange({ from, to });

    const courseQuery = { instructorId };
    if (createdAtRange) {
        courseQuery.createdAt = createdAtRange;
    }

    const courses = await Course.find(courseQuery)
        .populate({
            path: "lessonIds",
            options: { sort: { order: 1, createdAt: 1 } },
        })
        .sort({ createdAt: -1 })
        .lean();

    const courseIds = courses.map((item) => item._id);

    const sharedCourseQuery = courseIds.length
        ? { courseId: { $in: courseIds } }
        : { courseId: { $in: [] } };

    const eventRange = normalizeDateRange({ from, to });

    const enrollmentQuery = { ...sharedCourseQuery };
    const quizQuery = { ...sharedCourseQuery };
    const attemptQuery = { ...sharedCourseQuery };
    const assignmentQuery = { ...sharedCourseQuery };
    const submissionQuery = { ...sharedCourseQuery };
    const materialQuery = { ...sharedCourseQuery };
    const certificateQuery = { instructorId };
    const conversationQuery = { instructorId };

    if (eventRange) {
        enrollmentQuery.createdAt = eventRange;
        quizQuery.createdAt = eventRange;
        attemptQuery.createdAt = eventRange;
        assignmentQuery.createdAt = eventRange;
        submissionQuery.createdAt = eventRange;
        materialQuery.createdAt = eventRange;
        certificateQuery.createdAt = eventRange;
        conversationQuery.createdAt = eventRange;
    }

    const [
        enrollments,
        quizzes,
        attempts,
        assignments,
        submissions,
        conversations,
        materials,
        certificates,
    ] = await Promise.all([
        Enrollment.find(enrollmentQuery).lean(),
        Quiz.find(quizQuery).lean(),
        QuizAttempt.find(attemptQuery).lean(),
        Assignment.find(assignmentQuery).lean(),
        AssignmentSubmission.find(submissionQuery).lean(),
        ChatConversation.find(conversationQuery).lean(),
        Material.find(materialQuery).lean(),
        Certificate.find(certificateQuery).lean(),
    ]);

    const totalCourses = courses.length;
    const totalStudents = new Set(
        enrollments.map((item) => String(item.studentId)),
    ).size;

    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(
        (item) => item.completed,
    ).length;
    const completionRate = totalEnrollments
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    const averageProgress = totalEnrollments
        ? Math.round(
              enrollments.reduce(
                  (sum, item) => sum + Number(item.progress || 0),
                  0,
              ) / totalEnrollments,
          )
        : 0;

    const totalQuizzes = quizzes.length;
    const totalQuizAttempts = attempts.length;
    const averageQuizScore = totalQuizAttempts
        ? Math.round(
              attempts.reduce((sum, item) => sum + Number(item.score || 0), 0) /
                  totalQuizAttempts,
          )
        : 0;
    const quizPassRate = totalQuizAttempts
        ? Math.round(
              (attempts.filter((item) => item.passed).length /
                  totalQuizAttempts) *
                  100,
          )
        : 0;

    const totalAssignments = assignments.length;
    const totalSubmissions = submissions.length;
    const pendingAssignmentGradingCount = submissions.filter(
        (item) => item.status !== "graded",
    ).length;

    const totalMaterials = materials.length;
    const unreadConversationCount = conversations.filter(
        (item) => Number(item.instructorUnreadCount || 0) > 0,
    ).length;

    const pendingQuizReviewCount = quizzes.reduce((sum, quiz) => {
        const hasAttempt = attempts.some(
            (attempt) => String(attempt.quizId) === String(quiz._id),
        );
        return sum + (hasAttempt ? 1 : 0);
    }, 0);

    const enrollmentCountByCourse = new Map();
    const completionCountByCourse = new Map();
    const attemptListByCourse = new Map();
    const submissionCountByCourse = new Map();
    const materialCountByCourse = new Map();

    enrollments.forEach((item) => {
        const key = String(item.courseId);
        enrollmentCountByCourse.set(
            key,
            (enrollmentCountByCourse.get(key) || 0) + 1,
        );
        if (item.completed) {
            completionCountByCourse.set(
                key,
                (completionCountByCourse.get(key) || 0) + 1,
            );
        }
    });

    attempts.forEach((item) => {
        const key = String(item.courseId);
        if (!attemptListByCourse.has(key)) {
            attemptListByCourse.set(key, []);
        }
        attemptListByCourse.get(key).push(item);
    });

    submissions.forEach((item) => {
        const key = String(item.courseId);
        submissionCountByCourse.set(
            key,
            (submissionCountByCourse.get(key) || 0) + 1,
        );
    });

    materials.forEach((item) => {
        const key = String(item.courseId);
        materialCountByCourse.set(
            key,
            (materialCountByCourse.get(key) || 0) + 1,
        );
    });

    const estimatedRevenue = courses.reduce((sum, course) => {
        const enrollCount =
            enrollmentCountByCourse.get(String(course._id)) || 0;
        return sum + getCourseEffectivePrice(course) * enrollCount;
    }, 0);

    const topCourses = courses
        .map((course) => {
            const key = String(course._id);
            const courseAttempts = attemptListByCourse.get(key) || [];
            const attemptCount = courseAttempts.length;

            const avgScore = attemptCount
                ? Math.round(
                      courseAttempts.reduce(
                          (sum, item) => sum + Number(item.score || 0),
                          0,
                      ) / attemptCount,
                  )
                : 0;

            const passRate = attemptCount
                ? Math.round(
                      (courseAttempts.filter((item) => item.passed).length /
                          attemptCount) *
                          100,
                  )
                : 0;

            const enrollCount = enrollmentCountByCourse.get(key) || 0;
            const completeCount = completionCountByCourse.get(key) || 0;

            return {
                _id: course._id,
                title: course.title,
                thumbnail: course.thumbnail || "",
                shortDescription: course.shortDescription || "",
                description: course.description || "",
                category: course.category || "",
                status: course.status || "draft",
                price: course.price || 0,
                salePrice: course.salePrice,
                isFree: !!course.isFree,
                duration: course.duration || 0,
                totalLessons: Array.isArray(course.lessonIds)
                    ? course.lessonIds.length
                    : 0,
                totalEnrollments: enrollCount,
                rating: Number(course.rating || 0),
                totalReviews: Number(course.totalReviews || 0),
                totalMaterials: materialCountByCourse.get(key) || 0,
                totalAssignments:
                    assignments.filter((item) => String(item.courseId) === key)
                        .length || 0,
                totalQuizzes:
                    quizzes.filter((item) => String(item.courseId) === key)
                        .length || 0,
                totalSubmissions: submissionCountByCourse.get(key) || 0,
                completionRate: enrollCount
                    ? Math.round((completeCount / enrollCount) * 100)
                    : 0,
                averageQuizScore: avgScore,
                quizPassRate: passRate,
                estimatedRevenue: getCourseEffectivePrice(course) * enrollCount,
                createdAt: course.createdAt,
            };
        })
        .sort((a, b) => {
            if (b.totalEnrollments !== a.totalEnrollments) {
                return b.totalEnrollments - a.totalEnrollments;
            }
            if (b.estimatedRevenue !== a.estimatedRevenue) {
                return b.estimatedRevenue - a.estimatedRevenue;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const latestCourses = courses.slice(0, 5).map((course) => ({
        _id: course._id,
        title: course.title,
        thumbnail: course.thumbnail || "",
        shortDescription: course.shortDescription || "",
        description: course.description || "",
        category: course.category || "",
        status: course.status || "draft",
        price: course.price || 0,
        salePrice: course.salePrice,
        isFree: !!course.isFree,
        duration: course.duration || 0,
        createdAt: course.createdAt,
        totalLessons: Array.isArray(course.lessonIds)
            ? course.lessonIds.length
            : 0,
        totalEnrollments: enrollmentCountByCourse.get(String(course._id)) || 0,
    }));

    const monthlyTrend = buildRecentMonthBuckets(6, to || null);
    const bucketMap = new Map(monthlyTrend.map((item) => [item.key, item]));

    enrollments.forEach((item) => {
        const key = getMonthKey(item.createdAt);
        if (bucketMap.has(key)) {
            bucketMap.get(key).enrollments += 1;
        }
    });

    attempts.forEach((item) => {
        const key = getMonthKey(item.submittedAt || item.createdAt);
        if (bucketMap.has(key)) {
            bucketMap.get(key).quizAttempts += 1;
        }
    });

    submissions.forEach((item) => {
        const key = getMonthKey(item.submittedAt || item.createdAt);
        if (bucketMap.has(key)) {
            bucketMap.get(key).submissions += 1;
        }
    });

    return {
        totalCourses,
        totalStudents,
        totalEnrollments,
        completedEnrollments,
        completionRate,
        averageProgress,
        totalMaterials,
        totalQuizzes,
        totalQuizAttempts,
        averageQuizScore,
        quizPassRate,
        totalAssignments,
        totalSubmissions,
        pendingQuizReviewCount,
        pendingAssignmentGradingCount,
        unreadConversationCount,
        certificateCount: certificates.length,
        estimatedRevenue,
        latestCourses,
        topCourses: topCourses.slice(0, 5),
        monthlyTrend,
        filters: {
            from: from || "",
            to: to || "",
        },
    };
};

export const getInstructorDashboardCsv = async (
    instructorId,
    { from = "", to = "" } = {},
) => {
    const summary = await getInstructorDashboardSummary(instructorId, {
        from,
        to,
    });

    const rows = [
        ["Section", "Metric", "Value", "Extra"],
        ["Filter", "From", summary.filters?.from || "", ""],
        ["Filter", "To", summary.filters?.to || "", ""],
        ["Summary", "Total Courses", summary.totalCourses, ""],
        ["Summary", "Total Students", summary.totalStudents, ""],
        ["Summary", "Total Enrollments", summary.totalEnrollments, ""],
        ["Summary", "Completed Enrollments", summary.completedEnrollments, ""],
        ["Summary", "Completion Rate", `${summary.completionRate}%`, ""],
        ["Summary", "Average Progress", `${summary.averageProgress}%`, ""],
        ["Summary", "Total Materials", summary.totalMaterials, ""],
        ["Summary", "Total Quizzes", summary.totalQuizzes, ""],
        ["Summary", "Total Quiz Attempts", summary.totalQuizAttempts, ""],
        ["Summary", "Average Quiz Score", summary.averageQuizScore, ""],
        ["Summary", "Quiz Pass Rate", `${summary.quizPassRate}%`, ""],
        ["Summary", "Total Assignments", summary.totalAssignments, ""],
        ["Summary", "Total Submissions", summary.totalSubmissions, ""],
        [
            "Summary",
            "Pending Assignment Grading",
            summary.pendingAssignmentGradingCount,
            "",
        ],
        [
            "Summary",
            "Unread Conversations",
            summary.unreadConversationCount,
            "",
        ],
        ["Summary", "Certificates", summary.certificateCount, ""],
        ["Summary", "Estimated Revenue", summary.estimatedRevenue, ""],
        [""],
        ["Top Courses", "Title", "Enrollments", "Revenue"],
        ...summary.topCourses.map((item) => [
            "Top Course",
            item.title || "Course",
            item.totalEnrollments || 0,
            item.estimatedRevenue || 0,
        ]),
        [""],
        [
            "Monthly Trend",
            "Month",
            "Enrollments",
            "Quiz Attempts / Submissions",
        ],
        ...summary.monthlyTrend.map((item) => [
            "Monthly Trend",
            item.label || item.key,
            item.enrollments || 0,
            `${item.quizAttempts || 0} / ${item.submissions || 0}`,
        ]),
    ];

    return `\uFEFF${toCsv(rows)}`;
};

export const getMyCourses = async (studentId) => {
    const enrollments = await Enrollment.find({ studentId })
        .populate({
            path: "courseId",
            populate: [{ path: "instructorId" }, lessonPopulateConfig],
        })
        .sort({ createdAt: -1 });

    return enrollments.filter((item) => item.courseId);
};

export const getInstructorCourses = async (instructorId) => {
    return Course.find({ instructorId })
        .populate("instructorId")
        .populate({
            path: "lessonIds",
            options: { sort: { order: 1, createdAt: 1 } },
        })
        .sort({ createdAt: -1 });
};

export const getEnrollmentByStudentAndCourse = async (studentId, courseId) => {
    return Enrollment.findOne({ studentId, courseId }).populate({
        path: "courseId",
        populate: [{ path: "instructorId" }, lessonPopulateConfig],
    });
};

export const setCurrentLesson = async ({ studentId, courseId, lessonId }) => {
    if (!studentId || !courseId || !lessonId) {
        throw new Error("studentId, courseId and lessonId are required");
    }

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
        throw new Error("Enrollment not found");
    }

    const course = await getPublishedCourseWithLessons(courseId);
    if (!course) {
        throw new Error("Course not found");
    }

    const lessonExists = Array.isArray(course.lessonIds)
        ? course.lessonIds.some(
              (lesson) => String(lesson._id) === String(lessonId),
          )
        : false;

    if (!lessonExists) {
        throw new Error("Lesson not found in this course");
    }

    enrollment.lastLessonId = lessonId;
    await enrollment.save();

    return Enrollment.findById(enrollment._id).populate({
        path: "courseId",
        populate: [{ path: "instructorId" }, lessonPopulateConfig],
    });
};

export const completeLesson = async ({ studentId, courseId, lessonId }) => {
    if (!studentId || !courseId || !lessonId) {
        throw new Error("studentId, courseId and lessonId are required");
    }

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
        throw new Error("Enrollment not found");
    }

    const course = await getPublishedCourseWithLessons(courseId);
    if (!course) {
        throw new Error("Course not found");
    }

    const publishedLessons = Array.isArray(course.lessonIds)
        ? course.lessonIds
        : [];

    const lessonExists = publishedLessons.some(
        (lesson) => String(lesson._id) === String(lessonId),
    );

    if (!lessonExists) {
        throw new Error("Lesson not found in this course");
    }

    const lessonIdStr = String(lessonId);

    const existingCompletedIds = Array.isArray(enrollment.completedLessons)
        ? enrollment.completedLessons.map((item) => toStringId(item))
        : [];

    const wasAlreadyCompleted = existingCompletedIds.includes(lessonIdStr);

    if (!wasAlreadyCompleted) {
        enrollment.completedLessons.push(lessonId);
    }

    enrollment.lastLessonId = lessonId;

    const completedUniqueCount = new Set(
        enrollment.completedLessons.map((item) => toStringId(item)),
    ).size;

    const totalLessons = publishedLessons.length;
    const progress = calcProgress(totalLessons, completedUniqueCount);
    const wasCompletedBefore = !!enrollment.completed;

    enrollment.progress = progress;
    enrollment.completed =
        totalLessons > 0 && completedUniqueCount >= totalLessons;

    if (enrollment.completed && !enrollment.completedAt) {
        enrollment.completedAt = new Date();
    }

    if (!enrollment.completed) {
        enrollment.completedAt = null;
    }

    await enrollment.save();

    if (!wasAlreadyCompleted) {
        await awardXp({
            studentId,
            type: "complete_lesson",
            xpEarned: XP_RULES.COMPLETE_LESSON,
            sourceId: lessonId,
            sourceType: "Lesson",
            meta: { courseId },
        });
    }

    if (!wasCompletedBefore && enrollment.completed) {
        await awardXp({
            studentId,
            type: "complete_course",
            xpEarned: XP_RULES.COMPLETE_COURSE,
            sourceId: courseId,
            sourceType: "Course",
            meta: { completedLessonsCount: completedUniqueCount },
        });
    }

    return Enrollment.findById(enrollment._id).populate({
        path: "courseId",
        populate: [{ path: "instructorId" }, lessonPopulateConfig],
    });
};

export const getStudentsByCourse = async (
    courseId,
    { requesterId, requesterRole } = {},
) => {
    if (!courseId) {
        throw new Error("courseId is required");
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new Error("Course not found");
    }

    if (
        requesterRole !== "admin" &&
        String(course.instructorId) !== String(requesterId)
    ) {
        throw new Error("You are not allowed to view students of this course");
    }

    return Enrollment.find({ courseId })
        .populate("studentId")
        .populate({
            path: "courseId",
            populate: [{ path: "instructorId" }, lessonPopulateConfig],
        })
        .sort({ createdAt: -1 });
};

export const getStudentProgressDetail = async (
    courseId,
    studentId,
    { requesterId, requesterRole } = {},
) => {
    if (!courseId || !studentId) {
        throw new Error("courseId and studentId are required");
    }

    const course =
        await Course.findById(courseId).populate(lessonPopulateConfig);
    if (!course) {
        throw new Error("Course not found");
    }

    if (
        requesterRole !== "admin" &&
        String(course.instructorId) !== String(requesterId)
    ) {
        throw new Error(
            "You are not allowed to view student progress of this course",
        );
    }

    const enrollment = await Enrollment.findOne({ courseId, studentId })
        .populate("studentId")
        .populate({
            path: "courseId",
            populate: [{ path: "instructorId" }, lessonPopulateConfig],
        });

    if (!enrollment) {
        throw new Error("Enrollment not found");
    }

    const quizAttempts = await QuizAttempt.find({ courseId, studentId })
        .populate("quizId")
        .sort({ createdAt: -1 });

    const assignmentSubmissions = await AssignmentSubmission.find({
        courseId,
        studentId,
    })
        .populate("assignmentId")
        .sort({ createdAt: -1 });

    const totalLessons = Array.isArray(course.lessonIds)
        ? course.lessonIds.length
        : 0;

    const completedLessonsCount = new Set(
        (enrollment.completedLessons || []).map((item) => toStringId(item)),
    ).size;

    return {
        enrollment,
        totalLessons,
        completedLessonsCount,
        progressPercent: calcProgress(totalLessons, completedLessonsCount),
        isCompleted: totalLessons > 0 && completedLessonsCount >= totalLessons,
        quizAttempts,
        assignmentSubmissions,
    };
};
