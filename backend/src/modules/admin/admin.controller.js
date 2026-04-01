import mongoose from "mongoose";
import * as adminService from "./admin.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import * as walletService from "../wallet/wallet.service.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

export const getDashboard = async (req, res) => {
    try {
        const { from = "", to = "" } = req.query;
        const data = await adminService.getDashboardOverview({ from, to });

        return sendSuccess(res, {
            message: "Get admin dashboard successfully",
            data,
        });
    } catch (error) {
        return sendError(res, {
            statusCode: 500,
            message: error.message || "Failed to load admin dashboard",
        });
    }
};

export const exportDashboardCsv = async (req, res) => {
    try {
        const { from = "", to = "" } = req.query;
        const csv = await adminService.getDashboardCsv({ from, to });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="admin-dashboard-report.csv"',
        );

        return res.status(200).send(csv);
    } catch (error) {
        return sendError(res, {
            statusCode: 500,
            message: error.message || "Failed to export admin dashboard csv",
        });
    }
};

export const exportDashboardPdf = async (req, res) => {
    try {
        const { from = "", to = "" } = req.query;
        const dashboard = await adminService.getDashboardOverview({ from, to });
        const pdfBuffer = await buildAdminDashboardPdf(dashboard);

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="admin-dashboard-report.pdf"',
        );

        return res.status(200).send(pdfBuffer);
    } catch (error) {
        return sendError(res, {
            statusCode: 500,
            message: error.message || "Failed to export admin dashboard pdf",
        });
    }
};

export const getInstructorLeaderboard = async (req, res) => {
    try {
        const {
            sortBy = "students",
            from = "",
            to = "",
            limit = 10,
        } = req.query;

        const data = await adminService.getInstructorLeaderboard({
            sortBy,
            from,
            to,
            limit,
        });

        return sendSuccess(res, {
            message: "Get instructor leaderboard successfully",
            data,
        });
    } catch (error) {
        return sendError(res, {
            statusCode: 500,
            message: error.message || "Failed to fetch instructor leaderboard",
        });
    }
};

export const exportInstructorLeaderboardCsv = async (req, res) => {
    try {
        const {
            sortBy = "students",
            from = "",
            to = "",
            limit = 50,
        } = req.query;

        const csv = await adminService.getInstructorLeaderboardCsv({
            sortBy,
            from,
            to,
            limit,
        });

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="admin-instructor-leaderboard.csv"',
        );

        return res.status(200).send(csv);
    } catch (error) {
        return sendError(res, {
            statusCode: 500,
            message:
                error.message || "Failed to export instructor leaderboard csv",
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const result = await adminService.getUsers(req.query);

        return sendSuccess(res, {
            message: "Get users successfully",
            data: result,
        });
    } catch (error) {
        return sendError(res, {
            statusCode: 500,
            message: error.message || "Failed to fetch users",
        });
    }
};

export const getUserDetail = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!isValidObjectId(userId)) {
            return sendError(res, {
                statusCode: 400,
                message: "Invalid user id",
            });
        }

        const result = await adminService.getUserDetail(userId);

        return sendSuccess(res, {
            message: "Get user detail successfully",
            data: result,
        });
    } catch (error) {
        const statusCode = error.message === "User not found" ? 404 : 500;

        return sendError(res, {
            statusCode,
            message: error.message || "Failed to fetch user detail",
        });
    }
};

export const deactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentAdminId =
            req.user?.userId || req.user?._id || req.user?.id;

        if (!isValidObjectId(userId)) {
            return sendError(res, {
                statusCode: 400,
                message: "Invalid user id",
            });
        }

        const updatedUser = await adminService.setUserActiveStatus(
            userId,
            false,
            currentAdminId,
        );

        return sendSuccess(res, {
            message: "User deactivated successfully",
            data: updatedUser,
        });
    } catch (error) {
        let statusCode = 500;

        if (error.message === "User not found") statusCode = 404;
        if (
            error.message === "You cannot deactivate your own account" ||
            error.message === "Cannot change active status of another admin"
        ) {
            statusCode = 400;
        }

        return sendError(res, {
            statusCode,
            message: error.message || "Failed to deactivate user",
        });
    }
};

export const reactivateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentAdminId =
            req.user?.userId || req.user?._id || req.user?.id;

        if (!isValidObjectId(userId)) {
            return sendError(res, {
                statusCode: 400,
                message: "Invalid user id",
            });
        }

        const updatedUser = await adminService.setUserActiveStatus(
            userId,
            true,
            currentAdminId,
        );

        return sendSuccess(res, {
            message: "User reactivated successfully",
            data: updatedUser,
        });
    } catch (error) {
        let statusCode = 500;

        if (error.message === "User not found") statusCode = 404;
        if (error.message === "Cannot change active status of another admin") {
            statusCode = 400;
        }

        return sendError(res, {
            statusCode,
            message: error.message || "Failed to reactivate user",
        });
    }
};

