import express from "express";
import * as walletController from "./wallet.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/my-wallet", verifyToken, walletController.getMyWallet);
router.get("/withdraw/history", verifyToken, walletController.getMyWithdrawals);

router.post("/withdraw", verifyToken, walletController.createWithdrawalRequest);
router.post(
    "/withdraw/request-otp",
    verifyToken,
    walletController.requestWithdrawalOtp,
);
router.post(
    "/withdraw/verify-otp",
    verifyToken,
    walletController.verifyWithdrawalOtp,
);

router.post("/deposit", verifyToken, walletController.createDeposit);
router.get("/deposit/history", verifyToken, walletController.getMyDeposits);

export default router;