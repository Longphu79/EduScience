import {
    getProfile,
    updateProfile,
    deactivateAccount,
    changePassword,
    updateStudentProfile,
    updateInstructorProfile
} from '../controllers/user.controller.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import express from 'express';


const router = express.Router();
router.use(authMiddleware); // Áp dụng middlewareAuth cho tất cả các route sau nó

// USER PROFILE
router.get("/profile/:userId", authMiddleware, getProfile);
router.put("/profile/:userId", authMiddleware, updateProfile);
router.put("/changepassword/:userId", authMiddleware, changePassword);
router.put("/deactivate/:userId", authMiddleware, deactivateAccount);

// STUDENT PROFILE
router.put("/student/:userId", authMiddleware, updateStudentProfile);

// INSTRUCTOR PROFILE
router.put("/instructor/:userId", authMiddleware, updateInstructorProfile);

export default router;