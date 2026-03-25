import express from "express";
import { sepayWebhook } from "./webhook.controller.js";

const router = express.Router();

router.post("/sepay", sepayWebhook);

export default router;
