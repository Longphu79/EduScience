import multer from "multer";
import path from "path";
import fs from "fs";

const uploadRoot = "uploads/materials";

fs.mkdirSync(uploadRoot, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadRoot);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname || "");
        const baseName = path
            .basename(file.originalname || "file", ext)
            .replace(/[^a-zA-Z0-9-_]/g, "-")
            .replace(/-+/g, "-")
            .toLowerCase();

        cb(null, `${Date.now()}-${baseName}${ext}`);
    },
});

function fileFilter(req, file, cb) {
    cb(null, true);
}

export const uploadMaterialMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024,
    },
});
