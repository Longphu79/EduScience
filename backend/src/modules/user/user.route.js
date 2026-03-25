import express from "express";
import {
    getProfile,
    updateProfile,
    deactivateAccount,
    changePassword,
    updateStudentProfile,
    updateInstructorProfile,
    uploadAvatar,
    uploadCover,
} from "./user.controller.js";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { profileUpload } from "./user.upload.js";

const router = express.Router();

router.get("/profile/:userId", getProfile);

router.put("/profile/:userId", verifyToken, updateProfile);
router.put("/changepassword/:userId", verifyToken, changePassword);
router.put("/deactivate/:userId", verifyToken, deactivateAccount);

router.put("/student/:userId", verifyToken, updateStudentProfile);
router.put("/instructor/:userId", verifyToken, updateInstructorProfile);

router.post(
    "/upload/avatar/:userId",
    verifyToken,
    profileUpload.single("avatar"),
    uploadAvatar,
);

router.post(
    "/upload/cover/:userId",
    verifyToken,
    profileUpload.single("cover"),
    uploadCover,
);

export default router;
