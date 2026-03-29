import mongoose from "mongoose";
import User from "../user/user.model.js";
import Course from "../course/course.model.js";
import Enrollment from "../enrollment/enrollment.model.js";
import Wallet from "../wallet/Wallet.model.js";
import Withdrawal from "../wallet/Withdrawal.model.js";

const normalizeSortOrder = (sortOrder = "desc") => {
    return sortOrder === "asc" ? 1 : -1;
};

export const getDashboardStats = async () => {
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
        totalBalance,
        pendingWithdrawalsCount,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "instructor" }),
        User.countDocuments({ role: "admin" }),
        User.countDocuments({ isActive: true }),

        Course.countDocuments(),
        Course.countDocuments({ status: "draft" }),
        Course.countDocuments({ status: "published" }),
        Course.countDocuments({ status: "archived" }),
        Course.countDocuments({ isFree: true }),
        Course.countDocuments({ isFree: false }),

        Enrollment.countDocuments(),
        Enrollment.countDocuments({ completed: true }),
        Wallet.aggregate([
            { $group: { _id: null, total: { $sum: "$balance" } } },
        ]),
        Withdrawal.countDocuments({ status: "pending" }),
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
        pendingWithdrawals: pendingWithdrawalsCount,
        finance: {
            totalSystemBalance: totalBalance[0]?.total || 0,
        },
    };
};

export const getRecentUsers = async (limit = 5) => {
    const safeLimit = Math.max(1, Number(limit) || 5);

    return User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .lean();
};

export const getRecentCourses = async (limit = 5) => {
    const safeLimit = Math.max(1, Number(limit) || 5);

    return Course.find()
        .populate(
            "instructorId",
            "username fullName email avatarUrl role isActive",
        )
        .sort({ createdAt: -1 })
        .limit(safeLimit)
        .lean();
};

export const getTopCourses = async (limit = 5) => {
    const safeLimit = Math.max(1, Number(limit) || 5);

    return Course.find()
        .populate("instructorId", "username fullName email avatarUrl")
        .sort({ totalEnrollments: -1, rating: -1, createdAt: -1 })
        .limit(safeLimit)
        .lean();
};

export const getUsers = async ({
    page = 1,
    limit = 10,
    search = "",
    role = "",
    isActive = "",
    sortBy = "createdAt",
    sortOrder = "desc",
}) => {
    const query = {};

    if (role) query.role = role;
    if (isActive === "true") query.isActive = true;
    if (isActive === "false") query.isActive = false;

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
    const safeSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";
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
                "title slug thumbnail status level price salePrice isFree",
            )
            .sort({ createdAt: -1 })
            .lean();

        extra = {
            enrollments,
            summary: {
                totalEnrollments: enrollments.length,
                completedCourses: enrollments.filter((e) => e.completed).length,
                inProgressCourses: enrollments.filter((e) => !e.completed)
                    .length,
                certificatesCount: 0,
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
                publishedCourses: courses.filter(
                    (c) => c.status === "published",
                ).length,
                draftCourses: courses.filter((c) => c.status === "draft")
                    .length,
                archivedCourses: courses.filter((c) => c.status === "archived")
                    .length,
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
    currentAdminId = null,
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
}) => {
    const query = {};

    if (status) query.status = status;
    if (level) query.level = level;

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
    const safeSortBy = allowedSortFields.includes(sortBy)
        ? sortBy
        : "createdAt";
    const safeSortOrder = normalizeSortOrder(sortOrder);

    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Number(limit) || 10);
    const skip = (safePage - 1) * safeLimit;

    const [items, total] = await Promise.all([
        Course.find(query)
            .populate(
                "instructorId",
                "username fullName email avatarUrl isActive",
            )
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

export const getWithdrawalRequests = async ({
    page = 1,
    limit = 10,
    status = "pending",
}) => {
    try {
        const query = status ? { status } : {};

        const safePage = Math.max(1, Number(page) || 1);
        const safeLimit = Math.max(1, Number(limit) || 10);
        const skip = (safePage - 1) * safeLimit;

        const [items, total] = await Promise.all([
            Withdrawal.find(query)
                .populate("userId", "name fullName email avatarUrl username")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean(),
            Withdrawal.countDocuments(query),
        ]);

        const itemsWithDetails = items.map((item) => {
            const user = item.userId;
            const displayName = user?.fullName || user?.username || "N/A";
            const displayEmail = user?.email || "N/A";
            const displayAvatar =
                user?.avatarUrl ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;
            const bankId = item.bankInfo?.bankCode || "TPB";
            const accountNumber = item.bankInfo?.accountNumber || "0";
            const amount = item.amount || 0;
            const description = encodeURIComponent(`Rut tien ${item._id}`);

            return {
                ...item,
                userName: displayName,
                userEmail: displayEmail,
                userAvatar: displayAvatar,
                // Sử dụng các biến đã định nghĩa ở trên
                vietQrUrl: `https://img.vietqr.io/image/${bankId}-${accountNumber}-compact.png?amount=${amount}&addInfo=${description}`,
            };
        });

        return {
            items: itemsWithDetails,
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalItems: total,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
    } catch (error) {
        console.error("LỖI TẠI ADMIN SERVICE:", error);
        throw error;
    }
};

export const processWithdrawal = async (
    withdrawalId,
    status,
    adminNote = "",
) => {
    const allowedStatuses = ["completed", "rejected"];
    if (!allowedStatuses.includes(status))
        throw new Error("Trạng thái không hợp lệ");

    const withdrawal = await Withdrawal.findById(withdrawalId);
    if (!withdrawal) throw new Error("Yêu cầu rút tiền không tồn tại");
    if (withdrawal.status !== "pending")
        throw new Error("Yêu cầu này đã được xử lý trước đó");

    if (status === "rejected") {
        await Wallet.findOneAndUpdate(
            { userId: withdrawal.userId },
            { $inc: { balance: withdrawal.amount } },
        );
        withdrawal.status = "rejected";
        withdrawal.adminNote = adminNote;
    } else {
        withdrawal.status = "completed";
        withdrawal.processedAt = new Date();
    }

    await withdrawal.save();
    return withdrawal;
};
