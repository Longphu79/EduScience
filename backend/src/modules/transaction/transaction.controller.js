import * as transactionService from "./transaction.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const getMyTransactions = async (req, res) => {
    try {
        if (!req.user?._id) {
            return sendError(res, { message: "User not authenticated" }, 401);
        }

        const result = await transactionService.getUserTransactions(
            req.user._id,
            req.query,
        );

        // Trả về theo cấu trúc mà Frontend của bạn đang chờ (response.items)
        return sendSuccess(res, {
            message: "Get transactions successfully",
            data: {
                items: result.items || [],
                pagination: result.pagination,
            },
        });
    } catch (error) {
        console.error("Controller Error:", error);
        return sendError(res, { message: error.message });
    }
};
