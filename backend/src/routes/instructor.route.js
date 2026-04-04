import express from "express";

import { authMiddleware, requireRoles } from "../middleware/authMiddleware.js";
import {
  createPayoutRequest,
  getOverview,
  getCourseHealth,
  getPayoutAccount,
  getPayoutWorkspace,
  listCourses,
  listPayoutRequests,
  upsertPayoutAccount,
} from "../controllers/instructor.controller.js";

const router = express.Router();

router.use(authMiddleware, requireRoles("instructor"));

router.get("/overview", getOverview);
router.get("/courses", listCourses);
router.get("/courses/health", getCourseHealth);
router.get("/payouts/workspace", getPayoutWorkspace);
router.get("/payout-account", getPayoutAccount);
router.put("/payout-account", upsertPayoutAccount);
router.get("/payout-requests", listPayoutRequests);
router.post("/payout-requests", createPayoutRequest);

export default router;
