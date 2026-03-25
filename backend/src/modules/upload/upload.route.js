import express from "express";
import { verifyToken } from "../../middlewares/auth.middleware.js";
import { uploadMaterialMiddleware } from "../../middlewares/upload.middleware.js";
import { uploadMaterialFile } from "./upload.controller.js";

const router = express.Router();

router.post(
    "/material",
    verifyToken,
    uploadMaterialMiddleware.single("file"),
    uploadMaterialFile,
);

export default router;
