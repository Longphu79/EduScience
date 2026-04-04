import mongoose from "mongoose";
import Wallet from "./Wallet.model.js";
import Withdrawal from "./Withdrawal.model.js";
import Deposit from "./deposit.model.js";
import WithdrawalOtp from "./WithdrawalOtp.model.js";
import * as walletService from "./wallet.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";
import { sendMail } from "../../config/mail.js";
import { emitWithdrawalCreatedToAdmins } from "../chat/chat.socket.js";
import User from "../user/user.model.js";

const performCreateWithdrawalRequest = async ({
    userId,
    role,
    amount,
    bankInfo,
}) => {
    if (amount < 50000) {
        const error = new Error("Số tiền rút tối thiểu là 50,000 VND");
        error.statusCode = 400;
        throw error;
    }

    const wallet = await Wallet.findOne({ userId });

    if (!wallet || wallet.balance < amount) {
        const error = new Error("Số dư ví không đủ để thực hiện lệnh rút này");
        error.statusCode = 400;
        throw error;
    }

    const existedPending = await Withdrawal.findOne({
        userId,
        status: "pending",
        amount,
        "bankInfo.accountNumber": bankInfo.accountNumber,
        "bankInfo.accountName": bankInfo.accountName,
    });

    if (existedPending) {
        const error = new Error("Yêu cầu rút tiền đang chờ admin xác nhận");
        error.statusCode = 400;
        throw error;
    }

    const withdrawal = await Withdrawal.create({
        userId,
        userModel: role === "instructor" ? "Instructor" : "Student",
        amount,
        bankInfo,
        status: "pending",
    });

    return withdrawal;
};

function getAuthUserId(req) {
    return req.user?.id || req.user?._id || req.user?.userId;
}

