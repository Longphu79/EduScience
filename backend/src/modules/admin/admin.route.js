import express from "express";
import * as adminController from "./admin.controller.js";
import { verifyToken, requireAdmin } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(verifyToken, requireAdmin);

router.get("/dashboard", adminController.getDashboard);
router.get("/dashboard/export/csv", adminController.exportDashboardCsv);
router.get("/dashboard/export/pdf", adminController.exportDashboardPdf);

router.get(
  "/instructors/leaderboard",
  adminController.getInstructorLeaderboard
);
router.get(
  "/instructors/leaderboard/export/csv",
  adminController.exportInstructorLeaderboardCsv
);

router.get("/users", adminController.getUsers);
router.get("/users/:userId", adminController.getUserDetail);
router.patch("/users/:userId/deactivate", adminController.deactivateUser);
router.patch("/users/:userId/reactivate", adminController.reactivateUser);

router.get("/courses", adminController.getCourses);
router.get("/courses/:courseId", adminController.getCourseDetail);
router.patch("/courses/:courseId/publish", adminController.publishCourse);
router.patch("/courses/:courseId/archive", adminController.archiveCourse);
router.patch("/courses/:courseId/draft", adminController.moveCourseToDraft);

export default router;