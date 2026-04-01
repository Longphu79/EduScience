import Wallet from "./Wallet.model.js";
import Withdrawal from "./Withdrawal.model.js";
import * as walletService from "./wallet.service.js";
import { sendSuccess, sendError } from "../../utils/response.js";

export const getMyWallet = async (req, res) => {
    try {
        const userId = req.user.id;
        let wallet = await Wallet.findOne({ userId }).populate(
            "userId",
            "name email",
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
        const userId = req.user.id;
        const role = req.user.role;

        const wallet = await Wallet.findOne({ userId });

        if (!wallet || wallet.balance < amount) {
            return res.status(400).json({
                success: false,
                message: "Số dư ví không đủ để thực hiện lệnh rút này",
            });
        }

        if (amount < 50000) {
            return res
                .status(400)
                .json({ message: "Số tiền rút tối thiểu là 50,000 VND" });
        }

        wallet.balance -= amount;
        await wallet.save();

        const withdrawal = await Withdrawal.create({
            userId: userId,
            userModel: role === "instructor" ? "Instructor" : "Student",
            amount,
            bankInfo,
            status: "pending",
        });

        res.status(201).json({
            success: true,
            message:
                "request withdrawal created successfully, please wait for admin approval!",
            data: withdrawal,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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

        const deposit = await walletService.createDepositRequest(
            req.user._id,
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

// 2. Student xem danh sách yêu cầu nạp tiền của mình
export const getMyDeposits = async (req, res) => {
    try {
        // Bạn cần viết thêm hàm getDeposits trong walletService
        // hoặc query trực tiếp từ Model Deposit ở đây
        const deposits = await Deposit.find({ userId: req.user._id }).sort({
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
