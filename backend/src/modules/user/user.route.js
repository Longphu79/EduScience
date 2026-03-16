import express from "express";
import {
  getProfile,
  updateProfile,
  deactivateAccount,
  changePassword,
  updateStudentProfile,
  updateInstructorProfile,
} from "./user.controller.js";

const router = express.Router();

router.get("/profile/:userId", getProfile);
router.put("/profile/:userId", updateProfile);
router.put("/changepassword/:userId", changePassword);
router.put("/deactivate/:userId", deactivateAccount);

router.put("/student/:userId", updateStudentProfile);
router.put("/instructor/:userId", updateInstructorProfile);

export default router;