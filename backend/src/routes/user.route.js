import {
    getProfile,
    updateProfile,
    deactivateAccount,
    changePassword,
    updateStudentProfile,
    updateInstructorProfile
} from '../controllers/user.controller.js';
import express from 'express';

const router = express.Router();

// USER PROFILE
router.get("/profile/:userId", getProfile);
router.put("/profile/:userId", updateProfile);
router.put("/changepassword/:userId", changePassword);
router.put("/deactivate/:userId", deactivateAccount);

// STUDENT PROFILE
router.put("/student/:userId", updateStudentProfile);

// INSTRUCTOR PROFILE
router.put("/instructor/:userId", updateInstructorProfile);

export default router;