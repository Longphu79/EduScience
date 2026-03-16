import express from "express";
import * as adminController from "./admin.controller.js";

const router = express.Router();

router.get("/dashboard", adminController.getDashboard);

router.get("/users", adminController.getUsers);

router.get("/courses", adminController.getCourses);

router.delete("/users/:userId", adminController.deleteUser);

router.delete("/courses/:courseId", adminController.deleteCourse);

export default router;