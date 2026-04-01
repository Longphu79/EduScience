import mongoose from "mongoose";
import Deposit from "./deposit.model.js";
import Wallet from "./Wallet.model.js";
import * as transactionService from "../transaction/transaction.service.js";

export const createDepositRequest = async (userId, amount) => {
    // Tạo mã nội dung chuyển khoản ngẫu nhiên 6 chữ số
    const depositCode = `DEP${Math.floor(100000 + Math.random() * 900000)}`;

    return await Deposit.create({
        userId,
        amount,
        code: depositCode,
    });
};

export const approveDeposit = async (depositId) => {
    try {
        // 1. Tìm đơn nạp tiền
        const deposit = await Deposit.findById(depositId);
        if (!deposit || deposit.status !== "pending") {
            throw new Error("Yêu cầu không hợp lệ hoặc đã được xử lý");
        }

        // 2. Cộng tiền vào ví (findOneAndUpdate cực kỳ an toàn, không cần session cũng được)
        const wallet = await Wallet.findOneAndUpdate(
            { userId: deposit.userId },
            { $inc: { balance: deposit.amount } },
            { new: true }, // Trả về ví sau khi đã cộng tiền
        );

        if (!wallet) throw new Error("Không tìm thấy ví người dùng");

        // 3. Tạo lịch sử giao dịch (Transaction)
        await transactionService.createTransaction({
            userId: deposit.userId,
            amount: deposit.amount,
            type: "deposit",
            status: "completed",
            description: `Nạp tiền qua chuyển khoản (Mã: ${deposit.code})`,
            balanceBefore: wallet.balance - deposit.amount,
            balanceAfter: wallet.balance,
            referenceId: deposit._id,
            referenceModel: "Deposit",
        });

        // 4. Cập nhật trạng thái đơn nạp
        deposit.status = "completed";
        await deposit.save();

        return deposit;
    } catch (error) {
        console.error("Lỗi tại approveDeposit:", error.message);
        throw error;
    }
};

export const getAllDeposits = async ({ page = 1, limit = 10, status }) => {
    const query = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Deposit.find(query)
            .populate("userId", "fullName email") // Lấy thêm tên và email user
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        Deposit.countDocuments(query),
    ]);

    return {
        items,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            totalItems: total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

export const rejectDeposit = async (depositId) => {
    const deposit = await Deposit.findById(depositId);
    if (!deposit || deposit.status !== "pending") {
        throw new Error("Yêu cầu không hợp lệ hoặc đã được xử lý");
    }

    deposit.status = "cancelled";
    return await deposit.save();
};
