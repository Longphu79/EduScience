import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), "uploads/profile");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

function sanitizeFilename(value = "file") {
    return String(value)
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext =
            path.extname(file.originalname || "").toLowerCase() || ".jpg";
        const field = sanitizeFilename(file.fieldname || "image");
        const userId = sanitizeFilename(
            req.user?._id || req.user?.id || req.user?.userId || "guest",
        );
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${field}-${userId}-${unique}${ext}`);
    },
});

const fileFilter = (req, file, cb) => {
    console.log("--- Kiểm tra file ---");
    console.log("Tên file:", file.originalname);
    console.log("Mimetype gốc:", file.mimetype);

    // Danh sách các đuôi file ảnh cho phép
    const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    // Lấy đuôi file từ tên file gốc (ví dụ: .png)
    const fileExtension = file.originalname
        .toLowerCase()
        .substring(file.originalname.lastIndexOf("."));

    // Kiểm tra 1 trong 2 điều kiện: Mimetype là ảnh HOẶC Đuôi file là ảnh
    const isImageMime = file.mimetype.startsWith("image/");
    const isImageExt = allowedExtensions.includes(fileExtension);

    if (isImageMime || isImageExt) {
        cb(null, true); // Cho phép upload
    } else {
        // Trả về lỗi rõ ràng hơn để debug
        cb(
            new Error(
                `File không hợp lệ. Mimetype: ${file.mimetype}, Extension: ${fileExtension}`,
            ),
            false,
        );
    }
};

export const profileUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
});
