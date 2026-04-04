import express from "express";

import { authMiddleware, requireRoles } from "../middleware/authMiddleware.js";
import {
  listCourses,
  getOverview,
  getModerationQueue,
  listPayoutRequests,
  updatePayoutRequest,
  getPayoutLedger,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(authMiddleware, requireRoles("admin"));

router.get("/overview", getOverview);
router.get("/courses", listCourses);
router.get("/payout-requests", listPayoutRequests);
router.get("/moderation/queue", getModerationQueue);
router.get("/payout-ledger", getPayoutLedger);
router.put("/payout-requests/:requestId", updatePayoutRequest);

export default router;
