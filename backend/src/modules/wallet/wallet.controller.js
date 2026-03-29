import Wallet from "./Wallet.model.js";
import Withdrawal from "./Withdrawal.model.js";

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
