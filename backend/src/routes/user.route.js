import {
    getProfile,
    updateProfile,
    deactivateAccount,
    changePassword,
    updateStudentProfile,
    updateInstructorProfile,
    listInstructorOptions,
} from '../controllers/user.controller.js';
import { authMiddleware, requireRoles } from '../middleware/authMiddleware.js';
import express from 'express';


const router = express.Router();
router.use(authMiddleware);

router.get("/profile/me", getProfile);
router.put("/profile/me", updateProfile);
router.put("/changepassword", changePassword);
router.put("/deactivate", deactivateAccount);

router.get("/instructors/options", requireRoles("admin"), listInstructorOptions);
router.put("/student", requireRoles("student"), updateStudentProfile);
router.put("/instructor", requireRoles("instructor"), updateInstructorProfile);

// Backward-compatible aliases. Handlers always use the current actor.
router.get("/profile/:userId", getProfile);
router.put("/profile/:userId", updateProfile);
router.put("/changepassword/:userId", changePassword);
router.put("/deactivate/:userId", deactivateAccount);
router.put("/student/:userId", requireRoles("student"), updateStudentProfile);
router.put("/instructor/:userId", requireRoles("instructor"), updateInstructorProfile);

export default router;
