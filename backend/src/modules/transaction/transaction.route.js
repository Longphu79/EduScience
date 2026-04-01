import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import * as transactionController from "./transaction.controller.js";

const router = express.Router();

router.get(
    "/my-transactions",
    verifyToken,
    transactionController.getMyTransactions,
);

export default router;