export const getCourses = async (req, res) => {
    try {
        const result = await adminService.getCourses(req.query);

        return sendSuccess(res, {
            message: "Get admin courses successfully",
            data: result,
        });
    } catch (error) {
        return sendError(res, {
            statusCode: 500,
            message: error.message || "Failed to fetch courses",
        });
    }
};

export const getCourseDetail = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                statusCode: 400,
                message: "Invalid course id",
            });
        }

        const result = await adminService.getCourseDetail(courseId);

        return sendSuccess(res, {
            message: "Get course detail successfully",
            data: result,
        });
    } catch (error) {
        const statusCode = error.message === "Course not found" ? 404 : 500;

        return sendError(res, {
            statusCode,
            message: error.message || "Failed to fetch course detail",
        });
    }
};

export const publishCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                statusCode: 400,
                message: "Invalid course id",
            });
        }

        const updatedCourse = await adminService.setCourseStatus(
            courseId,
            "published",
        );

        return sendSuccess(res, {
            message: "Course published successfully",
            data: updatedCourse,
        });
    } catch (error) {
        let statusCode = 500;

        if (error.message === "Course not found") statusCode = 404;
        if (error.message === "Invalid course status") statusCode = 400;

        return sendError(res, {
            statusCode,
            message: error.message || "Failed to publish course",
        });
    }
};

export const archiveCourse = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                statusCode: 400,
                message: "Invalid course id",
            });
        }

        const updatedCourse = await adminService.setCourseStatus(
            courseId,
            "archived",
        );

        return sendSuccess(res, {
            message: "Course archived successfully",
            data: updatedCourse,
        });
    } catch (error) {
        let statusCode = 500;

        if (error.message === "Course not found") statusCode = 404;
        if (error.message === "Invalid course status") statusCode = 400;

        return sendError(res, {
            statusCode,
            message: error.message || "Failed to archive course",
        });
    }
};

export const moveCourseToDraft = async (req, res) => {
    try {
        const { courseId } = req.params;

        if (!isValidObjectId(courseId)) {
            return sendError(res, {
                statusCode: 400,
                message: "Invalid course id",
            });
        }

        const updatedCourse = await adminService.setCourseStatus(
            courseId,
            "draft",
        );

        return sendSuccess(res, {
            message: "Course moved to draft successfully",
            data: updatedCourse,
        });
    } catch (error) {
        let statusCode = 500;

        if (error.message === "Course not found") statusCode = 404;
        if (error.message === "Invalid course status") statusCode = 400;

        return sendError(res, {
            statusCode,
            message: error.message || "Failed to move course to draft",
        });
    }
};

export const getWithdrawalRequests = async (req, res) => {
    try {
        const { page, limit, status } = req.query;
        const data = await adminService.getWithdrawalRequests({
            page,
            limit,
            status,
        });
        res.status(200).json({
            sucess: true,
            data: data.items,
            pagination: data.pagination,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const processWithdrawal = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const { status, adminNote } = req.body;

        // TRUYỀN THAM SỐ RỜI THEO SERVICE
        const result = await adminService.processWithdrawal(
            withdrawalId,
            status,
            adminNote,
        );

        // LỖI CÚ PHÁP: res.status.json là sai -> res.status(200).json
        return res.status(200).json({
            success: true,
            message:
                status === "completed"
                    ? "Đã xác nhận thanh toán"
                    : "Đã từ chối yêu cầu",
            data: result,
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const handleApproveDeposit = async (req, res) => {
    try {
        const { depositId } = req.params;

        // Gọi hàm approveDeposit từ walletService đã viết ở bước trước
        const result = await walletService.approveDeposit(depositId);

        return sendSuccess(res, {
            message: "Đã duyệt nạp tiền và cộng số dư cho user",
            data: result,
        });
    } catch (error) {
        return sendError(res, { message: error.message });
    }
};

export const getDeposits = async (req, res) => {
    try {
        const result = await walletService.getAllDeposits(req.query);
        return sendSuccess(res, {
            message: "Get deposits success",
            data: result,
        });
    } catch (error) {
        return sendError(res, { message: error.message });
    }
};

export const handleRejectDeposit = async (req, res) => {
    try {
        const { depositId } = req.params;
        const result = await walletService.rejectDeposit(depositId);
        return sendSuccess(res, {
            message: "Đã từ chối yêu cầu nạp tiền",
            data: result,
        });
    } catch (error) {
        return sendError(res, { message: error.message });
    }
};
