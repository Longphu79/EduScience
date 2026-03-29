import express from "express";
import * as walletController from "./wallet.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/my-wallet", verifyToken, walletController.getMyWallet);
router.post("/withdraw", verifyToken, walletController.createWithdrawalRequest);

export default router;
