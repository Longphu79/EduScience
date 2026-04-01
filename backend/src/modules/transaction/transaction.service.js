import Transaction from "./transaction.model.js";
import mongoose from "mongoose";

export const getUserTransactions = async (
    userId,
    { page = 1, limit = 10, type },
) => {
    try {
        // 1. Chuyển userId về ObjectId chuẩn (Tránh lỗi $regex)
        const objectId =
            typeof userId === "string"
                ? new mongoose.Types.ObjectId(userId)
                : userId;

        const query = { userId: objectId };

        // 2. Kiểm tra type (nếu type là "all" hoặc trống thì không filter theo type)
        if (type && type !== "all" && type !== "") {
            query.type = type;
        }

        const safePage = Math.max(1, parseInt(page) || 1);
        const safeLimit = Math.max(1, parseInt(limit) || 10);
        const skip = (safePage - 1) * safeLimit;

        console.log("--- DEBUG QUERY ---");
        console.log("Searching for User ID:", objectId);

        const [items, total] = await Promise.all([
            Transaction.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(safeLimit)
                .lean(),
            Transaction.countDocuments(query),
        ]);

        return {
            items,
            pagination: {
                page: safePage,
                limit: safeLimit,
                totalItems: total,
                totalPages: Math.ceil(total / safeLimit),
            },
        };
    } catch (error) {
        console.error("Lỗi service:", error);
        throw error;
    }
};

export const createTransaction = async (data) => {
    try {
        if (!data.userId || !data.amount) {
            console.error("Missing required fields for transaction");
            return null;
        }

        const formattedData = {
            ...data,
            userId:
                typeof data.userId === "string"
                    ? new mongoose.Types.ObjectId(data.userId)
                    : data.userId,
            referenceId:
                data.referenceId && typeof data.referenceId === "string"
                    ? new mongoose.Types.ObjectId(data.referenceId)
                    : data.referenceId,
        };

        return await Transaction.create(formattedData);
    } catch (error) {
        console.error("Lỗi tạo bản ghi transaction trong DB:", error);
        return null;
    }
};
