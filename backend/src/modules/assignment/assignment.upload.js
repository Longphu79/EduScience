import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), "uploads/assignments");

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
    const ext = path.extname(file.originalname || "").toLowerCase() || "";
    const field = sanitizeFilename(file.fieldname || "file");
    const userId = sanitizeFilename(
      req.user?._id || req.user?.id || req.user?.userId || "guest"
    );
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    cb(null, `${field}-${userId}-${unique}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/zip",
    "application/x-zip-compressed",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("File type is not supported"));
  }

  cb(null, true);
}

export const assignmentUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

export const assignmentUploadFields = assignmentUpload.fields([
  { name: "attachments", maxCount: 10 },
  { name: "files", maxCount: 10 },
]);