async function buildWithdrawalRealtimePayload(withdrawal, fallbackUser = {}) {
    const userId = withdrawal?.userId;
    let user = null;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
        user = await User.findById(userId)
            .select("fullName name username email avatarUrl")
            .lean();
    }

    const displayName =
        user?.fullName ||
        user?.name ||
        user?.username ||
        fallbackUser?.fullName ||
        fallbackUser?.name ||
        fallbackUser?.username ||
        fallbackUser?.email ||
        "Unknown user";

    const displayEmail = user?.email || fallbackUser?.email || "N/A";

    const displayAvatar =
        user?.avatarUrl ||
        fallbackUser?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random`;

    return {
        ...withdrawal.toObject(),
        userName: displayName,
        userEmail: displayEmail,
        userAvatar: displayAvatar,
    };
}

export const getMyWallet = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        let wallet = await Wallet.findOne({ userId }).populate(
            "userId",
            "name email fullName username avatarUrl",
        );

        if (!wallet) {
            wallet = await Wallet.create({
                userId,
                userModel:
                    req.user.role === "instructor" ? "Instructor" : "Student",
                balance: 0,
            });
        }

        res.status(200).json({ success: true, data: wallet });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createWithdrawalRequest = async (req, res) => {
    try {
        const { amount, bankInfo } = req.body;
        const userId = getAuthUserId(req);
        const role = req.user.role;

        const withdrawal = await performCreateWithdrawalRequest({
            userId,
            role,
            amount: Number(amount),
            bankInfo,
        });

        const realtimePayload = await buildWithdrawalRealtimePayload(
            withdrawal,
            req.user,
        );

        emitWithdrawalCreatedToAdmins({
            withdrawal: realtimePayload,
            message: "Có yêu cầu rút tiền mới cần admin xử lý.",
        });

        res.status(201).json({
            success: true,
            message:
                "Withdrawal request created successfully, please wait for admin approval!",
            data: withdrawal,
        });
    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

export const requestWithdrawalOtp = async (req, res) => {
    try {
        const { amount, bankInfo } = req.body;
        const userId = getAuthUserId(req);
        const parsedAmount = Number(amount);

        if (!parsedAmount || parsedAmount < 50000) {
            return res.status(400).json({
                success: false,
                message: "Số tiền rút tối thiểu là 50,000 VND",
            });
        }

        if (
            !bankInfo?.bankCode ||
            !bankInfo?.accountNumber ||
            !bankInfo?.accountName
        ) {
            return res.status(400).json({
                success: false,
                message: "Thông tin ngân hàng không hợp lệ",
            });
        }

        const wallet = await Wallet.findOne({ userId });
        if (!wallet || wallet.balance < parsedAmount) {
            return res.status(400).json({
                success: false,
                message: "Số dư ví không đủ để thực hiện lệnh rút này",
            });
        }

        const latestOtp = await WithdrawalOtp.findOne({
            userId,
            used: false,
        }).sort({ createdAt: -1 });

        if (latestOtp) {
            const diffMs =
                Date.now() - new Date(latestOtp.createdAt).getTime();
            const cooldownMs = 60 * 1000;

            if (diffMs < cooldownMs) {
                const remainingSeconds = Math.ceil(
                    (cooldownMs - diffMs) / 1000,
                );

                return res.status(429).json({
                    success: false,
                    message: `Vui lòng chờ ${remainingSeconds}s để gửi lại OTP`,
                    retryAfter: remainingSeconds,
                });
            }
        }

        let email = req.user?.email || "";

        if (!email) {
            const usersCollection = mongoose.connection.collection("users");
            const user = await usersCollection.findOne({
                _id: new mongoose.Types.ObjectId(userId),
            });
            email = user?.email || "";
        }

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Không tìm thấy email người dùng",
            });
        }

        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await WithdrawalOtp.deleteMany({
            userId,
            used: false,
        });

        await WithdrawalOtp.create({
            userId,
            email,
            otp,
            amount: parsedAmount,
            bankInfo,
            expiresAt,
        });

        await sendMail({
            to: email,
            subject: "EduScience Withdrawal OTP",
            text: `Your OTP code is ${otp}. This code will expire in 5 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Withdrawal Verification</h2>
                    <p>Your OTP code is:</p>
                    <h1 style="letter-spacing: 4px;">${otp}</h1>
                    <p>This code will expire in 5 minutes.</p>
                    <p>If you did not request this withdrawal, please ignore this email.</p>
                </div>
            `,
        });

        return res.status(200).json({
            success: true,
            message: "OTP đã được gửi tới email của bạn",
            retryAfter: 60,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const verifyWithdrawalOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = getAuthUserId(req);
        const role = req.user.role;

        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng nhập mã OTP",
            });
        }

        const otpRecord = await WithdrawalOtp.findOne({
            userId,
            used: false,
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "Không tìm thấy OTP hợp lệ",
            });
        }

        if (otpRecord.expiresAt < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Mã OTP đã hết hạn",
            });
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();

            return res.status(400).json({
                success: false,
                message: "Mã OTP không đúng",
            });
        }

        const withdrawal = await performCreateWithdrawalRequest({
            userId,
            role,
            amount: otpRecord.amount,
            bankInfo: otpRecord.bankInfo,
        });

        otpRecord.used = true;
        await otpRecord.save();

        const realtimePayload = await buildWithdrawalRealtimePayload(
            withdrawal,
            req.user,
        );

        emitWithdrawalCreatedToAdmins({
            withdrawal: realtimePayload,
            message: "Có yêu cầu rút tiền mới cần admin xử lý.",
        });

        return res.status(201).json({
            success: true,
            message: "Yêu cầu rút tiền đã được gửi, chờ admin xác nhận",
            data: withdrawal,
        });
    } catch (error) {
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message,
        });
    }
};

export const createDeposit = async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount < 10000) {
            return sendError(res, {
                message: "Số tiền nạp tối thiểu là 10,000 VND",
            });
        }

        const userId = getAuthUserId(req);

        const deposit = await walletService.createDepositRequest(
            userId,
            amount,
        );

        return sendSuccess(res, {
            message: "Tạo yêu cầu nạp tiền thành công",
            data: deposit,
        });
    } catch (error) {
        return sendError(res, { message: error.message });
    }
};

export const getMyDeposits = async (req, res) => {
    try {
        const userId = getAuthUserId(req);
        const deposits = await Deposit.find({ userId }).sort({
            createdAt: -1,
        });

        return sendSuccess(res, {
            message: "Lấy danh sách nạp tiền thành công",
            data: deposits,
        });
    } catch (error) {
        return sendError(res, { message: error.message });
    }
};

export const getMyWithdrawals = async (req, res) => {
    try {
        const userId = getAuthUserId(req);

        const withdrawals = await Withdrawal.find({ userId })
            .sort({ createdAt: -1 })
            .lean();

        return sendSuccess(res, {
            message: "Lấy lịch sử rút tiền thành công",
            data: withdrawals,
        });
    } catch (error) {
        return sendError(res, { message: error.message });
    }
};